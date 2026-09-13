(()=>{
  const esperar=()=>{
    if(typeof render!=='function'||typeof sb==='undefined'||typeof load!=='function'||typeof D==='undefined'){
      setTimeout(esperar,150);return;
    }

    function clienteDoProcesso(p){
      const vinculado=(D.clientes||[]).find(c=>c.id===p.cliente_id);
      return vinculado?.nome || p.partes || '—';
    }

    function prepararTelaProcessos(){
      const sec=document.getElementById('processos');
      if(!sec)return;
      const th=sec.querySelector('thead tr');
      if(th)th.innerHTML='<th>Número</th><th>Cliente</th><th>Área</th><th>Comarca</th><th>Vara</th><th>Tribunal</th><th>Status</th><th>Consulta</th><th>Ação</th>';
      const table=sec.querySelector('table');
      if(table)table.style.minWidth='1450px';

      if(!document.getElementById('buscaProcesso')){
        const toolbar=sec.querySelector('.toolbar');
        const box=document.createElement('div');
        box.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0 14px';
        box.innerHTML='<input id="buscaProcesso" type="search" placeholder="Digite o número do processo" style="width:min(360px,100%);margin:0"><button type="button" class="primary" id="btnBuscarProcesso">Buscar processo</button><button type="button" class="secondary" id="limparBuscaProcesso">Limpar</button><span id="contagemProcessos" class="small"></span>';
        toolbar.insertAdjacentElement('afterend',box);
        document.getElementById('btnBuscarProcesso').onclick=renderProcessosAprimorados;
        document.getElementById('buscaProcesso').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderProcessosAprimorados();}});
        document.getElementById('limparBuscaProcesso').onclick=()=>{document.getElementById('buscaProcesso').value='';renderProcessosAprimorados();};
      }
    }

    window.renderProcessosAprimorados=function(){
      const tb=document.getElementById('tbProcessos');
      if(!tb)return;
      const busca=(document.getElementById('buscaProcesso')?.value||'').replace(/\D/g,'');
      const lista=(D.processos||[]).filter(p=>!busca||String(p.numero_cnj||'').replace(/\D/g,'').includes(busca));
      tb.innerHTML=lista.map(p=>`<tr>
        <td>${esc(p.numero_cnj||'')}</td>
        <td>${esc(clienteDoProcesso(p))}</td>
        <td>${esc(p.area||'—')}</td>
        <td>${esc(p.comarca||'—')}</td>
        <td>${esc(p.vara||'—')}</td>
        <td>${esc(p.tribunal||'—')}</td>
        <td>${esc(p.status||'—')}</td>
        <td>${datajudLabel(p)}</td>
        <td style="white-space:nowrap">${acaoProcesso(p)} <button type="button" class="secondary" style="color:#b42318;margin-left:6px" onclick="excluirProcessoSIG('${p.id}','${String(p.numero_cnj||'').replace(/'/g,'')}')">Excluir</button></td>
      </tr>`).join('');
      const c=document.getElementById('contagemProcessos');
      if(c)c.textContent=lista.length+' de '+(D.processos||[]).length+' processo(s)';
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
