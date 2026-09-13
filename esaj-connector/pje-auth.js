(()=>{
  function visivel(el){
    if(!el)return false;
    const r=el.getBoundingClientRect();
    const s=getComputedStyle(el);
    return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';
  }
  function norm(v){return String(v||'').replace(/\D/g,'')}
  function texto(el){return String(el?.innerText||el?.textContent||'').replace(/\s+/g,' ').trim()}
  function setValue(el,value){
    const proto=Object.getPrototypeOf(el);
    const desc=Object.getOwnPropertyDescriptor(proto,'value');
    if(desc?.set)desc.set.call(el,value);else el.value=value;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function clickResultado(cnj){
    const alvo=norm(cnj);
    const elems=[...document.querySelectorAll('a,button,[role="link"],[role="button"],td,span,div')];
    for(const el of elems){
      if(!visivel(el))continue;
      const t=texto(el);
      if(t && norm(t)===alvo){
        const clicavel=el.closest('a,button,[role="link"],[role="button"]')||el;
        clicavel.click();
        return true;
      }
    }
    return false;
  }
  function achaCampo(){
    const inputs=[...document.querySelectorAll('input:not([type="hidden"]),textarea')].filter(visivel);
    const preferidos=inputs.filter(el=>{
      const meta=[el.placeholder,el.getAttribute('aria-label'),el.name,el.id].join(' ').toLowerCase();
      return /(processo|n[uú]mero|consulta|pesquisa|buscar)/i.test(meta) && !/(senha|password|cpf|usu[aá]rio|email)/i.test(meta);
    });
    return preferidos[0]||null;
  }
  function disparaBusca(campo,cnj){
    setValue(campo,cnj);
    campo.focus();
    campo.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
    campo.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
    const area=campo.parentElement?.parentElement||campo.parentElement||document;
    const botoes=[...area.querySelectorAll('button,[role="button"],a')].filter(visivel);
    const b=botoes.find(x=>/(buscar|pesquisar|consultar|lupa)/i.test([texto(x),x.title,x.getAttribute('aria-label')].join(' ')));
    if(b)setTimeout(()=>b.click(),250);
  }

  async function executar(forcado=null){
    let pedido=forcado;
    if(!pedido){
      const obj=await chrome.storage.local.get('SIG_PJE_ABRIR');
      pedido=obj.SIG_PJE_ABRIR;
    }
    if(!pedido)return;
    if(Date.now()-Number(pedido.criado_em||Date.now())>120000)return;
    const host=location.hostname.match(/^pje\.trt(\d+)\.jus\.br$/i);
    if(!host||Number(host[1])!==Number(pedido.trt))return;
    const cnj=pedido.cnj;

    let tentativas=0;
    const timer=setInterval(async()=>{
      tentativas++;
      if(clickResultado(cnj)){
        clearInterval(timer);
        await chrome.storage.local.remove('SIG_PJE_ABRIR');
        return;
      }
      const campo=achaCampo();
      if(campo){
        if(norm(campo.value)!==norm(cnj))disparaBusca(campo,cnj);
      }
      if(tentativas>=35){
        clearInterval(timer);
        console.warn('SIG PJe: não foi possível localizar automaticamente o processo na tela autenticada.');
      }
    },900);
  }

  chrome.runtime.onMessage.addListener((req,_sender,sendResponse)=>{
    if(req?.type!=='SIG_PJE_EXECUTAR')return;
    executar({cnj:req.cnj,trt:req.trt,criado_em:Date.now()})
      .then(()=>sendResponse({ok:true}))
      .catch(e=>sendResponse({ok:false,error:e?.message||String(e)}));
    return true;
  });

  executar().catch(e=>console.error('SIG PJe:',e));
})();
