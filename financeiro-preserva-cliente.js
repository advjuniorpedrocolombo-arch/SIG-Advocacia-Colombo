(()=>{
'use strict';
const KEY='sig_fin_cliente_selecionado';
function getSelect(){return document.getElementById('finCliente')}
function remember(){const s=getSelect();if(s?.value)sessionStorage.setItem(KEY,s.value)}
function restore(){const s=getSelect(),id=sessionStorage.getItem(KEY);if(!s||!id||s.value===id)return;const exists=[...s.options].some(o=>o.value===id);if(!exists)return;s.value=id;s.dispatchEvent(new Event('change',{bubbles:true}))}
document.addEventListener('change',e=>{if(e.target?.id==='finCliente')remember()},true);
document.addEventListener('click',e=>{const t=e.target;if(t?.dataset?.ed||t?.dataset?.pg)remember()},true);
new MutationObserver(()=>{queueMicrotask(restore)}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore);else restore();
})();
