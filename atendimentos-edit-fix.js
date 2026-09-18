(()=>{
  let editandoId=null;

  const paraLocal=v=>{
    if(!v)return '';
    const d=new Date(v);
    if(Number.isNaN(d.getTime()))return '';
    const p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const preencherForm=item=>{
    const form=document.getElementById('atForm');
    if(!form)return false;
    form.reset();
    Object.entries(item||{}).forEach(([k,v])=>{
      const el=form.elements[k];
      if(!el||v==null)return;
      el.value=(k==='proximo_contato'||k==='data_primeiro_contato')?paraLocal(v):v;
    });
    const titulo=document.getElementById('atModalTitulo');
    if(titulo)titulo.textContent='Editar atendimento';
    document.getElementById('atModal')?.classList.add('show');
    return true;
  };

  const dadosDoForm=form=>({
    nome_contato:form.nome_contato.value.trim(),
    telefone:form.telefone.value.trim()||null,
    email:form.email.value.trim()||null,
    area_juridica:form.area_juridica.value||null,
    resumo_problema:form.resumo_problema.value.trim(),
    urgencia:form.urgencia.value,
    documentos_necessarios:form.documentos_necessarios.value.trim()||null,
    orientacao_inicial:form.orientacao_inicial.value.trim()||null,
    proximo_contato:form.proximo_contato.value?new Date(form.proximo_contato.value).toISOString():null,
    status:form.status.value,
    observacoes:form.observacoes.value.trim()||null,
    data_primeiro_contato:form.data_primeiro_contato.value?new Date(form.data_primeiro_contato.value).toISOString():new Date().toISOString(),
    atualizado_em:new Date().toISOString()
  });

  document.addEventListener('click',async e=>{
    const editar=e.target.closest?.('[data-editar]');
    if(editar){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const id=editar.dataset.editar;
      if(!id)return;
      try{
        if(typeof sb==='undefined')throw new Error('Conexão com o banco ainda não está disponível.');
        editar.disabled=true;
        const textoOriginal=editar.textContent;
        editar.textContent='Abrindo...';
        const {data,error}=await sb.from('atendimentos').select('*').eq('id',id).single();
        editar.disabled=false;
        editar.textContent=textoOriginal;
        if(error)throw error;
        editandoId=id;
        if(!preencherForm(data))throw new Error('Formulário de atendimento não localizado.');
      }catch(err){
        editar.disabled=false;
        editar.textContent='Editar';
        alert('Não foi possível abrir o atendimento para edição: '+(err?.message||err));
      }
      return;
    }

    if(e.target.closest?.('#atFechar,#atCancelar,#btnNovoAtendimento'))editandoId=null;
  },true);

  document.addEventListener('submit',async e=>{
    if(!editandoId||e.target?.id!=='atForm')return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const form=e.target;
    const btn=document.getElementById('atSalvar');
    try{
      if(btn){btn.disabled=true;btn.textContent='Salvando...';}
      const {error}=await sb.from('atendimentos').update(dadosDoForm(form)).eq('id',editandoId);
      if(error)throw error;
      editandoId=null;
      document.getElementById('atModal')?.classList.remove('show');
      document.getElementById('atAtualizar')?.click();
    }catch(err){
      alert('Não foi possível salvar as alterações: '+(err?.message||err));
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Salvar atendimento';}
    }
  },true);
})();
