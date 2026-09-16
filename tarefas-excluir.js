(()=>{
  let excluindo=false;

  async function excluirTarefa(id){
    if(excluindo) return;
    const dados=window.D||D;
    const tarefa=(dados?.tarefas||[]).find(t=>String(t.id)===String(id));
    const nome=tarefa?.titulo||'esta tarefa';
    if(!confirm(`Excluir definitivamente a tarefa "${nome}"?\n\nEssa ação não poderá ser desfeita.`)) return;

    excluindo=true;
    try{
      const {error}=await sb.from('tarefas').delete().eq('id',id);
      if(error) throw error;

      try{
        Object.keys(localStorage)
          .filter(k=>k.startsWith('sig-tarefas-ordem:'))
          .forEach(k=>{
            const ordem=JSON.parse(localStorage.getItem(k)||'[]').map(String).filter(x=>x!==String(id));
            localStorage.setItem(k,JSON.stringify(ordem));
          });
      }catch(_){ }

      if(typeof load==='function') await load();
      else location.reload();
    }catch(err){
      alert('Não foi possível excluir a tarefa: '+(err?.message||err));
    }finally{
      excluindo=false;
    }
  }

  window.excluirTarefa=excluirTarefa;

  function aplicarBotoes(){
    document.querySelectorAll('#tarefas .sig-check-row[data-task-id]').forEach(row=>{
      const acoes=row.querySelector('.sig-check-actions');
      if(!acoes||acoes.querySelector('.sig-btn-excluir')) return;

      const btn=document.createElement('button');
      btn.type='button';
      btn.className='sig-btn-excluir';
      btn.textContent='Excluir';
      btn.title='Excluir tarefa';
      btn.style.marginLeft='5px';
      btn.style.background='#fff';
      btn.style.color='#b42318';
      btn.style.border='1px solid #f3b8b3';
      btn.style.fontWeight='700';
      btn.onclick=e=>{
        e.stopPropagation();
        excluirTarefa(row.dataset.taskId);
      };
      acoes.appendChild(btn);
    });
  }

  const area=document.getElementById('tarefas');
  if(!area) return;

  let pendente=false;
  const observer=new MutationObserver(()=>{
    if(pendente) return;
    pendente=true;
    requestAnimationFrame(()=>{
      pendente=false;
      aplicarBotoes();
    });
  });
  observer.observe(area,{childList:true,subtree:true});
  aplicarBotoes();
})();
