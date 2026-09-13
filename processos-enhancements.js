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

    function ligarBusca(){
      const campo=document.getElementById('buscaProcesso');
      const btn=document.getElementById('btnBuscarProcesso');
      const limpar=document.getElementById('btnLimparBuscaProcesso') || document.getElementById('limparBuscaProcesso');
      const arquivados=document.getElementById('btnAlternarArquivados');
      if(!campo||!btn||!limpar)return;

      btn.onclick=()=>renderProcessosAprimorados();
      campo.onkeydown=e=>{
        if(e.key==='Enter'){
          e.preventDefault();
          renderProcessosAprimorados();
        }
      };
      campo.oninput=()=>{
        if(!String(campo.value||'').trim()) renderProcessosAprimorados();
      };
      limpar.onclick=()=>{
        campo.value='';
        renderProcessosAprimorados();
        campo.focus();
      };
      if(arquivados){
        arquivados.onclick=()=>{
          mostrarArquivados=!mostrarArquivados;
          arquivados.textContent=mostrarArquivados?'Ocultar arquivados':'Mostrar arquivados';
          renderProcessosAprimorados();
        };
      }
    }

    function prepararTelaProcessos(){
      const sec=document.getElementById('processos');
      if(!sec)return;

      const th=sec.querySelector('thead tr');
      if(th)th.innerHTML='<th>Número</th><th>Meu cliente</th><th>Área</th><th>Comarca</th><th>Vara</th><th>Tribunal</th><th>Status</th><th>Consulta</th><th>Ação</th>';
      const table=sec.querySelector('table');
      if(table)table.style.minWidth='1550px';

      if(!document.getElementById('buscaProcesso')){
        const toolbar=sec.querySelector('.toolbar');
        const box=document.createElement('div');
        box.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0 14px';
        box.innerHTML='<input id="buscaProcesso" type="search" placeholder="Digite o número do processo" style="width:min(360px,100%);margin:0"><button type="button" class="primary" id="btnBuscarProcesso">Buscar processo</button><button type="button" class="secondary" id="btnLimparBuscaProcesso">Limpar</button><button type="button" class="secondary" id="btnAlternarArquivados">Mostrar arquivados</button><span id="resultadoBuscaProcesso" class="small"></span>';
        toolbar.insertAdjacentElement('afterend',box);
      }else if(!document.getElementById('btnAlternarArquivados')){
        const limpar=document.getElementById('btnLimparBuscaProcesso') || document.getElementById('limparBuscaProcesso');
        if(limpar){
          const b=document.createElement('button');
          b.type='button';
          b.className='secondary';
          b.id='btnAlternarArquivados';
          b.textContent='Mostrar arquivados';
          limpar.insertAdjacentElement('afterend',b);
        }
      }

      ligarBusca();
    }

    window.renderProcessosAprimorados=function(){
      const tb=document.getElementById('tbProcessos');
      if(!tb)return;

      const campo=document.getElementById('buscaProcesso');
      const busca=String(campo?.value||'').replace(/\D/g,'');
      const todos=(D.processos||[]);
      const lista=todos.filter(p=>{
        const bateBusca=!busca||String(p.numero_cnj||'').replace(/\D/g,'').includes(busca);
        const visivel=mostrarArquivados||String(p.status||'').toLowerCase()!=='arquivado';
        return bateBusca&&visivel;
      });

      tb.innerHTML=lista.map(p=>{
        const arquivado=String(p.status||'').toLowerCase()==='arquivado';
        const btnArquivo=arquivado
          ? `<button type="button" class="secondary" style="margin-left:6px" onclick="reativarProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Reativar</button>`
          : `<button type="button" class="secondary" style="margin-left:6px" onclick="arquivarProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Arquivar</button>`;
        return `<tr>
        <td>${esc(p.numero_cnj||'')}</td>
        <td>${esc(clienteDoProcesso(p))}</td>
        <td>${esc(p.area||'—')}</td>
        <td>${esc(p.comarca||'—')}</td>
        <td>${esc(p.vara||'—')}</td>
        <td>${esc(p.tribunal||'—')}</td>
        <td>${esc(p.status||'—')}</td>
        <td>${datajudLabel(p)}</td>
        <td style="white-space:nowrap">${acaoProcesso(p)} ${btnArquivo} <button type="button" class="secondary" style="color:#b42318;margin-left:6px" onclick="excluirProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Excluir</button></td>
      </tr>`;
      }).join('');

      const saida=document.getElementById('resultadoBuscaProcesso') || document.getElementById('contagemProcessos');
      const ativos=todos.filter(p=>String(p.status||'').toLowerCase()!=='arquivado').length;
      const arquivados=todos.length-ativos;
      if(saida){
        saida.textContent=busca
          ? (lista.length ? lista.length+' processo(s) encontrado(s)' : 'Processo não encontrado')
          : mostrarArquivados
            ? `${todos.length} processo(s) no total — ${arquivados} arquivado(s)`
            : `${ativos} processo(s) ativo(s)`;
      }
      const mproc=document.getElementById('mproc');
      if(mproc)mproc.textContent=ativos;
    };

    window.arquivarProcessoSIG=async function(id,numero){
      const observacao=prompt('Arquivar processo '+numero+'\n\nDigite uma observação sobre o arquivamento (opcional):','');
      if(observacao===null)return;
      if(!confirm('Confirmar o arquivamento deste processo?\n\nEle não será excluído e poderá ser reativado depois.'))return;

      const {data:atual,error:erroBusca}=await sb.from('processos').select('observacoes').eq('id',id).single();
      if(erroBusca){alert('Não foi possível preparar o arquivamento: '+erroBusca.message);return;}

      const carimbo=new Date().toLocaleString('pt-BR');
      const registro=`[ARQUIVAMENTO ${carimbo}] ${String(observacao||'Sem observação.').trim()||'Sem observação.'}`;
      const anterior=String(atual?.observacoes||'').trim();
      const novo=anterior?anterior+'\n\n'+registro:registro;

      const {error}=await sb.from('processos').update({
        status:'arquivado',
        observacoes:novo,
        monitoramento_ativo:false,
        monitorar_datajud:false,
        atualizado_em:new Date().toISOString()
      }).eq('id',id);
      if(error){alert('Não foi possível arquivar o processo: '+error.message);return;}

      await load();
      alert('Processo arquivado com sucesso.');
    };

    window.reativarProcessoSIG=async function(id,numero){
      if(!confirm('Reativar o processo '+numero+'?'))return;

      const {data:atual,error:erroBusca}=await sb.from('processos').select('observacoes').eq('id',id).single();
      if(erroBusca){alert('Não foi possível preparar a reativação: '+erroBusca.message);return;}

      const carimbo=new Date().toLocaleString('pt-BR');
      const registro=`[REATIVAÇÃO ${carimbo}] Processo reativado no SIG.`;
      const anterior=String(atual?.observacoes||'').trim();
      const novo=anterior?anterior+'\n\n'+registro:registro;

      const {error}=await sb.from('processos').update({
        status:'ativo',
        observacoes:novo,
        monitoramento_ativo:true,
        monitorar_datajud:true,
        atualizado_em:new Date().toISOString()
      }).eq('id',id);
      if(error){alert('Não foi possível reativar o processo: '+error.message);return;}

      await load();
      alert('Processo reativado com sucesso.');
    };

    window.excluirProcessoSIG=async function(id,numero){
      const aviso='ATENÇÃO — EXCLUSÃO DEFINITIVA\n\nProcesso: '+numero+'\n\nAo confirmar, este processo será excluído definitivamente do SIG. Movimentações, prazos, tarefas, documentos e compromissos vinculados também poderão ser excluídos.\n\nEsta ação não pode ser desfeita.\n\nDeseja realmente excluir?';
      if(!confirm(aviso))return;
      const {error}=await sb.from('processos').delete().eq('id',id);
      if(error){alert('Não foi possível excluir o processo: '+error.message);return;}
      await load();
      alert('Processo excluído definitivamente do SIG.');
    };

    const original=render;
    render=function(){
      original();
      prepararTelaProcessos();
      renderProcessosAprimorados();
    };

    prepararTelaProcessos();
    renderProcessosAprimorados();
  };
  esperar();
})();
