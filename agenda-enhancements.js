(()=>{
  const esperar=()=>{
    if(typeof render!=='function'||typeof sb==='undefined'||typeof load!=='function'||typeof D==='undefined'){
      setTimeout(esperar,150);return;
    }

    function fmtInputData(v){
      if(!v)return '';
      const d=new Date(v);
      if(Number.isNaN(d.getTime()))return '';
      const p=n=>String(n).padStart(2,'0');
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    function garantirModalEditarAgenda(){
      if(document.getElementById('mEditarAgendaSIG'))return;
      const modal=document.createElement('div');
      modal.id='mEditarAgendaSIG';
      modal.className='modal hidden';
      modal.innerHTML=`<div class="card" style="width:min(720px,100%);max-height:90vh;overflow:auto">
        <h3>Editar compromisso</h3>
        <form id="fEditarAgendaSIG">
          <input type="hidden" name="id">
          <label>Título</label>
          <input name="titulo" required>
          <div class="formgrid">
            <div><label>Tipo</label><select name="tipo"><option value="compromisso">Compromisso</option><option value="audiencia">Audiência</option><option value="reuniao">Reunião</option><option value="atendimento">Atendimento</option><option value="pericia">Perícia</option><option value="outro">Outro</option></select></div>
            <div><label>Início</label><input name="inicio" type="datetime-local" required></div>
            <div><label>Fim</label><input name="fim" type="datetime-local"></div>
            <div><label>Local</label><input name="local"></div>
            <div class="span2"><label>Processo</label><select name="processo_id"><option value="">Sem vínculo</option></select></div>
          </div>
          <div class="actions">
            <button type="button" class="secondary" id="cancelarEditarAgendaSIG">Cancelar</button>
            <button type="submit" class="primary">Salvar alterações</button>
          </div>
        </form>
      </div>`;
      document.body.appendChild(modal);
      document.getElementById('cancelarEditarAgendaSIG').onclick=()=>modal.classList.add('hidden');
      document.getElementById('fEditarAgendaSIG').onsubmit=async e=>{
        e.preventDefault();
        const f=e.currentTarget;
        const id=f.elements.id.value;
        const payload={
          titulo:String(f.elements.titulo.value||'').trim(),
          tipo:String(f.elements.tipo.value||'compromisso'),
          inicio:f.elements.inicio.value||null,
          fim:f.elements.fim.value||null,
          local:String(f.elements.local.value||'').trim()||null,
          processo_id:f.elements.processo_id.value||null
        };
        const btn=f.querySelector('button[type="submit"]');
        const txt=btn.textContent;btn.disabled=true;btn.textContent='Salvando...';
        const {error}=await sb.from('eventos_agenda').update(payload).eq('id',id);
        btn.disabled=false;btn.textContent=txt;
        if(error){alert('Não foi possível editar o compromisso: '+error.message);return;}
        modal.classList.add('hidden');
        await load();
        alert('Compromisso atualizado com sucesso.');
      };
    }

    window.editarAgendaSIG=function(id){
      garantirModalEditarAgenda();
      const a=(D.agenda||[]).find(x=>x.id===id);
      if(!a){alert('Compromisso não encontrado.');return;}
      const f=document.getElementById('fEditarAgendaSIG');
      const sel=f.elements.processo_id;
      sel.innerHTML='<option value="">Sem vínculo</option>'+((D.processos||[]).map(p=>`<option value="${p.id}">${esc(p.titulo||p.numero_cnj||'Processo')}</option>`).join(''));
      f.elements.id.value=a.id||'';
      f.elements.titulo.value=a.titulo||'';
      f.elements.tipo.value=a.tipo||'compromisso';
      f.elements.inicio.value=fmtInputData(a.inicio);
      f.elements.fim.value=fmtInputData(a.fim);
      f.elements.local.value=a.local||'';
      sel.value=a.processo_id||'';
      document.getElementById('mEditarAgendaSIG').classList.remove('hidden');
    };

    window.excluirAgendaSIG=async function(id,titulo){
      if(!confirm(`Excluir o compromisso "${titulo||'sem título'}"?\n\nEsta ação não poderá ser desfeita.`))return;
      const {error}=await sb.from('eventos_agenda').delete().eq('id',id);
      if(error){alert('Não foi possível excluir o compromisso: '+error.message);return;}
      await load();
      alert('Compromisso excluído com sucesso.');
    };

    function renderAgendaAprimorada(){
      const sec=document.getElementById('agenda');
      const tb=document.getElementById('tbAgenda');
      if(!sec||!tb)return;
      const th=sec.querySelector('thead tr');
      if(th)th.innerHTML='<th>Início</th><th>Tipo</th><th>Título</th><th>Local</th><th>Status</th><th>Ações</th>';
      tb.innerHTML=(D.agenda||[]).map(x=>{
        const tituloSeguro=String(x.titulo||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
        return `<tr><td>${fmt(x.inicio)}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.titulo||'')}</td><td>${esc(x.local||'')}</td><td>${esc(x.status||'')}</td><td style="white-space:nowrap"><button type="button" class="secondary" onclick="editarAgendaSIG('${x.id}')">Editar</button> <button type="button" class="secondary" style="color:#b42318;margin-left:6px" onclick="excluirAgendaSIG('${x.id}','${tituloSeguro}')">Excluir</button></td></tr>`;
      }).join('');
    }

    garantirModalEditarAgenda();
    const original=render;
    render=function(){original();renderAgendaAprimorada();};
    renderAgendaAprimorada();
  };
  esperar();
})();
