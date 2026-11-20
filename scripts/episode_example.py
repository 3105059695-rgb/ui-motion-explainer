"""A reproducible novice exercise with authored narration, material, correction and bounds."""
from pathlib import Path
import shutil
import episode_edit as ed
import episode_media as media
import reference_edits as edits
from edit_session import plan_lock, write_atomic
from video_sources import ROOT


def run(folder):
    folder=Path(folder).resolve()
    problem='两张票最容易看错的是站名，请先看这张票上的东站。'
    if (folder/'lesson-result.json').is_file():
        return edits.read(folder/'lesson-result.json')
    if folder.exists() and any(folder.iterdir()):
        raise ValueError('练习使用单独的空目录，保留已有工程。')
    folder.mkdir(parents=True,exist_ok=True)
    script=folder/'script.txt';script.write_text(problem,encoding='utf8')
    for f in ('station.wav','ticket.png','station.png'):
        shutil.copyfile(ROOT/'assets/editing-lesson'/f,folder/f)
    ed.initialise(folder,script)
    with plan_lock(folder):
        board=edits.read(folder/ed.STATE);u=board['units'][0]
        ed.decide(board,{'synopsis':'要防止坐错车站，需要观众认出票上的东站。','units':[{'id':u['id'],'job':'focus','why':'从整票辨认一个真实的站名。'}]})
        for k in ('fred-argon','arun-membership'):
            ed.choices(board,u,k)
        ed.choose(board,u,'fred-argon','arun-membership','只有一张实票要辨认；保留票面方位再推近站名。两张票轮换会暗示未经展示的第二张票。',None)
        media.watch(folder,board,u,'fred-argon')
        media.observe(folder,board,u,'fred-argon',{'mode':'limited','note':'练习程序生成连续对照，未代替观察者观看。'})
        d=media.movie(folder/'station.wav')[0]
        spec={'audio':'station.wav','seconds':[0,d],'fps':15,'size':[768,432],
              'inputs':{'original':{'path':'ticket.png'},'result':{'path':'station.png','focus':[.40,.54]}},
              'beats':[[.42,d*.84]]}
        first=media.make_trial(folder,board,u,spec)
        media.review(folder,board,u,{'trial_sha256':u['trial']['sha256'],'result':'revise',
          'readability':'旧时间表到一句话的末尾才放大站名。','relation':'站名应在读到它时已能辨认。',
          'cut':'末尾需要留出读字时间。','fix':'把同一动作的转折提前，留下末段给东站。'})
        spec['revision']=u['revision'];spec['beats']=[[.42,d*.52]]
        second=media.make_trial(folder,board,u,spec)
        write_atomic(folder/ed.STATE,board)
        result={'sentence':problem,'decision':u['choice'],'first_trial':first['clip'],'revised_trial':second['clip'],
                'comparison':second['page'],'actual_viewing':'示例脚本未进行视觉或带声听审；可在对照页实际检查。'}
        write_atomic(folder/'lesson-result.json',result)
        return result
