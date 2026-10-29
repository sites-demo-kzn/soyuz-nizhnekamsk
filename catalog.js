'use strict';
(() => {
 const form=document.querySelector('#filters'), grid=document.querySelector('#catalog-grid'), empty=document.querySelector('#catalog-empty'), count=document.querySelector('#results-count'), error=document.querySelector('#filter-error');
 const fields=['type','location','rooms','priceMin','priceMax','areaMin','areaMax','sort'];
 const params=new URLSearchParams(location.search);
 fields.forEach(name=>{const field=form.elements[name];if(!params.has(name))return;if(field instanceof RadioNodeList){if([...field].some(input=>input.value===params.get(name)))field.value=params.get(name);}else if(field.tagName==='SELECT'){if([...field.options].some(option=>option.value===params.get(name)))field.value=params.get(name);}else if(/^\d{1,10}$/.test(params.get(name)))field.value=params.get(name);});
 form.elements.favorites.checked=params.get('favorites')==='1';
 function values(){return {...Object.fromEntries(new FormData(form)),favorites:form.elements.favorites.checked,rooms:form.elements.rooms.value};}
 function summary(data){const parts=[];if(data.type)parts.push(data.type==='land'?'Земельный участок':'Квартира');if(data.location)parts.push(data.location==='crimea'?'Крым':'Нижнекамск');if(data.rooms&&data.type!=='land')parts.push(data.rooms==='studio'?'Студия':data.rooms==='3'?'3 комнаты и больше':data.rooms+' комн.');if(data.priceMin)parts.push('бюджет от '+Soyuz.money(Number(data.priceMin)));if(data.priceMax)parts.push('бюджет до '+Soyuz.money(Number(data.priceMax)));if(data.areaMin)parts.push('площадь от '+data.areaMin+' м²');if(data.areaMax)parts.push('площадь до '+data.areaMax+' м²');return parts.join(' · ');}
 function render(updateUrl=true){
  const focusedFavorite=document.activeElement?.dataset.favorite;const data=values();document.querySelector('#rooms-filter').disabled=data.type==='land';
  const numeric=['priceMin','priceMax','areaMin','areaMax'];numeric.forEach(name=>form.elements[name].setCustomValidity(''));error.textContent='';
  for(const name of numeric){if(form.elements[name].validity.badInput||(data[name]!==''&&(!Number.isFinite(Number(data[name]))||Number(data[name])<0))){error.textContent='Введите неотрицательное число в поле цены или площади.';return;}}
  for(const [min,max,label] of [['priceMin','priceMax','цены'],['areaMin','areaMax','площади']]){if(data[min]&&data[max]&&Number(data[min])>Number(data[max])){error.textContent=`Минимальное значение ${label} не может быть больше максимального.`;form.elements[max].setCustomValidity(error.textContent);return;}}
  const items=Soyuz.listings.filter(item=>(!data.type||item.type===data.type)&&(!data.location||item.location===data.location)&&(data.type==='land'||!data.rooms||(data.rooms==='studio'?item.rooms===0:data.rooms==='3'?item.rooms>=3:item.rooms===Number(data.rooms)))&&(!data.priceMin||item.priceRub>=Number(data.priceMin))&&(!data.priceMax||item.priceRub<=Number(data.priceMax))&&(!data.areaMin||item.area>=Number(data.areaMin))&&(!data.areaMax||item.area<=Number(data.areaMax))&&(!data.favorites||Soyuz.isFavorite(item.id)));
  items.sort((a,b)=>data.sort==='price-desc'?b.priceRub-a.priceRub:data.sort==='area-desc'?b.area-a.area:a.priceRub-b.priceRub);
  const query=new URLSearchParams();fields.forEach(name=>{if(data[name]&&!(name==='sort'&&data[name]==='price-asc')&&!(name==='rooms'&&data.type==='land'))query.set(name,data[name]);});if(data.favorites)query.set('favorites','1');
  const url='catalog.html'+(query.size?'?'+query.toString():'');if(updateUrl)history.replaceState(null,'',url);
  grid.innerHTML=items.map(item=>Soyuz.card(item,url)).join('');Soyuz.updateFavorites();if(focusedFavorite){const next=grid.querySelector('[data-favorite="'+focusedFavorite+'"]');if(next)next.focus();else{count.tabIndex=-1;count.focus();}}grid.hidden=items.length===0;empty.hidden=items.length>0;
  count.textContent=items.length===0?'Ничего не найдено':items.length===1?'Найден 1 объект':'Найдено '+items.length+' объекта';
  const selected=summary(data);document.querySelector('#filter-summary').textContent=selected||'Все объекты агентства';
  document.querySelector('#request-selection').onclick=()=>SoyuzRequests.open({title:'Оставьте пожелания',subject:'Сообщить о подходящем объекте',wish:selected,titleText:'Мы свяжемся с вами, когда появится подходящий вариант. Укажите телефон и расскажите, что вы ищете.'});
  document.querySelector('#catalog-request').onclick=()=>SoyuzRequests.open({title:'Подберём ваш вариант',subject:'Подбор недвижимости',wish:selected});
  document.querySelector('#empty-title').textContent=data.favorites?'В избранном пока нет таких вариантов':'Пока нет подходящих вариантов';
 }
 form.addEventListener('submit',event=>{event.preventDefault();render();});form.addEventListener('change',()=>render());form.addEventListener('input',event=>{if(event.target.type==='number')render();});form.addEventListener('reset',()=>setTimeout(()=>render(),0));
 document.querySelector('#empty-reset').addEventListener('click',()=>form.reset());document.addEventListener('favoriteschange',()=>render());window.addEventListener('pageshow',()=>render(false));render();
})();
