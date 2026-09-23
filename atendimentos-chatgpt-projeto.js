(()=>{
  const esperar=()=>{
    const form=document.getElementById('atForm');
    const lista=document.getElementById('atLista');
    if(typeof sb==='undefined'||!form||!lista){setTimeout(esperar,200);return;}
    if(form.dataset.chatgptProjetoAtivo==='1')return;
    form.dataset.chatgptProjetoAtivo='1';

    let atendimentoEditandoId=null;
    let injetandoBotoes=false;

    const normalizarUrl=(valor)=>{
      const v=String(valor||'').trim();
      if(!v)return '';
      try{
        const u=new URL(v);
        const host=u.hostname.toLowerCase();
        const hostPermitido=host==='chatgpt.com'||host.endsWith('.chatgpt.com')||host==='chat.openai.com';
        if(u.protocol!=='https:'||!hostPermitido)return null;
        return u.href;
      }catch{return null;}
    };

    function abrirProjeto(url){
      const segura=normalizarUrl(url);
      if(!segura){alert('Informe um link válido do ChatGPT (https://chatgpt.com/...).');return;}
      window.open(segura,'_blank','noopener,noreferrer');
    }

    function garantirCampo(){
      if(form.elements.chatgpt_projeto_url)return;
      const obs=form.querySelector('textarea[name="observacoes"]')?.closest('.full');
      if(!obs)return;
      const bloco=document.createElement('div');
      bloco.className='full';
      bloco.id='atChatGPTProjetoCampo';
      bloco.innerHTML=`
        <label>Projeto ChatGPT</label>
        <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center">
          <input name="chatgpt_projeto_url" type="url" inputmode="url" autocomplete="off" placeholder="Cole o link do projeto no ChatGPT">
          <button type="button" class="secondary" id="atAbrirChatGPTProjeto" style="white-space:nowrap">🤖 Abrir projeto</button>
        </div>
        <div style="font-size:10px;color:#718198;margin-top:4px">Cole uma vez o endereço do projeto. Depois, basta usar o botão para abrir diretamente no ChatGPT.</div>`;
      obs.parentNode.insertBefore(bloco,obs);
      const abrir=document.getElementById('atAbrirChatGPTProjeto');
      abrir.onclick=()=>abrirProjeto(form.elements.chatgpt_projeto_url.value);
      const input=form.elements.chatgpt_projeto_url;
      const atualizarEstado=()=>{
        const ok=!!normalizarUrl(input.value);
        abrir.disabled=!ok;
        abrir.title=ok?'Abrir projeto do ChatGPT em nova aba':'Cadastre um link válido do ChatGPT';
      };
      input.addEventListener('input',atualizarEstado);
      atualizarEstado();
    }

    async function preencherLink(id){
      garantirCampo();
      const input=form.elements.chatgpt_projeto_url;
      if(!input)return;
      input.value='';
      document.getElementById('atAbrirChatGPTProjeto')?.setAttribute('disabled','disabled');
      if(!id)return;
      const {data,error}=await sb.from('atendimentos').select('chatgpt_projeto_url').eq('id',id).maybeSingle();
      if(error){console.warn('SIG: não foi possível carregar link do ChatGPT',error);return;}
      input.value=data?.chatgpt_projeto_url||'';
      input.dispatchEvent(new Event('input'));
    }

    async function salvarLinkDepoisDoAtendimento({id,url,nome}){
      const segura=normalizarUrl(url);
      if(url&&segura===null)throw new Error('O link do projeto ChatGPT não é válido. Use um endereço iniciado por https://chatgpt.com/.');

      if(id){
        const {error}=await sb.from('atendimentos').update({chatgpt_projeto_url:segura||null,atualizado_em:new Date().toISOString()}).eq('id',id);
        if(error)throw error;
        return;
      }
      if(!segura)return;

      const {data,error}=await sb.from('atendimentos').select('id').eq('nome_contato',nome).order('criado_em',{ascending:false}).limit(1);
      if(error)throw error;
      const novoId=data?.[0]?.id;
      if(!novoId)throw new Error('Atendimento recém-criado não localizado para vincular o projeto ChatGPT.');
      const {error:updateError}=await sb.from('atendimentos').update({chatgpt_projeto_url:segura,atualizado_em:new Date().toISOString()}).eq('id',novoId);
      if(updateError)throw updateError;
    }

    garantirCampo();

    const salvarOriginal=form.onsubmit;
    form.onsubmit=async function(e){
      garantirCampo();
      const url=form.elements.chatgpt_projeto_url?.value?.trim()||'';
      const nome=form.elements.nome_contato?.value?.trim()||'';
      const id=atendimentoEditandoId;
      const segura=normalizarUrl(url);
      if(url&&segura===null){
        e.preventDefault();
        alert('O link do projeto ChatGPT não é válido. Cole o endereço completo iniciado por https://chatgpt.com/.');
        return;
      }
      await salvarOriginal.call(this,e);
      try{
        await salvarLinkDepoisDoAtendimento({id,url,nome});
        document.getElementById('atAtualizar')?.click();
      }catch(err){
        alert('O atendimento foi salvo, mas não foi possível salvar o link do projeto ChatGPT: '+(err?.message||err));
      }
    };

    document.addEventListener('click',e=>{
      const editar=e.target.closest?.('[data-editar]');
      if(editar){
        atendimentoEditandoId=editar.dataset.editar||null;
        setTimeout(()=>preencherLink(atendimentoEditandoId),0);
        return;
      }
      if(e.target.closest?.('#btnNovoAtendimento')){
        atendimentoEditandoId=null;
        setTimeout(()=>preencherLink(null),0);
      }
    },true);

    async function injetarBotoes(){
      if(injetandoBotoes)return;
      const cards=[...lista.querySelectorAll('.at-card')];
      const ids=cards.map(c=>c.querySelector('[data-editar]')?.dataset.editar).filter(Boolean);
      if(!ids.length)return;
      injetandoBotoes=true;
      try{
        const {data,error}=await sb.from('atendimentos').select('id,chatgpt_projeto_url').in('id',ids);
        if(error)throw error;
        const links=new Map((data||[]).map(x=>[String(x.id),x.chatgpt_projeto_url]));
        cards.forEach(card=>{
          const id=card.querySelector('[data-editar]')?.dataset.editar;
          const actions=card.querySelector('.at-actions');
          if(!id||!actions)return;
          actions.querySelector('[data-chatgpt-projeto]')?.remove();
          const url=links.get(String(id));
          if(!normalizarUrl(url))return;
          const b=document.createElement('button');
          b.type='button';b.className='secondary';b.dataset.chatgptProjeto=id;b.textContent='🤖 ChatGPT ↗';
          b.title='Abrir projeto deste cliente no ChatGPT';
          b.onclick=()=>abrirProjeto(url);
          const editar=actions.querySelector('[data-editar]');
          editar?.insertAdjacentElement('afterend',b);
        });
      }catch(err){console.warn('SIG: falha ao preparar botões do ChatGPT',err);}
      finally{injetandoBotoes=false;}
    }

    let timer=null;
    const obsLista=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(injetarBotoes,80);
    });
    obsLista.observe(lista,{childList:true,subtree:true});
    injetarBotoes();
  };
  esperar();
})();
