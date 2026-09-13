(()=>{
  const esperar=()=>{
    if(typeof render!=='function'||typeof sb==='undefined'||typeof load!=='function'||typeof D==='undefined'){
      setTimeout(esperar,150);return;
    }

    let mostrarArquivados=false;

    function clienteDoProcesso(p){
      const vinculado=(D.clientes||[]).find(c=>c.id===p.cliente_id);
      return vinculado?.nome || p.partes || '—';
    }

    function normCNJ(v){return String(v||'').replace(/\D/g,'')}
    function fmtCNJ(n){n=normCNJ(n);return n.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,'$1-$2.$3.$4.$5.$6')}
    function urlTJSP(numero){
      const n=normCNJ(numero);if(n.length!==20)return null;
      const f=fmtCNJ(n),digAno=f.slice(0,15),foro=n.slice(-4);
      const q=new URLSearchParams({conversationId:'','dadosConsulta.localPesquisa.cdLocal':'-1',cbPesquisa:'NUMPROC','dadosConsulta.tipoNuProcesso':'UNIFICADO',numeroDigitoAnoUnificado:digAno,foroNumeroUnificado:foro,'dadosConsulta.valorConsultaNuUnificado':f,'dadosConsulta.valorConsulta':''});
      return 'https://esaj.tjsp.jus.br/cpopg/search.do?'+q.toString();
    }
    window.abrirProcessoTribunal=function(id){
      const p=(D.processos||[]).find(x=>x.id===id);
      if(!p){alert('Processo não encontrado.');return;}
      const n=normCNJ(p.numero_cnj),t=String(p.tribunal||'').toUpperCase();
      let url=null;
      if(n.length===20&&(n.slice(13,16)==='826'||t==='TJSP'||t.includes('TJSP')))url=urlTJSP(p.numero_cnj);
      else if(t.includes('TRT2')||n.slice(13,16)==='502')url='https://pje.trt2.jus.br/consultaprocessual/';
      else if(t.includes('TRF3')||n.slice(13,16)==='403')url='https://pje1g.trf3.jus.br/pje/ConsultaPublica/listView.seam';
      if(!url){alert('Ainda não há um atalho configurado para este tribunal.');return;}
      window.open(url,'_blank','noopener');
    };

    async function prepararLoteEsaj(){
      try{
        const processos=(D.processos||[]).filter(p=>{
          const n=String(p.numero_cnj||'').replace(/\D/g,'');
          const ativo=String(p.status||'').toLowerCase()!=='arquivado';
          const tjsp=n.length===20&&(n.slice(13,16)==='826'||String(p.tribunal||'').toUpperCase()==='TJSP');
          return ativo&&tjsp;
        });
        if(!processos.length){alert('Nenhum processo TJSP ativo encontrado para atualização em lote.');return;}
        const pacote={tipo:'SIG_ESAJ_LOTE',gerado_em:new Date().toISOString(),processos:processos.map(p=>({id:p.id,numero_cnj:p.numero_cnj,titulo:p.titulo}))};
        await navigator.clipboard.writeText(JSON.stringify(pacote));
        alert('Lote preparado com '+processos.length+' processo(s) TJSP ativo(s).\n\nAgora abra a extensão SIG — Conector e-SAJ e clique em “Atualizar lote copiado”.');
      }catch(e){alert('Não foi possível preparar o lote: '+(e?.message||e));}
    }
    window.prepararLoteEsaj=prepararLoteEsaj;

    function garantirModalEditar(){
      if(document.getElementById('mEditarProcessoSIG'))return;
      const modal=document.createElement('div');
      modal.id='mEditarProcessoSIG';
      modal.className='modal hidden';
      modal.innerHTML=`<div class="card" style="width:min(720px,100%);max-height:90vh;overflow:auto">
        <h3>Editar processo</h3>
        <form id="fEditarProcessoSIG">
          <input type="hidden" name="id">
          <label>Número do processo</label>
          <input name="numero_cnj" readonly style="background:#f2f4f7">
          <div class="formgrid">
            <div><label>Meu cliente</label><input name="partes" placeholder="Nome do cliente"></div>
            <div><label>Área de atuação</label><input name="area" placeholder="Ex.: Família, Cível, Trabalhista"></div>
            <div><label>Comarca</label><input name="comarca"></div>
            <div><label>Vara</label><input name="vara"></div>
            <div class="span2"><label>Parte contrária</label><input name="parte_contraria"></div>
            <div class="span2"><label>Observações</label><textarea name="observacoes" rows="5"></textarea></div>
          </div>
          <div class="actions">
            <button type="button" class="secondary" id="cancelarEditarProcessoSIG">Cancelar</button>
            <button type="submit" class="primary">Salvar alterações</button>
          </div>
        </form>
      </div>`;
      document.body.appendChild(modal);
      document.getElementById('cancelarEditarProcessoSIG').onclick=()=>modal.classList.add('hidden');
      document.getElementById('fEditarProcessoSIG').onsubmit=async e=>{
        e.preventDefault();
        const f=e.currentTarget;
        const id=f.elements.id.value;
        const payload={
          partes:String(f.elements.partes.value||'').trim()||null,
          area:String(f.elements.area.value||'').trim()||null,
          comarca:String(f.elements.comarca.value||'').trim()||null,
          vara:String(f.elements.vara.value||'').trim()||null,
          parte_contraria:String(f.elements.parte_contraria.value||'').trim()||null,
          observacoes:String(f.elements.observacoes.value||'').trim()||null,
          atualizado_em:new Date().toISOString()
        };
        const salvar=f.querySelector('button[type="submit"]');
        salvar.disabled=true;salvar.textContent='Salvando...';
        const {error}=await sb.from('processos').update(payload).eq('id',id);
        salvar.disabled=false;salvar.textContent='Salvar alterações';
        if(error){alert('Não foi possível salvar as alterações: '+error.message);return;}
        modal.classList.add('hidden');
        await load();
        alert('Processo atualizado com sucesso.');
      };
    }

    window.editarProcessoSIG=function(id){
      garantirModalEditar();
      const p=(D.processos||[]).find(x=>x.id===id);
      if(!p){alert('Processo não encontrado.');return;}
      const f=document.getElementById('fEditarProcessoSIG');
      f.elements.id.value=p.id||'';
      f.elements.numero_cnj.value=p.numero_cnj||'';
      f.elements.partes.value=clienteDoProcesso(p)==='—'?'':clienteDoProcesso(p);
      f.elements.area.value=p.area||'';
      f.elements.comarca.value=p.comarca||'';
      f.elements.vara.value=p.vara||'';
      f.elements.parte_contraria.value=p.parte_contraria||'';
      f.elements.observacoes.value=p.observacoes||'';
      document.getElementById('mEditarProcessoSIG').classList.remove('hidden');
    };

    function ligarBusca(){
      const campo=document.getElementById('buscaProcesso');
      const btn=document.getElementById('btnBuscarProcesso');
      const limpar=document.getElementById('btnLimparBuscaProcesso') || document.getElementById('limparBuscaProcesso');
      const arquivados=document.getElementById('btnAlternarArquivados');
      if(!campo||!btn||!limpar)return;
      btn.onclick=()=>renderProcessosAprimorados();
      campo.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();renderProcessosAprimorados();}};
      campo.oninput=()=>{if(!String(campo.value||'').trim())renderProcessosAprimorados();};
      limpar.onclick=()=>{campo.value='';renderProcessosAprimorados();campo.focus();};
      if(arquivados){arquivados.onclick=()=>{mostrarArquivados=!mostrarArquivados;arquivados.textContent=mostrarArquivados?'Ocultar arquivados':'Mostrar arquivados';renderProcessosAprimorados();};}
    }

    function garantirBotoesTopo(sec){
      const toolbar=sec.querySelector('.toolbar');if(!toolbar)return;
      let actions=toolbar.lastElementChild;
      if(!actions||actions===toolbar.firstElementChild){actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap';toolbar.appendChild(actions);}
      if(!document.getElementById('btnAtualizarEsajLote')){const b=document.createElement('button');b.type='button';b.className='secondary';b.id='btnAtualizarEsajLote';b.textContent='Atualizar e-SAJ (lote)';b.onclick=prepararLoteEsaj;actions.insertBefore(b,actions.firstChild);}
    }

    function prepararTelaProcessos(){
      const sec=document.getElementById('processos');if(!sec)return;
      garantirBotoesTopo(sec);garantirModalEditar();
      const th=sec.querySelector('thead tr');if(th)th.innerHTML='<th>Número</th><th>Meu cliente</th><th>Área</th><th>Comarca</th><th>Vara</th><th>Tribunal</th><th>Status</th><th>Consulta</th><th>Ação</th>';
      const table=sec.querySelector('table');if(table)table.style.minWidth='1750px';
      if(!document.getElementById('buscaProcesso')){
        const toolbar=sec.querySelector('.toolbar'),box=document.createElement('div');
        box.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0 14px';
        box.innerHTML='<input id="buscaProcesso" type="search" placeholder="Digite o número do processo" style="width:min(360px,100%);margin:0"><button type="button" class="primary" id="btnBuscarProcesso">Buscar processo</button><button type="button" class="secondary" id="btnLimparBuscaProcesso">Limpar</button><button type="button" class="secondary" id="btnAlternarArquivados">Mostrar arquivados</button><span id="resultadoBuscaProcesso" class="small"></span>';
        toolbar.insertAdjacentElement('afterend',box);
      }else if(!document.getElementById('btnAlternarArquivados')){
        const limpar=document.getElementById('btnLimparBuscaProcesso') || document.getElementById('limparBuscaProcesso');
        if(limpar){const b=document.createElement('button');b.type='button';b.className='secondary';b.id='btnAlternarArquivados';b.textContent='Mostrar arquivados';limpar.insertAdjacentElement('afterend',b);}
      }
      ligarBusca();
    }

    window.renderProcessosAprimorados=function(){
      const tb=document.getElementById('tbProcessos');if(!tb)return;
      const campo=document.getElementById('buscaProcesso'),busca=String(campo?.value||'').replace(/\D/g,''),todos=(D.processos||[]);
      const lista=todos.filter(p=>{const bateBusca=!busca||String(p.numero_cnj||'').replace(/\D/g,'').includes(busca);const visivel=mostrarArquivados||String(p.status||'').toLowerCase()!=='arquivado';return bateBusca&&visivel;});
      tb.innerHTML=lista.map(p=>{
        const arquivado=String(p.status||'').toLowerCase()==='arquivado';
        const btnAtualizar=!arquivado&&p.numero_cnj?`<button type="button" class="secondary btnData" onclick="consultarDataJud('${p.id}',this)">Atualizar processo</button>`:'';
        const btnEditar=`<button type="button" class="secondary" style="margin-left:6px" onclick="editarProcessoSIG('${p.id}')">Editar</button>`;
        const btnArquivo=arquivado?`<button type="button" class="secondary" style="margin-left:6px" onclick="reativarProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Reativar</button>`:`<button type="button" class="secondary" style="margin-left:6px" onclick="arquivarProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Arquivar</button>`;
        const btnTribunal=p.numero_cnj?` <button type="button" class="secondary" title="Abrir processo no tribunal" style="padding:5px 9px;margin-left:7px;font-weight:700;white-space:nowrap" onclick="abrirProcessoTribunal('${p.id}')">Tribunal ↗</button>`:'';
        return `<tr><td style="white-space:nowrap">${esc(p.numero_cnj||'')}${btnTribunal}</td><td>${esc(clienteDoProcesso(p))}</td><td>${esc(p.area||'—')}</td><td>${esc(p.comarca||'—')}</td><td>${esc(p.vara||'—')}</td><td>${esc(p.tribunal||'—')}</td><td>${esc(p.status||'—')}</td><td>${datajudLabel(p)}</td><td style="white-space:nowrap">${btnAtualizar} ${btnEditar} ${btnArquivo} <button type="button" class="secondary" style="color:#b42318;margin-left:6px" onclick="excluirProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Excluir</button></td></tr>`;
      }).join('');
      const saida=document.getElementById('resultadoBuscaProcesso')||document.getElementById('contagemProcessos'),ativos=todos.filter(p=>String(p.status||'').toLowerCase()!=='arquivado').length,arquivados=todos.length-ativos;
      if(saida)saida.textContent=busca?(lista.length?lista.length+' processo(s) encontrado(s)':'Processo não encontrado'):mostrarArquivados?`${todos.length} processo(s) no total — ${arquivados} arquivado(s)`: `${ativos} processo(s) ativo(s)`;
      const mproc=document.getElementById('mproc');if(mproc)mproc.textContent=ativos;
    };

    window.arquivarProcessoSIG=async function(id,numero){
      const observacao=prompt('Arquivar processo '+numero+'\n\nDigite uma observação sobre o arquivamento (opcional):','');if(observacao===null)return;
      if(!confirm('Confirmar o arquivamento deste processo?\n\nEle não será excluído e poderá ser reativado depois.'))return;
      const {data:atual,error:erroBusca}=await sb.from('processos').select('observacoes').eq('id',id).single();if(erroBusca){alert('Não foi possível preparar o arquivamento: '+erroBusca.message);return;}
      const carimbo=new Date().toLocaleString('pt-BR'),registro=`[ARQUIVAMENTO ${carimbo}] ${String(observacao||'Sem observação.').trim()||'Sem observação.'}`,anterior=String(atual?.observacoes||'').trim(),novo=anterior?anterior+'\n\n'+registro:registro;
      const {error}=await sb.from('processos').update({status:'arquivado',observacoes:novo,monitoramento_ativo:false,monitorar_datajud:false,atualizado_em:new Date().toISOString()}).eq('id',id);if(error){alert('Não foi possível arquivar o processo: '+error.message);return;}await load();alert('Processo arquivado com sucesso.');
    };

    window.reativarProcessoSIG=async function(id,numero){
      if(!confirm('Reativar o processo '+numero+'?'))return;
      const {data:atual,error:erroBusca}=await sb.from('processos').select('observacoes').eq('id',id).single();if(erroBusca){alert('Não foi possível preparar a reativação: '+erroBusca.message);return;}
      const carimbo=new Date().toLocaleString('pt-BR'),registro=`[REATIVAÇÃO ${carimbo}] Processo reativado no SIG.`,anterior=String(atual?.observacoes||'').trim(),novo=anterior?anterior+'\n\n'+registro:registro;
      const {error}=await sb.from('processos').update({status:'ativo',observacoes:novo,monitoramento_ativo:true,monitorar_datajud:true,atualizado_em:new Date().toISOString()}).eq('id',id);if(error){alert('Não foi possível reativar o processo: '+error.message);return;}await load();alert('Processo reativado com sucesso.');
    };

    window.excluirProcessoSIG=async function(id,numero){
      const aviso='ATENÇÃO — EXCLUSÃO DEFINITIVA\n\nProcesso: '+numero+'\n\nAo confirmar, este processo será excluído definitivamente do SIG. Movimentações, prazos, tarefas, documentos e compromissos vinculados também poderão ser excluídos.\n\nEsta ação não pode ser desfeita.\n\nDeseja realmente excluir?';
      if(!confirm(aviso))return;const {error}=await sb.from('processos').delete().eq('id',id);if(error){alert('Não foi possível excluir o processo: '+error.message);return;}await load();alert('Processo excluído definitivamente do SIG.');
    };

    const original=render;
    render=function(){original();prepararTelaProcessos();renderProcessosAprimorados();};
    prepararTelaProcessos();renderProcessosAprimorados();
  };
  esperar();
})();
