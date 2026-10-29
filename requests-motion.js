'use strict';
(() => {
 const dialog=document.querySelector('#request-dialog'), form=document.querySelector('#request-form'), success=document.querySelector('#request-success');
 let context={}, busy=false, lastFocus=null;
 const phoneValue=value=>{const digits=value.replace(/\D/g,'');return digits.length===10?'7'+digits:digits.length===11&&digits[0]==='8'?'7'+digits.slice(1):digits;};
 const formatPhone=value=>{const n=phoneValue(value);return n.length===11&&n[0]==='7'?`+7 ${n.slice(1,4)} ${n.slice(4,7)}-${n.slice(7,9)}-${n.slice(9)}`:value;};
 function fieldError(name,message){const input=form.elements[name];input.setAttribute('aria-invalid',String(!!message));document.querySelector(`#${name}-error`).textContent=message;}
 function clearErrors(){['clientName','phone','wish','consent','viewingDate'].forEach(name=>fieldError(name,''));document.querySelector('#request-error').textContent='';}
 function validate(){
  clearErrors();let valid=true;
  if(form.elements.clientName.value.trim().length<2||!/\p{L}/u.test(form.elements.clientName.value)){fieldError('clientName','Укажите, как к вам обращаться — не менее двух букв.');valid=false;}
  const phone=phoneValue(form.elements.phone.value);if(!/^7\d{10}$/.test(phone)){fieldError('phone','Укажите номер телефона: +7 и ещё 10 цифр.');valid=false;}
  if(form.elements.wish.value.trim().length<10){fieldError('wish','Расскажите о пожеланиях чуть подробнее — от 10 символов.');valid=false;}
  if(!form.elements.consent.checked){fieldError('consent','Подтвердите согласие на обратный звонок.');valid=false;}
  if(context.viewing&&form.elements.viewingDate.value&&form.elements.viewingDate.value<form.elements.viewingDate.min){fieldError('viewingDate','Выберите сегодняшнюю или будущую дату.');valid=false;}
  if(!valid)form.querySelector('[aria-invalid="true"]').focus();return valid;
 }
 function open(options={}){
  context=options;lastFocus=document.activeElement;form.reset();clearErrors();busy=false;form.hidden=false;success.hidden=true;
  form.querySelector('button[type="submit"]').disabled=false;
  document.querySelector('#request-title').textContent=options.title||'Оставьте пожелания';
  document.querySelector('#request-intro').textContent=options.titleText||(options.viewing?'Оставьте телефон и удобное время. Свяжемся с вами, чтобы согласовать просмотр.':'Расскажите, что вы ищете. Оставьте номер телефона — свяжемся с вами и обсудим подходящие варианты.');
  form.elements.wish.value=options.wish||'';
  const date=new Date(),localDate=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);form.elements.viewingDate.min=localDate;
  document.querySelector('#viewing-fields').hidden=!options.viewing;
  form.querySelector('button[type="submit"]').textContent=options.viewing?'Записаться на просмотр':'Оставить пожелания';
  SoyuzMotion.openDialog(dialog);
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!validate())return;busy=true;
  const button=form.querySelector('button[type="submit"]'),original=button.textContent;button.disabled=true;button.textContent='Сохраняем…';
  const payload={id:globalThis.crypto?.randomUUID?.()||String(Date.now()),createdAt:new Date().toISOString(),subject:context.subject||'Подбор недвижимости',name:form.elements.clientName.value.trim(),phone:'+'+phoneValue(form.elements.phone.value),wish:form.elements.wish.value.trim(),viewingDate:context.viewing?form.elements.viewingDate.value:'',viewingTime:context.viewing?form.elements.viewingTime.value:'',consent:true,source:location.pathname};
  try{
   const endpoint=window.SOYUZ_REQUESTS_CONFIG?.endpoint||'';
   if(endpoint){
    const url=new URL(endpoint,location.href);if(url.protocol!=='https:')throw new Error('Unsupported endpoint');
    const response=await fetch(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Request failed');
   }else{
    // Local frontend approval mode. No network delivery, account creation or backend registration occurs.
    let saved=[];try{saved=JSON.parse(sessionStorage.getItem('soyuz-requests')||'[]');if(!Array.isArray(saved))saved=[];}catch{}
    sessionStorage.setItem('soyuz-requests',JSON.stringify([...saved.slice(-19),payload]));
   }
   const displayed=await SoyuzMotion.swap(dialog.querySelector('.dialog-body'),()=>{
   form.hidden=true;success.hidden=false;
   const title=document.querySelector('#request-success-title');title.textContent=context.viewing?'Запрос на просмотр сохранён':'Ваши пожелания сохранены';
   document.querySelector('#request-success-text').textContent=(context.viewing?'Свяжемся с вами, чтобы согласовать удобное время просмотра.':'Свяжемся с вами, когда появится подходящий вариант.')+' Ваш телефон: '+formatPhone(payload.phone)+'.';
   });
   if(displayed&&dialog.open)document.querySelector('#request-success-title').focus();
  }catch{document.querySelector('#request-error').textContent='Не удалось сохранить запрос. Попробуйте ещё раз или позвоните нам: +7 908 332-90-32.';document.querySelector('#request-error').focus();}
  finally{busy=false;button.disabled=false;button.textContent=original;}
 });
 form.elements.phone.addEventListener('blur',()=>{form.elements.phone.value=formatPhone(form.elements.phone.value);});
 form.addEventListener('input',event=>{if(['clientName','phone','wish','consent','viewingDate'].includes(event.target.name))fieldError(event.target.name,'');});
 dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus();});
 window.SoyuzRequests={open};
})();
