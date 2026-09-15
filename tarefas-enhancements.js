(()=>{
  let tarefaEditandoId=null;

  function paraISO(valor){
    if(!valor) return null;
    const d=new Date(valor);
    if(Number.isNaN(d.getTime())) throw new Error('Data ou horário inválido.');
    return d.toISOString();
  }

  function paraDatetimeLocal(valor){
    if(!valor) return '';
    const d=new Date(valor);
    if(Number.isNaN(d.getTime())) return '';
    const pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function garantirBotaoEmAndamento(){
    const form=document.getElementById('fTarefa');
    if(!form) return null;
    const actions=form.querySelector('.actions');
    if(!actions) return null;
    let btn=document.getElementById('btnTarefaEmAndamento');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='btnTarefaEmAndamento';
      btn.className='secondary';
      btn.textContent='Em andamento';
      btn.style.background='#eaf2fb';
      btn.style.color='#173b72';
      btn.style.fontWeight='700';
      btn.style.display='none';
      const cancelar=actions.querySelector('button[type="button"]');
      actions.insertBefore(btn,cancelar||actions.firstChild);
      btn.addEventListener('click',async()=>{
        if(!tarefaEditandoId) return;
        const tarefa=(window.D||D).tarefas.find(x=>x.id===tarefaEditandoId);
        if(tarefa?.status==='em_andamento') return;
        const textoOriginal=btn.textContent;
        try{
          btn.disabled=true;
          btn.textContent='Atualizando...';
          const {error}=await sb.from('tarefas').update({status:'em_andamento'}).eq('id',tarefaEditandoId);
          if(error) throw error;
          closeM('mTarefa');
          tarefaEditandoId=null;
          await load();
        }catch(err){
          alert('Não foi possível marcar a tarefa como em andamento: '+(err?.message||err));
        }finally{
          btn.disabled=false;
          btn.textContent=textoOriginal;
        }
      });
    }
    return btn;
  }

  function atualizarBotaoEmAndamento(tarefa){
    const btn=garantirBotaoEmAndamento();
    if(!btn) return;
    if(!tarefaEditandoId){
      btn.style.display='none';
      return;
    }
    btn.style.display='inline-block';
    const emAndamento=tarefa?.status==='em_andamento';
    btn.disabled=emAndamento;
    btn.textContent=emAndamento?'Em andamento ✓':'Em andamento';
  }

  function prepararModalNovaTarefa(){
    tarefaEditandoId=null;
    const form=document.getElementById('fTarefa');
    const modal=document.getElementById('mTarefa');
    if(!form||!modal) return;
    form.reset();
    const titulo=modal.querySelector('h3');
    if(titulo) titulo.textContent='Nova tarefa';
    const salvar=form.querySelector('button[type="submit"],button.primary');
    if(salvar) salvar.textContent='Salvar';
    atualizarBotaoEmAndamento(null);
  }

  window.editarTarefa=function(id){
    const tarefa=(window.D||D).tarefas.find(x=>x.id===id);
    if(!tarefa) return alert('Tarefa não localizada.');
    tarefaEditandoId=id;
    const form=document.getElementById('fTarefa');
    const modal=document.getElementById('mTarefa');
    if(!form||!modal) return;
    form.elements.titulo.value=tarefa.titulo||'';
    form.elements.processo_id.value=tarefa.processo_id||'';
    form.elements.data_prevista.value=paraDatetimeLocal(tarefa.data_prevista);
    form.elements.prioridade.value=tarefa.prioridade||'normal';
    form.elements.descricao.value=tarefa.descricao||'';
    const titulo=modal.querySelector('h3');
    if(titulo) titulo.textContent='Editar tarefa';
    const salvar=form.querySelector('button[type="submit"],button.primary');
    if(salvar) salvar.textContent='Salvar alterações';
    atualizarBotaoEmAndamento(tarefa);
    openM('mTarefa');
  };

  const renderOriginal=window.render;
  if(typeof renderOriginal==='function'){
    window.render=function(){
      renderOriginal();
      const tbody=document.getElementById('tbTarefas');
      if(!tbody) return;
      const tarefas=(window.D||D).tarefas;
      [...tbody.querySelectorAll('tr')].forEach((tr,i)=>{
        const t=tarefas[i];
        if(!t) return;
        const td=tr.lastElementChild;
        if(!td) return;
        const concluir=t.status!=='concluida'?`<button class="secondary" onclick="done('tarefas','${t.id}','concluida')">Concluir</button> `:'';
        td.innerHTML=`${concluir}<button class="secondary" onclick="editarTarefa('${t.id}')">Editar</button>`;
      });
    };
  }

  const form=document.getElementById('fTarefa');
  if(form){
    garantirBotaoEmAndamento();
    form.onsubmit=async e=>{
      e.preventDefault();
      const btn=form.querySelector('button[type="submit"],button.primary');
      try{
        const dados=toObj(e.target);
        dados.data_prevista=paraISO(e.target.elements.data_prevista.value);
        if(btn){btn.disabled=true;btn.textContent='Salvando...';}
        if(!tarefaEditandoId){
          const {error}=await sb.from('tarefas').insert({...dados,user_id:U.id});
          if(error) throw error;
        }else{
          const {error}=await sb.from('tarefas').update(dados).eq('id',tarefaEditandoId);
          if(error) throw error;
        }
        e.target.reset();closeM('mTarefa');tarefaEditandoId=null;
        const titulo=document.querySelector('#mTarefa h3');if(titulo) titulo.textContent='Nova tarefa';
        atualizarBotaoEmAndamento(null);
        await load();
      }catch(err){alert('Não foi possível salvar a tarefa: '+(err?.message||err));}
      finally{if(btn){btn.disabled=false;btn.textContent=tarefaEditandoId?'Salvar alterações':'Salvar';}}
    };
  }

  const botaoNova=document.querySelector('#tarefas .toolbar button.primary');
  if(botaoNova)botaoNova.addEventListener('click',prepararModalNovaTarefa,true);

  function rotuloStatus(status){
    const s=String(status||'pendente').toLowerCase();
    if(s==='em_andamento') return {texto:'Em andamento',classe:'em-andamento'};
    if(s==='concluida'||s==='concluído'||s==='concluido') return {texto:'Concluída',classe:'concluida'};
    if(s==='pendente') return {texto:'Pendente',classe:'pendente'};
    return {texto:s.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase()),classe:'outro'};
  }

  function garantirEstiloStatus(){
    if(document.getElementById('sigTarefaStatusStyle')) return;
    const st=document.createElement('style');
    st.id='sigTarefaStatusStyle';
    st.textContent=`
      #tarefas.sig-weekly .sig-tag-status{padding:3px 7px;border-radius:999px;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.02em;background:#f2f4f7;color:#475467;border:1px solid #e4e7ec}
      #tarefas.sig-weekly .sig-tag-status.em-andamento{background:#eaf2fb;color:#175cd3;border-color:#bfd4f5}
      #tarefas.sig-weekly .sig-tag-status.concluida{background:#dcfae6;color:#067647;border-color:#abefc6}
      #tarefas.sig-weekly .sig-tag-status.pendente{background:#f2f4f7;color:#475467;border-color:#e4e7ec}
      #tarefas.sig-weekly .sig-tag-status.outro{background:#f4f3ff;color:#5925dc;border-color:#d9d6fe}
    `;
    document.head.appendChild(st);
  }

  function aplicarStatusSemanal(){
    garantirEstiloStatus();
    const tarefas=((window.D||D)?.tarefas)||[];
    document.querySelectorAll('#tarefas .sig-check-row[data-task-id]').forEach(row=>{
      const tarefa=tarefas.find(t=>String(t.id)===String(row.dataset.taskId));
      if(!tarefa) return;
      const tags=row.querySelector('.sig-check-tags');
      if(!tags) return;
      const info=rotuloStatus(tarefa.status);
      let badge=tags.querySelector('.sig-tag-status');
      if(!badge){
        badge=document.createElement('span');
        badge.className='sig-tag-status';
        tags.appendChild(badge);
      }
      const classe=`sig-tag-status ${info.classe}`;
      if(badge.className!==classe) badge.className=classe;
      if(badge.textContent!==info.texto) badge.textContent=info.texto;
    });
  }

  const areaTarefas=document.getElementById('tarefas');
  if(areaTarefas){
    let pendente=false;
    const observer=new MutationObserver(()=>{
      if(pendente) return;
      pendente=true;
      requestAnimationFrame(()=>{pendente=false;aplicarStatusSemanal();});
    });
    observer.observe(areaTarefas,{childList:true,subtree:true});
    aplicarStatusSemanal();
  }

  if(!document.getElementById('sigTarefasSemanalLoader')){
    const s=document.createElement('script');
    s.id='sigTarefasSemanalLoader';
    s.src='tarefas-layout-semanal.js?v=20260915-0100';
    document.body.appendChild(s);
  }
})();