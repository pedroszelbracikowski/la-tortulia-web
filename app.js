const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionOK = !motionPreference.matches;
motionPreference.addEventListener('change', event => { motionOK = !event.matches; });
if (motionOK && !(window.gsap && window.ScrollTrigger) && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);} }),{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
const dialogs=[...document.querySelectorAll('dialog')];
function openDialog(dialog){if(dialog.open)return;dialog.showModal();document.body.classList.add('dialog-open');if(dialog.id==='menu-dialog')document.querySelector('.menu-toggle').setAttribute('aria-expanded','true');dialog.dispatchEvent(new CustomEvent('patio:dialogopen'));}
function closeDialog(dialog, afterClose){
  if(!dialog.open||dialog.dataset.closing==='true')return;
  dialog.dataset.closing='true';
  let finished=false;
  const complete=()=>{
    if(finished)return;
    finished=true;
    delete dialog.dataset.closing;
    if(afterClose)dialog.addEventListener('close',afterClose,{once:true});
    dialog.close();
    dialog.classList.remove('is-closing');
  };
  const request=new CustomEvent('patio:dialogclose',{cancelable:true,detail:{complete}});
  if(dialog.dispatchEvent(request))complete();
}
dialogs.forEach(dialog=>{dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(dialog)));dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});dialog.addEventListener('close',()=>{if(dialog.id==='menu-dialog')document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');if(!dialogs.some(d=>d.open))document.body.classList.remove('dialog-open');});dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);}});});
const menu=document.querySelector('#menu-dialog');
document.querySelector('.menu-toggle').addEventListener('click',()=>openDialog(menu));
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();closeDialog(menu,()=>window.location.assign(link.href));}));
const inquiry=document.querySelector('#inquiry-dialog');
const form=document.querySelector('#inquiry-form');
document.querySelectorAll('[data-inquiry]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.event)form.elements.evento.value=button.dataset.event;openDialog(inquiry);}));
const today=new Date();form.elements.data.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
form.addEventListener('submit',event=>{event.preventDefault();if(inquiry.dataset.closing==='true'||!form.reportValidity())return;const d=new FormData(form);const date=d.get('data').split('-').reverse().join('/');const message=`Olá, equipe do Pátio La Tertúlia! Gostaria de uma proposta para meu evento.\n\nNome: ${d.get('nome')}\nE-mail: ${d.get('email')}\nTelefone: ${d.get('telefone')}\nEvento: ${d.get('evento')}\nData desejada: ${date}\nConvidados: ${d.get('convidados')}\nNoivos / aniversariante: ${d.get('homenageados')}\nCerimônia: ${d.get('cerimonia')}\n\nO que imagino: ${d.get('detalhes')||'Gostaria de conhecer as possibilidades.'}`;window.open(`https://wa.me/553134661191?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');});
const gallery=document.querySelector('.gallery');
const galleryCards=[...gallery.querySelectorAll('.gallery-item')];
const galleryPrev=document.querySelector('#gallery-prev');
const galleryNext=document.querySelector('#gallery-next');
const galleryLimit=()=>Math.max(0,gallery.scrollWidth-gallery.clientWidth);
const galleryStops=()=>[...new Set([0,...galleryCards.map(card=>Math.min(card.offsetLeft,galleryLimit())),galleryLimit()])].sort((a,b)=>a-b);
function moveGallery(direction){
  const x=gallery.scrollLeft,stops=galleryStops();
  const next=direction>0?stops.find(stop=>stop>x+3):stops.reverse().find(stop=>stop<x-3);
  if(next!==undefined)gallery.scrollTo({left:next,behavior:motionOK?'smooth':'instant'});
}
function updateGalleryControls(){galleryPrev.disabled=gallery.scrollLeft<3;galleryNext.disabled=gallery.scrollLeft>=galleryLimit()-3;}
galleryPrev.addEventListener('click',()=>moveGallery(-1));
galleryNext.addEventListener('click',()=>moveGallery(1));
gallery.addEventListener('scroll',updateGalleryControls,{passive:true});
gallery.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='Home'||event.key==='End'){
    const index=event.key==='Home'?0:galleryCards.length-1;
    galleryCards[index].focus({preventScroll:true});
    gallery.scrollTo({left:event.key==='Home'?0:galleryLimit(),behavior:motionOK?'smooth':'instant'});
  }else{
    const index=galleryCards.indexOf(event.target),direction=event.key==='ArrowRight'?1:-1;
    if(index>=0){
      const card=galleryCards[Math.max(0,Math.min(galleryCards.length-1,index+direction))];
      card.focus({preventScroll:true});
      gallery.scrollTo({left:Math.min(card.offsetLeft,galleryLimit()),behavior:motionOK?'smooth':'instant'});
    }else moveGallery(direction);
  }
});
// Mouse dragging complements the native touch scroll, without opening a photo on release.
let galleryDrag=null,suppressPhotoClick=false;
gallery.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  suppressPhotoClick=false;
  galleryDrag={id:event.pointerId,x:event.clientX,scroll:gallery.scrollLeft,moved:false};
});
gallery.addEventListener('pointermove',event=>{
  if(!galleryDrag||event.pointerId!==galleryDrag.id)return;
  const distance=event.clientX-galleryDrag.x;
  if(!galleryDrag.moved&&Math.abs(distance)>7){galleryDrag.moved=true;gallery.setPointerCapture(event.pointerId);gallery.classList.add('is-dragging');}
  if(galleryDrag.moved){event.preventDefault();gallery.scrollLeft=galleryDrag.scroll-distance;}
});
function endGalleryDrag(event){
  if(!galleryDrag||event.pointerId!==galleryDrag.id)return;
  const moved=galleryDrag.moved;
  galleryDrag=null;
  gallery.classList.remove('is-dragging');
  if(gallery.hasPointerCapture(event.pointerId))gallery.releasePointerCapture(event.pointerId);
  if(moved){
    suppressPhotoClick=true;
    const nearest=galleryStops().reduce((a,b)=>Math.abs(b-gallery.scrollLeft)<Math.abs(a-gallery.scrollLeft)?b:a);
    gallery.scrollTo({left:nearest,behavior:motionOK?'smooth':'instant'});
    window.setTimeout(()=>{suppressPhotoClick=false;},0);
  }
}
gallery.addEventListener('pointerup',endGalleryDrag);
gallery.addEventListener('pointercancel',endGalleryDrag);
gallery.addEventListener('lostpointercapture',endGalleryDrag);
gallery.addEventListener('click',event=>{if(suppressPhotoClick){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
window.addEventListener('pointerup',endGalleryDrag);
window.addEventListener('resize',updateGalleryControls,{passive:true});
if('ResizeObserver'in window)new ResizeObserver(updateGalleryControls).observe(gallery);
updateGalleryControls();
const photos=[...document.querySelectorAll('[data-photo]')];let currentPhoto=0;
const lightbox=document.querySelector('#photo-dialog');
function showPhoto(index){currentPhoto=(index+photos.length)%photos.length;const photo=photos[currentPhoto];const image=document.querySelector('#lightbox-image');image.src=photo.dataset.photo;image.alt=photo.querySelector('img').alt;document.querySelector('#lightbox-caption').textContent=photo.dataset.caption;document.querySelector('#lightbox-count').textContent=`${currentPhoto+1} / ${photos.length}`;}
photos.forEach((photo,index)=>photo.addEventListener('click',()=>{showPhoto(index);openDialog(lightbox);}));
document.querySelector('#photo-prev').addEventListener('click',()=>showPhoto(currentPhoto-1));document.querySelector('#photo-next').addEventListener('click',()=>showPhoto(currentPhoto+1));lightbox.addEventListener('keydown',event=>{if(event.key==='ArrowRight')showPhoto(currentPhoto+1);if(event.key==='ArrowLeft')showPhoto(currentPhoto-1);});
