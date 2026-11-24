import unittest

import motion_lookup


def unit(quote,job='operate',why='让观众看清发生的变化'):
    return {'quote':quote,'decision':{'job':job,'why':why}}


class NumberedMotionRetrieval(unittest.TestCase):
    def test_semantic_lookup_without_ids(self):
        for line,expected in [
                ('我把桌面的合同拖进对话框，一松手它就挂成了附件。','M061'),
                ('三套工具一起开跑，各自的日志一直在刷新，先跑完的就停在那里。','M063@J078'),
                ('三项都取消，挨个给它们画一道横线，划完的先留着。','M052@J066'),
                ('拖动中间的分界线，左半边看原图，右半边看处理后。','087'),
                ('这行的价钱和租用键一起亮，其余地方都暗下去。','068@J062'),
                ('十秒开始倒数，一直数到零。','164')]:
            with self.subTest(line=line):
                matches=motion_lookup.search(unit(line))['matches']
                self.assertIn(expected,[v['id'] for v in matches[:3]])
                self.assertTrue(matches[0]['matched'])

    def test_weak_cases_and_original(self):
        for line in ('我觉得这件事很重要。','小猫舔完爪，把耳朵转向窗外的蝉鸣。'):
            self.assertEqual(motion_lookup.search(unit(line))['status'],'no_match')
        self.assertEqual(motion_lookup.search(unit('我把文件拖过去。','keep'))['status'],'keep')

    def test_refine_and_pin(self):
        u=unit('这里能看到区别。','compare')
        ctx=motion_lookup.search(u,'M052@J066','strike')
        self.assertEqual([r['id'] for r in ctx['matches']],['M052@J066'])
        self.assertEqual(ctx['status'],'specified')
        self.assertEqual(motion_lookup.search(u,'#087')['matches'][0]['id'],'087')
        self.assertFalse(motion_lookup.search(u,'M052@J066','race')['matches'])
        self.assertIn('M063@J078',[r['id'] for r in motion_lookup.search(u,'三方并跑，各自刷新日志','race')['matches'][:3]])

    def test_verified_before_after_matches_the_actual_program(self):
        from episode_edit import check_motion_order
        from numbered_motions import card
        reverse=unit('旧价保留一会儿，先划掉，再在旁边显示新的价格。','compare')
        lookup=motion_lookup.search(reverse)
        self.assertEqual(lookup['status'],'partial')
        row=next(r for r in lookup['matches'] if r['id']=='M056')
        self.assertEqual(row['order_conflict'],{'requested':['划除','新价'],'implemented':['新价','划除']})
        with self.assertRaisesRegex(ValueError,'实际顺序'):check_motion_order(reverse,card('M056'))
        forward=unit('先让新售价滚出来，再把旁边的旧价划去，最后说省了多少钱。','compare')
        self.assertEqual(motion_lookup.search(forward)['matches'][0]['id'],'M056')
        check_motion_order(forward,card('M056'))


if __name__=='__main__':unittest.main()
