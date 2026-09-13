(()=>{
  const esperar=()=>{
    if(typeof D==='undefined'||!document.getElementById('agenda')){setTimeout(esperar,180);return;}

    const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const data=v=>v?new Date(v).toLocaleString('pt-BR'):'—';

    function modal(){
      let m=document.getElementById('mDetalhesAgendaSIG');
      if(m)return m;
      m=document.createElement('div');
      m.id='mDetalhesAgendaSIG';m.className='modal hidden';
      m.innerHTML=`<div class="card" style="width:min(820px,100%);max-height:90vh;overflow:auto">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><h3 style="margin:0">Detalhes do compromisso</h3><button type="button" class="secondary" id="fecharDetalhesAgendaSIG">Fechar</button></div>
        <div id="conteudoDetalhesAgendaSIG" style="margin-top:16px"></div>
      </div>`;
      document.body.appendChild(m);
      document.getElementById('fecharDetalhesAgendaSIG').onclick=()=>m.classList.add('hidden');
      m.addEventListener('click',ev=>{if(ev.target===m)m.classList.add('hidden')});
      return m;
    }

    window.verDetalhesAgendaSIG=function(id){
      const a=(D.agenda||[]).find(x=>x.id===id);
      if(!a)return alert('Compromisso não encontrado.');
      const p=(D.processos||[]).find(x=>x.id===a.processo_id);
      const cli=p?(D.clientes||[]).find(c=>c.id===p.cliente_id):null;
      const btnProc=p?`<button type="button" class="primary" onclick="abrirProcessoTribunal('${p.id}')">Abrir processo ↗</button>`:'';
      const blocoProcesso=p?`
        <div class="card" style="margin-top:14px;background:#f8fafc">
          <h4 style="margin-top:0">Processo vinculado</h4>
          <div class="formgrid">
            <div><b>Número</b><br>${e(p.numero_cnj||'—')}</div>
            <div><b>Cliente</b><br>${e(cli?.nome||p.partes||'—')}</div>
            <div><b>Área</b><br>${e(p.area||'—')}</div>
            <div><b>Tribunal</b><br>${e(p.tribunal||'—')}</div>
            <div><b>Comarca</b><br>${e(p.comarca||'—')}</div>
            <div><b>Vara</b><br>${e(p.vara||'—')}</div>
            <div><b>Parte contrária</b><br>${e(p.parte_contraria||'—')}</div>
            <div><b>Status</b><br>${e(p.status||'—')}</div>
          </div>
          <div style="margin-top:14px">${btnProc}</div>
        </div>`:`<div class="card" style="margin-top:14px;background:#fff8e1"><b>Processo:</b> este compromisso não está vinculado a processo.</div>`;
      modal();
      document.getElementById('conteudoDetalhesAgendaSIG').innerHTML=`
        <div class="formgrid">
          <div class="span2"><b>Título</b><br>${e(a.titulo||'—')}</div>
          <div><b>Tipo</b><br>${e(a.tipo||'—')}</div>
          <div><b>Status</b><br>${e(a.status||'—')}</div>
          <div><b>Início</b><br>${e(data(a.inicio))}</div>
          <div><b>Fim</b><br>${e(data(a.fim))}</div>
          <div class="span2"><b>Local</b><br>${e(a.local||'—')}</div>
        </div>${blocoProcesso}`;
      document.getElementById('mDetalhesAgendaSIG').classList.remove('hidden');
    };

    function aplicar(){
      const tb=document.getElementById('tbAgenda');if(!tb)return;
      const rows=[...tb.querySelectorAll('tr')];
      rows.forEach((tr,i)=>{
        const a=(D.agenda||[])[i];if(!a||tr.dataset.sigDetalhes)return;
        tr.dataset.sigDetalhes='1';
        const primeira=tr.querySelector('td');
        if(primeira){primeira.style.cursor='pointer';primeira.title='Clique para ver todos os detalhes';primeira.onclick=()=>verDetalhesAgendaSIG(a.id);}
        const titulo=tr.querySelectorAll('td')[2];
        if(titulo){titulo.style.cursor='pointer';titulo.title='Clique para ver todos os detalhes';titulo.onclick=()=>verDetalhesAgendaSIG(a.id);}
      });
    }

    const obs=new MutationObserver(aplicar);obs.observe(document.getElementById('agenda'),{childList:true,subtree:true});
    aplicar();
  };
  esperar();
})();
