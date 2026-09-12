const $=id=>document.getElementById(id);
function msg(t,ok=false){const el=$('msg');el.className='msg '+(ok?'ok':'err');el.textContent=t}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function norm(v){return String(v||'').replace(/\D/g,'')}
function fmt(n){n=norm(n);return n.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,'$1-$2.$3.$4.$5.$6')}
function esajUrl(numero){
  const n=norm(numero);if(n.length!==20)throw new Error('Número CNJ inválido: '+numero);
  const f=fmt(n),digAno=f.slice(0,15),foro=n.slice(-4);
  const q=new URLSearchParams({conversationId:'','dadosConsulta.localPesquisa.cdLocal':'-1',cbPesquisa:'NUMPROC','dadosConsulta.tipoNuProcesso':'UNIFICADO',numeroDigitoAnoUnificado:digAno,foroNumeroUnificado:foro,'dadosConsulta.valorConsultaNuUnificado':f,'dadosConsulta.valorConsulta':''});
  return 'https://esaj.tjsp.jus.br/cpopg/search.do?'+q.toString();
}
async function waitComplete(tabId,timeout=25000){
  const t=await chrome.tabs.get(tabId);if(t.status==='complete')return;
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{chrome.tabs.onUpdated.removeListener(onU);reject(new Error('Tempo excedido ao abrir o e-SAJ.'))},timeout);
    function onU(id,info){if(id===tabId&&info.status==='complete'){clearTimeout(timer);chrome.tabs.onUpdated.removeListener(onU);resolve()}}
    chrome.tabs.onUpdated.addListener(onU);
  });
}
async function capture(tabId){
  let last='';
  for(let i=0;i<8;i++){
    try{const cap=await chrome.tabs.sendMessage(tabId,{type:'SIG_CAPTURAR_ESAJ'});if(cap?.ok)return cap.payload;last=cap?.error||'Página ainda não disponível';}catch(e){last=e?.message||String(e)}
    await sleep(750);
  }
  throw new Error(last||'Não foi possível ler a página do e-SAJ.');
}
$('who').textContent='Processo individual: abra os detalhes no e-SAJ. Lote: prepare a lista no SIG.';

$('enviar').onclick=async()=>{
  try{
    $('enviar').disabled=true;$('lote').disabled=true;msg('Lendo o processo no e-SAJ...',true);
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id||!/^https:\/\/esaj\.tjsp\.jus\.br\//.test(tab.url||''))throw new Error('Abra a página de detalhes do processo no e-SAJ.');
    const cap=await capture(tab.id);
    const payload={...cap,movimentos:(cap.movimentos||[]).slice(0,250)};
    await navigator.clipboard.writeText(JSON.stringify(payload));
    await chrome.tabs.create({url:'https://advjuniorpedrocolombo-arch.github.io/SIG-Advocacia-Colombo/esaj-importador.html'});
    msg('Dados copiados. No importador, clique em “Ler dados copiados”.',true);
  }catch(e){msg(e?.message||String(e));}
  finally{$('enviar').disabled=false;$('lote').disabled=false;}
};

$('lote').onclick=async()=>{
  let tabId=null;
  try{
    $('enviar').disabled=true;$('lote').disabled=true;
    const raw=await navigator.clipboard.readText();
    if(!raw)throw new Error('A lista está vazia. Abra “Preparar atualização e-SAJ” no SIG e copie o lote.');
    let pacote;try{pacote=JSON.parse(raw)}catch(_){throw new Error('O conteúdo copiado não é um lote do SIG. Prepare o lote novamente.')}
    if(pacote?.tipo!=='SIG_ESAJ_LOTE'||!Array.isArray(pacote.processos))throw new Error('O conteúdo copiado não é um lote válido do SIG.');
    const processos=pacote.processos.filter(x=>norm(x.numero_cnj).length===20);
    if(!processos.length)throw new Error('Nenhum processo TJSP válido foi encontrado no lote.');
    const resultados=[];
    for(let i=0;i<processos.length;i++){
      const p=processos[i];msg(`Consultando ${i+1}/${processos.length}\n${p.numero_cnj}`,true);
      try{
        const tab=await chrome.tabs.create({url:esajUrl(p.numero_cnj),active:false});tabId=tab.id;
        await waitComplete(tabId);await sleep(1200);
        const dados=await capture(tabId);
        resultados.push({ok:true,processo_id:p.id||null,numero_cnj:p.numero_cnj,titulo:p.titulo||'',payload:{...dados,movimentos:(dados.movimentos||[]).slice(0,250)}});
      }catch(e){resultados.push({ok:false,processo_id:p.id||null,numero_cnj:p.numero_cnj,titulo:p.titulo||'',erro:e?.message||String(e)});}
      finally{if(tabId){try{await chrome.tabs.remove(tabId)}catch(_){ }tabId=null}}
      await sleep(350);
    }
    const saida={tipo:'SIG_ESAJ_RESULTADOS',gerado_em:new Date().toISOString(),total:processos.length,resultados};
    await navigator.clipboard.writeText(JSON.stringify(saida));
    const ok=resultados.filter(x=>x.ok).length,erros=resultados.length-ok;
    msg(`Varredura concluída: ${ok} processo(s) lido(s), ${erros} com falha. Abrindo importador...`,true);
    await chrome.tabs.create({url:'https://advjuniorpedrocolombo-arch.github.io/SIG-Advocacia-Colombo/esaj-lote-importador.html'});
  }catch(e){msg(e?.message||String(e));}
  finally{if(tabId){try{await chrome.tabs.remove(tabId)}catch(_){ }}$('enviar').disabled=false;$('lote').disabled=false;}
};
