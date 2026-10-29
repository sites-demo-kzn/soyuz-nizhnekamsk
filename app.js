'use strict';
const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');navigation.classList.remove('open');navigation.inert=true;}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');navigation.classList.toggle('open',open);navigation.inert=!open;});
navigation.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
const content={
 buy:{title:'Подберём квартиру',text:'Расскажите, какую квартиру вы ищете: район, количество комнат, бюджет и удобные сроки. Обсудим ваш запрос с риэлтором агентства СОЮЗ.',message:'Здравствуйте! Интересует подбор квартиры в Нижнекамске. Хочу обсудить варианты.'},
 sell:{title:'Продадим вашу недвижимость',text:'Планируете продать недвижимость в Нижнекамске? Расскажите об объекте и ваших пожеланиях. Обсудим условия и дальнейшие шаги.',message:'Здравствуйте! Хочу обсудить продажу недвижимости в Нижнекамске.'},
 agent:{title:'Риэлторские услуги',text:'Покупка, продажа или другой вопрос о недвижимости — обсудите свою задачу с агентством. Уточним, какая помощь нужна именно вам.',message:'Здравствуйте! Нужна консультация по риэлторским услугам.'},
 land:{title:'Земельные участки в Крыму',text:'Ищете участок в Крыму? Расскажите о желаемом расположении, площади и бюджете. Актуальные предложения и условия уточним при личном общении.',message:'Здравствуйте! Интересуют земельные участки в Крыму. Расскажите об актуальных предложениях.'},
 selection:{title:'Что вы ищете?',text:'Выберите направление — обсудим ваши пожелания и поможем сориентироваться в вариантах.',options:['buy','land'],message:'Здравствуйте! Хочу обсудить подбор недвижимости.'},
 'all-services':{title:'Недвижимость с СОЮЗ',text:'Выберите задачу, чтобы узнать подробнее и связаться с агентством.',options:['buy','sell','agent','land'],message:'Здравствуйте! Хочу узнать об услугах агентства СОЮЗ.'}
};
content.catalog={title:'Актуальные объекты',text:'Выберите объект, чтобы посмотреть подробности и связаться с агентством.',options:window.SOYUZ_LISTINGS.map(x=>x.id),message:'Здравствуйте! Интересуют объекты недвижимости.'};
window.SOYUZ_LISTINGS.forEach(item=>{content[item.id]={title:item.title,text:item.description,image:item.image,features:item.address+' · '+item.features+' · '+item.price,message:'Здравствуйте! Интересует '+item.title.toLowerCase()+', '+item.address+' за '+item.price+'. Расскажите подробнее.'};});
const labels={buy:'Покупка квартиры',sell:'Продажа недвижимости',agent:'Риэлторские услуги',land:'Участки в Крыму'};
window.SOYUZ_LISTINGS.forEach(item=>{labels[item.id]=item.title+' · '+item.price;});
const dialog=document.querySelector('#service-dialog');
function openService(key){const item=content[key];if(!item)return;document.querySelector('#dialog-title').textContent=item.title;document.querySelector('#dialog-description').textContent=item.text;const image=document.querySelector('#dialog-image');image.hidden=!item.image;if(item.image){image.src=item.image;image.alt=item.title;}const features=document.querySelector('#dialog-features');features.hidden=!item.features;features.textContent=item.features||'';document.querySelector('#dialog-whatsapp').href='https://wa.me/79083329032?text='+encodeURIComponent(item.message);const options=document.querySelector('#dialog-options');options.replaceChildren();(item.options||[]).forEach(option=>{const button=document.createElement('button');button.className='dialog-option';button.textContent=labels[option];button.type='button';button.addEventListener('click',()=>openService(option));options.append(button);});if(!dialog.open)dialog.showModal();}
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>openService(button.dataset.dialog)));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelector('#year').textContent=new Date().getFullYear();

let favorites=[];try{const saved=JSON.parse(localStorage.getItem('soyuz-favorites')||'[]');if(Array.isArray(saved))favorites=saved.filter(x=>window.SOYUZ_LISTINGS.some(i=>i.id===x));}catch{}
function updateFavorites(){document.querySelectorAll('[data-favorite]').forEach(button=>{const selected=favorites.includes(button.dataset.favorite);const item=window.SOYUZ_LISTINGS.find(i=>i.id===button.dataset.favorite);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',(selected?'Убрать из избранного: ':'Добавить в избранное: ')+item.title);});}
document.querySelectorAll('[data-favorite]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.favorite;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];let saved=true;try{localStorage.setItem('soyuz-favorites',JSON.stringify(favorites));}catch{saved=false;}updateFavorites();document.querySelector('#favorite-status').textContent=(favorites.includes(id)?'Объект добавлен в избранное':'Объект удалён из избранного')+(saved?'':'. Сохранение на устройстве недоступно.');}));updateFavorites();
