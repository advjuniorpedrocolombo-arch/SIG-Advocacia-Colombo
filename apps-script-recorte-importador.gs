// SIG Advocacia Colombo — Importador automático do Recorte Digital OAB/SP
// Implantar este arquivo em um projeto Google Apps Script executado pela conta
// que recebe os e-mails do Recorte Digital.
//
// Propriedades do script necessárias:
// SUPABASE_URL=https://dmvytzyfzeytfrddyucv.supabase.co
// SUPABASE_SERVICE_ROLE=<chave service_role do projeto>
// SIG_USER_ID=2264550a-f366-4295-81e7-b05b00f3b621
// SIG_TOKEN=<token aleatório forte para proteger o Web App>

function doGet(e) {
  return responder_(sincronizarRecortes_(e));
}

function doPost(e) {
  return responder_(sincronizarRecortes_(e));
}

function responder_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sincronizarRecortes_(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const tokenEsperado = props.getProperty('SIG_TOKEN') || '';
    const tokenRecebido = (e && e.parameter && e.parameter.token) || '';
    if (!tokenEsperado || tokenRecebido !== tokenEsperado) {
      return { ok: false, erro: 'Token inválido.' };
    }

    const supabaseUrl = props.getProperty('SUPABASE_URL');
    const serviceRole = props.getProperty('SUPABASE_SERVICE_ROLE');
    const userId = props.getProperty('SIG_USER_ID');
    if (!supabaseUrl || !serviceRole || !userId) {
      return { ok: false, erro: 'Configuração incompleta no Apps Script.' };
    }

    const threads = GmailApp.search('from:oabsp@recortedigital.adv.br newer_than:15d', 0, 30);
    const mensagens = [];
    threads.forEach(t => t.getMessages().forEach(m => mensagens.push(m)));
    mensagens.sort((a,b) => a.getDate() - b.getDate());

    let importadas = 0;
    let ignoradas = 0;
    let erros = [];

    mensagens.forEach(msg => {
      const gmailId = msg.getId();
      const assunto = msg.getSubject() || '';
      const corpo = msg.getPlainBody() || '';
      const pubs = extrairPublicacoes_(corpo);
      pubs.forEach((p, idx) => {
        try {
          const identificador = p.identificador_documento || (gmailId + ':' + (idx + 1));
          if (jaExiste_(supabaseUrl, serviceRole, gmailId, identificador, p.numero_cnj, p.data_publicacao)) {
            ignoradas++;
            return;
          }

          const processoId = localizarProcesso_(supabaseUrl, serviceRole, userId, p.numero_cnj);
          const registro = {
            user_id: userId,
            processo_id: processoId,
            numero_cnj: p.numero_cnj,
            fonte: 'Recorte Digital OAB/SP',
            assunto_email: assunto,
            gmail_message_id: gmailId,
            data_disponibilizacao: p.data_disponibilizacao,
            data_publicacao: p.data_publicacao,
            tipo_publicacao: p.tipo_publicacao,
            jornal: p.jornal,
            caderno: p.caderno,
            local_publicacao: p.local_publicacao,
            vara: p.vara,
            identificador_documento: identificador,
            texto: p.texto,
            lida: false,
            analisada: false,
            prazo_gerado: false,
            arquivada: false
          };
          inserir_(supabaseUrl, serviceRole, registro);
          importadas++;
        } catch (err) {
          erros.push(String(err && err.message ? err.message : err));
        }
      });
    });

    return { ok: erros.length === 0, importadas, ignoradas, erros };
  } catch (err) {
    return { ok: false, erro: String(err && err.message ? err.message : err) };
  }
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
    const cnj      = capturar_(bloco, /PROCESSO:\s*(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/i) || capturar_(bloco, /(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/);
    const ident    = capturar_(bloco, /Identificador do documento:\s*([^\.\n]+)/i);
    const pubIdx   = bloco.search(/\nPublica(?:ç|c)ão:\s*\n/i);
    let conteudo = pubIdx >= 0 ? bloco.slice(pubIdx).replace(/^\n?Publica(?:ç|c)ão:\s*\n/i, '') : bloco;
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

function headers_(serviceRole) {
  return {
    apikey: serviceRole,
    Authorization: 'Bearer ' + serviceRole,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
  };
}

function jaExiste_(base, key, gmailId, identificador, cnj, dataPub) {
  const filtros = [];
  if (gmailId) filtros.push('gmail_message_id.eq.' + encodeURIComponent(gmailId));
  if (identificador) filtros.push('identificador_documento.eq.' + encodeURIComponent(identificador));
  if (cnj && dataPub) filtros.push('and(numero_cnj.eq.' + encodeURIComponent(cnj) + ',data_publicacao.eq.' + encodeURIComponent(dataPub) + ')');
  const url = base + '/rest/v1/publicacoes_recorte?select=id&or=(' + filtros.join(',') + ')&limit=1';
  const r = UrlFetchApp.fetch(url, { method:'get', headers:headers_(key), muteHttpExceptions:true });
  if (r.getResponseCode() >= 300) throw new Error('Falha ao verificar duplicidade: ' + r.getContentText());
  const arr = JSON.parse(r.getContentText() || '[]');
  return arr.length > 0;
}

function localizarProcesso_(base, key, userId, cnj) {
  if (!cnj) return null;
  const url = base + '/rest/v1/processos?select=id&user_id=eq.' + encodeURIComponent(userId) + '&numero_cnj=eq.' + encodeURIComponent(cnj) + '&limit=1';
  const r = UrlFetchApp.fetch(url, { method:'get', headers:headers_(key), muteHttpExceptions:true });
  if (r.getResponseCode() >= 300) throw new Error('Falha ao localizar processo: ' + r.getContentText());
  const arr = JSON.parse(r.getContentText() || '[]');
  return arr.length ? arr[0].id : null;
}

function inserir_(base, key, registro) {
  const r = UrlFetchApp.fetch(base + '/rest/v1/publicacoes_recorte', {
    method:'post',
    headers:headers_(key),
    payload:JSON.stringify(registro),
    muteHttpExceptions:true
  });
  if (r.getResponseCode() >= 300) throw new Error('Falha ao inserir publicação: ' + r.getContentText());
}

// Execute uma vez manualmente depois de configurar as propriedades para validar.
function testeSincronizacao() {
  const token = PropertiesService.getScriptProperties().getProperty('SIG_TOKEN');
  Logger.log(JSON.stringify(sincronizarRecortes_({ parameter:{ token:token } })));
}
