(()=>{
  const normalizar=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  function inserirBotoesEditarCompactos(){
    const processos=Array.isArray(window.D?.processos)?window.D.processos:[];
    document.querySelectorAll('#tbProcessos tr').forEach(tr=>{
      const td=tr.querySelector('td');
      if(!td||td.querySelector('.btnEditarMiniProc'))return;
      const texto=String(td.innerText||'');
      const numero=(texto.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)||[])[0];
      if(!numero)return;
      const p=processos.find(x=>String(x.numero_cnj||'').trim()===numero.trim());
      if(!p)return;
      const b=document.createElement('button');
      b.type='button';
      b.className='secondary btnEditarMiniProc';
      b.textContent='Editar';
      b.title='Editar processo';
      b.style.cssText='padding:2px 6px;margin-left:6px;font-size:9px;line-height:1.2;border-radius:6px;vertical-align:middle;min-height:auto';
      b.onclick=e=>{e.stopPropagation();if(typeof window.editarProcessoSIG==='function')window.editarProcessoSIG(p.id);};
      td.appendChild(b);
    });
  }

  const esperar=()=>{
    if(typeof window.renderProcessosAprimorados!=='function'||!document.getElementById('buscaProcesso')){
      setTimeout(esperar,180);return;
    }
    if(window.__buscaClienteProcessosAtiva)return;
    window.__buscaClienteProcessosAtiva=true;

    const original=window.renderProcessosAprimorados;
    window.renderProcessosAprimorados=function(){
      original.apply(this,arguments);
      inserirBotoesEditarCompactos();

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

    inserirBotoesEditarCompactos();
  };
  esperar();
})();
