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
        const concluir=t.status!=='concluida'
          ? `<button class="secondary" onclick="done('tarefas','${t.id}','concluida')">Concluir</button> `
          : '';
        td.innerHTML=`${concluir}<button class="secondary" onclick="editarTarefa('${t.id}')">Editar</button>`;
      });
    };
  }

  const form=document.getElementById('fTarefa');
  if(form){
    form.onsubmit=async e=>{
      e.preventDefault();
      const btn=form.querySelector('button[type="submit"],button.primary');
      try{
        const dados=toObj(e.target);
        dados.data_prevista=paraISO(e.target.elements.data_prevista.value);
        if(btn){btn.disabled=true;btn.textContent='Salvando...';}

        if(!tarefaEditandoId){
          const payload={...dados,user_id:U.id};
          const {error}=await sb.from('tarefas').insert(payload);
          if(error) throw error;
        }else{
          const {error}=await sb.from('tarefas').update(dados).eq('id',tarefaEditandoId);
          if(error) throw error;
        }

        e.target.reset();
        closeM('mTarefa');
        tarefaEditandoId=null;
        const titulo=document.querySelector('#mTarefa h3');
        if(titulo) titulo.textContent='Nova tarefa';
        await load();
      }catch(err){
        alert('Não foi possível salvar a tarefa: '+(err?.message||err));
      }finally{
        if(btn){btn.disabled=false;btn.textContent=tarefaEditandoId?'Salvar alterações':'Salvar';}
      }
    };
  }

  const botaoNova=document.querySelector('#tarefas .toolbar button.primary');
  if(botaoNova){
    botaoNova.addEventListener('click',prepararModalNovaTarefa,true);
  }

  if(!document.getElementById('sigTarefasSemanalLoader')){
    const s=document.createElement('script');
    s.id='sigTarefasSemanalLoader';
    s.src='tarefas-layout-semanal.js?v=20260913-2145';
    document.body.appendChild(s);
  }
})();
