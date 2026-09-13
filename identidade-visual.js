(()=>{
  const FOTO='https://avatars.githubusercontent.com/u/322606806?v=4';

  function aplicar(){
    const side=document.querySelector('.side');
    const top=document.querySelector('.top');
    if(!side||!top)return;

    if(!document.getElementById('sigPerfilAdvogado')){
      const h=side.querySelector('h3');
      if(h)h.style.display='none';
      const bloco=document.createElement('div');
      bloco.id='sigPerfilAdvogado';
      bloco.style.cssText='text-align:center;padding:4px 4px 18px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.16)';
      bloco.innerHTML=`
        <img src="${FOTO}" alt="Dr. Junior P. Colombo" style="width:88px;height:88px;object-fit:cover;border-radius:50%;border:3px solid rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(0,0,0,.22);display:block;margin:0 auto 10px">
        <div style="font-weight:700;font-size:15px;line-height:1.3">Dr. Junior P. Colombo</div>
        <div style="font-size:12px;color:#d8e4f3;margin-top:4px">OAB/SP 510.497</div>`;
      side.insertBefore(bloco,side.firstChild);
    }

    if(!document.getElementById('sigMarcaTopo')){
      const marca=document.createElement('div');
      marca.id='sigMarcaTopo';
      marca.textContent='ADVOCACIA COLOMBO';
      marca.style.cssText='position:absolute;left:50%;transform:translateX(-50%);font-size:22px;font-weight:800;letter-spacing:1.4px;color:#173b72;white-space:nowrap;pointer-events:none';
      top.style.position='relative';
      top.appendChild(marca);

      const css=document.createElement('style');
      css.textContent='@media(max-width:900px){#sigMarcaTopo{position:static!important;transform:none!important;width:100%;text-align:center;order:-1;margin-bottom:10px}.top{flex-wrap:wrap!important}}';
      document.head.appendChild(css);
    }
  }

  let n=0;
  const t=setInterval(()=>{aplicar();if(++n>80)clearInterval(t);},200);
  document.addEventListener('click',()=>setTimeout(aplicar,0),true);
})();
