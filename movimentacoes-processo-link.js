(()=>{
  function instalar(){
    if(typeof render!=='function' || typeof D==='undefined')return false;
    if(window.__SIG_MOV_LINK_PATCHED)return true;
    window.__SIG_MOV_LINK_PATCHED=true;

    const renderOriginal=render;
    render=function(){
      const r=renderOriginal.apply(this,arguments);
      setTimeout(decorar,0);
      return r;
    };

    function decorar(){
      const tb=document.getElementById('tbMov');
      if(!tb || !Array.isArray(D.movimentacoes))return;
      const linhas=[...tb.querySelectorAll('tr')];
      linhas.forEach((tr,i)=>{
        if(tr.querySelector('.btnAbrirProcessoMov'))return;
        const mov=D.movimentacoes[i];
        if(!mov?.processo_id)return;
        const p=Array.isArray(D.processos)?D.processos.find(x=>x.id===mov.processo_id):null;
        if(!p)return;
        const td=tr.lastElementChild;
        if(!td)return;
        const b=document.createElement('button');
        b.type='button';
        b.className='secondary btnAbrirProcessoMov';
        b.textContent='Abrir processo ↗';
        b.title='Abrir processo diretamente no tribunal';
        b.style.marginLeft='6px';
        b.onclick=()=>{
          if(typeof window.abrirProcessoTribunal==='function')window.abrirProcessoTribunal(mov.processo_id);
          else alert('Atalho do tribunal ainda não está disponível.');
        };
        td.appendChild(b);
      });
    }

    decorar();
    return true;
  }

  let tentativas=0;
  const timer=setInterval(()=>{
    if(instalar() || ++tentativas>80)clearInterval(timer);
  },150);
})();
