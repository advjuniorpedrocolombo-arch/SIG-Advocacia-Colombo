// SIG Advocacia Colombo — Importador do Recorte Digital OAB/SP
// Google Apps Script executado pela conta Gmail que recebe o Recorte Digital.
//
// Configuração necessária em Propriedades do script:
// SIG_EDGE_TOKEN = token privado informado na implantação
//
// Implantar como Aplicativo da Web:
// - Executar como: Eu
// - Quem tem acesso: Qualquer pessoa

const SIG_EDGE_URL = 'https://dmvytzyfzeytfrddyucv.supabase.co/functions/v1/importar-recorte';

function doGet() {
  return responder_(sincronizarRecortes_());
}

function doPost() {
  return responder_(sincronizarRecortes_());
}

function responder_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sincronizarRecortes_() {
  try {
    const token = PropertiesService.getScriptProperties().getProperty('SIG_EDGE_TOKEN');
    if (!token) return { ok:false, erro:'SIG_EDGE_TOKEN não configurado.' };

    const threads = GmailApp.search('from:oabsp@recortedigital.adv.br newer_than:15d', 0, 30);
    const mensagens = [];
    threads.forEach(t => t.getMessages().forEach(m => mensagens.push(m)));
    mensagens.sort((a,b) => a.getDate() - b.getDate());

    let importadas = 0;
    let ignoradas = 0;
    const erros = [];
    let emailsLidos = 0;

    mensagens.forEach(msg => {
      try {
        const corpo = msg.getPlainBody() || '';
        const pubs = extrairPublicacoes_(corpo);
        if (!pubs.length) return;

        emailsLidos++;
        const resposta = enviarAoSIG_({
          assunto_email: msg.getSubject() || '',
          gmail_message_id: msg.getId(),
          publicacoes: pubs
        }, token);

        importadas += Number(resposta.importadas || 0);
        ignoradas += Number(resposta.ignoradas || 0);
        if (Array.isArray(resposta.erros)) erros.push(...resposta.erros);
        if (resposta.erro) erros.push(resposta.erro);
      } catch (err) {
        erros.push(String(err && err.message ? err.message : err));
      }
    });

    return {
      ok: erros.length === 0,
      emails_lidos: emailsLidos,
      importadas,
      ignoradas,
      erros
    };
  } catch (err) {
    return { ok:false, erro:String(err && err.message ? err.message : err) };
  }
}

function enviarAoSIG_(payload, token) {
  const r = UrlFetchApp.fetch(SIG_EDGE_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-sig-token': token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const status = r.getResponseCode();
  const texto = r.getContentText() || '{}';
  let json;
  try { json = JSON.parse(texto); }
  catch (_) { json = { ok:false, erro:'Resposta inválida do SIG: ' + texto }; }

  if (status >= 300) throw new Error(json.erro || ('Erro HTTP ' + status));
  return json;
}

function extrairPublicacoes_(texto) {
  if (!texto) return [];

  const blocos = texto.split(/\n\s*Publica(?:ç|c)ão:\s*\d+\.?\s*\n/i).slice(1);

  return blocos.map(bloco => {
    const dataDisp = capturar_(bloco, /Data de Disponibiliza(?:ç|c)ão:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const dataPub  = capturar_(bloco, /Data de Publica(?:ç|c)ão:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const jornal   = capturar_(bloco, /Jornal:\s*([^\n]+)/i);
    const caderno  = capturar_(bloco, /Caderno:\s*([^\n]+)/i);
    const local    = capturar_(bloco, /Local:\s*([^\n]+)/i);
    const vara     = capturar_(bloco, /Vara:\s*([^\n]+)/i);
    const tipo     = capturar_(bloco, /Publica(?:ç|c)ão:\s*\n?\s*([^\n]+)/i) || 'Publicação';
    const cnj      = capturar_(bloco, /PROCESSO:\s*(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/i)
                  || capturar_(bloco, /(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/);
    const ident    = capturar_(bloco, /Identificador do documento:\s*([^\.\n]+)/i);

    const pubIdx = bloco.search(/\nPublica(?:ç|c)ão:\s*\n/i);
    let conteudo = pubIdx >= 0
      ? bloco.slice(pubIdx).replace(/^\n?Publica(?:ç|c)ão:\s*\n/i, '')
      : bloco;

    conteudo = conteudo.split(/\n\s*Total de Publica(?:ç|c)ões:/i)[0].trim();

    return {
      numero_cnj: cnj || null,
      data_disponibilizacao: paraISO_(dataDisp),
      data_publicacao: paraISO_(dataPub),
      tipo_publicacao: tipo ? tipo.trim() : 'Publicação',
      jornal: jornal ? jornal.trim() : null,
      caderno: caderno ? caderno.trim() : null,
      local_publicacao: local ? local.trim() : null,
      vara: vara ? vara.trim() : null,
      identificador_documento: ident ? ident.trim() : null,
      texto: conteudo
    };
  }).filter(p => p.texto && (p.numero_cnj || p.identificador_documento));
}

function capturar_(texto, re) {
  const m = texto.match(re);
  return m ? m[1] : null;
}

function paraISO_(br) {
  if (!br) return null;
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// Execute manualmente uma vez para autorizar GmailApp/UrlFetchApp e validar.
function testeSincronizacao() {
  Logger.log(JSON.stringify(sincronizarRecortes_()));
}
