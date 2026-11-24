"""Offline Chinese retrieval over the live book. Results are candidates for an editor."""
from collections import Counter
from functools import lru_cache
from math import log
from pathlib import Path
import json
import re
import unicodedata

from style_registry import ROOT, confirmed_workflow


# Alternate descriptions of visible changes. These apply to every entry and future additions.
VOCAB = '''
划除 划掉 划去 划除 划走 划线删除 划线作废 划横线 删除线 横线划掉 删去 抹掉 杠掉 画横杠 画道横线 画一道横线 一道杠
替换 替换 改写 改成 换成新 换字 原位换 覆盖旧
原位 原位 同一行 原地换 同一位置
新价 新价 新价格 新售价 新的价格 现价 优惠价
旧价 旧价 旧价格 老价格 原价 旧的价格 原来的价格
差额 差额 差价 省了多少 节省金额
旧句 旧句 原句 旧写法 旧文字 原文那句
新句 新句 新写法 新文字 正确说法 新表达
拖放 拖入 拖进 拖到 拖拽 拖文件 拖动文件 拖过去 拽到 松手 松开鼠标
附件 附件 输入框里的文件 聊天框里的文件 文件贴到消息 文件卡
提交 发送 发出去 提交 回车发送 发送消息
并行 并行 同时跑 同时运行 一起跑 同时开跑 一起开跑 一块运行 并排运行 并发 分头 并排跑 同时开始 同时开工
独立 各自 分别刷新 各走各的 各跑各的 独立速度 单独更新 分开计时
并列 并排 并列 左右对照 分屏 放在一起比 两边对照 同屏
依次 依次 挨个 逐个 逐一 轮流 逐项 从左到右 一个接一个 一条接一条 一条一条 先后 按顺序
三项 三个 三项 三条 三列 三枚 三方 三组 三套 三家 三步 三张 三种 三台 三路 第三
两项 两个 两项 两条 两边 两方 双点 两处 两块 两份 两种 两张 两组 两列 两套 两家 两台
同亮 同时照亮 同时亮 同时高亮 同时聚光 一起亮 同时保亮 两块亮窗 双亮窗 同时圈出 一起框出来
遮暗 压暗 变暗 暗下去 遮暗 只留下 盖灰 灰罩 打暗 遮罩
聚焦 聚光 高亮 圈出来 圈出 标亮 照亮 点亮 聚焦 框出来 框住 打亮
进度 进度 已完成数 完成数 进度条 完成了多少 跑了多少 进度各
日志 日志 运行记录 工作日志 实时记录
计时 耗时 比速度 用了多久 花了多久 花多长时间 跑得快 谁更快 计时 用时 花的时间 先跑完 谁先完成
卡住 卡住 卡死 停在 停住 冻结 卡在 不再动 不动了 到这就停
出错 报错 失败 出错 错误提示 红字告警 运行不了 跑不动
恢复 恢复 重试 重新运行 修复 再试一次
价格 售价 价钱 价格 价位 标价 报价 多少钱
按钮 按钮 按键 控件 操作键 租用键
文件 文件 文档 稿件 表格文件 报告文件
定位 定位 找位置 锁定位置 标出位置 找到那行
出处 出处 来源 引用 原文 原句 原话 引证
输入 输入框 对话框 聊天框 消息框 键入 填入 输进去 输入文字
光标 光标 鼠标 指针 悬停 移上去 点一下
前后 处理前 处理后 前后对比 修改前 修改后 原图 效果图 改前 改后
拖线 分隔线 分界线 分割线 中线 拖动滑块 滑动对比 对比滑块
分支 分支 分头 分发 兵分 两路 多路
合并 汇合 合流 汇总 汇入 归并 合并 会合
箭头 箭头 连到下一 接下一 长出箭头 引出下一 串起来
留屏 保留 不消失 留着 停在原处 保持可见 留在屏上
回中 回中 居中 挪到中间 重新对齐 回到中央
章节 章节 章号 下一章 切到下一节 新章节 章标题
放大 放大 镜头推近 推近 局部特写 拉近 放大镜
滚动 滚动 往下翻 滑到 长页面 长页 页面下移 向下滚
容量 容量 额度 上限 显存 装不下 容得下 不够装
倒计时 倒数 倒计时 还剩几秒 数到零 逐秒减少
排名 排名 排行 名次 排位 榜单 排个高低
勾选 勾选 打勾 对勾 勾掉 勾起来 选中框
折线 折线 趋势线 波动走势 曲线
清单 清单 待办 事项列表 勾选项
成本 成本 账单 花费 支出 总额 花多少钱
身份 名片 身份 软件名字 软件名 产品名 名字和图标 品牌标识
加载 加载 载入 等待 转圈 等它 异步等待
'''
ALIASES = [line.split() for line in VOCAB.strip().splitlines()]
STOP = set('可以 我们 然后 这个 这些 那个 怎样 什么 需要 这样 观众 小白 看到 看见 看懂 画面 镜头 动作 对应 表现 展示 让人 让他 使其 它的 他的 我的 一个 一下 同样 的是 时候 已经 进行 出现 表示 注意 这里 结果 知道 发生 的话 清楚 是在 我想'.split())
SKIP = re.compile(r'(?:不要|无需|不用|不需要|禁止)([^，。；、！？,\n]+)')
WORDS = re.compile(r'[\u3400-\u9fff]+|[a-z]+\d*|\d+(?:\.\d+)?%?')
IDS = re.compile(r'#?(m?)(\d+)(@[a-z][a-z0-9_-]*)?',re.I)


