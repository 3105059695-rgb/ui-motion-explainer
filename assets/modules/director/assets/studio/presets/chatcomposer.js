/* Jules Forrest voice-recipe study. Observed source: 9 questions, then review. */
(function () {
  'use strict';
  const source = 'https://x.com/julesforrest/status/2104278316618244179';
  const media = 'https://cdn.collectui.com/amplify_video/2104277997565968384/vid/avc1/1080x1080/VkVQyMNQWy_7mrsu-optimized.mp4';
  const take = (value, count) => Array.from(String(value ?? '')).slice(0, count).join('');
  const defaults = [
    {label:'家庭',question:'家里有哪些人一起吃饭？',hint:'说说伴侣、孩子，或其他一起住的人。',color:'#efd370',ink:'#262218',answer:'家里是我、伴侣和孩子。孩子六岁，最近有点挑食。',facts:[['我、伴侣和孩子','2 位成人、1 位儿童']]},
    {label:'饮食',question:'有什么饮食限制需要注意？',hint:'过敏、无麸质，或其他饮食要求。',color:'#596330',ink:'#f3f0da',answer:'伴侣需要无麸质的饮食，孩子还小，所以不要太辣。',facts:[['无麸质','伴侣无麸质'],['不要太辣','不太辣']]},
    {label:'优先目标',question:'做饭时，家里最看重什么？',hint:'时间、预算、留饭，或吃得更健康。',color:'#e44712',ink:'#fff4e3',answer:'工作日最好三十分钟以内。我们也喜欢留一些做第二天午餐。',facts:[['三十分钟以内','工作日快做'],['第二天午餐','可留饭']]},
    {label:'菜系',question:'你们最常做哪些菜系？',hint:'说说常做的地区风味或菜式。',color:'#502433',ink:'#f9e9ed',answer:'常做日式饭碗，也喜欢墨西哥菜，想吃舒服一点时就做意大利菜。',facts:[['日式','日式'],['墨西哥','墨西哥'],['意大利','意大利']]},
    {label:'喜欢食材',question:'家里最喜欢哪些食材？',hint:'肉类、蔬菜，以及你们喜欢的味道。',color:'#23231e',ink:'#f1efe5',answer:'鸡腿肉经常吃，蘑菇几乎什么都能搭，最近还很喜欢韭葱。',facts:[['鸡腿肉','鸡腿肉'],['蘑菇','蘑菇'],['韭葱','韭葱']]},
    {label:'不喜欢',question:'有哪些食材是你们不爱吃的？',hint:'说说家里有人不愿意吃的东西。',color:'#efd370',ink:'#262218',answer:'我不吃橄榄，伴侣不喜欢香菜，觉得它有肥皂味。',facts:[['橄榄','橄榄'],['香菜','香菜']]},
    {label:'菜谱来源',question:'你们平时在哪里找菜谱？',hint:'网站、杂志，或你关注的账号。',color:'#596330',ink:'#f3f0da',answer:'主要用 NYT Cooking 找菜谱，也订了 Bon Appétit 的邮件。',facts:[['NYT Cooking','NYT Cooking'],['Bon Appétit','Bon Appétit']]},
    {label:'喜欢厨师',question:'你们喜欢照谁的食谱做？',hint:'食谱作者、电视厨师，或料理创作者。',color:'#e44712',ink:'#fff4e3',answer:'喜欢 Samin Nosrat，也会照 Yotam Ottolenghi 的食谱做。',facts:[['Samin Nosrat','Samin Nosrat'],['Yotam Ottolenghi','Yotam Ottolenghi']]},
    {label:'保存位置',question:'家里的食谱都存在哪里？',hint:'应用、备忘录、截图，或食谱书。',color:'#502433',ink:'#f9e9ed',answer:'散在好多地方，有截图、备忘录，还有以前存的 Pinterest。',facts:[['截图','截图'],['备忘录','备忘录'],['Pinterest','Pinterest']]}
  ];
  const tick='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const mic='<svg viewBox="0 0 32 40" aria-hidden="true"><rect x="10" y="3" width="12" height="23" rx="6" fill="currentColor"/><path d="M5 18v4a11 11 0 0 0 22 0v-4M16 33v5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  const plus='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const minus='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  UIFX.register({
    id:'ai-voice-recipe-preferences',title:'语音食谱偏好 · 九轮识别与家庭核对',category:'ai',duration:70,
    source,referenceMedia:media,sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'同一手机逐轮转写家庭料理偏好，关键词先填入条件、回答结束再勾选；九轮完成后核对汇总，打开家庭人数面板并收起。',
    adaptationNotes:'108.45秒1080×1080手机概念改为70秒1920×1080：保留九问、实时提取、滚动条件、完整汇总与家庭面板→Done。新增旁侧同任务记录以供横屏阅读；原英文转为中文示例，触点替换为鼠标。没有+/-修改、Next提交、录音或网络调用。',
    tags:['Collect UI','UI Interaction','AI','语音转写','食谱偏好','家庭设置','条件勾选','底部面板'],
    params:{title:'家庭料理偏好',prompt:'说出习惯，偏好会一项项被记下来。',result:'这些信息对吗？'},
    editableRounds:'可选params.rounds[0..8]分别替换question/hint/answer/facts。facts是[答案中的原文短语,记录值]数组，只有答案实际含短语才提取。只替换answer时记录该回答本身，不推测饮食/人数。家庭答案改写后，人数编辑面板显示未知；可用params.household.adults/children提供明确人数。'
  },function(c,p){
    const e=c.esc;
    const rounds=defaults.map((d,i)=>{
      const custom=Array.isArray(p.rounds)?p.rounds[i]:null;
      const answer=take((custom?.answer??d.answer),76).trim()||d.answer;
      const supplied=custom?.facts;
      const candidate=Array.isArray(supplied)?supplied:(custom?.answer!==undefined?[[answer,take(answer,54)]]:d.facts);
      const facts=candidate.filter(x=>Array.isArray(x)&&String(x[0]??'').length>0&&answer.includes(String(x[0]))).map(x=>[String(x[0]),take(x[1]??x[0],54)]);
      // No unmatched keyword can create a semantic fact. A literal answer is the fallback.
      if(!facts.length)facts.push([answer,take(answer,54)]);
      return {...d,question:take(custom?.question??d.question,34).trim()||d.question,hint:take(custom?.hint??d.hint,46).trim()||d.hint,answer,facts};
    });
    const title=take(p.title||'家庭料理偏好',24),prompt=take(p.prompt||'说出习惯，偏好会一项项被记下来。',48),result=take(p.result||'这些信息对吗？',18);
    const householdChanged=Array.isArray(p.rounds)&&p.rounds[0]?.answer!==undefined;
    const countValue=(value,fallback)=>Number.isInteger(value)&&value>=0&&value<=99?String(value):fallback;
    const adults=countValue(p.household?.adults,householdChanged?'—':'2');
    const children=countValue(p.household?.children,householdChanged?'—':'1');
    // Each answer has one permanent DOM object. Letter and keyword state live entirely in GSAP.
    const transcripts=rounds.map((r,i)=>{
      const chars=Array.from(r.answer),marks=[];
      r.facts.forEach(([phrase],j)=>{const pos=r.answer.indexOf(phrase);const start=Array.from(r.answer.slice(0,pos)).length;marks.push({j,start,end:start+Array.from(phrase).length});});
      const html=chars.map((ch,k)=>{
        const mark=marks.find(m=>k>=m.start&&k<m.end);
        return `<span class="jcr-letter ${mark?'jcr-key key-'+i+'-'+mark.j:''}" data-char="${k}">${e(ch)}</span>`;
      }).join('');
      return `<div class="jcr-transcript transcript-${i}" data-round="${i+1}" aria-label="第${i+1}轮回答">${html}<i class="jcr-caret"></i></div>`;
    }).join('');
    const mini=rounds.map((r,i)=>`<div class="jcr-mini-row mini-${i}"><span class="jcr-mini-check">${tick}</span><b>${e(r.label)}</b><span class="jcr-mini-value">等待回答</span></div>`).join('');
    const records=rounds.map((r,i)=>`<div class="jcr-record-row record-${i}" data-round="${i+1}"><span class="jcr-record-check">${tick}</span><b>${e(r.label)}</b><span class="jcr-record-value">等待回答</span></div>`).join('');
    const reviews=rounds.map((r,i)=>`<div class="jcr-review-row review-${i}"><b>${e(r.label)}</b><span>${e(r.facts.map(f=>f[1]).join('、'))}</span></div>`).join('');
    const bars=[16,30,22,40,18].map((h,i)=>`<i class="wave-${i}" style="height:${h}px"></i>`).join('');
    c.root.innerHTML=`<style>
      .jcr-scene{background:#e8e7e3;color:#252520;font-family:ProjectSans,sans-serif}.jcr-scene *{box-sizing:border-box}.jcr-scene button{border:0;background:none;color:inherit;padding:0;font:inherit}.jcr-phone{position:absolute;left:230px;top:88px;width:430px;height:850px;padding:12px;border-radius:68px;background:#23231e;box-shadow:0 26px 46px #17171322,0 2px 3px #0002;transform-origin:50% 80%}.jcr-screen{position:relative;width:406px;height:826px;border-radius:56px;background:#fff;overflow:hidden}.jcr-status{position:absolute;left:43px;right:39px;top:22px;display:flex;justify-content:space-between;align-items:center;font-size:18px;font-weight:650}.jcr-status svg{width:73px;height:19px}.jcr-home{position:absolute;left:143px;bottom:16px;width:120px;height:5px;border-radius:4px;background:#222;z-index:6}.jcr-question{position:absolute;left:18px;right:18px;top:58px;height:206px;border-radius:25px;background:#efd370;color:#262218;overflow:hidden;transform-origin:50% 50%}.jcr-question h2{position:absolute;left:22px;right:22px;top:22px;font-size:30px;font-weight:440;line-height:1.34;letter-spacing:-.6px;overflow-wrap:anywhere}.jcr-question p{position:absolute;left:22px;right:22px;bottom:23px;font-size:20px;line-height:1.5;opacity:.84}.jcr-transcript{position:absolute;left:24px;right:24px;top:295px;height:176px;font-size:28px;line-height:1.38;overflow:hidden;overflow-wrap:anywhere}.jcr-letter{display:none;opacity:0;color:#23231e}.jcr-key{border-radius:3px;background:transparent}.jcr-caret{display:inline-block;width:2px;height:27px;margin-left:2px;background:#df4916;vertical-align:-4px}.jcr-mini-clip{position:absolute;left:18px;right:18px;bottom:132px;height:204px;overflow:hidden;mask-image:linear-gradient(to bottom,transparent 0,#000 24px,#000 100%)}.jcr-mini-track{position:absolute;left:0;right:0;top:0}.jcr-mini-row{position:absolute;left:0;width:370px;height:51px;display:grid;grid-template-columns:25px 88px 1fr;align-items:center;column-gap:8px;padding:3px 15px;border:1px solid transparent;border-radius:16px;background:#fff;color:#686863}.jcr-mini-row b{font-size:18px;font-weight:550;color:#35352f}.jcr-mini-value{font-size:17px;line-height:23px;max-height:46px;overflow:hidden;overflow-wrap:anywhere}.jcr-mini-check{width:20px;height:20px;border:1.5px solid #deded9;border-radius:50%;display:grid;place-items:center;color:white;background:white}.jcr-mini-check svg{width:15px;height:15px;opacity:0}.jcr-mic{position:absolute;left:168px;bottom:46px;width:70px;height:70px;border-radius:50%;background:#e44812!important;color:#fff!important;display:grid;place-items:center}.jcr-mic-icon{position:absolute;inset:0;display:grid;place-items:center}.jcr-mic-icon svg{width:22px;height:30px}.jcr-pause{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:5px}.jcr-pause i{width:5px;height:20px;background:#fff;border-radius:1px}.jcr-waves{position:absolute;bottom:62px;height:40px;display:flex;align-items:center;gap:4px;color:#d94716}.jcr-wave-left{left:112px}.jcr-wave-right{right:112px}.jcr-waves i{display:block;width:3px;border-radius:3px;background:currentColor;transform-origin:50% 50%}.jcr-outline{position:absolute;left:168px;bottom:46px;width:70px;height:70px;border:2px solid #d9471655;border-radius:50%;pointer-events:none}.jcr-title{position:absolute;left:792px;top:118px;width:934px;font-size:56px;line-height:1.45;font-weight:620;letter-spacing:-1px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.jcr-prompt{position:absolute;left:795px;top:200px;width:900px;font-size:27px;line-height:1.6;color:#797971;max-height:88px;overflow:hidden}.jcr-record{position:absolute;left:790px;top:291px;width:932px;height:641px;background:#ffffffd8;border:1px solid #d9d9d1;border-radius:30px;overflow:hidden;box-shadow:0 10px 28px #36362407}.jcr-record-head{position:absolute;left:30px;right:30px;top:25px;display:flex;align-items:center;justify-content:space-between;font-size:25px;line-height:38px;color:#414139}.jcr-counter{color:#878780;font-size:22px;font-variant-numeric:tabular-nums}.jcr-record-rule{position:absolute;left:30px;right:30px;top:79px;height:3px;border-radius:3px;background:#e8e8e1;overflow:hidden}.jcr-record-progress{width:100%;height:100%;background:#596330;transform-origin:0 50%}.jcr-record-table{position:absolute;left:24px;right:24px;top:97px}.jcr-record-row{position:relative;display:grid;grid-template-columns:32px 148px 1fr;align-items:center;gap:12px;height:58px;padding:2px 16px;border:1px solid transparent;border-radius:14px}.jcr-record-row b{font-size:25px;line-height:33px;font-weight:550}.jcr-record-value{font-size:26px;line-height:36px;color:#4c4c45;overflow:hidden;max-height:72px;overflow-wrap:anywhere}.jcr-record-check{width:26px;height:26px;border:1.5px solid #deded8;border-radius:50%;display:grid;place-items:center;color:white;background:white}.jcr-record-check svg{width:19px;height:19px;opacity:0}.jcr-review{position:absolute;inset:0}.jcr-review-title{position:absolute;left:25px;right:25px;top:75px;font-size:32px;line-height:42px;font-weight:650;max-height:84px;overflow:hidden;overflow-wrap:anywhere}.jcr-review-sub{position:absolute;left:25px;right:25px;top:128px;font-size:18px;line-height:28px;color:#74746f}.jcr-review-table{position:absolute;left:18px;right:18px;top:191px;border:1px solid #deded9;border-radius:18px;overflow:hidden}.jcr-review-row{display:grid;grid-template-columns:102px 1fr;gap:10px;align-items:center;min-height:48px;padding:7px 13px;border-bottom:1px solid #e8e8e3;font-size:17px;line-height:23px}.jcr-review-row:last-child{border-bottom:0}.jcr-review-row b{font-weight:550}.jcr-review-row span{color:#75756f;overflow-wrap:anywhere}.jcr-next{position:absolute;left:21px;right:21px;bottom:44px;height:57px;border-radius:32px;background:#23231e!important;color:white!important;font-size:22px!important;font-weight:550!important}.jcr-dim{position:absolute;inset:0;background:#000;z-index:3;pointer-events:none}.jcr-sheet{position:absolute;left:0;right:0;bottom:0;height:275px;background:#fff;border-radius:31px 31px 0 0;z-index:4;padding:28px 21px 37px}.jcr-sheet-handle{position:absolute;top:9px;left:185px;width:36px;height:5px;border-radius:6px;background:#d9d9d5}.jcr-sheet-head{height:44px;display:flex;justify-content:space-between;align-items:center;font-size:25px;font-weight:600}.jcr-done{font-size:22px!important;font-weight:500!important;padding:8px 0!important}.jcr-person-row{height:68px;margin-top:11px;border:1px solid #e6e3e1;background:#f8f6f5;border-radius:17px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between}.jcr-person-label{font-size:21px;font-weight:550}.jcr-person-label small{display:block;font-size:14px;font-weight:400;color:#99968f;line-height:20px}.jcr-stepper{display:flex;gap:12px;align-items:center;font-size:23px;font-weight:550}.jcr-stepper button{width:34px;height:34px;border:1px solid #dedbd7;border-radius:50%;display:grid;place-items:center;background:white}.jcr-stepper svg{width:19px;height:19px}.jcr-stepper span{min-width:18px;text-align:center}.jcr-note{position:absolute;left:792px;top:953px;font-size:20px;line-height:30px;color:#85857e}.jcr-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:2px solid #69695d;border-radius:50%;z-index:92;pointer-events:none}.jcr-scene .fx-cursor{width:38px;height:46px}
    </style><div class="fx-scene jcr-scene"><div class="jcr-phone"><div class="jcr-screen"><div class="jcr-status"><span>9:41</span><svg viewBox="0 0 73 19" aria-hidden="true"><path d="M1 14v3h3v-3M6 10v7h3v-7M11 6v11h3V6M16 2v15h3V2" fill="currentColor"/><path d="M27 6q8-8 16 0M30 10q5-5 10 0M33 14q2-2 4 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="51" y="3" width="19" height="12" rx="4" fill="currentColor"/><path d="M71 6v6" stroke="currentColor" stroke-width="2"/></svg></div><div class="jcr-question"><h2>${e(rounds[0].question)}</h2><p>${e(rounds[0].hint)}</p></div>${transcripts}<div class="jcr-mini-clip"><div class="jcr-mini-track">${mini}</div></div><span class="jcr-outline"></span><div class="jcr-waves jcr-wave-left">${bars}</div><div class="jcr-waves jcr-wave-right">${bars}</div><button class="jcr-mic" aria-label="开始语音示意"><span class="jcr-mic-icon">${mic}</span><span class="jcr-pause"><i></i><i></i></span></button><div class="jcr-review"><div class="jcr-review-title">${e(result)}</div><div class="jcr-review-sub">核对这份家庭料理偏好。</div><div class="jcr-review-table">${reviews}</div><button class="jcr-next">下一步</button></div><div class="jcr-dim"></div><div class="jcr-sheet"><span class="jcr-sheet-handle"></span><div class="jcr-sheet-head"><span>家庭成员</span><button class="jcr-done">完成</button></div><div class="jcr-person-row"><div class="jcr-person-label">成人<small>包括你自己</small></div><div class="jcr-stepper"><button aria-label="减少成人人数">${minus}</button><span>${e(adults)}</span><button aria-label="增加成人人数">${plus}</button></div></div><div class="jcr-person-row"><div class="jcr-person-label">儿童<small>18 岁以下</small></div><div class="jcr-stepper"><button aria-label="减少儿童人数">${minus}</button><span>${e(children)}</span><button aria-label="增加儿童人数">${plus}</button></div></div></div><span class="jcr-home"></span></div></div><div class="jcr-title">${e(title)}</div><div class="jcr-prompt">${e(prompt)}</div><div class="jcr-record"><div class="jcr-record-head"><span class="jcr-record-state">偏好记录</span><span class="jcr-counter">0 / 9</span></div><div class="jcr-record-rule"><div class="jcr-record-progress"></div></div><div class="jcr-record-table">${records}</div></div><div class="jcr-note">界面示意 · 转写动画，不调用录音或语音服务</div>${c.cursor()}<i class="jcr-ring"></i></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true});
    tl.set(qa('.jcr-transcript'),{opacity:0},0).set(qa('.jcr-letter'),{opacity:0,display:'none'},0).set(qa('.jcr-caret'),{opacity:0},0)
      .set(q('.jcr-question'),{rotationX:0},0).set(qa('.jcr-waves i'),{scaleY:1},0).set(qa('.jcr-mini-value'),{textContent:'等待回答'},0).set(qa('.jcr-mini-row'),{opacity:0},0).set(qa('.jcr-record-row'),{opacity:.35},0)
      .set(q('.jcr-mini-track'),{y:153},0).set(q('.jcr-record-progress'),{scaleX:0},0)
      .set(q('.jcr-waves'),{opacity:0},0).set(q('.jcr-wave-right'),{opacity:0},0).set(q('.jcr-pause'),{opacity:0},0)
      .set(q('.jcr-review'),{opacity:0},0).set(q('.jcr-sheet'),{y:300},0).set(q('.jcr-dim'),{opacity:0},0)
      .set(q('.fx-cursor'),{x:694,y:901,opacity:0},0).set(q('.jcr-ring'),{opacity:0},0)
      .set(q('.jcr-phone'),{opacity:0,scale:.96,rotationY:5},0).set(q('.jcr-record'),{opacity:0,y:20},0)
      .to(q('.jcr-phone'),{opacity:1,scale:1,rotationY:0,duration:.85,ease:'power3.out'},0)
      .to(q('.jcr-record'),{opacity:1,y:0,duration:.7,ease:'power2.out'},.18)
      .to(q('.fx-cursor'),{x:442,y:845,opacity:1,duration:.5,ease:'power2.inOut'},.55);
    c.click(tl,q('.fx-cursor'),q('.jcr-ring'),442,845,1.18);
    tl.to(q('.jcr-mic-icon'),{opacity:0,duration:.18},1.3).to(q('.jcr-pause'),{opacity:1,duration:.18},1.3)
      .to(qa('.jcr-waves'),{opacity:1,duration:.25},1.3).to(q('.fx-cursor'),{opacity:0,duration:.3},1.75)
      .set(q('.jcr-outline'),{opacity:0,scale:1},0).to(q('.jcr-outline'),{opacity:.55,scale:1.32,duration:.6,ease:'sine.out'},1.3).to(q('.jcr-outline'),{opacity:0,duration:.3},1.9);
    qa('.jcr-waves i').forEach((bar,i)=>tl.to(bar,{scaleY:.32,duration:.2,repeat:274,yoyo:true,ease:'sine.inOut'},1.5+(i%5)*.05));
    rounds.forEach((r,i)=>{
      const t=1.8+i*6.15,trans=q('.transcript-'+i),letters=Array.from(trans.querySelectorAll('.jcr-letter'));
      const row=q('.record-'+i),miniRow=q('.mini-'+i),chars=Array.from(r.answer),typeStart=t+.72,typeDuration=3.35;
      tl.set(q('.jcr-question h2'),{textContent:r.question},t).set(q('.jcr-question p'),{textContent:r.hint},t)
        .to(q('.jcr-question'),{backgroundColor:r.color,color:r.ink,rotationX:0,duration:.42,ease:'power2.out'},t)
        .fromTo(q('.jcr-question'),{rotationX:-7},{rotationX:0,duration:.45,ease:'power2.out',immediateRender:false},t)
        .to(q('.jcr-mini-track'),{y:153-i*51,duration:.5,ease:'power2.inOut'},t)
        .set(miniRow,{top:i*51},0).to(miniRow,{opacity:1,borderColor:'#deded8',boxShadow:'0 5px 12px #23231e0c',duration:.32},t+.15)
        .to(row,{opacity:1,backgroundColor:'#f3f2ed',borderColor:'#e1e0d8',duration:.35},t+.05)
        .set(q('.jcr-record-state'),{textContent:'正在记录 · '+r.label},t)
        .set(trans,{opacity:1},t+.5).set(trans.querySelector('.jcr-caret'),{opacity:1},typeStart);
      if(i>0){tl.to(q('.transcript-'+(i-1)),{opacity:0,duration:.22},t-.12).to(q('.record-'+(i-1)),{backgroundColor:'transparent',borderColor:'transparent',duration:.3},t);}
      for(let j=0;j<i;j++)tl.to(q('.mini-'+j+' .jcr-mini-check'),{backgroundColor:r.color,borderColor:r.color,duration:.35},t);
      letters.forEach((letter,k)=>tl.set(letter,{opacity:1,display:'inline'},typeStart+typeDuration*(k+1)/chars.length));
      const found=[];
      r.facts.map(([phrase,value],j)=>({phrase,value,j,pos:r.answer.indexOf(phrase)})).sort((a,b)=>a.pos-b.pos).forEach(f=>{
        const end=Array.from(r.answer.slice(0,f.pos+f.phrase.length)).length,when=typeStart+typeDuration*end/chars.length+.08;
        found.push(f.value);const partial=found.join('、');
        tl.to(qa('.key-'+i+'-'+f.j),{backgroundColor:r.color+'30',duration:.2},when)
          .set(row.querySelector('.jcr-record-value'),{textContent:partial},when+.05)
          .set(miniRow.querySelector('.jcr-mini-value'),{textContent:partial},when+.05)
          .to(row,{backgroundColor:r.color+'12',duration:.2},when);
      });
      const done=t+4.7;
      tl.to(miniRow.querySelector('.jcr-mini-check'),{backgroundColor:r.color,borderColor:r.color,duration:.25},done)
        .to(miniRow.querySelector('.jcr-mini-check svg'),{opacity:1,duration:.2},done+.1)
        .to(row.querySelector('.jcr-record-check'),{backgroundColor:r.color,borderColor:r.color,duration:.25},done)
        .to(row.querySelector('.jcr-record-check svg'),{opacity:1,duration:.2},done+.1)
        .set(q('.jcr-counter'),{textContent:(i+1)+' / 9'},done+.15)
        .to(q('.jcr-record-progress'),{scaleX:(i+1)/9,duration:.45,ease:'power2.out'},done)
        .set(trans.querySelector('.jcr-caret'),{opacity:0},done)
        .to(miniRow,{borderColor:'transparent',boxShadow:'0 0 0 #23231e00',duration:.35},t+5.65);
    });
    // The original shows only open Household and Done; counts never change, and Next is never pressed.
    tl.to([q('.jcr-question'),q('.transcript-8'),q('.jcr-mini-clip'),q('.jcr-mic'),...qa('.jcr-waves')],{opacity:0,duration:.45},57.6)
      .fromTo(q('.jcr-review'),{y:16,opacity:0},{y:0,opacity:1,duration:.55,ease:'power2.out',immediateRender:false},57.9)
      .set(q('.jcr-record-state'),{textContent:'九项偏好已记录'},58.0)
      .to(q('.jcr-record'),{borderColor:'#6f784d',boxShadow:'0 8px 28px #59633014',duration:.45},58.1)
      .to(q('.record-8'),{backgroundColor:'transparent',borderColor:'transparent',duration:.3},58.1)
      .to(q('.fx-cursor'),{x:432,y:316,opacity:1,duration:.62,ease:'power2.inOut'},60.85);
    c.click(tl,q('.fx-cursor'),q('.jcr-ring'),432,316,61.65);
    tl.to(q('.jcr-dim'),{opacity:.3,duration:.35},61.77).to(q('.jcr-sheet'),{y:0,duration:.5,ease:'power3.out'},61.77)
      .to(q('.fx-cursor'),{x:587,y:696,duration:.55,ease:'power2.inOut'},64.4);
    c.click(tl,q('.fx-cursor'),q('.jcr-ring'),587,696,65.1);
    tl.to(q('.jcr-sheet'),{y:300,duration:.45,ease:'power2.inOut'},65.25).to(q('.jcr-dim'),{opacity:0,duration:.4},65.25)
      .to(q('.fx-cursor'),{x:706,y:887,opacity:0,duration:.6,ease:'power2.inOut'},65.7)
      .to({}, {duration:.01},69.99);
    return {timeline:tl,duration:70};
  });
})();


