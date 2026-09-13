(()=>{
  const PESO={urgente:0,alta:1,normal:2,baixa:3};
  let organizando=false;

  function prioridadeDaLinha(row){
    const tag=row.querySelector('.sig-tag-prio');
    const valor=(tag?.textContent||'normal').trim().toLowerCase();
    return PESO[valor]??2;
  }

  function horarioDaLinha(row){
    const meta=(row.querySelector('.sig-check-meta')?.textContent||'').trim();
    const m=meta.match(/^(\d{1,2}):(\d{2})/);
    return m?(Number(m[1])*60+Number(m[2])):9999;
  }

  function ordenar(){
    if(organizando)return;
    organizando=true;
    try{
      document.querySelectorAll('#tarefas.sig-weekly .sig-day-body').forEach(body=>{
        const linhas=[...body.querySelectorAll(':scope > .sig-check-row')];
        if(linhas.length<2)return;
        linhas.sort((a,b)=>{
          const pa=prioridadeDaLinha(a),pb=prioridadeDaLinha(b);
          if(pa!==pb)return pa-pb;
          return horarioDaLinha(a)-horarioDaLinha(b);
        });
        linhas.forEach(l=>body.appendChild(l));
      });
    }finally{
      organizando=false;
    }
  }

  function observar(){
    const wrap=document.getElementById('sigTarefasSemanal');
    if(!wrap||wrap.dataset.prioridadeObserver==='1')return false;
    wrap.dataset.prioridadeObserver='1';
    const obs=new MutationObserver(()=>setTimeout(ordenar,0));
    obs.observe(wrap,{childList:true,subtree:true});
    ordenar();
    return true;
  }

  let tent=0;
  const timer=setInterval(()=>{
    observar();
    ordenar();
    if(++tent>80)clearInterval(timer);
  },250);

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#menu button[data-p="tarefas"],#tarefas'))setTimeout(()=>{observar();ordenar();},80);
  },true);

  window.organizarTarefasPorPrioridade=ordenar;
})();
