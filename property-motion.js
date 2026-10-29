'use strict';
(() => {
 const params=new URLSearchParams(location.search), item=Soyuz.listings.find(item=>item.id===params.get('id'));
 if(!item){document.querySelector('#property-content').hidden=true;document.querySelector('#property-missing').hidden=false;document.title='Объект не найден — СОЮЗ';return;}
 const from=params.get('from')||'', back=/^catalog\.html(?:\?[a-zA-Z0-9%&=+_.-]*)?$/.test(from)?from:'catalog.html';document.querySelectorAll('[data-catalog-back]').forEach(link=>link.href=back);
 document.title=`${item.title}, ${item.address} — СОЮЗ`;
 document.querySelector('#property-title').textContent=item.title;document.querySelector('#property-address').textContent=`${item.city}, ${item.address}`;document.querySelector('#property-price').textContent=item.price;
 document.querySelector('#price-per-meter').textContent=Soyuz.money(Math.round(item.priceRub/item.area))+' за м²';document.querySelector('#property-description').textContent=item.description;document.querySelector('#property-details').textContent=item.details;
 document.querySelector('#property-characteristics').innerHTML=[['Комнат',item.rooms],['Общая площадь',item.area+' м²'],['Этаж',item.floor+' из '+item.floors],['Тип объекта','Квартира'],['Город',item.city]].map(([name,value])=>`<div><dt>${Soyuz.escape(name)}</dt><dd>${Soyuz.escape(value)}</dd></div>`).join('');
 const image=document.querySelector('#property-image');image.src=item.image;image.alt=item.imageAlt;const zoomImage=document.querySelector('#zoom-image');zoomImage.src=item.image;zoomImage.alt=item.imageAlt;document.querySelector('#property-zoom').addEventListener('click',()=>SoyuzMotion.openDialog(document.querySelector('#photo-dialog')));
 document.querySelector('#property-favorite').dataset.favorite=item.id;Soyuz.updateFavorites();
 document.querySelectorAll('[data-viewing]').forEach(button=>button.addEventListener('click',()=>SoyuzRequests.open({title:'Записаться на просмотр',subject:`Просмотр: ${item.title}, ${item.address}`,wish:`Интересует ${item.title.toLowerCase()}, ${item.city}, ${item.address}. Стоимость ${item.price}. Хочу договориться о просмотре.`,viewing:true})));
 document.querySelector('#property-question').addEventListener('click',()=>SoyuzRequests.open({title:'Вопрос об объекте',subject:`Вопрос: ${item.title}, ${item.address}`,wish:`Интересует ${item.title.toLowerCase()}, ${item.address}. `}));
 document.querySelector('#similar-listings').innerHTML=Soyuz.listings.filter(other=>other.id!==item.id).map(other=>Soyuz.card(other)).join('');Soyuz.updateFavorites();
 document.querySelector('#share-property').addEventListener('click',async()=>{const url=new URL('property.html?id='+encodeURIComponent(item.id),location.href).href;try{await navigator.clipboard.writeText(url);document.querySelector('#share-status').textContent='Ссылка на объявление скопирована';}catch{const input=document.querySelector('#share-url');input.hidden=false;input.value=url;input.focus();input.select();document.querySelector('#share-status').textContent='Скопируйте ссылку из поля ниже';}});
})();
