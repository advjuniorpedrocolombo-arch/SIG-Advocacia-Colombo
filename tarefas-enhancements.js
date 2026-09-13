(()=>{
  let tarefaEditandoId=null;

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
      if(!tarefaEditandoId){
        await ins('tarefas',e.target,'mTarefa');
        prepararModalNovaTarefa();
        return;
      }

      const dados=toObj(e.target);
      const {error}=await sb.from('tarefas').update(dados).eq('id',tarefaEditandoId);
      if(error) return alert('Falha ao editar tarefa: '+error.message);

      e.target.reset();
      closeM('mTarefa');
      tarefaEditandoId=null;
      const titulo=document.querySelector('#mTarefa h3');
      if(titulo) titulo.textContent='Nova tarefa';
      const salvar=e.target.querySelector('button[type="submit"],button.primary');
      if(salvar) salvar.textContent='Salvar';
      await load();
    };
  }

  const botaoNova=document.querySelector('#tarefas .toolbar button.primary');
  if(botaoNova){
    botaoNova.addEventListener('click',prepararModalNovaTarefa,true);
  }
})();
