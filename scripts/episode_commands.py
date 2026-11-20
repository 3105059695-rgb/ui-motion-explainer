"""Public director subcommands for a script-led, resumable edit."""
from pathlib import Path

import episode_edit as ed
import episode_media as media
import episode_export as export
import reference_edits as edits
from edit_session import plan_lock, write_atomic

ACTIONS=('decide','options','choose','watch','observe','trial','review','proofs','compare','deliver','register','revise','finish-review','example')


def parsers(sub):
    for action in ACTIONS:
        p=sub.add_parser(action,help={'decide':'Save whole-script editorial decisions.','options':'Compare techniques by editing purpose.',
            'choose':'Keep a reasoned choice.','watch':'Open an exact continuous reference interval.','observe':'Record actual viewing or limits.',
            'trial':'Render one shot with current inputs and source voice.','review':'Check or revise the current trial.',
            'compare':'Open a shot beside its reference.','deliver':'Assemble saved shot media.','register':'Conform an external export.',
            'proofs':'Inspect the opening and difficult transition on the actual voice track.',
            'revise':'Conform other shots and adopt only the changed shot and its editable source.',
            'finish-review':'Record whole-film viewing.','example':'Run a small worked example.'}[action])
        p.add_argument('--project',required=True,type=Path)
        if action in ('options','choose','watch','observe','trial','review','compare','revise'):
            p.add_argument('--unit',required=True)
        if action in ('decide','observe','review','finish-review'):p.add_argument('--file',required=True,type=Path)
        if action=='trial':p.add_argument('--spec',required=True,type=Path)
        if action=='proofs':
            p.add_argument('--opening-end',type=float);p.add_argument('--bridge',type=float,nargs=2);p.add_argument('--file',type=Path)
        if action in ('options','choose','watch','observe'):p.add_argument('--id',required=action!='options')
        if action=='options':p.add_argument('--offset',type=int,default=0)
        if action=='choose':
            p.add_argument('--against');p.add_argument('--why',required=True);p.add_argument('--revision',type=int)
            p.add_argument('--aspect',choices=('motion','layout','color'),default='motion')
        if action=='watch':
            group=p.add_mutually_exclusive_group()
            group.add_argument('--stills',nargs='+');group.add_argument('--seconds',type=float,nargs=2);group.add_argument('--restore',action='store_true')
        if action=='compare':p.add_argument('--final',action='store_true')
        if action=='deliver':
            p.add_argument('--out',required=True);p.add_argument('--draft',action='store_true')
        if action=='register':
            p.add_argument('--media',required=True);p.add_argument('--route',required=True)
        if action=='revise':
            p.add_argument('--media',required=True);p.add_argument('--implementation');p.add_argument('--revision',type=int)


def command(args):
    folder=args.project.resolve()
    if args.command=='example':
        from episode_example import run
        return run(folder)
    if not (folder/ed.STATE).is_file():
        raise ValueError('先对本期口播运行 direct -- prepare。')
    with plan_lock(folder):
        ed.ensure_project_entry(folder)
        board=edits.read(folder/ed.STATE)
        u=ed.unit_for(board,args.unit) if hasattr(args,'unit') else None
        action=args.command
        if action=='decide':
            ed.decide(board,edits.read(args.file.resolve(strict=True)))
            result=ed.status(folder,board)
        elif action=='options':result=ed.choices(board,u,args.id,args.offset)
        elif action=='choose':
            choice=ed.choose(board,u,args.id,args.against,args.why,args.revision,args.aspect)
            result={**choice,**trial_form(folder,board,u)}
        elif action=='watch':result=media.watch(folder,board,u,args.id,args.seconds,args.stills,args.restore)
        elif action=='observe':result=media.observe(folder,board,u,args.id,edits.read(args.file))
        elif action=='trial':result=media.make_trial(folder,board,u,edits.read(args.spec))
        elif action=='review':result=media.review(folder,board,u,edits.read(args.file))
        elif action=='proofs':
            from episode_proofs import run
            result=run(folder,board,args.opening_end,args.bridge,edits.read(args.file) if args.file else None)
        elif action=='compare':
            actual=None
            if args.final:
                if not board['outputs']:raise ValueError('尚无成片。')
                actual=board['outputs'][-1]['media']
            result=media.compare(folder,board,u,actual)
        elif action=='deliver':result=export.assemble(folder,board,args.out,args.draft)
        elif action=='register':result=export.register(folder,board,args.media,args.route)
        elif action=='revise':
            from episode_revision import adopt
            result=adopt(folder,board,u,args.media,args.implementation,args.revision)
        elif action=='finish-review':result=export.final_review(folder,board,edits.read(args.file))
        write_atomic(folder/ed.STATE,board)
    return result


def trial_form(folder,board,unit):
    """Give a new editor the selected implementation's current input contract."""
    import editing_library as lib
    choice=unit['choice']
    seed={'seconds':unit['decision'].get('seconds',[None,None]),'audio':board.get('source_media'),'revision':unit['revision']}
    if choice['id']=='original':
        seed['picture']=board.get('source_media')
    else:
        card=lib.card(choice['id'])
        slots=card['inputs']
        if choice['id']=='arun-membership' and any(k in unit['quote']+choice['why'] for k in ('两个','两张','两项','两件','两份','两种','两家')):
            seed['variant']='pair'
            slots={k:v for k,v in slots.items() if k!='c'}
        seed['inputs']={k:{'text':None} if v['kind']=='text' else {'path':None} for k,v in slots.items()}
    path=folder/'editorial'/unit['id']/('trial-form-r'+str(unit['revision'])+'.json')
    if not path.exists():
        path.parent.mkdir(exist_ok=True,parents=True)
        write_atomic(path,seed)
    unit['trial_form']=ed.relative(folder,path)
    return {'file_to_fill':str(path),'fields':seed,'next':'填本期真实素材、原声与剪点，直接运行 direct -- trial --project 本期工程 --unit '+unit['id']+' --spec "'+str(path)+'"。使用自定义合成时说明保留了哪个动作、改变了什么。'}


def verify_and_register(folder, path, route='verify-output'):
    folder=Path(folder).resolve()
    with plan_lock(folder):
        board=edits.read(folder/ed.STATE)
        data=export.register(folder,board,Path(path).resolve(),route)
        write_atomic(folder/ed.STATE,board)
    data['technical_passed']=bool(data['export']['conform'])
    data['full_delivery_verified']=data['status'].get('completed',False)
    return data


def attach_export(report, project, media_path):
    folder=Path(project).resolve()
    owner=next((f for f in (folder,folder.parent) if (f/ed.STATE).is_file()),None)
    if owner:
        result=verify_and_register(owner,media_path,report.get('backend','reference-timeline'))
        report['episode']=result['status']
        report['full_delivery_verified']=result['full_delivery_verified']
    else:
        report['delivery_status']='exported'
        report['full_delivery_verified']=False
        report['editorial_gap']='关联原工程后用 direct -- register 登记真实镜头及回看。'
