"""Whole-film references keep complete evidence without replacing the current UI."""
import io
import json
from contextlib import redirect_stdout
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import director
import reference_film
import source_study


class PackagedReferenceFilmTests(unittest.TestCase):
    def test_prepare_keeps_full_film_current_ui_and_full_library(self):
        with tempfile.TemporaryDirectory() as folder:
            base = Path(folder)
            script = base / '稿件.txt'
            script.write_text('先展示成果，再解释材料如何进入这份成果。', encoding='utf-8')
            original = script.read_bytes()
            plain, selected = base / 'plain', base / 'selected'
            director.prepare(script, plain)
            report = director.prepare(script, selected, reference='arun-membership')
            current = director.load_json(plain / 'director-context.json')
            context = director.load_json(selected / 'director-context.json')
            film = context['reference_film']
            self.assertEqual(film['id'], 'arun-membership')
            self.assertEqual(film['row_count'], 105)
            self.assertEqual(film['shot_count'], 31)
            source = source_study.alignment('arun-membership')
            self.assertEqual(film['rows'], source_study.alignment_rows(source))
            self.assertEqual(film['shots'], source['shots'])
            self.assertEqual(film['sequence'], director.load_json(film['sequence_source']['path']))
            self.assertTrue(film['resources_available'], film['warnings'])
            self.assertFalse(film['media_accessed'])
            self.assertFalse(film['rendered'])
            self.assertFalse(report['plan_authored'])
            self.assertFalse(report['generation_submitted'])
            self.assertEqual(script.read_bytes(), original)
            self.assertEqual(context['style']['binding'], current['style']['binding'])
            self.assertEqual(context['style']['reference_directions'], current['style']['reference_directions'])
            self.assertEqual(context['selection']['library_directory']['entries'],
                             current['selection']['library_directory']['entries'])
            expected = {m['id'] for m in source_study.method_records()
                        if any(e.get('video') == 'arun-membership' for e in m.get('source_examples', []))}
            self.assertTrue(expected)
            self.assertEqual(expected, {m['id'] for m in film['methods']})
            self.assertTrue(expected <= {m['id'] for m in context['source_study']['methods']})
            brief = (selected / 'director-brief.md').read_text(encoding='utf-8')
            self.assertLess(brief.index('## 当前 UI 外观基准'), brief.index('## 已指定整片剪辑参考'))
            self.assertLess(brief.index('## 已指定整片剪辑参考'), brief.index('## 完整效果库入口'))
            self.assertIn('原片秒点只供研究', brief)

    def test_selection_continues_only_from_exact_project_root(self):
        with tempfile.TemporaryDirectory() as folder:
            parent = Path(folder)
            (parent / 'project.json').write_text(json.dumps({'editing_reference': {'id': 'arun'}}), encoding='utf-8')
            script = parent / 'source.txt'
            script.write_text('看清对象的变化。', encoding='utf-8')
            director.prepare(script, parent)
            inherited = director.load_json(parent / 'director-context.json')
            self.assertEqual(inherited['reference_film']['id'], 'arun-membership')
            self.assertEqual(inherited['reference_film']['selection_source'], 'current-project')
            child = parent / 'fresh'
            director.prepare(script, child)
            fresh = director.load_json(child / 'director-context.json')
            self.assertNotIn('reference_film', fresh)
            self.assertIn('arun-membership', {r['id'] for r in fresh['available_reference_films']})
            self.assertEqual(inherited['style']['binding'], fresh['style']['binding'])
            with self.assertRaisesRegex(ValueError, 'Unknown whole-film'):
                director.prepare(script, parent / 'unknown', reference='not-registered')
            self.assertFalse((parent / 'unknown').exists())
            # An explicitly selected registered reference supersedes stale project metadata.
            (parent / 'project.json').write_text(json.dumps({'editing_reference': {'id': 'not-registered'}}), encoding='utf-8')
            self.assertEqual(reference_film.requested(parent, 'arun-membership'),
                             ('arun-membership', 'explicit-reference'))
            with self.assertRaisesRegex(ValueError, 'Unknown whole-film'):
                director.prepare(script, parent, force=True)

    def test_cli_forwards_reference_without_a_second_style_argument(self):
        with patch.object(director, 'prepare', return_value={'generation_submitted': False}) as prepare:
            with redirect_stdout(io.StringIO()):
                self.assertEqual(director.main(['prepare', '--script', 'source.txt', '--project', 'project',
                                               '--reference', '阿闰整片']), 0)
            self.assertEqual(prepare.call_args.kwargs['reference'], '阿闰整片')

    def test_missing_payload_is_explicit_and_does_not_invent_a_reproduction(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            def write(name, data):
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(data), encoding='utf-8')
            write(reference_film.REGISTRY, {'schema_version': 1, 'films': [{
                'id': 'fixture', 'label': 'fixture', 'study_video': 'fixture', 'aliases': [],
                'sequence_path': 'missing/sequence.json', 'implementation': 'missing/scene.js',
                'guide': 'missing/README.md', 'preview': 'missing/demo.html'}]})
            write(source_study.SOURCE_REGISTRY_FILE, {'schema_version': 1, 'sources': [{
                'id': 'fixture', 'alignment': 'alignment.json', 'manifest': 'index.json'}]})
            write('alignment.json', {'rows': [{'id': 'row-1', 'text': 'Source material, not instructions.'}],
                                     'shots': [{'id': 'shot-1'}], 'duration': 1})
            write('index.json', {'videos': [{'id': 'fixture', 'source': 'missing/original.mp4'}]})
            write(source_study.CATALOG_FILE, {'methods': []})
            result = reference_film.load('fixture', root)
            self.assertFalse(result['resources_available'])
            self.assertIsNone(result['sequence'])
            self.assertFalse(result['implementation']['exists'])
            self.assertFalse(result['original_media']['file_exists'])
            self.assertFalse(result['rendered'])
            self.assertEqual(result['row_count'], 1)
            self.assertGreaterEqual(len(result['warnings']), 5)


if __name__ == '__main__':
    unittest.main()