def normalize(value):
    return unicodedata.normalize('NFKC',str(value or '')).lower()


def grams(text):
    found=set()
    for word in WORDS.findall(text):
        if '\u3400'<=word[0]<='\u9fff':
            found.update(word[i:i+2] for i in range(len(word)-1) if word[i:i+2] not in STOP)
        elif len(word)>1 or word.isdigit():
            found.add(word)
    return found


def concepts(text):
    return {group[0] for group in ALIASES if any(term in text for term in group)}


def field(text):
    text=normalize(text)
    return grams(text),concepts(text)


def requested_order(text):
    """Only parse explicit, positive before/after instructions. Keep unrelated sentences separate."""
    steps=re.search(r'先([^。！？；\n]+?)(?:然后|随后|接着|再|才)([^。！？；\n]+)',SKIP.sub(' ',normalize(text)))
    if not steps:return []
    result=[]
    for clause in steps.groups():
        tags=concepts(clause)
        # Once a concrete price state is named, the broad "价格" tag cannot establish this step.
        if tags & {'新价','旧价'}:tags.discard('价格')
        tags-= {'依次','两项','三项','留屏','原位'}
        if not tags:return []
        result.append(tags)
    return result


def reversed_order(steps,verified):
    if not steps or not verified:return None
    first=[(i,t) for i,t in enumerate(verified) if t in steps[0]-steps[1]]
    second=[(i,t) for i,t in enumerate(verified) if t in steps[1]-steps[0]]
    if first and second and min(i for i,_ in first)>max(i for i,_ in second):
        return {'requested':[first[0][1],second[0][1]],'implemented':[second[0][1],first[0][1]]}
    return None


@lru_cache(maxsize=3)
def index(catalog,mtime,size):
    data=json.loads(Path(catalog).read_bytes())
    paths={};terms={};groups={};sections={}
    for s in data.get('directory',{}).get('sections',[]):
        sections[s['key']]=sections[s['name']]=s['key']
        for f in s['folders']:
            groups[f['name']]=groups[f['key']]=f['key']
            terms[f['key']]=field(' '.join([f['name'],*f['terms']]))
            paths.update({i:(s['key'],f['key'],s['name']+' › '+f['name']) for i in f['ids']})
    rows=[];frequency=Counter()
    for r in data['entries']:
        name=field(r['name']);body=field(r['meaning']+' '+r.get('binding',''))
        path=paths.get(r['id'],('','',''))
        words=name[0]|body[0];tags=name[1]|body[1]
        frequency.update(words);frequency.update(':'+tag for tag in tags)
        rows.append((r,path,name,body))
    weights={t:1+log((len(rows)+1)/(n+1)) for t,n in frequency.items()}
    return rows,terms,groups,sections,weights


