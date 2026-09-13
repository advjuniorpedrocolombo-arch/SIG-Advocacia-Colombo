(()=>{
  const somenteNumeros=v=>String(v||'').replace(/\D/g,'');

  function filtrarProcessosSIG(){
    const campo=document.getElementById('buscaProcesso');
    const tbody=document.getElementById('tbProcessos');
    const saida=document.getElementById('resultadoBuscaProcesso');
    if(!campo||!tbody)return;

    const termo=somenteNumeros(campo.value);
    const linhas=Array.from(tbody.querySelectorAll('tr'));
    let visiveis=0;

    linhas.forEach(tr=>{
      const numero=somenteNumeros(tr.cells[0]?.textContent||'');
      const ok=!termo||numero.includes(termo);
      tr.style.display=ok?'':'none';
      if(ok)visiveis++;
    });

    if(saida){
      saida.textContent=termo
        ? (visiveis?`${visiveis} processo(s) encontrado(s)`:'Processo não encontrado')
        : `${linhas.length} processo(s)`;
    }
  }

  function limparBuscaProcessoSIG(){
    const campo=document.getElementById('buscaProcesso');
    if(campo)campo.value='';
    filtrarProcessosSIG();
    campo?.focus();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#btnBuscarProcesso')){
      e.preventDefault();
      filtrarProcessosSIG();
    }
    if(e.target.closest('#btnLimparBuscaProcesso')){
      e.preventDefault();
      limparBuscaProcessoSIG();
    }
  });

  document.addEventListener('keydown',e=>{
    if(e.target?.id==='buscaProcesso'&&e.key==='Enter'){
      e.preventDefault();
      filtrarProcessosSIG();
    }
  });

  function observarTabela(){
    const tbody=document.getElementById('tbProcessos');
    if(!tbody){setTimeout(observarTabela,200);return;}
    let agendado=false;
    new MutationObserver(()=>{
      if(agendado)return;
      agendado=true;
      setTimeout(()=>{agendado=false;filtrarProcessosSIG();},0);
    }).observe(tbody,{childList:true});
    filtrarProcessosSIG();
  }

  window.filtrarProcessosSIG=filtrarProcessosSIG;
  window.limparBuscaProcessoSIG=limparBuscaProcessoSIG;
  observarTabela();
})();
