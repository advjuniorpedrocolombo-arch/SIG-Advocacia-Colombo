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
function normalizaData(s){
  const m=String(s||'').match(/\b(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}(?::\d{2})?))?/);
  return m?clean(m[0]):'';
}
function movimentos(){
  const out=[];
  const seen=new Set();
  const add=(data,descricao)=>{
    data=clean(data);descricao=clean(descricao);
    if(!descricao||descricao.length<3)return;
    if(/^movimenta(c|ç)(a|ã)o(ões)?$/i.test(descricao))return;
    const k=(data+'|'+descricao).toLowerCase();
    if(seen.has(k))return;seen.add(k);out.push({data,descricao});
  };

  const selectors=[
    '#tabelaTodasMovimentacoes tr',
    '#tabelaUltimasMovimentacoes tr',
    'table[id*="moviment" i] tr',
    'table[class*="moviment" i] tr',
    'tr[class*="moviment" i]'
  ];
  document.querySelectorAll(selectors.join(',')).forEach(tr=>{
    const tds=[...tr.querySelectorAll('td')];
    if(!tds.length)return;
    const texts=tds.map(td=>clean(td.innerText||td.textContent||''));
    const data=texts.map(normalizaData).find(Boolean)||normalizaData(clean(tr.innerText||''));
    let desc='';
    if(texts.length>=2){
      desc=texts.filter(t=>t && t!==data && !/^\d{2}\/\d{2}\/\d{4}/.test(t)).join(' — ');
    }
    if(!desc)desc=clean(tr.innerText||'').replace(data,'').trim();
    if(data||/juntad|publicad|despach|decis|senten|peti[cç]|certid|remet|recebid|conclus|audi[eê]n|intima|mandado|expedi/i.test(desc))add(data,desc);
  });

  if(!out.length){
    document.querySelectorAll('div,li,p,span').forEach(el=>{
      const t=clean(el.innerText||'');
      if(t.length<8||t.length>1200)return;
      const data=normalizaData(t);
      if(data&&/juntad|publicad|despach|decis|senten|peti[cç]|certid|remet|recebid|conclus|audi[eê]n|intima|movimenta/i.test(t)){
        add(data,t.replace(data,'').trim());
      }
    });
  }
  return out.slice(0,250);
}
function partes(){
  const area=document.querySelector('#partesPrincipais, #tablePartesPrincipais, [id*="partesPrincipais"], [id*="parte" i] table');
  return clean(area?.innerText||'');
}
function clienteRepresentado(){
  const alvo=/510[.\s-]?497|OAB\s*\/?\s*SP\s*[:.-]?\s*510[.\s-]?497/i;
  const area=document.querySelector('#partesPrincipais, #tablePartesPrincipais, [id*="partesPrincipais"], [id*="parte" i] table');
  if(!area)return '';
  const linhas=[...area.querySelectorAll('tr')];
  for(const tr of linhas){
    const texto=clean(tr.innerText||tr.textContent||'');
    if(!alvo.test(texto))continue;
    const cels=[...tr.querySelectorAll('td')].map(td=>clean(td.innerText||td.textContent||'')).filter(Boolean);
    if(cels.length){
      let nome=cels.find(v=>!alvo.test(v) && !/advogad|oab|autor|réu|requerente|requerido|exequente|executado|interessado/i.test(v))||cels[0];
      nome=clean(nome.replace(/^(autor|réu|requerente|requerido|exequente|executado|interessado)\s*:?\s*/i,''));
      if(nome)return nome;
    }
  }
  return '';
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
      cliente_representado:clienteRepresentado(),
      movimentos:movimentos(),
      url:location.href,
      capturado_em:new Date().toISOString()
    };
    if(!payload.numero_cnj) throw new Error('Número do processo não encontrado nesta página. Abra a página de detalhes do processo no e-SAJ.');
    sendResponse({ok:true,payload});
  }catch(e){sendResponse({ok:false,error:e.message||String(e)})}
  return true;
});
