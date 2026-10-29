'use strict';
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ease='cubic-bezier(.22,1,.36,1)';
  const dialogs=new WeakMap(), swaps=new WeakMap(), pending=new Set();
  const finished=animation=>animation ? animation.finished.catch(()=>{}) : Promise.resolve();
  function track(promise){pending.add(promise);promise.finally(()=>pending.delete(promise));return promise;}
  function animate(element,frames,duration,options={}){return !reduced.matches&&element?.animate ? element.animate(frames,{duration,easing:ease,...options}) : null;}
  async function idle(){while(pending.size)await Promise.allSettled([...pending]);}
  function cancelSwap(element){const old=swaps.get(element);if(old){old.cancelled=true;old.animation?.cancel();swaps.delete(element);}if(element){element.style.removeProperty('overflow');element.style.removeProperty('pointer-events');delete element.dataset.motionSwap;}}
  function swap(element,update){
    if(!element){update();return Promise.resolve(true);}
    cancelSwap(element);
    if(reduced.matches){update();return Promise.resolve(true);}
    const state={cancelled:false,animation:null};swaps.set(element,state);
    return track((async()=>{
      const oldHeight=element.getBoundingClientRect().height;
      element.dataset.motionSwap='leaving';element.style.pointerEvents='none';
      state.animation=animate(element,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-7px)'}],110,{fill:'forwards'});
      await finished(state.animation);if(state.cancelled)return false;
      update();const newHeight=element.getBoundingClientRect().height;
      element.dataset.motionSwap='entering';element.style.overflow='hidden';state.animation?.cancel();
      state.animation=animate(element,[{height:oldHeight+'px',opacity:0,transform:'translateY(12px)'},{height:newHeight+'px',opacity:1,transform:'translateY(0)'}],290);
      await finished(state.animation);if(state.cancelled)return false;
      element.style.removeProperty('overflow');element.style.removeProperty('pointer-events');delete element.dataset.motionSwap;swaps.delete(element);return true;
    })());
  }
  function openDialog(dialog){
    if(!dialog)return Promise.resolve();
    const old=dialogs.get(dialog);
    if(dialog.open&&old?.phase!=='closing')return old?.promise||Promise.resolve();
    if(old?.phase==='closing')return track(old.promise.then(()=>openDialog(dialog)));
    dialog.showModal();dialog.dataset.motionState='opening';
    const state={phase:'opening',animation:null,promise:null};dialogs.set(dialog,state);
    state.promise=track((async()=>{
      state.animation=animate(dialog,[{opacity:0,transform:'translateY(26px) scale(.965)'},{opacity:1,transform:'translateY(0) scale(1)'}],350);
      await finished(state.animation);
      if(dialogs.get(dialog)===state){dialog.dataset.motionState='open';dialogs.delete(dialog);}
    })());return state.promise;
  }
  function closeDialog(dialog){
    if(!dialog?.open)return Promise.resolve();
    const old=dialogs.get(dialog);if(old?.phase==='closing')return old.promise;
    const style=getComputedStyle(dialog),start={opacity:style.opacity,transform:style.transform};old?.animation?.cancel();
    cancelSwap(dialog.querySelector('.dialog-body'));dialog.dataset.motionState='closing';
    const state={phase:'closing',animation:null,promise:null};dialogs.set(dialog,state);
    state.promise=track((async()=>{
      state.animation=animate(dialog,[start,{opacity:0,transform:'translateY(18px) scale(.975)'}],230,{fill:'forwards'});
      await finished(state.animation);
      if(dialogs.get(dialog)!==state)return;
      dialog.close();state.animation?.cancel();delete dialog.dataset.motionState;dialogs.delete(dialog);
    })());return state.promise;
  }
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);}));
  const page=document.querySelector('.page');let navigating=false,pageAnimation=null;
  function arrive(){navigating=false;pageAnimation?.cancel();document.documentElement.dataset.pageMotion='entering';
    pageAnimation=animate(page,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],380);
    track(finished(pageAnimation).then(()=>{document.documentElement.dataset.pageMotion='ready';}));
  }
  window.addEventListener('pageshow',event=>{if(event.persisted)arrive();});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
    const url=new URL(link.href,location.href),base=new URL('.',location.href);
    if(url.origin!==location.origin||!url.pathname.startsWith(base.pathname)||(!url.pathname.endsWith('.html')&&!url.pathname.endsWith('/')))return;
    if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
    event.preventDefault();if(navigating)return;navigating=true;
    // Avoid stale HTML/JS from the previous release in a visitor's browser cache.
    url.searchParams.set('v','flow-2');document.documentElement.dataset.pageMotion='leaving';
    pageAnimation?.cancel();
    pageAnimation=animate(page,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-10px)'}],190,{fill:'forwards'});
    finished(pageAnimation).then(()=>location.assign(url.href));
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(animation=>animation.cancel());});
  window.SoyuzMotion={openDialog,closeDialog,swap,idle,animate};
  arrive();
})();
