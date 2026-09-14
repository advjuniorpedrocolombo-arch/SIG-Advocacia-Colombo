(()=>{
  const ID='sigAgendaModernStyle';
  let filtroTexto='';
  let filtroTipo='';
  let filtroStatus='';

  function addStyle(){
    if(document.getElementById(ID)) return;
    const s=document.createElement('style');
    s.id=ID;
    s.textContent=`
      #agenda.sig-agenda-modern{--azul:#0b63e5;--navy:#102c55;--borda:#dfe7f2;--muted:#667085}
      #agenda.sig-agenda-modern .toolbar{align-items:flex-start;gap:18px;margin:0 0 18px}
      #agenda .sig-agenda-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;width:100%}
      #agenda .sig-agenda-titlewrap{display:flex;gap:14px;align-items:center}
      #agenda .sig-agenda-icon{width:52px;height:52px;border-radius:14px;background:#edf5ff;display:grid;place-items:center;font-size:25px}
      #agenda .sig-agenda-title{margin:0;color:#12213f;font-size:28px}
      #agenda .sig-agenda-sub{margin:4px 0 0;color:var(--muted);font-size:14px}
      #agenda .sig-agenda-new{background:var(--azul)!important;color:#fff!important;padding:12px 18px;border-radius:10px!important;box-shadow:0 6px 16px #0b63e526}
      #agenda .sig-metrics{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px;margin:0 0 16px}
      #agenda .sig-metric{background:#fff;border:1px solid var(--borda);border-radius:14px;padding:14px 16px;min-height:84px;box-shadow:0 3px 12px #102c550a}
      #agenda .sig-metric .n{font-size:24px;font-weight:800;color:#12213f;display:block;margin-top:5px}
      #agenda .sig-metric .l{font-size:12px;color:var(--muted)}
      #agenda .sig-filtros{display:grid;grid-template-columns:minmax(220px,1.7fr) minmax(150px,.7fr) minmax(150px,.7fr) auto;gap:10px;margin:0 0 14px;align-items:center}
      #agenda .sig-filtros input,#agenda .sig-filtros select{margin:0;background:#fff;border:1px solid var(--borda);height:42px;border-radius:10px}
      #agenda .sig-filtros button{height:42px;white-space:nowrap}
      #agenda .table{border:1px solid var(--borda);border-radius:14px;box-shadow:0 4px 14px #102c550a;overflow:auto}
      #agenda table{min-width:920px}
      #agenda th{background:#f3f7fc;color:#33476b;text-transform:uppercase;font-size:11px;letter-spacing:.03em;padding:12px}
      #agenda td{padding:12px;border-bottom:1px solid #e8edf5;color:#172033}
      #agenda tbody tr:hover{background:#fbfdff}
      #agenda td:nth-child(1){font-weight:700;white-space:nowrap}
      #agenda td:nth-child(3){font-weight:700}
      #agenda .sig-dia-semana{color:#173b72;margin-right:5px}
      #agenda .sig-tipo,#agenda .sig-status{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;font-weight:700;font-size:12px;white-space:nowrap}
      #agenda .sig-tipo{background:#eaf8f0;color:#087443}
      #agenda .sig-tipo.compromisso{background:#eaf2ff;color:#0b63e5}
      #agenda .sig-status{background:#eaf2ff;color:#0b63e5}
      #agenda .sig-local-virtual:before{content:'▣ ';color:#49617f}
      #agenda .sig-local-presencial:before{content:'● ';color:#0b63e5}
      #agenda td:last-child button{padding:8px 12px;border-radius:9px!important}
      #agenda .sig-empty{text-align:center;padding:28px;color:var(--muted)}
      @media(max-width:900px){#agenda .sig-metrics{grid-template-columns:repeat(2,1fr)}#agenda .sig-filtros{grid-template-columns:1fr 1fr}#agenda .sig-agenda-head{flex-direction:column}.sig-agenda-new{align-self:stretch}}
      @media(max-width:560px){#agenda .sig-metrics{grid-template-columns:1fr 1fr}#agenda .sig-filtros{grid-template-columns:1fr}#agenda .sig-agenda-title{font-size:23px}}
    `;
    document.head.appendChild(s);
  }

  function fmtCompact(v){
    if(!v) return '—';
    const d=new Date(v);
    if(Number.isNaN(d.getTime())) return '—';
    const dia=d.toLocaleDateString('pt-BR',{weekday:'long'});
    const diaFmt=dia.charAt(0).toUpperCase()+dia.slice(1);
    return `<span class="sig-dia-semana">${diaFmt}</span> ${d.toLocaleDateString('pt-BR')} · ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
  }

  function normal(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}

  function montarEstrutura(){
    const sec=document.getElementById('agenda');
    if(!sec||sec.dataset.moderno==='1') return;
    sec.dataset.moderno='1';
    sec.classList.add('sig-agenda-modern');
    const toolbar=sec.querySelector('.toolbar');
    if(toolbar){
      toolbar.innerHTML=`<div class="sig-agenda-head"><div class="sig-agenda-titlewrap"><div class="sig-agenda-icon">📅</div><div><h3 class="sig-agenda-title">Tarefas e Compromissos</h3><p class="sig-agenda-sub">Organize sua rotina, audiências, prazos e compromissos em um só lugar.</p></div></div><button class="primary sig-agenda-new" type="button" onclick="openM('mAgenda')">+ Novo compromisso</button></div>`;
      toolbar.insertAdjacentHTML('afterend',`
        <div class="sig-metrics">
          <div class="sig-metric"><span class="l">Compromissos agendados</span><span class="n" id="sigAgTotal">0</span></div>
          <div class="sig-metric"><span class="l">Compromissos de hoje</span><span class="n" id="sigAgHoje">0</span></div>
          <div class="sig-metric"><span class="l">Já realizados</span><span class="n" id="sigAgPassados">0</span></div>
          <div class="sig-metric"><span class="l">Próximo compromisso</span><span class="n" id="sigAgProximo" style="font-size:16px">—</span></div>
        </div>
        <div class="sig-filtros">
          <input id="sigAgBusca" type="search" placeholder="Buscar compromisso, local ou palavra-chave...">
          <select id="sigAgTipo"><option value="">Todos os tipos</option><option value="compromisso">Compromisso</option><option value="audiencia">Audiência</option><option value="reuniao">Reunião</option><option value="atendimento">Atendimento</option><option value="pericia">Perícia</option><option value="outro">Outro</option></select>
          <select id="sigAgStatus"><option value="">Todos os status</option><option value="agendado">Agendado</option><option value="realizado">Realizado</option><option value="cancelado">Cancelado</option></select>
          <button class="secondary" id="sigAgLimpar" type="button">Limpar filtros</button>
        </div>`);
      document.getElementById('sigAgBusca').addEventListener('input',e=>{filtroTexto=e.target.value;renderModern()});
      document.getElementById('sigAgTipo').addEventListener('change',e=>{filtroTipo=e.target.value;renderModern()});
      document.getElementById('sigAgStatus').addEventListener('change',e=>{filtroStatus=e.target.value;renderModern()});
      document.getElementById('sigAgLimpar').onclick=()=>{
        filtroTexto=filtroTipo=filtroStatus='';
        document.getElementById('sigAgBusca').value='';
        document.getElementById('sigAgTipo').value='';
        document.getElementById('sigAgStatus').value='';
        renderModern();
      };
    }
  }

  function atualizarMetricas(lista){
    const agora=new Date();
    const hoje=agora.toLocaleDateString('pt-BR');
    const futuros=lista.filter(x=>x.inicio&&new Date(x.inicio)>=agora&&normal(x.status)!=='cancelado');
    const deHoje=lista.filter(x=>x.inicio&&new Date(x.inicio).toLocaleDateString('pt-BR')===hoje);
    const passados=lista.filter(x=>x.inicio&&new Date(x.inicio)<agora);
    const prox=[...futuros].sort((a,b)=>new Date(a.inicio)-new Date(b.inicio))[0];
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerHTML=v};
    set('sigAgTotal',futuros.length);
    set('sigAgHoje',deHoje.length);
    set('sigAgPassados',passados.length);
    set('sigAgProximo',prox?fmtCompact(prox.inicio):'Nenhum');
  }

  function renderModern(){
    if(typeof D==='undefined') return;
    const tb=document.getElementById('tbAgenda');
    const sec=document.getElementById('agenda');
    if(!tb||!sec) return;
    const all=D.agenda||[];
    atualizarMetricas(all);
    const q=normal(filtroTexto);
    const lista=all.filter(x=>{
      const texto=normal([x.titulo,x.local,x.tipo,x.status].join(' '));
      return (!q||texto.includes(q))&&(!filtroTipo||normal(x.tipo)===normal(filtroTipo))&&(!filtroStatus||normal(x.status)===normal(filtroStatus));
    });
    const th=sec.querySelector('thead tr');
    if(th) th.innerHTML='<th>Dia · Data/Hora</th><th>Tipo</th><th>Título</th><th>Local</th><th>Status</th><th>Ações</th>';
    if(!lista.length){tb.innerHTML='<tr><td colspan="6" class="sig-empty">Nenhum compromisso encontrado.</td></tr>';return;}
    tb.innerHTML=lista.map(x=>{
      const tipo=normal(x.tipo);
      const virtual=normal(x.local).includes('virtual');
      const tituloSeguro=String(x.titulo||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
      return `<tr>
        <td>${fmtCompact(x.inicio)}</td>
        <td><span class="sig-tipo ${tipo==='compromisso'?'compromisso':''}">${esc(x.tipo||'—')}</span></td>
        <td>${esc(x.titulo||'')}</td>
        <td><span class="${virtual?'sig-local-virtual':'sig-local-presencial'}">${esc(x.local||'—')}</span></td>
        <td><span class="sig-status">${esc(x.status||'agendado')}</span></td>
        <td style="white-space:nowrap"><button type="button" class="secondary" onclick="editarAgendaSIG('${x.id}')">Editar</button> <button type="button" class="secondary" style="color:#b42318;background:#fff1f2;margin-left:6px" onclick="excluirAgendaSIG('${x.id}','${tituloSeguro}')">Excluir</button></td>
      </tr>`;
    }).join('');
  }

  function instalar(){
    addStyle();
    montarEstrutura();
    renderModern();
    if(typeof render==='function'&&!render.__sigAgendaModern){
      const old=render;
      const novo=function(){old();setTimeout(renderModern,0)};
      novo.__sigAgendaModern=true;
      render=novo;
    }
  }

  let tent=0;
  const t=setInterval(()=>{
    if(document.getElementById('agenda')&&typeof D!=='undefined'){instalar();clearInterval(t)}
    if(++tent>100)clearInterval(t);
  },150);
})();