chrome.runtime.onMessage.addListener((req,_sender,sendResponse)=>{
  if(req?.type!=='SIG_PJE_ABRIR_PROCESSO')return;
  (async()=>{
    try{
      const trt=Number(req.trt);
      const cnj=String(req.cnj||'');
      if(!trt||!cnj)throw new Error('Dados do processo inválidos.');

      await chrome.storage.local.set({SIG_PJE_ABRIR:{cnj,trt,criado_em:Date.now()}});

      const tabs=await chrome.tabs.query({url:`https://pje.trt${trt}.jus.br/*`});
      const candidatos=tabs
        .filter(t=>t.id)
        .sort((a,b)=>{
          const aPublica=/\/consultaprocessual\//i.test(a.url||'')?1:0;
          const bPublica=/\/consultaprocessual\//i.test(b.url||'')?1:0;
          return aPublica-bPublica;
        });

      if(candidatos.length){
        const tab=candidatos[0];
        await chrome.tabs.update(tab.id,{active:true});
        if(tab.windowId)await chrome.windows.update(tab.windowId,{focused:true});
        try{
          await chrome.tabs.sendMessage(tab.id,{type:'SIG_PJE_EXECUTAR',cnj,trt});
        }catch(_e){
          await chrome.tabs.reload(tab.id);
        }
        sendResponse({ok:true,reused:true,tabId:tab.id});
        return;
      }

      const nova=await chrome.tabs.create({url:`https://pje.trt${trt}.jus.br/primeirograu/`,active:true});
      sendResponse({ok:true,reused:false,tabId:nova.id});
    }catch(e){
      sendResponse({ok:false,error:e?.message||String(e)});
    }
  })();
  return true;
});
