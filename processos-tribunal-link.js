(()=>{
  function norm(v){return String(v||'').replace(/\D/g,'')}
  function fmt(n){n=norm(n);return n.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,'$1-$2.$3.$4.$5.$6')}
  function urlTJSP(numero){
    const n=norm(numero);
    if(n.length!==20)return null;
    const f=fmt(n),digAno=f.slice(0,15),foro=n.slice(-4);
    const q=new URLSearchParams({conversationId:'','dadosConsulta.localPesquisa.cdLocal':'-1',cbPesquisa:'NUMPROC','dadosConsulta.tipoNuProcesso':'UNIFICADO',numeroDigitoAnoUnificado:digAno,foroNumeroUnificado:foro,'dadosConsulta.valorConsultaNuUnificado':f,'dadosConsulta.valorConsulta':''});
    return 'https://esaj.tjsp.jus.br/cpopg/search.do?'+q.toString();
  }
  window.abrirProcessoTribunal=function(id){
    const p=(window.D?.processos||[]).find(x=>x.id===id);
    if(!p){alert('Processo não encontrado.');return;}
    const numero=p.numero_cnj||'';
    const n=norm(numero);
    const t=String(p.tribunal||'').toUpperCase().replace(/\s+/g,'');
    const ramoTribunal=n.length===20?n.slice(13,16):'';
    let url=null;

    if(n.length===20 && (ramoTribunal==='826' || t.includes('TJSP'))) {
      url=urlTJSP(numero);
    } else if(t.includes('TRT15') || ramoTribunal==='515') {
      url='https://pje.trt15.jus.br/consultaprocessual';
    } else if(t.includes('TRT2') || ramoTribunal==='502') {
      url='https://pje.trt2.jus.br/consultaprocessual/';
    } else if(t.includes('TRF3') || ramoTribunal==='403') {
      url='https://pje1g.trf3.jus.br/pje/ConsultaPublica/listView.seam';
    }

    if(!url){alert('Ainda não há um atalho configurado para este tribunal.');return;}
    window.open(url,'_blank','noopener');
  };

  const aplicar=()=>{
    const renderBase=window.renderProcessosAprimorados;
    if(typeof renderBase!=='function'||!window.D){setTimeout(aplicar,200);return;}
    if(renderBase.__tribunalLinkAplicado)return;
    function renderComLink(){
      renderBase();
      const tb=document.getElementById('tbProcessos');
      if(!tb)return;
      const linhas=[...tb.querySelectorAll('tr')];
      linhas.forEach((tr,i)=>{
        const td=tr.cells?.[0];if(!td)return;
        const p=(window.D.processos||[]).filter(proc=>{
          const campo=document.getElementById('buscaProcesso');
          const busca=String(campo?.value||'').replace(/\D/g,'');
          const bateBusca=!busca||String(proc.numero_cnj||'').replace(/\D/g,'').includes(busca);
          const visivel=!document.getElementById('btnAlternarArquivados')||true;
          return bateBusca&&visivel;
        })[i];
        if(!p||td.querySelector('.btnTribunalDireto'))return;
        const b=document.createElement('button');
        b.type='button';b.className='secondary btnTribunalDireto';
        b.textContent='↗';b.title='Abrir processo no tribunal';
        b.style.cssText='margin-left:6px;padding:4px 8px;vertical-align:middle';
        b.onclick=()=>window.abrirProcessoTribunal(p.id);
        td.appendChild(b);
      });
    }
    renderComLink.__tribunalLinkAplicado=true;
    window.renderProcessosAprimorados=renderComLink;
    renderComLink();
  };
  aplicar();
})();
