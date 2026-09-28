(()=>{
  const URL_CONTRATOS='https://advjuniorpedrocolombo-arch.github.io/Contratos_honor-rios/';
  function inserir(){
    const menu=document.getElementById('menu');
    if(!menu || document.getElementById('btnContratosHonorarios')) return false;
    const btn=document.createElement('button');
    btn.id='btnContratosHonorarios';
    btn.type='button';
    btn.textContent='Contratos de Honorários';
    btn.title='Abrir sistema de contratos automáticos';
    btn.addEventListener('click',()=>window.open(URL_CONTRATOS,'_blank','noopener,noreferrer'));
    menu.appendChild(btn);
    return true;
  }
  if(!inserir()){
    const obs=new MutationObserver(()=>{ if(inserir()) obs.disconnect(); });
    obs.observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('load',inserir,{once:true});
  }
})();
