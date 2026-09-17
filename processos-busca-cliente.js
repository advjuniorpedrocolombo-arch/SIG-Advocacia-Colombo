(()=>{
  const normalizar=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const esperar=()=>{
    if(typeof window.renderProcessosAprimorados!=='function'||!document.getElementById('buscaProcesso')){
      setTimeout(esperar,180);return;
    }
    if(window.__buscaClienteProcessosAtiva)return;
    window.__buscaClienteProcessosAtiva=true;

    const original=window.renderProcessosAprimorados;
    window.renderProcessosAprimorados=function(){
      original.apply(this,arguments);
      const campo=document.getElementById('buscaProcesso');
      const termo=String(campo?.value||'').trim();
      if(!termo)return;

      const soDigitos=termo.replace(/\D/g,'');
      const temLetras=/[A-Za-zÀ-ÿ]/.test(termo);
      if(!temLetras&&soDigitos)return;

      const alvo=normalizar(termo);
      const linhas=[...document.querySelectorAll('#tbProcessos tr')];
      let encontrados=0;
      linhas.forEach(tr=>{
        const celulas=tr.querySelectorAll('td');
        const numero=normalizar(celulas[0]?.innerText||'');
        const cliente=normalizar(celulas[1]?.innerText||'');
        const bate=cliente.includes(alvo)||numero.includes(alvo);
        tr.style.display=bate?'':'none';
        if(bate)encontrados++;
      });
      const saida=document.getElementById('resultadoBuscaProcesso')||document.getElementById('contagemProcessos');
      if(saida)saida.textContent=encontrados?`${encontrados} processo(s) encontrado(s)`:'Processo/cliente não encontrado';
    };

    const campo=document.getElementById('buscaProcesso');
    campo.placeholder='Digite o número do processo ou nome do cliente';
    campo.setAttribute('aria-label','Buscar processo por número ou nome do cliente');

    const btn=document.getElementById('btnBuscarProcesso');
    if(btn)btn.title='Buscar por número do processo ou nome do cliente';
  };
  esperar();
})();
