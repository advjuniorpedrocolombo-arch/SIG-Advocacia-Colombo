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

  window.abrirProcessoTribunal=function(ref){
    let p=null;
    try{
      if(typeof D!=='undefined' && Array.isArray(D.processos)){
        p=D.processos.find(x=>x.id===ref || norm(x.numero_cnj)===norm(ref));
      }
    }catch(_e){}

    const numero=p?.numero_cnj || ref || '';
    const n=norm(numero);
    const t=String(p?.tribunal||'').toUpperCase().replace(/\s+/g,'');
    const ramoTribunal=n.length===20?n.slice(13,16):'';
    let url=null;

    if(n.length!==20){alert('Número CNJ inválido.');return;}
    if(ramoTribunal==='826' || t.includes('TJSP')){
      url=urlTJSP(numero);
    }else if(ramoTribunal==='515' || t.includes('TRT15')){
      url='https://pje.trt15.jus.br/consultaprocessual/';
    }else if(ramoTribunal==='502' || t.includes('TRT2')){
      url='https://pje.trt2.jus.br/consultaprocessual/';
    }else if(ramoTribunal==='403' || t.includes('TRF3')){
      url='https://pje1g.trf3.jus.br/pje/ConsultaPublica/listView.seam';
    }

    if(!url){alert('Ainda não há um atalho configurado para este tribunal.');return;}
    window.open(url,'_blank','noopener');
  };
})();
