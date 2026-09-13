(()=>{
  function paraISO(v){
    if(!v)return null;
    const d=new Date(v);
    if(Number.isNaN(d.getTime()))throw new Error('Data ou horário inválido.');
    return d.toISOString();
  }

  function instalarNovo(){
    const f=document.getElementById('fAgenda');
    if(!f||f.__sigTimezoneAgenda)return;
    f.__sigTimezoneAgenda=true;
    f.onsubmit=async e=>{
      e.preventDefault();
      const btn=f.querySelector('button[type="submit"],button:not([type])');
      const antigo=btn?.textContent||'Salvar';
      try{
        const payload={
          user_id:U?.id,
          titulo:String(f.elements.titulo.value||'').trim(),
          tipo:String(f.elements.tipo.value||'compromisso'),
          inicio:paraISO(f.elements.inicio.value),
          fim:paraISO(f.elements.fim.value),
          local:String(f.elements.local.value||'').trim()||null,
          processo_id:f.elements.processo_id.value||null
        };
        if(btn){btn.disabled=true;btn.textContent='Salvando...';}
        const {error}=await sb.from('eventos_agenda').insert(payload);
        if(error)throw error;
        closeM('mAgenda');
        f.reset();
        await load();
      }catch(err){
        alert('Não foi possível salvar o compromisso: '+(err?.message||err));
      }finally{
        if(btn){btn.disabled=false;btn.textContent=antigo;}
      }
    };
  }

  function instalarEdicao(){
    const f=document.getElementById('fEditarAgendaSIG');
    if(!f||f.__sigTimezoneAgenda)return;
    f.__sigTimezoneAgenda=true;
    f.onsubmit=async e=>{
      e.preventDefault();
      const id=f.elements.id.value;
      const btn=f.querySelector('button[type="submit"]');
      const antigo=btn?.textContent||'Salvar alterações';
      try{
        const payload={
          titulo:String(f.elements.titulo.value||'').trim(),
          tipo:String(f.elements.tipo.value||'compromisso'),
          inicio:paraISO(f.elements.inicio.value),
          fim:paraISO(f.elements.fim.value),
          local:String(f.elements.local.value||'').trim()||null,
          processo_id:f.elements.processo_id.value||null
        };
        if(btn){btn.disabled=true;btn.textContent='Salvando...';}
        const {error}=await sb.from('eventos_agenda').update(payload).eq('id',id);
        if(error)throw error;
        document.getElementById('mEditarAgendaSIG')?.classList.add('hidden');
        await load();
        alert('Compromisso atualizado com sucesso.');
      }catch(err){
        alert('Não foi possível editar o compromisso: '+(err?.message||err));
      }finally{
        if(btn){btn.disabled=false;btn.textContent=antigo;}
      }
    };
  }

  function iniciar(){
    if(typeof sb==='undefined'||typeof U==='undefined')return;
    instalarNovo();
    instalarEdicao();
  }

  let n=0;
  const t=setInterval(()=>{iniciar();if(++n>120)clearInterval(t);},200);
  document.addEventListener('click',()=>setTimeout(iniciar,0),true);
})();
