'use strict';
(() => {
 const listings = window.SOYUZ_LISTINGS || [];
 const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let favorites = [];
 try { const saved=JSON.parse(localStorage.getItem('soyuz-favorites')||'[]'); if(Array.isArray(saved))favorites=saved.filter(id=>listings.some(item=>item.id===id)); } catch {}
 function updateFavorites(){
  document.querySelectorAll('[data-favorite]').forEach(button=>{const item=listings.find(item=>item.id===button.dataset.favorite);if(!item)return;const selected=favorites.includes(item.id);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',`${selected?'Убрать из избранного':'Добавить в избранное'}: ${item.title}`);});
  document.querySelectorAll('[data-favorites-count]').forEach(el=>el.textContent=String(favorites.length));
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-favorite]');if(!button)return;const id=button.dataset.favorite;if(!listings.some(item=>item.id===id))return;
  favorites=favorites.includes(id)?favorites.filter(value=>value!==id):[...favorites,id];let saved=true;
  try{localStorage.setItem('soyuz-favorites',JSON.stringify(favorites));}catch{saved=false;}
  updateFavorites();const status=document.querySelector('#favorite-status');if(status)status.textContent=(favorites.includes(id)?'Объект добавлен в избранное':'Объект удалён из избранного')+(saved?'':'. Сохранение на устройстве недоступно.');document.dispatchEvent(new CustomEvent('favoriteschange'));
 });
 window.addEventListener('storage',event=>{if(event.key!=='soyuz-favorites')return;try{const value=JSON.parse(event.newValue||'[]');favorites=Array.isArray(value)?value.filter(id=>listings.some(item=>item.id===id)):[];}catch{favorites=[];}updateFavorites();document.dispatchEvent(new CustomEvent('favoriteschange'));});
 const toggle=document.querySelector('.menu-toggle'),navigation=document.querySelector('#navigation');
 function closeMenu(){if(!toggle||!navigation)return;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');navigation.classList.remove('open');navigation.inert=true;}
 if(toggle&&navigation){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');navigation.classList.toggle('open',open);navigation.inert=!open;});navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});}
 document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelectorAll('[data-close-dialog],.dialog-close').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});});
 const content={
  buy:{title:'Подберём квартиру',text:'Расскажите, какую квартиру вы ищете: район, количество комнат, бюджет и удобные сроки. Обсудим ваш запрос с риэлтором агентства СОЮЗ.',subject:'Подбор квартиры в Нижнекамске'},
  sell:{title:'Продажа недвижимости',text:'Планируете продать недвижимость в Нижнекамске? Расскажите об объекте и ваших пожеланиях. Обсудим условия и дальнейшие шаги.',subject:'Продажа недвижимости'},
  agent:{title:'Риэлторские услуги',text:'Покупка, продажа или другой вопрос о недвижимости — обсудите свою задачу с агентством. Уточним, какая помощь нужна именно вам.',subject:'Риэлторские услуги'},
  land:{title:'Земельные участки в Крыму',text:'Расскажите о желаемом расположении, площади и бюджете. Актуальные предложения и условия уточним при личном общении.',subject:'Земельный участок в Крыму'},
  'all-services':{title:'Недвижимость с СОЮЗ',text:'Выберите задачу, чтобы узнать подробнее и связаться с агентством.',options:['buy','sell','agent','land']}
 };
 const labels={buy:'Покупка квартиры',sell:'Продажа недвижимости',agent:'Риэлторские услуги',land:'Участки в Крыму'},serviceDialog=document.querySelector('#service-dialog');
 function openService(key){const item=content[key];if(!item||!serviceDialog)return;serviceDialog.querySelector('#dialog-title').textContent=item.title;serviceDialog.querySelector('#dialog-description').textContent=item.text;const options=serviceDialog.querySelector('#dialog-options');options.replaceChildren();(item.options||[]).forEach(option=>{const button=document.createElement('button');button.className='dialog-option';button.type='button';button.textContent=labels[option];button.addEventListener('click',()=>openService(option));options.append(button);});const request=serviceDialog.querySelector('[data-service-request]');request.hidden=!!item.options;request.onclick=()=>{serviceDialog.close();window.SoyuzRequests.open({title:'Обсудим вашу задачу',subject:item.subject,wish:item.subject});};if(!serviceDialog.open)serviceDialog.showModal();}
 document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>openService(button.dataset.dialog)));
 document.querySelectorAll('[data-request]').forEach(button=>button.addEventListener('click',()=>window.SoyuzRequests.open({title:'Подберём ваш вариант',subject:'Подбор недвижимости'})));
 document.querySelectorAll('[data-year],#year').forEach(el=>el.textContent=String(new Date().getFullYear()));
 window.Soyuz={listings,icon,escape,updateFavorites,isFavorite:id=>favorites.includes(id),money:value=>new Intl.NumberFormat('ru-RU').format(value)+' ₽',card(item,from=''){const url=`property.html?id=${encodeURIComponent(item.id)}`+(from?'&from='+encodeURIComponent(from):'');return `<article class="property-card"><a class="property-open" href="${escape(url)}"><img src="${escape(item.image)}" alt="${escape(item.imageAlt)}" width="1200" height="800" loading="lazy"><span class="property-body"><strong>${escape(item.title)}</strong><span class="property-location">${escape(item.city)}, ${escape(item.address)}</span><span class="catalog-card-features">${escape(item.features)}</span><span class="property-price">${escape(item.price)}</span></span></a><button class="favorite" type="button" data-favorite="${escape(item.id)}" aria-pressed="false" aria-label="Добавить в избранное: ${escape(item.title)}">${icon('heart')}</button></article>`;}};
 updateFavorites();
})();
