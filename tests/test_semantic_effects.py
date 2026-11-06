import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('semantic_effects', ROOT / 'scripts/semantic_effects.py')
effects = importlib.util.module_from_spec(spec); spec.loader.exec_module(effects)


class SemanticEffectsTest(unittest.TestCase):
    def test_manifest_is_complete_and_preserves_x_spans(self):
        entries = effects.entries()
        self.assertEqual(len(entries), 72)
        self.assertEqual(len({x['id'] for x in entries}), 72)
        self.assertEqual([effects.inspect(x)['source_range'] for x in ('X01', 'X08', 'X09', 'X20', 'X21', 'X23')],
                         [[0, 4], [28, 32], [0, 6], [66, 72], [0, 9], [18, 27]])

    def test_current_content_and_real_media_in_portable_projects(self):
        with tempfile.TemporaryDirectory(prefix='semantic-binding-') as tmp, sync_playwright() as pw:
            folder = Path(tmp)
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1920, 'height': 1080})
            errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
            # Actual current input, not an original fixture's labels.
            stage = folder / 'stage.html'
            stage.write_text('<div id="actual" style="position:absolute;left:100px;top:100px;font-size:42px">周三交付</div>', encoding='utf-8')
            binding = folder / 'binding.json'
            binding.write_text(json.dumps({'options': {'node': {'selector': '#actual'}, 'before': '周三交付', 'after': '周五交付'}}), encoding='utf-8')
            project = effects.materialize('O27', folder / 'bound-o', binding, stage, duration=3)
            page.goto(Path(project['html']).as_uri()); page.evaluate('window.ready()'); page.evaluate('window.render(3)')
            self.assertEqual(page.locator('#actual').text_content(), '周五交付')
            page.evaluate('window.render(0)'); self.assertEqual(page.locator('#actual').text_content(), '周三交付')
            # Every distinct original source bundle works from an unrelated directory.
            for eid in ('X01', 'X09', 'X21'):
                info = effects.inspect(eid); slot = info['slots'][0]['selector']
                binding.write_text(json.dumps({'text': {slot: '这期新的口播内容'}}, ensure_ascii=False), encoding='utf-8')
                project = effects.materialize(eid, folder / eid, binding)
                page.goto(Path(project['html']).as_uri()); page.evaluate('window.ready()')
                for p in (0, .5, 1, 0):
                    page.evaluate('(p)=>window.render(window.semanticDuration*p)', p)
                    self.assertEqual(page.locator(slot).text_content(), '这期新的口播内容')
            # A real local video binds into X04's original recording slot at 1x.
            source = ROOT / 'assets/style-film/current-style-full.mp4'
            binding.write_text(json.dumps({'media': {'.recording-slot': {'src': str(source), 'kind': 'video', 'sourceIn': 14}}}), encoding='utf-8')
            project = effects.materialize('X04', folder / 'bound-x04', binding)
            page.goto(Path(project['html']).as_uri()); page.evaluate('window.ready()'); page.evaluate('window.render(2)')
            self.assertTrue(page.evaluate('()=>{const v=document.querySelector(".semantic-bound-media");return v.readyState>=2&&v.playbackRate===1&&Math.abs(v.currentTime-16)<.05}'))
            self.assertEqual(errors, [])
            browser.close()

    def test_no_silent_demo_or_overwrite(self):
        with tempfile.TemporaryDirectory(prefix='semantic-guards-') as tmp:
            target = Path(tmp) / 'project'
            with self.assertRaises(ValueError):
                effects.materialize('O01', target)
            target.mkdir(); (target / 'important.txt').write_text('keep', encoding='utf-8')
            with self.assertRaises(ValueError):
                effects.materialize('X01', target, demo=True)
            self.assertEqual((target / 'important.txt').read_text(), 'keep')


if __name__ == '__main__':
    unittest.main()
