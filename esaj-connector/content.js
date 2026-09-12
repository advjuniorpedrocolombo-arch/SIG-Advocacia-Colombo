function txt(sel){const e=document.querySelector(sel);return e?e.textContent.trim():''}
function first(selectors){for(const s of selectors){const v=txt(s);if(v)return v}return ''}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}
function cnjFromPage(){
  const candidates=[
    first(['#numeroProcesso','#numeroProcessoProcesso','#processoNumero','#numeroProcessoFormatado']),
    document.body.innerText.match(/\b\d{7}-\d{2}\.\d{4}\.8\.26\.\d{4}\b/)?.[0]||''
  ];
  return candidates.map(clean).find(Boolean)||'';
}
function movimentos(){
  const out=[];
  const rows=document.querySelectorAll('#tabelaTodasMovimentacoes tr, #tabelaUltimasMovimentacoes tr, table[id*="Moviment"] tr');
  rows.forEach(tr=>{
    const data=clean(tr.querySelector('.dataMovimentacao, td:first-child')?.textContent||'');
    const desc=clean(tr.querySelector('.descricaoMovimentacao, td:nth-child(2), td:last-child')?.textContent||'');
    if(desc && !/movimenta(c|ç)(a|ã)o/i.test(desc)) out.push({data,descricao:desc});
  });
  if(!out.length){
    document.querySelectorAll('.movimentacao, [class*="movimentacao"]').forEach(el=>{
      const t=clean(el.textContent);if(t)out.push({data:'',descricao:t});
    });
  }
  return out.slice(0,250);
}
function partes(){
  const area=document.querySelector('#partesPrincipais, #tablePartesPrincipais, [id*="partesPrincipais"]');
  return clean(area?.innerText||'');
}
chrome.runtime.onMessage.addListener((req,_sender,sendResponse)=>{
  if(req?.type!=='SIG_CAPTURAR_ESAJ')return;
  try{
    const payload={
      numero_cnj:cnjFromPage(),
      classe:first(['#classeProcesso','#classeProcessoProcesso','[id*="classeProcesso"]']),
      assunto:first(['#assuntoProcesso','#assuntoProcessoProcesso','[id*="assuntoProcesso"]']),
      foro:first(['#foroProcesso','#foroProcessoProcesso','[id*="foroProcesso"]']),
      vara:first(['#varaProcesso','#varaProcessoProcesso','[id*="varaProcesso"]']),
      juiz:first(['#juizProcesso','#juizProcessoProcesso','[id*="juizProcesso"]']),
      partes:partes(),
      movimentos:movimentos(),
      url:location.href,
      capturado_em:new Date().toISOString()
    };
    if(!payload.numero_cnj) throw new Error('Número do processo não encontrado nesta página. Abra a página de detalhes do processo no e-SAJ.');
    sendResponse({ok:true,payload});
  }catch(e){sendResponse({ok:false,error:e.message||String(e)})}
  return true;
});
