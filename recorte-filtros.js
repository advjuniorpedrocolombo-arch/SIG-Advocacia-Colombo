(()=>{
  const esperar=()=>{
    const sec=document.getElementById('recorte');
    const lista=document.getElementById('rdLista');
    if(!sec||!lista){setTimeout(esperar,220);return;}
    instalar(sec,lista);
  };

  function instalar(sec,lista){
    if(sec.dataset.filtrosRecorte==='1')return;
    sec.dataset.filtrosRecorte='1';

    let filtro=window.__filtroRecorteSIG||'todos';

    function recorteDoCard(card){
      let id=card.dataset.recorteId;
      if(!id){
        const b=[...card.querySelectorAll('button')].find(x=>(x.getAttribute('onclick')||'').includes('verRecorteDigital'));
        id=(b?.getAttribute('onclick')||'').match(/verRecorteDigital\('([^']+)'\)/)?.[1];
      }
      return (window.__recortesSIG||[]).find(r=>String(r.id)===String(id));
    }

    function passa(r){
      if(filtro==='nao')return !r.analisada;
      if(filtro==='analisadas')return !!r.analisada;
      if(filtro==='sem')return !r.processo_id;
      return true;
    }

    function mostrandoArquivados(){
      const b=document.getElementById('btnVerArquivadosRecorte');
      return !!b && b.textContent.trim().toLowerCase()==='ver ativos';
    }

    function aplicar(){
      window.__filtroRecorteSIG=filtro;
      sec.querySelectorAll('.rd-stat').forEach(c=>c.classList.toggle('ativo',c.dataset.filtro===filtro));

      const info=document.getElementById('rdFiltroInfo');
      const nomes={nao:'Não analisadas',analisadas:'Analisadas',sem:'Sem processo vinculado'};
      if(info){
        info.textContent=filtro==='todos'?'':`Filtro ativo: ${nomes[filtro]||''}. Clique em “Total de publicações” para limpar.`;
        info.style.display=filtro==='todos'?'none':'block';
      }

      const arq=mostrandoArquivados();
      lista.querySelectorAll('.rd-card').forEach(card=>{
        const r=recorteDoCard(card);if(!r)return;
        card.style.display=(!!r.arquivada===arq && passa(r))?'':'none';
      });
    }

    sec.addEventListener('click',e=>{
      const c=e.target.closest('.rd-stat[data-filtro]');
      if(c){filtro=c.dataset.filtro||'todos';setTimeout(aplicar,0);return;}
      if(e.target.closest('#btnVerArquivadosRecorte'))setTimeout(aplicar,30);
    });

    sec.addEventListener('keydown',e=>{
      const c=e.target.closest('.rd-stat[data-filtro]');
      if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();filtro=c.dataset.filtro||'todos';aplicar();}
    });

    const mo=new MutationObserver(()=>setTimeout(aplicar,20));
    mo.observe(lista,{childList:true,subtree:true});
    setTimeout(aplicar,50);
  }

  esperar();
})();
