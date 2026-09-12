const $=id=>document.getElementById(id);
function msg(t,ok=false){$('msg').className='msg '+(ok?'ok':'err');$('msg').textContent=t}
$('loginBox').classList.add('hidden');
$('connected').classList.remove('hidden');
$('who').textContent='Use o processo aberto no e-SAJ autenticado.';
$('logout').classList.add('hidden');
$('enviar').onclick=async()=>{
  try{
    $('enviar').disabled=true;msg('Lendo o processo no e-SAJ...',true);
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id||!/^https:\/\/esaj\.tjsp\.jus\.br\//.test(tab.url||''))throw new Error('Abra a página de detalhes do processo no e-SAJ antes de enviar.');
    const cap=await chrome.tabs.sendMessage(tab.id,{type:'SIG_CAPTURAR_ESAJ'});
    if(!cap?.ok)throw new Error(cap?.error||'Não foi possível ler a página do e-SAJ.');
    await chrome.storage.local.set({sig_esaj_payload:cap.payload});
    window.open('https://advjuniorpedrocolombo-arch.github.io/SIG-Advocacia-Colombo/esaj-importador.html','_blank');
    msg('Dados capturados. O importador do SIG foi aberto.',true);
  }catch(e){msg(e.message||String(e))}finally{$('enviar').disabled=false}
};
