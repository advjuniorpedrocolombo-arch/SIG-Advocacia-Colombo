(()=>{
  const esperar=()=>{
    const modal=document.getElementById('mTarefa');
    const form=document.getElementById('fTarefa');
    if(!modal||!form||typeof D==='undefined'){setTimeout(esperar,180);return;}
    instalar(modal,form);
  };

  function normaliza(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  }
  function soDigitos(v){return String(v||'').replace(/\D/g,'');}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));}

  function clienteDoProcesso(p){
    const c=(D.clientes||[]).find(x=>String(x.id)===String(p.cliente_id));
    return c?.nome||p.partes||'';
  }

  function instalar(modal,form){
    if(modal.dataset.buscaProcessoTarefa==='1')return;
    modal.dataset.buscaProcessoTarefa='1';

    const sel=form.elements.processo_id;
    if(!sel)return;
    const bloco=sel.closest('div')||sel.parentElement;
    if(!bloco)return;

    const acoes=document.createElement('div');
    acoes.style.cssText='display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-top:-4px;margin-bottom:10px';
    bloco.appendChild(acoes);

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='secondary';
    btn.id='btnBuscarProcessoTarefa';
    btn.textContent='Procurar processo / cliente';
    btn.style.cssText='width:100%;font-weight:700';
    acoes.appendChild(btn);

    const btnTribunal=document.createElement('button');
    btnTribunal.type='button';
    btnTribunal.className='secondary';
    btnTribunal.id='btnTribunalTarefa';
    btnTribunal.textContent='Tribunal ↗';
    btnTribunal.title='Abrir o processo vinculado no tribunal';
    btnTribunal.style.cssText='font-weight:700;white-space:nowrap;display:none';
    acoes.appendChild(btnTribunal);

    function processoSelecionado(){
      return (D.processos||[]).find(p=>String(p.id)===String(sel.value||''));
    }

    function atualizarBotaoTribunal(){
      const p=processoSelecionado();
      const habilitado=!!(p&&p.numero_cnj);
      btnTribunal.style.display=habilitado?'inline-block':'none';
      btnTribunal.disabled=!habilitado;
      btnTribunal.dataset.processoId=habilitado?String(p.id):'';
    }

    btnTribunal.onclick=()=>{
      const p=processoSelecionado();
      if(!p){alert('Selecione ou vincule um processo primeiro.');return;}
      if(typeof abrirProcessoTribunal==='function'){
        abrirProcessoTribunal(p.id);
      }else{
        alert('O atalho do tribunal ainda não está disponível nesta tela.');
      }
    };

    const painel=document.createElement('div');
    painel.id='painelBuscaProcessoTarefa';
    painel.style.cssText='display:none;margin:-2px 0 12px;padding:12px;border:1px solid #dbe4ef;border-radius:10px;background:#f8fbff';
    painel.innerHTML=`
      <label style="font-weight:700">Buscar por número do processo ou nome do cliente</label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input id="buscaProcessoTarefa" type="search" placeholder="Ex.: 1003162 ou Maria da Silva" style="margin:5px 0;flex:1;min-width:220px">
        <button type="button" class="secondary" id="limparBuscaProcessoTarefa">Limpar</button>
      </div>
      <div id="resultadosBuscaProcessoTarefa" style="display:grid;gap:6px;margin-top:6px"></div>
    `;
    bloco.appendChild(painel);

    const campo=painel.querySelector('#buscaProcessoTarefa');
    const resultados=painel.querySelector('#resultadosBuscaProcessoTarefa');
    const limpar=painel.querySelector('#limparBuscaProcessoTarefa');

    const renderResultados=()=>{
      const q=String(campo.value||'').trim();
      if(!q){resultados.innerHTML='<div class="small">Digite parte do número CNJ ou do nome do cliente.</div>';return;}
      const nq=normaliza(q), dq=soDigitos(q);
      const lista=(D.processos||[]).filter(p=>{
        const cnj=String(p.numero_cnj||'');
        const cliente=clienteDoProcesso(p);
        const titulo=String(p.titulo||'');
        return (dq&&soDigitos(cnj).includes(dq)) || normaliza(cliente).includes(nq) || normaliza(titulo).includes(nq);
      }).slice(0,20);
      if(!lista.length){resultados.innerHTML='<div class="small">Nenhum processo encontrado.</div>';return;}
      resultados.innerHTML=lista.map(p=>{
        const cliente=clienteDoProcesso(p)||'Cliente não informado';
        return `<button type="button" class="secondary resultado-processo-tarefa" data-id="${esc(p.id)}" style="text-align:left;padding:9px 10px;line-height:1.35;background:white;border:1px solid #dbe4ef">
          <strong>${esc(p.numero_cnj||'Sem número CNJ')}</strong><br>
          <span>${esc(cliente)}</span>${p.area?` <span class="small">— ${esc(p.area)}</span>`:''}
        </button>`;
      }).join('');
      resultados.querySelectorAll('.resultado-processo-tarefa').forEach(b=>{
        b.onclick=()=>{
          const id=b.dataset.id;
          let opt=[...sel.options].find(o=>String(o.value)===String(id));
          if(!opt){
            const p=(D.processos||[]).find(x=>String(x.id)===String(id));
            if(p){opt=document.createElement('option');opt.value=p.id;opt.textContent=p.titulo||p.numero_cnj||'Processo';sel.appendChild(opt);}
          }
          sel.value=id;
          sel.dispatchEvent(new Event('change',{bubbles:true}));
          const p=(D.processos||[]).find(x=>String(x.id)===String(id));
          const cliente=p?clienteDoProcesso(p):'';
          campo.value='';
          resultados.innerHTML=`<div class="small" style="color:#067647;font-weight:700">Vinculado: ${esc(p?.numero_cnj||'')} — ${esc(cliente||p?.titulo||'')}</div>`;
          atualizarBotaoTribunal();
          setTimeout(()=>{painel.style.display='none';},450);
        };
      });
    };

    btn.onclick=()=>{
      const abrir=painel.style.display==='none';
      painel.style.display=abrir?'block':'none';
      if(abrir){renderResultados();setTimeout(()=>campo.focus(),0);}
    };
    sel.addEventListener('change',atualizarBotaoTribunal);
    campo.oninput=renderResultados;
    campo.onkeydown=e=>{if(e.key==='Escape'){painel.style.display='none';campo.value='';}};
    limpar.onclick=()=>{campo.value='';renderResultados();campo.focus();};

    const observer=new MutationObserver(()=>atualizarBotaoTribunal());
    observer.observe(modal,{attributes:true,attributeFilter:['class']});
    setTimeout(atualizarBotaoTribunal,0);
  }

  esperar();
})();
