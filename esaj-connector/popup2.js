const $=id=>document.getElementById(id);
function msg(t,ok=false){const el=$('msg');el.className='msg '+(ok?'ok':'err');el.textContent=t}
$('who').textContent='Abra a página de detalhes do processo no e-SAJ autenticado.';
$('enviar').onclick=async()=>{
  try{
    $('enviar').disabled=true;
    msg('Lendo o processo no e-SAJ...',true);
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id||!/^https:\/\/esaj\.tjsp\.jus\.br\//.test(tab.url||'')){
      throw new Error('Abra a página de detalhes do processo no e-SAJ.');
    }
    const cap=await chrome.tabs.sendMessage(tab.id,{type:'SIG_CAPTURAR_ESAJ'});
    if(!cap?.ok)throw new Error(cap?.error||'Não foi possível ler a página do e-SAJ.');
    const payload={...cap.payload,movimentos:(cap.payload.movimentos||[]).slice(0,100)};
    await navigator.clipboard.writeText(JSON.stringify(payload));
    await chrome.tabs.create({url:'https://advjuniorpedrocolombo-arch.github.io/SIG-Advocacia-Colombo/esaj-importador.html'});
    msg('Dados copiados. No importador, clique em “Ler dados copiados”.',true);
  }catch(e){
    msg(e?.message||String(e));
  }finally{
    $('enviar').disabled=false;
  }
};
