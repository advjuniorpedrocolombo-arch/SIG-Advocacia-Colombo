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

    function fmtAgendaComDia(v){
      if(!v)return '—';
      const d=new Date(v);
      if(Number.isNaN(d.getTime()))return '—';
      const dia=d.toLocaleDateString('pt-BR',{weekday:'long'});
      const diaCap=dia.charAt(0).toUpperCase()+dia.slice(1);
      const data=d.toLocaleDateString('pt-BR');
      const hora=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      return `<strong>${esc(diaCap)}</strong> ${esc(data)} · ${esc(hora)}`;
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

    function garantirAreaArquivados(){
      const sec=document.getElementById('agenda');
      if(!sec)return;
      const toolbar=sec.querySelector('.toolbar');
      if(toolbar&&!document.getElementById('btnArquivarPassadosSIG')){
        const box=document.createElement('div');
        box.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center';
        const novo=toolbar.querySelector('button.primary');
        if(novo)box.appendChild(novo);
        const btn=document.createElement('button');
        btn.type='button';btn.id='btnArquivarPassadosSIG';btn.className='secondary';
        btn.textContent='📦 Arquivar compromissos passados';
        btn.onclick=arquivarPassadosAgendaSIG;
        box.appendChild(btn);
        toolbar.appendChild(box);
      }
      if(!document.getElementById('agendaArquivadosSIG')){
        const d=document.createElement('details');
        d.id='agendaArquivadosSIG';
        d.style.marginTop='14px';
        d.innerHTML=`<summary style="cursor:pointer;font-weight:700;color:#173b72">📦 Compromissos arquivados <span id="agendaArquivadosQtdSIG">(0)</span></summary>
          <div class="table" style="margin-top:10px"><table><thead><tr><th>Dia · Data/Hora</th><th>Tipo</th><th>Título</th><th>Local</th><th>Ações</th></tr></thead><tbody id="tbAgendaArquivadosSIG"></tbody></table></div>`;
        sec.appendChild(d);
      }
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

    window.arquivarAgendaSIG=async function(id,titulo){
      if(!confirm(`Arquivar o compromisso "${titulo||'sem título'}"?\n\nEle sairá da agenda ativa, mas continuará disponível em Compromissos arquivados.`))return;
      const {error}=await sb.from('eventos_agenda').update({status:'arquivado'}).eq('id',id);
      if(error){alert('Não foi possível arquivar o compromisso: '+error.message);return;}
      await load();
    };

    window.restaurarAgendaSIG=async function(id){
      const {error}=await sb.from('eventos_agenda').update({status:'agendado'}).eq('id',id);
      if(error){alert('Não foi possível restaurar o compromisso: '+error.message);return;}
      await load();
    };

    window.arquivarPassadosAgendaSIG=async function(){
      const agora=new Date();
      const passados=(D.agenda||[]).filter(x=>x.status!=='arquivado'&&x.inicio&&new Date(x.inicio)<agora);
      if(!passados.length){alert('Não há compromissos passados para arquivar.');return;}
      if(!confirm(`Arquivar ${passados.length} compromisso(s) cuja data já passou?\n\nNenhum registro será excluído.`))return;
      const ids=passados.map(x=>x.id);
      const {error}=await sb.from('eventos_agenda').update({status:'arquivado'}).in('id',ids);
      if(error){alert('Não foi possível arquivar os compromissos: '+error.message);return;}
      await load();
      alert(`${passados.length} compromisso(s) arquivado(s) com sucesso.`);
    };

    function renderAgendaAprimorada(){
      const sec=document.getElementById('agenda');
      const tb=document.getElementById('tbAgenda');
      if(!sec||!tb)return;
      garantirAreaArquivados();
      const th=sec.querySelector('thead tr');
      if(th)th.innerHTML='<th>Dia · Data/Hora</th><th>Tipo</th><th>Título</th><th>Local</th><th>Status</th><th>Ações</th>';
      const ativos=(D.agenda||[]).filter(x=>x.status!=='arquivado');
      tb.innerHTML=ativos.map(x=>{
        const tituloSeguro=String(x.titulo||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
        return `<tr><td style="white-space:nowrap">${fmtAgendaComDia(x.inicio)}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.titulo||'')}</td><td>${esc(x.local||'')}</td><td>${esc(x.status||'')}</td><td style="white-space:nowrap"><button type="button" class="secondary" onclick="editarAgendaSIG('${x.id}')">Editar</button> <button type="button" class="secondary" style="margin-left:6px" onclick="arquivarAgendaSIG('${x.id}','${tituloSeguro}')">📦 Arquivar</button> <button type="button" class="secondary" style="color:#b42318;margin-left:6px" onclick="excluirAgendaSIG('${x.id}','${tituloSeguro}')">Excluir</button></td></tr>`;
      }).join('')||'<tr><td colspan="6" style="text-align:center;color:#667085">Nenhum compromisso ativo.</td></tr>';

      const arquivados=(D.agenda||[]).filter(x=>x.status==='arquivado');
      const qtd=document.getElementById('agendaArquivadosQtdSIG');if(qtd)qtd.textContent=`(${arquivados.length})`;
      const tba=document.getElementById('tbAgendaArquivadosSIG');
      if(tba)tba.innerHTML=arquivados.map(x=>`<tr><td style="white-space:nowrap">${fmtAgendaComDia(x.inicio)}</td><td>${esc(x.tipo||'')}</td><td>${esc(x.titulo||'')}</td><td>${esc(x.local||'')}</td><td><button type="button" class="secondary" onclick="restaurarAgendaSIG('${x.id}')">↩ Restaurar</button></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:#667085">Nenhum compromisso arquivado.</td></tr>';
    }

    garantirModalEditarAgenda();
    garantirAreaArquivados();
    const original=render;
    render=function(){original();renderAgendaAprimorada();};
    renderAgendaAprimorada();
  };
  esperar();
})();