def search(unit, query=None, folder=None, root=ROOT):
    settings=confirmed_workflow(root)['motion_library']
    catalog=Path(settings['catalog']);stat=catalog.stat()
    rows,terms,groups,sections,weights=index(str(catalog),stat.st_mtime_ns,stat.st_size)
    decision=unit['decision']
    text=query.strip() if query and query.strip() else (unit['quote']+'。'+decision['why'])
    result={'source':'personal' if settings['personal_library'] else 'bundled','searched_entries':len(rows),
            'query':text,'folder':folder,'status':'no_match','matches':[]}
    if decision['job']=='keep' and not query and not folder:
        result['status']='keep';return result
    leaf=groups.get(folder);parent=sections.get(folder)
    if folder and not leaf and not parent:
        raise ValueError('目录中找不到分类 '+folder+'。可用二级名称、分类 key 或一级名称。')
    norm=normalize(text);excluded=' '.join(SKIP.findall(norm));positive=SKIP.sub(' ',norm)
    words,tags=field(positive)
    steps=requested_order(text)
    excluded_words,excluded_tags=field(excluded)
    excluded_words-=words;excluded_tags-=tags
    ident=IDS.fullmatch(norm.strip())
    exact=(ident[1]+ident[2].zfill(3)+(ident[3] or '')).upper() if ident else None
    ranked=[]
    for row,path,name,body in rows:
        if leaf and path[1]!=leaf or parent and path[0]!=parent:continue
        if exact and row['id']!=exact:continue
        n,c=name;d,b=body
        shared=words&(n|d);visual=tags&(c|b)
        score=sum(weights[w]*(2.6 if w in n else 1) for w in shared)
        score+=sum(weights[':'+t]*(3.6 if t in c else 2.1) for t in visual)
        indexed,aliases=terms.get(path[1],(set(),set()))
        score+=min(8,1.6*len(tags&aliases)+.55*len(words&indexed))
        score-=sum(weights[':'+t]*5 for t in excluded_tags & (c|b))
        score-=sum(weights[w]*2 for w in excluded_words & (n|d))
        # A broad category alone can open a folder. It cannot certify a sentence match.
        discriminating=visual-{'两项','三项','原位','留屏','文件'}
        strong=bool(exact or score>=12 and (discriminating or len(shared)>=3))
        if not strong and not folder:continue
        matched=sorted(visual)+sorted(shared-visual,key=lambda w:(-weights[w],w))[:5]
        entry={'id':row['id'],'title':row['name'],'folder':path[2],'matched':matched[:9],'supported':strong}
        conflict=reversed_order(steps,row.get('verifiedOrder'))
        missing=[sorted(s) for s in steps if not (s & (c|b))]
        if conflict:entry.update(supported=False,order_conflict=conflict)
        if missing:entry.update(supported=False,steps_to_verify=missing)
        tier=0 if not conflict and not missing else 1 if conflict else 2
        ranked.append((score,row.get('adaptation')=='portrait',row['id'],entry,tier))
    ranked.sort(key=lambda v:(v[4],-v[0],-int(v[1]),v[2]))
    if ranked:
        if exact or folder:chosen=ranked
        else:chosen=[v for v in ranked if v[0]>=max(12,max(r[0] for r in ranked)*.40)][:18]
        result['matches']=[v[3] for v in chosen]
        result['status']='specified' if exact else ('folder' if folder else 'candidates')
        if steps and not exact and not folder and all(not v['supported'] for v in result['matches']):
            result['status']='partial'
    return result
