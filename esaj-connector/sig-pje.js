(()=>{
  function norm(v){return String(v||'').replace(/\D/g,'')}
  function fmt(n){n=norm(n);return n.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,'$1-$2.$3.$4.$5.$6')}
  function dadosTRT(cnj){
    const n=norm(cnj);
    if(n.length!==20||n[13]!=='5')return null;
    const trt=Number(n.slice(14,16));
    if(!trt)return null;
    return {cnj:fmt(n),trt};
  }

  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');
    if(!b)return;
    const texto=(b.textContent||'').trim().toLowerCase();
    const titulo=(b.title||'').toLowerCase();
    if(!(texto.includes('tribunal')||titulo.includes('tribunal')))return;

    const tr=b.closest('tr');
    if(!tr)return;
    const m=(tr.innerText||'').match(/\b\d{7}-\d{2}\.\d{4}\.5\.\d{2}\.\d{4}\b/);
    if(!m)return;
    const d=dadosTRT(m[0]);
    if(!d)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    try{
      await chrome.storage.local.set({
        SIG_PJE_ABRIR:{cnj:d.cnj,trt:d.trt,criado_em:Date.now()}
      });
      window.open(`https://pje.trt${d.trt}.jus.br/primeirograu/`,'_blank','noopener');
    }catch(err){
      console.error('SIG PJe:',err);
      alert('Não foi possível acionar o conector do PJe. Recarregue a extensão SIG — Conector Tribunais no Chrome.');
    }
  },true);
})();
