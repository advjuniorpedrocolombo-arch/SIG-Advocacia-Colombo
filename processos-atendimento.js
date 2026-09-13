(()=>{
  let filtro='TODOS';

  function normalizarTipo(v){
    const s=String(v||'').trim().toUpperCase();
    return (s==='PARTICULAR'||s==='DPESP')?s:null;
  }
  function ehTrabalhista(p){
    const area=String(p?.area||'').trim().toLowerCase();
    return area.includes('trabalh');
  }

  function instalarCampoNovo(){
    const form=document.getElementById('fProcesso');
    if(!form||form.elements.tipo_atendimento)return;
    const grid=form.querySelector('.formgrid');
    if(!grid)return;
    const box=document.createElement('div');
    box.innerHTML='<label>Tipo de atendimento</label><select name="tipo_atendimento"><option value="">Não definido</option><option value="PARTICULAR">Particular</option><option value="DPESP">DPESP</option></select>';
    const area=grid.querySelector('input[name="area"]')?.closest('div');
    if(area&&area.nextSibling)grid.insertBefore(box,area.nextSibling);else grid.appendChild(box);
  }

  function instalarCampoEdicao(){
    const form=document.getElementById('fEditarProcessoSIG');
    if(!form)return;
    const grid=form.querySelector('.formgrid');
    if(!grid)return;
    if(!form.elements.tipo_atendimento){
      const box=document.createElement('div');
      box.innerHTML='<label>Tipo de atendimento</label><select name="tipo_atendimento"><option value="">Não definido</option><option value="PARTICULAR">Particular</option><option value="DPESP">DPESP</option></select>';
      const area=grid.querySelector('input[name="area"]')?.closest('div');
      if(area&&area.nextSibling)grid.insertBefore(box,area.nextSibling);else grid.appendChild(box);
    }

    if(!window.__SIG_TIPO_ATENDIMENTO_EDIT_PATCHED&&typeof window.editarProcessoSIG==='function'){
      const anterior=window.editarProcessoSIG;
      window.__SIG_TIPO_ATENDIMENTO_EDIT_PATCHED=true;
      window.editarProcessoSIG=function(id){
        anterior(id);
        const p=(typeof D!=='undefined'&&Array.isArray(D.processos))?D.processos.find(x=>x.id===id):null;
        const f=document.getElementById('fEditarProcessoSIG');
        if(f?.elements.tipo_atendimento)f.elements.tipo_atendimento.value=normalizarTipo(p?.tipo_atendimento)||'';
      };
    }

    if(!form.__sigTipoAtendimentoSubmit){
      form.__sigTipoAtendimentoSubmit=true;
      form.onsubmit=async e=>{
        e.preventDefault();
        const f=e.currentTarget;
        const id=f.elements.id.value;
        let link=null;
        if(f.elements.link_pje&&String(f.elements.link_pje.value||'').trim()){
          try{
            const u=new URL(String(f.elements.link_pje.value).trim());
            if(u.protocol!=='https:')throw new Error();
            link=u.href;
          }catch(_e){alert('Link direto PJe inválido. Cole o endereço completo da barra do navegador.');return;}
        }
        const payload={
          partes:String(f.elements.partes.value||'').trim()||null,
          area:String(f.elements.area.value||'').trim()||null,
          tipo_atendimento:normalizarTipo(f.elements.tipo_atendimento.value),
          comarca:String(f.elements.comarca.value||'').trim()||null,
          vara:String(f.elements.vara.value||'').trim()||null,
          parte_contraria:String(f.elements.parte_contraria.value||'').trim()||null,
          observacoes:String(f.elements.observacoes.value||'').trim()||null,
          atualizado_em:new Date().toISOString()
        };
        if(f.elements.link_pje)payload.link_pje=link;
        const btn=f.querySelector('button[type="submit"]');
        const antigo=btn.textContent;btn.disabled=true;btn.textContent='Salvando...';
        const {error}=await sb.from('processos').update(payload).eq('id',id);
        btn.disabled=false;btn.textContent=antigo;
        if(error){alert('Não foi possível salvar as alterações: '+error.message);return;}
        document.getElementById('mEditarProcessoSIG')?.classList.add('hidden');
        await load();
        alert('Processo atualizado com sucesso.');
      };
    }
  }

  function estiloBotoes(){
    ['TODOS','PARTICULAR','DPESP','TRABALHISTA'].forEach(v=>{
      const b=document.getElementById('filtroAtendimento'+v);
      if(!b)return;
      b.className=v===filtro?'primary':'secondary';
    });
  }

  function instalarFiltros(){
    if(document.getElementById('filtrosTipoAtendimento'))return;
    const busca=document.getElementById('buscaProcessoBox')||document.getElementById('buscaProcesso')?.parentElement;
    if(!busca)return;
    const box=document.createElement('div');
    box.id='filtrosTipoAtendimento';
    box.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px';
    box.innerHTML='<span class="small" style="font-weight:700">Filtrar processos:</span><button type="button" id="filtroAtendimentoTODOS" class="primary">Todos</button><button type="button" id="filtroAtendimentoPARTICULAR" class="secondary">Particular</button><button type="button" id="filtroAtendimentoDPESP" class="secondary">DPESP</button><button type="button" id="filtroAtendimentoTRABALHISTA" class="secondary">Trabalhista</button>';
    busca.insertAdjacentElement('afterend',box);
    ['TODOS','PARTICULAR','DPESP','TRABALHISTA'].forEach(v=>document.getElementById('filtroAtendimento'+v).onclick=()=>{filtro=v;estiloBotoes();window.renderProcessosAprimorados?.();});
  }

  function instalarRender(){
    if(window.__SIG_TIPO_ATENDIMENTO_RENDER_PATCHED||typeof window.renderProcessosAprimorados!=='function')return;
    const original=window.renderProcessosAprimorados;
    window.__SIG_TIPO_ATENDIMENTO_RENDER_PATCHED=true;
    window.renderProcessosAprimorados=function(){
      if(filtro==='TODOS'){
        original();
      }else{
        const todos=Array.isArray(D.processos)?D.processos:[];
        const filtrados=todos.filter(p=>filtro==='TRABALHISTA'?ehTrabalhista(p):normalizarTipo(p.tipo_atendimento)===filtro);
        D.processos=filtrados;
        try{original();}finally{D.processos=todos;}
        const mproc=document.getElementById('mproc');
        if(mproc)mproc.textContent=todos.filter(p=>String(p.status||'').toLowerCase()!=='arquivado').length;
        const saida=document.getElementById('resultadoBuscaProcesso')||document.getElementById('contagemProcessos');
        if(saida){
          const ativos=filtrados.filter(p=>String(p.status||'').toLowerCase()!=='arquivado').length;
          const rotulo=filtro==='PARTICULAR'?'particular(es)':filtro==='DPESP'?'DPESP':'trabalhista(s)';
          saida.textContent=`${ativos} processo(s) ${rotulo} ativo(s)`;
        }
      }
      marcarTipos();
    };
  }

  function marcarTipos(){
    const tb=document.getElementById('tbProcessos');
    if(!tb||typeof D==='undefined')return;
    [...tb.querySelectorAll('tr')].forEach(tr=>{
      const td=tr.cells?.[0];if(!td||td.querySelector('.sig-tipo-atendimento'))return;
      const numero=String(td.textContent||'').match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)?.[0];
      if(!numero)return;
      const p=(D.processos||[]).find(x=>String(x.numero_cnj||'')===numero);
      const tipo=normalizarTipo(p?.tipo_atendimento);
      if(!tipo)return;
      const tag=document.createElement('span');
      tag.className='tag sig-tipo-atendimento';
      tag.style.cssText='margin-left:7px;white-space:nowrap';
      tag.textContent=tipo==='PARTICULAR'?'Particular':'DPESP';
      td.appendChild(tag);
    });
  }

  function iniciar(){
    if(typeof D==='undefined'||typeof sb==='undefined')return;
    instalarCampoNovo();
    instalarCampoEdicao();
    instalarFiltros();
    instalarRender();
    marcarTipos();
  }

  let n=0;
  const timer=setInterval(()=>{iniciar();if(++n>100)clearInterval(timer);},200);
  document.addEventListener('click',()=>setTimeout(iniciar,0),true);
})();
