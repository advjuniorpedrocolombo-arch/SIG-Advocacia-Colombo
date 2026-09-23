(()=>{
  const normalizarUrl=(v)=>{
    const s=String(v||'').trim();
    if(!s)return null;
    try{
      const u=new URL(s);
      if(u.protocol!=='https:')throw new Error();
      const host=u.hostname.toLowerCase();
      if(host!=='chatgpt.com'&&host!=='www.chatgpt.com'&&host!=='chat.openai.com')throw new Error();
      return u.href;
    }catch(_e){return false;}
  };

  function instalarCampo(){
    const form=document.getElementById('fEditarProcessoSIG');
    if(!form)return false;
    const grid=form.querySelector('.formgrid');
    if(!grid)return false;

    if(!form.elements.chatgpt_projeto_url){
      const box=document.createElement('div');
      box.className='full';
      box.innerHTML=`<label>Projeto ChatGPT</label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input name="chatgpt_projeto_url" type="url" placeholder="Cole aqui o link do projeto no ChatGPT" style="flex:1;min-width:260px;margin:0">
          <button type="button" class="secondary" id="btnAbrirProjetoChatGPT" style="white-space:nowrap">🤖 Abrir projeto</button>
        </div>
        <div class="small" style="margin-top:4px">O link fica salvo neste processo e abre o projeto correspondente em uma nova aba.</div>`;
      const linkPje=form.elements.link_pje?.closest('div');
      if(linkPje&&linkPje.nextSibling)grid.insertBefore(box,linkPje.nextSibling);else grid.appendChild(box);
    }

    const btn=form.querySelector('#btnAbrirProjetoChatGPT');
    if(btn&&!btn.dataset.on){
      btn.dataset.on='1';
      btn.onclick=()=>{
        const url=normalizarUrl(form.elements.chatgpt_projeto_url?.value);
        if(url===false)return alert('Link do ChatGPT inválido. Cole o endereço completo do projeto.');
        if(!url)return alert('Cadastre primeiro o link do projeto ChatGPT.');
        window.open(url,'_blank','noopener');
      };
    }
    return true;
  }

  function instalarAbertura(){
    if(window.__SIG_CHATGPT_EDIT_PATCHED||typeof window.editarProcessoSIG!=='function')return;
    const anterior=window.editarProcessoSIG;
    window.__SIG_CHATGPT_EDIT_PATCHED=true;
    window.editarProcessoSIG=function(id){
      anterior(id);
      setTimeout(()=>{
        instalarCampo();
        const p=(typeof D!=='undefined'&&Array.isArray(D.processos))?D.processos.find(x=>x.id===id):null;
        const f=document.getElementById('fEditarProcessoSIG');
        if(f?.elements.chatgpt_projeto_url)f.elements.chatgpt_projeto_url.value=p?.chatgpt_projeto_url||'';
      },0);
    };
  }

  function instalarSubmit(){
    const form=document.getElementById('fEditarProcessoSIG');
    if(!form||form.__sigChatgptSubmit)return;
    if(!form.elements.chatgpt_projeto_url)return;
    form.__sigChatgptSubmit=true;

    form.addEventListener('submit',async e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      const f=e.currentTarget;
      const id=f.elements.id.value;

      let linkPje=null;
      if(f.elements.link_pje&&String(f.elements.link_pje.value||'').trim()){
        try{
          const u=new URL(String(f.elements.link_pje.value).trim());
          if(u.protocol!=='https:')throw new Error();
          linkPje=u.href;
        }catch(_e){alert('Link direto PJe inválido. Cole o endereço completo da barra do navegador.');return;}
      }

      const chatgpt=normalizarUrl(f.elements.chatgpt_projeto_url.value);
      if(chatgpt===false){alert('Link do ChatGPT inválido. Cole o endereço completo do projeto.');return;}

      const tipo=String(f.elements.tipo_atendimento?.value||'').trim().toUpperCase();
      const payload={
        partes:String(f.elements.partes?.value||'').trim()||null,
        area:String(f.elements.area?.value||'').trim()||null,
        tipo_atendimento:(tipo==='PARTICULAR'||tipo==='DPESP')?tipo:null,
        comarca:String(f.elements.comarca?.value||'').trim()||null,
        vara:String(f.elements.vara?.value||'').trim()||null,
        parte_contraria:String(f.elements.parte_contraria?.value||'').trim()||null,
        observacoes:String(f.elements.observacoes?.value||'').trim()||null,
        chatgpt_projeto_url:chatgpt,
        atualizado_em:new Date().toISOString()
      };
      if(f.elements.link_pje)payload.link_pje=linkPje;

      const btn=f.querySelector('button[type="submit"]');
      const antigo=btn?.textContent||'Salvar alterações';
      if(btn){btn.disabled=true;btn.textContent='Salvando...';}
      try{
        const {error}=await sb.from('processos').update(payload).eq('id',id);
        if(error)throw error;
        document.getElementById('mEditarProcessoSIG')?.classList.add('hidden');
        if(typeof load==='function')await load();
        alert('Processo atualizado com sucesso.');
      }catch(err){
        alert('Não foi possível salvar as alterações: '+(err?.message||err));
      }finally{
        if(btn){btn.disabled=false;btn.textContent=antigo;}
      }
    },true);
  }

  function iniciar(){
    if(typeof sb==='undefined'||typeof D==='undefined')return;
    instalarCampo();
    instalarAbertura();
    instalarSubmit();
  }

  let tentativas=0;
  const timer=setInterval(()=>{iniciar();if(++tentativas>150)clearInterval(timer);},200);
  document.addEventListener('click',()=>setTimeout(iniciar,0),true);
})();
