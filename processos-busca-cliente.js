(()=>{
  const normalizar=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const soDigitos=v=>String(v||'').replace(/\D/g,'');

  function nomeCliente(p){
    const clientes=Array.isArray(window.D?.clientes)?window.D.clientes:[];
    const c=clientes.find(x=>x.id===p.cliente_id);
    return c?.nome || p.partes || 'Sem cliente vinculado';
  }

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

  function garantirAutocomplete(){
    const campo=document.getElementById('buscaProcesso');
    if(!campo||document.getElementById('sugestoesBuscaProcesso'))return;
    const pai=document.getElementById('buscaProcessoBox')||campo.parentElement;
    if(!pai)return;
    pai.style.position='relative';
    const lista=document.createElement('div');
    lista.id='sugestoesBuscaProcesso';
    lista.style.cssText='display:none;position:absolute;left:0;top:calc(100% + 2px);width:min(560px,100%);max-height:330px;overflow:auto;background:#fff;border:1px solid #d7e0eb;border-radius:10px;box-shadow:0 12px 30px rgba(16,44,85,.16);z-index:9999;padding:5px';
    pai.appendChild(lista);
  }

  function fecharSugestoes(){
    const lista=document.getElementById('sugestoesBuscaProcesso');
    if(lista){lista.style.display='none';lista.innerHTML='';}
  }

  function mostrarSugestoes(){
    garantirAutocomplete();
    const campo=document.getElementById('buscaProcesso');
    const lista=document.getElementById('sugestoesBuscaProcesso');
    if(!campo||!lista)return;
    const termo=String(campo.value||'').trim();
    if(termo.length<3){fecharSugestoes();return;}

    const alvo=normalizar(termo), dig=soDigitos(termo);
    const processos=(Array.isArray(window.D?.processos)?window.D.processos:[]).filter(p=>{
      const nome=normalizar(nomeCliente(p));
      const numeroTxt=normalizar(p.numero_cnj||'');
      const numeroDig=soDigitos(p.numero_cnj||'');
      return nome.includes(alvo)||numeroTxt.includes(alvo)||(dig.length>=3&&numeroDig.includes(dig));
    }).slice(0,10);

    if(!processos.length){
      lista.innerHTML='<div style="padding:10px 12px;font-size:12px;color:#748398">Nenhum processo encontrado.</div>';
      lista.style.display='block';
      return;
    }

    lista.innerHTML=processos.map(p=>{
      const nome=String(nomeCliente(p)||'Sem cliente vinculado');
      const numero=String(p.numero_cnj||'Sem número');
      const area=String(p.area||'');
      const seguro=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      return `<button type="button" class="sugProcItem" data-id="${seguro(p.id)}" style="display:block;width:100%;text-align:left;border:0;background:#fff;padding:9px 10px;border-radius:8px;cursor:pointer;color:#172033"><strong style="display:block;font-size:12px">${seguro(nome)}</strong><span style="display:block;font-size:10px;color:#66788d;margin-top:2px">${seguro(numero)}${area?' · '+seguro(area):''}</span></button>`;
    }).join('');
    lista.style.display='block';

    lista.querySelectorAll('.sugProcItem').forEach(btn=>{
      btn.onmouseenter=()=>btn.style.background='#f3f7fc';
      btn.onmouseleave=()=>btn.style.background='#fff';
      btn.onclick=()=>{
        const p=(window.D?.processos||[]).find(x=>String(x.id)===String(btn.dataset.id));
        if(!p)return;
        campo.value=p.numero_cnj||nomeCliente(p);
        fecharSugestoes();
        if(typeof window.renderProcessosAprimorados==='function')window.renderProcessosAprimorados();
      };
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

      const dig=soDigitos(termo);
      const temLetras=/[A-Za-zÀ-ÿ]/.test(termo);
      if(!temLetras&&dig)return;

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
    campo.placeholder='Digite número do processo ou nome do cliente';
    campo.setAttribute('aria-label','Buscar processo por número ou nome do cliente');
    campo.setAttribute('autocomplete','off');

    garantirAutocomplete();

    campo.addEventListener('input',()=>{
      const termo=String(campo.value||'').trim();
      if(termo.length>=3){
        mostrarSugestoes();
        window.renderProcessosAprimorados();
      }else if(!termo){
        fecharSugestoes();
        window.renderProcessosAprimorados();
      }else{
        fecharSugestoes();
      }
    });
    campo.addEventListener('focus',()=>{if(String(campo.value||'').trim().length>=3)mostrarSugestoes();});
    campo.addEventListener('keydown',e=>{if(e.key==='Escape')fecharSugestoes();});
    document.addEventListener('click',e=>{if(e.target!==campo&&!e.target.closest('#sugestoesBuscaProcesso'))fecharSugestoes();});

    const btn=document.getElementById('btnBuscarProcesso');
    if(btn)btn.title='Buscar por número do processo ou nome do cliente';

    inserirBotoesEditarCompactos();
  };
  esperar();
})();
