(()=>{
  function normalizaUrl(v){
    const s=String(v||'').trim();
    if(!s)return null;
    try{
      const u=new URL(s);
      if(u.protocol!=='https:')throw new Error('Use um endereço https://');
      return u.href;
    }catch(e){throw new Error('Link direto PJe inválido. Cole o endereço completo da barra do navegador.');}
  }

  function instalarCampoNovo(){
    const form=document.getElementById('fProcesso');
    if(!form || form.elements.link_pje)return;
    const grid=form.querySelector('.formgrid');
    if(!grid)return;
    const box=document.createElement('div');
    box.className='span2';
    box.innerHTML='<label>Link direto PJe (opcional)</label><input name="link_pje" type="url" placeholder="Cole aqui o endereço exato do processo no PJe autenticado"><div class="small" style="margin-top:-8px;margin-bottom:10px">Se preenchido, o botão Tribunal abrirá exatamente este endereço.</div>';
    grid.appendChild(box);
  }

  function instalarCampoEdicao(){
    const form=document.getElementById('fEditarProcessoSIG');
    if(!form || form.elements.link_pje)return;
    const grid=form.querySelector('.formgrid');
    if(!grid)return;
    const box=document.createElement('div');
    box.className='span2';
    box.innerHTML='<label>Link direto PJe (opcional)</label><input name="link_pje" type="url" placeholder="Cole o endereço exato do processo no PJe autenticado"><div class="small" style="margin-top:-8px;margin-bottom:10px">Use o link interno do processo já aberto no PJe.</div>';
    const obs=grid.querySelector('textarea[name="observacoes"]')?.closest('.span2');
    if(obs)grid.insertBefore(box,obs);else grid.appendChild(box);

    const antigoEditar=window.editarProcessoSIG;
    if(typeof antigoEditar==='function'&&!window.__SIG_LINK_PJE_EDIT_PATCHED){
      window.__SIG_LINK_PJE_EDIT_PATCHED=true;
      window.editarProcessoSIG=function(id){
        antigoEditar(id);
        const p=(typeof D!=='undefined'&&Array.isArray(D.processos))?D.processos.find(x=>x.id===id):null;
        const f=document.getElementById('fEditarProcessoSIG');
        if(f?.elements.link_pje)f.elements.link_pje.value=p?.link_pje||'';
      };
    }

    form.onsubmit=async e=>{
      e.preventDefault();
      const f=e.currentTarget;
      const id=f.elements.id.value;
      let link=null;
      try{link=normalizaUrl(f.elements.link_pje.value);}catch(err){alert(err.message);return;}
      const payload={
        partes:String(f.elements.partes.value||'').trim()||null,
        area:String(f.elements.area.value||'').trim()||null,
        comarca:String(f.elements.comarca.value||'').trim()||null,
        vara:String(f.elements.vara.value||'').trim()||null,
        parte_contraria:String(f.elements.parte_contraria.value||'').trim()||null,
        observacoes:String(f.elements.observacoes.value||'').trim()||null,
        link_pje:link,
        atualizado_em:new Date().toISOString()
      };
      const salvar=f.querySelector('button[type="submit"]');
      salvar.disabled=true;salvar.textContent='Salvando...';
      const {error}=await sb.from('processos').update(payload).eq('id',id);
      salvar.disabled=false;salvar.textContent='Salvar alterações';
      if(error){alert('Não foi possível salvar as alterações: '+error.message);return;}
      document.getElementById('mEditarProcessoSIG')?.classList.add('hidden');
      await load();
      alert('Processo atualizado com sucesso.');
    };
  }

  function instalarAbrirDireto(){
    if(window.__SIG_LINK_PJE_OPEN_PATCHED)return;
    const fallback=window.abrirProcessoTribunal;
    if(typeof fallback!=='function')return;
    window.__SIG_LINK_PJE_OPEN_PATCHED=true;
    window.abrirProcessoTribunal=function(ref){
      let p=null;
      try{if(typeof D!=='undefined'&&Array.isArray(D.processos))p=D.processos.find(x=>x.id===ref);}catch(_e){}
      const link=String(p?.link_pje||'').trim();
      if(link){
        try{
          const u=new URL(link);
          if(u.protocol!=='https:')throw new Error();
          window.open(u.href,'_blank','noopener');
          return;
        }catch(_e){alert('O link direto PJe salvo neste processo é inválido. Edite o processo e cole novamente o endereço completo.');return;}
      }
      fallback(ref);
    };
  }

  function validarNovoProcesso(){
    const form=document.getElementById('fProcesso');
    if(!form || form.__sigLinkPjeValidation)return;
    form.__sigLinkPjeValidation=true;
    form.addEventListener('submit',e=>{
      const campo=form.elements.link_pje;
      if(!campo||!String(campo.value||'').trim())return;
      try{campo.value=normalizaUrl(campo.value);}catch(err){e.preventDefault();e.stopImmediatePropagation();alert(err.message);}
    },true);
  }

  function iniciar(){
    instalarCampoNovo();
    instalarCampoEdicao();
    instalarAbrirDireto();
    validarNovoProcesso();
  }

  let n=0;
  const timer=setInterval(()=>{
    iniciar();
    if(++n>80)clearInterval(timer);
  },250);
  document.addEventListener('click',()=>setTimeout(iniciar,0),true);
})();
