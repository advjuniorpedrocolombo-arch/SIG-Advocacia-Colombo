(()=>{
  const FOTO='avatar-junior.svg?v=20260913-1715';

  function irPainel(){
    const btn=document.querySelector('#menu button[data-p="painel"]');
    if(btn)btn.click();
  }

  function aplicar(){
    const side=document.querySelector('.side');
    const top=document.querySelector('.top');
    if(!side||!top)return;

    const oabOriginal=top.querySelector('.tag');
    if(oabOriginal)oabOriginal.style.display='none';

    if(!document.getElementById('sigPerfilAdvogado')){
      const h=side.querySelector('h3');
      if(h)h.style.display='none';

      const bloco=document.createElement('div');
      bloco.id='sigPerfilAdvogado';
      bloco.setAttribute('role','button');
      bloco.setAttribute('tabindex','0');
      bloco.setAttribute('aria-label','Voltar ao Painel');
      bloco.title='Voltar ao Painel';
      bloco.style.cssText='text-align:center;padding:4px 4px 14px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.16);cursor:pointer;transition:transform .15s ease,opacity .15s ease';
      bloco.innerHTML=`
        <div id="sigFotoWrap" style="width:88px;height:88px;border-radius:50%;border:3px solid rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(0,0,0,.22);margin:0 auto 10px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;transition:transform .15s ease">
          <img id="sigFotoAdvogado" src="${FOTO}" alt="Dr. Junior P. Colombo" style="width:100%;height:100%;object-fit:cover;display:block">
        </div>
        <div style="font-weight:700;font-size:15px;line-height:1.3">Dr. Junior P. Colombo</div>
        <div style="font-size:12px;color:#d8e4f3;margin-top:4px">OAB/SP 510.497</div>
        <div style="font-size:10px;color:#aebfd4;margin-top:5px">Clique na foto para voltar ao Painel</div>`;
      side.insertBefore(bloco,side.firstChild);

      bloco.addEventListener('click',irPainel);
      bloco.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();irPainel();}});
      bloco.addEventListener('mouseenter',()=>{const w=document.getElementById('sigFotoWrap');if(w)w.style.transform='scale(1.04)';});
      bloco.addEventListener('mouseleave',()=>{const w=document.getElementById('sigFotoWrap');if(w)w.style.transform='scale(1)';});

      const img=document.getElementById('sigFotoAdvogado');
      if(img){
        img.onerror=()=>{
          const wrap=document.getElementById('sigFotoWrap');
          if(wrap){wrap.innerHTML='<div style="font-weight:800;font-size:25px;color:#173b72">JC</div>';}
        };
      }
    }

    if(!document.getElementById('sigLinkEtec')){
      const perfil=document.getElementById('sigPerfilAdvogado');
      if(perfil){
        const atalho=document.createElement('a');
        atalho.id='sigLinkEtec';
        atalho.href='https://www.profjuniorcolombo.com';
        atalho.target='_blank';
        atalho.rel='noopener noreferrer';
        atalho.title='Abrir Prof. Junior Colombo';
        atalho.style.cssText='display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0 12px;padding:9px 10px;border:1px solid rgba(255,255,255,.18);border-radius:10px;color:#fff;text-decoration:none;background:rgba(255,255,255,.07);font-size:12px;font-weight:700;transition:background .15s ease,transform .15s ease';
        atalho.innerHTML='<span style="width:28px;height:28px;border-radius:8px;background:#fff;color:#173b72;display:grid;place-items:center;font-size:9px;font-weight:900;letter-spacing:.2px">ETEC</span><span>Portal do Professor</span><span aria-hidden="true">↗</span>';
        atalho.addEventListener('mouseenter',()=>{atalho.style.background='rgba(255,255,255,.13)';atalho.style.transform='translateY(-1px)';});
        atalho.addEventListener('mouseleave',()=>{atalho.style.background='rgba(255,255,255,.07)';atalho.style.transform='translateY(0)';});
        perfil.insertAdjacentElement('afterend',atalho);
      }
    }

    const marcaDuplicada=document.getElementById('sigMarcaTopo');
    if(marcaDuplicada)marcaDuplicada.remove();
  }

  let n=0;
  const t=setInterval(()=>{aplicar();if(++n>100)clearInterval(t);},200);
  document.addEventListener('click',()=>setTimeout(aplicar,0),true);
})();
