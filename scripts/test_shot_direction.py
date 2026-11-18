import base64
from pathlib import Path
import tempfile
import unittest
from urllib.parse import parse_qs, urlsplit

import director
import reference_edits as edits
import shot_direction as art
import video_routing
import video_sources


class ShotDirectionTests(unittest.TestCase):
    def test_fresh_install_resolves_each_positive_source_to_playable_evidence(self):
        catalog = video_sources.Catalog()
        rows = edits.assignments(video_routing.Router(catalog), [])['required']
        directions = edits.read(catalog.root / art.DIRECTION)
        effects = {e['id'] for e in video_sources.read(catalog.root, 'assets/semantic-motion/manifest.json')['effects']}
        refs = {}
        for row in rows:
            key = row['source_id']
            direction = directions[key]
            roles = art.surfaces(direction, row['inputs'])
            self.assertTrue(direction['watch'])
            self.assertTrue(all(roles[k]!='native' for k, s in row['inputs'].items() if s['kind']=='text'))
            ref = art.source_reference(catalog.root, row, direction, overlay={'files':{}})
            self.assertTrue((catalog.root / ref['path'].partition('?')[0]).is_file(), key)
            self.assertFalse(ref['label'].startswith('同类'), key)
            if 'study.html?' in ref['path']:
                params = parse_qs(urlsplit(ref['path']).query)
                self.assertEqual(params['source'], [key])
                self.assertLessEqual(set(params['steps'][0].split(',')), effects)
            refs[key] = ref
        self.assertEqual(len(refs), 32)
        self.assertEqual(refs['base-codex']['range'], [111.8,114.5])
        self.assertEqual(len({(r['path'], str(r.get('range'))) for r in refs.values()}), 32)

    def test_native_shot_preserves_bound_content_and_shared_motion(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            script = base/'原文.txt'
            script.write_text('先看这条消息的原文，再看下一条消息。', encoding='utf-8')
            project = base/'episode'
            director.prepare(script, project)
            plan_path = project/'reference-cut-plan.json'
            plan = edits.read(plan_path)
            i, shot = next((i,s) for i,s in enumerate(plan['shots']) if s['source_id']=='fred-weekly')
            draft = art.hyperframes(project, i+1, base/'pending')
            self.assertTrue(draft['pending'])
            self.assertNotIn('entry', draft)
            image = project/'截图 #1.png'
            image.write_bytes(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='))
            caption = '原始用词 <本期> & </script>'
            plan.update(fps=24, width=1280, height=720, duration_frames=96)
            shot.update(start_frame=0, end_frame=96, unit='U001',
                        inputs={'first':{'path':image.name}, 'caption':{'text':caption}, 'second':{'path':image.name}})
            edits.write(plan_path, plan)
            output = base/'native'
            result = art.hyperframes(project, i+1, output)
            self.assertEqual(result['pending'], [])
            self.assertEqual((result['duration'],result['media']), (4,1))
            entry = Path(result['entry']).read_text(encoding='utf-8')
            score = edits.read(output/'shot.json')
            recipes = edits.read(art.ROOT/edits.RECIPES)['recipes']
            self.assertEqual(score['layers'], recipes['fred-weekly']['layers'])
            self.assertEqual(entry.count('data-fusion-layer="'), len(score['layers']))
            self.assertIn('window.__timelines', entry)
            self.assertIn('&lt;/script&gt;', entry)
            self.assertNotIn('</script>', (output/'shot-data.js').read_text(encoding='utf-8'))
            self.assertEqual(image.read_bytes(), (output/score['slots']['first']['binding']['path']).read_bytes())
            self.assertEqual((output/'shot-motion.js').read_bytes(), (art.ROOT/'assets/reference-edits/shot-motion.js').read_bytes())
            colors = edits.read(art.ROOT/art.PALETTE)
            self.assertTrue(all(f'--fusion-{k}: {v};' in (output/'style.css').read_text(encoding='utf-8') for k,v in colors.items()))
            with self.assertRaises(ValueError):
                art.hyperframes(project, i+1, output)
            self.assertEqual(plan, edits.read(plan_path))
