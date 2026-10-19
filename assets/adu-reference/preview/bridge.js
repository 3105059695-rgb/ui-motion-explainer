/* Parent-controlled source clock, including file:// launch. */
(() => {
  const ready = Promise.resolve(window.READY).then(async () => {
    if (window.imgWait) await window.imgWait();
    parent.postMessage({type:'adu-ready'},'*');
  }).catch(error => parent.postMessage({type:'adu-error',message:String(error)},'*'));
  window.addEventListener('message',async event => {
    if (event.source !== parent || !event.data || event.data.type !== 'adu-render') return;
    await ready;
    try {window.renderAt(event.data.time);}
    catch(error){parent.postMessage({type:'adu-error',message:String(error)},'*');}
  });
})();
