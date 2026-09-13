(()=>{
  let semanaBase=inicioSemana(new Date());

  const css=`
  #tarefas.sig-weekly .toolbar{align-items:center;margin-bottom:14px}
  #tarefas.sig-weekly .table{display:none!important}
  #tarefas.sig-weekly .sig-week-wrap{display:block}
  #tarefas.sig-weekly .sig-week-top{display:flex;justify-content:space-between;align-items:center;gap:14px;background:linear-gradient(135deg,#102c55,#173b72);color:#fff;border-radius:20px;padding:18px 20px;margin:8px 0 14px;box-shadow:0 10px 28px rgba(16,44,85,.14)}
  #tarefas.sig-weekly .sig-week-title{font-family:Georgia,serif;font-size:26px;font-weight:700;margin:0}
  #tarefas.sig-weekly .sig-week-sub{font-size:12px;color:#d8e4f3;margin-top:4px}
  #tarefas.sig-weekly .sig-week-nav{display:flex;gap:8px;flex-wrap:wrap}
  #tarefas.sig-weekly .sig-week-nav button{background:#fff;color:#173b72;padding:8px 11px;border-radius:10px;font-weight:700}
  #tarefas.sig-weekly .sig-week-stats{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap}
  #tarefas.sig-weekly .sig-stat{background:#fff;border:1px solid #e1e8f0;border-radius:14px;padding:10px 14px;min-width:130px;box-shadow:0 4px 14px rgba(16,44,85,.04)}
  #tarefas.sig-weekly .sig-stat b{display:block;font-size:22px;color:#102c55}
  #tarefas.sig-weekly .sig-stat span{font-size:11px;color:#73849a}
  #tarefas.sig-weekly .sig-week-days{display:grid;grid-template-columns:repeat(7,minmax(150px,1fr));gap:10px;overflow-x:auto;padding-bottom:4px}
  #tarefas.sig-weekly .sig-day{min-width:150px;background:#f8fbff;border:1px solid #dfe8f2;border-radius:16px;padding:10px;min-height:240px}
  #tarefas.sig-weekly .sig-day.today{border:2px solid #2f6fb7;background:#f3f8ff}
  #tarefas.sig-weekly .sig-day-head{text-align:center;padding:4px 2px 10px;border-bottom:1px solid #dfe8f2;margin-bottom:10px}
  #tarefas.sig-weekly .sig-day-name{font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#173b72}
  #tarefas.sig-weekly .sig-day-date{font-family:Georgia,serif;font-size:27px;font-weight:700;color:#102c55;line-height:1.1}
  #tarefas.sig-weekly .sig-day-month{font-size:10px;color:#75869a;text-transform:uppercase}
  #tarefas.sig-weekly .sig-task-card{position:relative;background:#fff;border:1px solid #e3eaf2;border-radius:12px;padding:10px 9px 9px 36px;margin-bottom:8px;box-shadow:0 4px 12px rgba(16,44,85,.05);cursor:pointer;transition:.15s ease}
  #tarefas.sig-weekly .sig-task-card:hover{transform:translateY(-1px);box-shadow:0 7px 16px rgba(16,44,85,.09)}
  #tarefas.sig-weekly .sig-task-card.done{opacity:.62}
  #tarefas.sig-weekly .sig-task-check{position:absolute;left:9px;top:10px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#eaf4ff;color:#173b72;font-size:12px;font-weight:900;border:1px solid #c9d9ec}
  #tarefas.sig-weekly .sig-task-card.done .sig-task-check{background:#dff5ea;color:#087a4b;border-color:#bde8d2}
  #tarefas.sig-weekly .sig-task-title{font-size:12px;font-weight:700;color:#172033;line-height:1.25;margin-right:2px}
  #tarefas.sig-weekly .sig-task-time{font-size:10px;color:#60758d;margin-top:5px}
  #tarefas.sig-weekly .sig-task-prio{display:inline-block;margin-top:6px;padding:3px 6px;border-radius:999px;font-size:9px;font-weight:800;text-transform:uppercase;background:#eef3fb;color:#173b72}
  #tarefas.sig-weekly .sig-task-prio.urgente{background:#fee4e2;color:#b42318}
  #tarefas.sig-weekly .sig-task-prio.alta{background:#fff1dc;color:#b54708}
  #tarefas.sig-weekly .sig-task-actions{display:flex;gap:5px;margin-top:7px}
  #tarefas.sig-weekly .sig-task-actions button{padding:5px 7px;border-radius:7px;font-size:10px}
  #tarefas.sig-weekly .sig-empty{text-align:center;color:#a0adbb;font-size:11px;padding:28px 4px}
  #tarefas.sig-weekly .sig-week-foot{margin-top:14px;background:#fff;border:1px solid #e1e8f0;border-radius:14px;padding:10px 14px;color:#6b7d92;font-size:12px;display:flex;justify-content:space-between;gap:10px;align-items:center}
  #tarefas.sig-weekly .sig-progress{height:6px;background:#edf2f7;border-radius:999px;overflow:hidden;flex:1;max-width:320px}
  #tarefas.sig-weekly .sig-progress > i{display:block;height:100%;background:#173b72;border-radius:999px}
  @media(max-width:900px){#tarefas.sig-weekly .sig-week-days{grid-template-columns:repeat(7,190px)}#tarefas.sig-weekly .sig-week-top{align-items:flex-start;flex-direction:column}}
  `;

  function inicioSemana(d){
    const x=new Date(d);x.setHours(0,0,0,0);const dia=x.getDay();const diff=dia===0?-6:1-dia;x.setDate(x.getDate()+diff);return x;
  }
  function fimSemana(inicio){const x=new Date(inicio);x.setDate(x.getDate()+6);x.setHours(23,59,59,999);return x;}
  function chaveDia(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;}
  function mesmoDia(a,b){return chaveDia(a)===chaveDia(b)}
  function cap(s){return s?String(s).charAt(0).toUpperCase()+String(s).slice(1):''}
  function fmtData(d){return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}
  function hora(v){if(!v)return '';return new Date(v).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}

  function garantirEstrutura(){
    const sec=document.getElementById('tarefas');
    if(!sec)return null;
    sec.classList.add('sig-weekly');
    if(!document.getElementById('sigTarefasSemanalStyle')){const st=document.createElement('style');st.id='sigTarefasSemanalStyle';st.textContent=css;document.head.appendChild(st);}
    let wrap=document.getElementById('sigTarefasSemanal');
    if(!wrap){wrap=document.createElement('div');wrap.id='sigTarefasSemanal';wrap.className='sig-week-wrap';const table=sec.querySelector('.table');sec.insertBefore(wrap,table||null);}
    return wrap;
  }

  function renderSemanal(){
    if(typeof D==='undefined')return;
    const wrap=garantirEstrutura();if(!wrap)return;
    const ini=new Date(semanaBase),fim=fimSemana(ini),hoje=new Date();
    const tarefas=(D.tarefas||[]).filter(t=>t.data_prevista&&new Date(t.data_prevista)>=ini&&new Date(t.data_prevista)<=fim).sort((a,b)=>new Date(a.data_prevista)-new Date(b.data_prevista));
    const concl=tarefas.filter(t=>t.status==='concluida').length, pend=tarefas.length-concl;
    const dias=Array.from({length:7},(_,i)=>{const d=new Date(ini);d.setDate(ini.getDate()+i);return d;});
    const pct=tarefas.length?Math.round(concl/tarefas.length*100):0;
    wrap.innerHTML=`
      <div class="sig-week-top">
        <div><div class="sig-week-title">Semana de ${fmtData(ini)} a ${fmtData(fim)}</div><div class="sig-week-sub">Organize suas tarefas por dia, acompanhe prioridades e conclua sua semana.</div></div>
        <div class="sig-week-nav"><button type="button" id="sigSemanaAnterior">← Semana anterior</button><button type="button" id="sigSemanaHoje">Semana atual</button><button type="button" id="sigSemanaProxima">Próxima semana →</button></div>
      </div>
      <div class="sig-week-stats"><div class="sig-stat"><b>${tarefas.length}</b><span>Tarefas da semana</span></div><div class="sig-stat"><b>${pend}</b><span>Pendentes</span></div><div class="sig-stat"><b>${concl}</b><span>Concluídas</span></div></div>
      <div class="sig-week-days">${dias.map(d=>{
        const doDia=tarefas.filter(t=>mesmoDia(t.data_prevista,d));
        return `<section class="sig-day ${mesmoDia(d,hoje)?'today':''}">
          <div class="sig-day-head"><div class="sig-day-name">${cap(d.toLocaleDateString('pt-BR',{weekday:'long'}))}</div><div class="sig-day-date">${String(d.getDate()).padStart(2,'0')}</div><div class="sig-day-month">${d.toLocaleDateString('pt-BR',{month:'short',year:'numeric'})}</div></div>
          ${doDia.length?doDia.map(t=>{
            const done=t.status==='concluida';
            return `<article class="sig-task-card ${done?'done':''}" onclick="editarTarefa('${t.id}')">
              <button class="sig-task-check" type="button" title="${done?'Concluída':'Marcar como concluída'}" onclick="event.stopPropagation();${done?'':'done(\'tarefas\',\''+t.id+'\',\'concluida\')'}">${done?'✓':'○'}</button>
              <div class="sig-task-title">${esc(t.titulo||'Tarefa')}</div>
              <div class="sig-task-time">${hora(t.data_prevista)}${t.processo_id?' · '+esc(procNome(t.processo_id)):''}</div>
              <span class="sig-task-prio ${esc(t.prioridade||'normal')}">${esc(t.prioridade||'normal')}</span>
              <div class="sig-task-actions"><button type="button" class="secondary" onclick="event.stopPropagation();editarTarefa('${t.id}')">Editar</button>${done?'':`<button type="button" class="secondary" onclick="event.stopPropagation();done('tarefas','${t.id}','concluida')">Concluir</button>`}</div>
            </article>`;
          }).join(''):'<div class="sig-empty">Sem tarefas</div>'}
        </section>`;
      }).join('')}</div>
      <div class="sig-week-foot"><span>${pct}% da semana concluída</span><div class="sig-progress"><i style="width:${pct}%"></i></div><span>${concl}/${tarefas.length}</span></div>`;
    document.getElementById('sigSemanaAnterior').onclick=()=>{semanaBase.setDate(semanaBase.getDate()-7);renderSemanal();};
    document.getElementById('sigSemanaHoje').onclick=()=>{semanaBase=inicioSemana(new Date());renderSemanal();};
    document.getElementById('sigSemanaProxima').onclick=()=>{semanaBase.setDate(semanaBase.getDate()+7);renderSemanal();};
  }

  const renderAnterior=window.render;
  if(typeof renderAnterior==='function')window.render=function(){renderAnterior();renderSemanal();};
  let tent=0;const ti=setInterval(()=>{if(typeof D!=='undefined'){renderSemanal();if(++tent>20)clearInterval(ti)}},250);
  document.addEventListener('click',e=>{if(e.target?.closest?.('#menu button[data-p="tarefas"]'))setTimeout(renderSemanal,50)},true);
})();
