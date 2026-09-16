(()=>{
  const esperar=()=>{
    const sec=document.getElementById('agenda');
    const tb=document.getElementById('tbAgenda');
    if(!sec||!tb||typeof D==='undefined'||typeof arquivarAgendaSIG!=='function'){
      setTimeout(esperar,150);return;
    }

    function tituloSeguro(s){
      return String(s||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
    }

    function aplicar(){
      const tarefas=D.agenda||[];
      [...tb.querySelectorAll('tr')].forEach(tr=>{
        const editar=[...tr.querySelectorAll('button')].find(b=>/editarAgendaSIG\('([^']+)'\)/.test(b.getAttribute('onclick')||''));
        if(!editar)return;
        const m=(editar.getAttribute('onclick')||'').match(/editarAgendaSIG\('([^']+)'\)/);
        if(!m)return;
        const id=m[1];
        const item=tarefas.find(x=>String(x.id)===String(id));
        if(!item)return;

        if(String(item.status||'').toLowerCase()==='arquivado'){
          tr.style.display='none';
          return;
        }
        tr.style.display='';

        const td=tr.lastElementChild;
        if(!td||td.querySelector('.sig-btn-arquivar'))return;
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='secondary sig-btn-arquivar';
        btn.textContent='Arquivar';
        btn.style.marginLeft='6px';
        btn.style.color='#8a4b08';
        btn.style.background='#fff7e8';
        btn.onclick=()=>arquivarAgendaSIG(id,item.titulo||'');
        const excluir=[...td.querySelectorAll('button')].find(b=>(b.textContent||'').trim().toLowerCase()==='excluir');
        if(excluir)td.insertBefore(btn,excluir);else td.appendChild(btn);
      });
    }

    let pendente=false;
    const obs=new MutationObserver(()=>{
      if(pendente)return;
      pendente=true;
      requestAnimationFrame(()=>{pendente=false;aplicar();});
    });
    obs.observe(tb,{childList:true,subtree:true});
    aplicar();
  };
  esperar();
})();
