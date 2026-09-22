(()=>{
  let tentativas=0;
  const maxTentativas=160;

  function iniciar(){
    if(window.__sigRecorteAutoRefreshExecutado)return;

    const autenticado=typeof U!=='undefined'&&U;
    const btn=document.getElementById('btnAtualizarRecortes');

    if(!autenticado||!btn){
      if(++tentativas<maxTentativas)setTimeout(iniciar,250);
      return;
    }

    window.__sigRecorteAutoRefreshExecutado=true;
    const textoOriginal=btn.textContent;

    // O clique precisa ocorrer ANTES de o botão ser desabilitado.
    // Em elementos disabled, HTMLElement.click() não dispara o handler.
    try{
      btn.textContent='Atualizando...';
      btn.click();
    }finally{
      btn.disabled=true;
      setTimeout(()=>{
        btn.disabled=false;
        btn.textContent=textoOriginal;
      },1200);
    }
  }

  iniciar();
})();
