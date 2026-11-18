import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import capability_catalog
import video_binding
import video_routing
import video_sources


class VideoUseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = video_sources.Catalog()
        cls.router = video_routing.Router(cls.catalog)
        cls.capabilities = capability_catalog.records()

    def test_catalog_covers_owning_registries_and_real_implementations(self):
        self.assertEqual([], video_sources.check(self.catalog, self.capabilities)['errors'])
        rows = self.catalog.rows('focus')
        atlas = video_sources.read(self.catalog.root, video_sources.ATLAS)['videos']
        self.assertTrue({a['id'] for a in atlas} <= {a['id'] for a in rows})
        sources = video_sources.read(self.catalog.root, video_sources.CASES)['entries']
        self.assertEqual(len(sources), len(self.catalog.rows('prompt-motion')))
        tags = video_sources.read(self.catalog.root, 'references/library-search-tags.json')['entries']
        self.assertEqual(len(sources), len({tags[s['slug']]['application'] for s in sources}))
        fred = video_sources.read(self.catalog.root, video_sources.FRED)['items']
        self.assertEqual(len(fred), len(self.catalog.rows('fredtalk')))
        for f in ('codex', 'doubao', 'token'):
            cues = video_sources.read(self.catalog.root, video_sources.BASE + f + '-previews.json')
            uses = self.catalog.lookup('base-' + f)['uses']
            self.assertEqual({c['id'] for c in cues}, {u['capability'].split(':')[1] for u in uses})
        self.assertEqual(16, len(self.catalog.lookup('local-video-5c2f8b41')['uses']))
        body = self.catalog.lookup('fangmu-ten-agents-final-20261021')['uses']
        self.assertEqual(10, len(body))
        self.assertTrue(all(u['examples'][0]['start'] >= 15 for u in body))

    def test_scopes_and_aliases(self):
        self.assertIs(self.catalog.lookup('interview-n'), self.catalog.lookup('reference:brainextends-e19ac3'))
        source = self.catalog.lookup('sample:fangmu/body-car-v2')
        self.assertEqual('interview-l', source['id'])
        for row in self.catalog.rows('focus'):
            if row['status'] == 'diagnostic':
                self.assertEqual([], row['uses'])
                for alias in row['aliases']:
                    self.assertIs(self.catalog.lookup(alias), row)
                    cap = next(c for c in self.capabilities if c['original_id'] == alias)
                    self.assertEqual('diagnostic-only', cap['source_use'])
                    self.assertEqual([], self.router.match(row['title'], source=alias))
        self.assertEqual('metadata-only', self.catalog.lookup('pending:loading-animation-p1-001-decode-pending')['status'])
        self.assertEqual('catalog-media-0026', self.catalog.lookup('pending:loading-animation-p1-001-decode-pending')['id'])

    def test_semantic_choices_across_collections(self):
        examples = {
            '三家会员，用同一道题进行测试。':'arun-membership',
            '改坏了配置，回滚到上一版。':'claude',
            '这台机器的显存能装下模型吗？':'fred-jev',
            '放大原图才能看清细节。':'fred-argon',
            '我在三个工具里反复复制粘贴同一份资料。':'girl-manual',
            '搜索原文，保留命中的那一行。':'base-codex',
            '按钮变成播放器，再收回搜索框。':'reference:twoclipping-5cba86',
            '请求消耗令牌，令牌桶空了就等待。':'reference:parkerrex-1a54fe',
            '滑动确认后，这一笔转账原位显示成功。':'collect:alok-transfer-confirmation-2101955340547879167',
            '真实页面上滚到卖点处停住标注。':'fredtalk:fred-wave2-42-t18c',
        }
        for quote, ident in examples.items():
            with self.subTest(quote=quote):
                pick = self.router.match(quote)[0]
                self.assertEqual(ident, pick['source_id'])
                self.assertTrue(pick['bind'] and pick['evidence']['path'] and pick['apply'])
        for text in ('到下期再见。', '今天我们聊聊 AI 和 UI。', '我不需要回滚。'):
            self.assertEqual([], self.router.match(text))

    def test_multi_source_handoff_preserves_original_spans(self):
        text = '  以前我得反复复制这份资料，现在交给智能体接管。\n改坏配置后可以回滚。'
        units = self.router.plan(text)['units']
        first = units[0]['combination']
        self.assertEqual(['girl-manual', 'girl-takeover'], [s['source_id'] for s in first])
        for step in [*units, *first]:
            self.assertEqual(step['quote'], text[step['span']['start']:step['span']['end']])
        self.assertEqual('claude', units[1]['primary']['source_id'])
        self.assertEqual([], self.router.plan('在本机检查。')['sources_used_in_output'])

    def test_source_specific_evidence_and_offline_binding(self):
        rows = {r['id']: r for r in self.capabilities}
        with tempfile.TemporaryDirectory() as folder, patch.object(capability_catalog, 'records', return_value=self.capabilities):
            target = Path(folder) / 'bound.json'
            result = video_binding.select(self.catalog, 'claude', 'method:Q-C04', target)
            self.assertEqual('Q-C04', json.loads(target.read_text('utf-8'))['program'])
            self.assertEqual('method:Q-C04', result['capability'])
            self.assertEqual('direct', rows['method:Q-C04']['execution_state'])
            with self.assertRaises(ValueError):
                video_binding.select(self.catalog, 'claude', 'method:Q-C04', target)
            with self.assertRaises(ValueError):
                video_binding.select(self.catalog, 'interview-g', 'method:Q-C04')
            with self.assertRaises(ValueError):
                video_binding.select(self.catalog, 'base-codex', 'method:Q-C04')
            native = Path(folder) / 'native.json'
            video_binding.select(self.catalog, 'fangmu-ten-agents-final-20261021', 'design:parallel-workflow', native)
            self.assertTrue(native.is_file())
        info = video_routing.inspect_source(self.catalog, 'claude')
        lesson = next(x for x in info['uses'] if x['capability'] == 'method:Q-C04')
        self.assertTrue(lesson['evidence_locator']['row_ids'])
        self.assertIn('--video claude', lesson['evidence_locator']['read'])
        weak = self.catalog.lookup('collect:homepage-four-folders-preview')
        self.assertEqual('observation-only', weak['status'])
        self.assertFalse(weak['uses'])


if __name__ == '__main__':
    unittest.main()
