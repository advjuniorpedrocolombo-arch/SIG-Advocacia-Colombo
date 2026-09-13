(()=>{
  let semanaBase=inicioSemana(new Date());

  const css=`
  #tarefas.sig-weekly{min-width:0;overflow-x:hidden}
  #tarefas.sig-weekly .toolbar{align-items:center;margin-bottom:12px;gap:10px;flex-wrap:wrap}
  #tarefas.sig-weekly .table{display:none!important}
  #tarefas.sig-weekly .sig-week-wrap{display:block;min-width:0;width:100%;max-width:100%;overflow:hidden}
  #tarefas.sig-weekly .sig-week-top{display:flex;justify-content:space-between;align-items:center;gap:12px;background:linear-gradient(135deg,#102c55,#173b72);color:#fff;border-radius:18px;padding:14px 16px;margin:6px 0 12px;box-shadow:0 8px 22px rgba(16,44,85,.13)}
  #tarefas.sig-weekly .sig-week-title{font-family:Georgia,serif;font-size:22px;font-weight:700;margin:0}
  #tarefas.sig-weekly .sig-week-sub{font-size:11px;color:#d8e4f3;margin-top:3px}
  #tarefas.sig-weekly .sig-week-nav{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
  #tarefas.sig-weekly .sig-week-nav button{background:#fff;color:#173b72;padding:7px 9px;border-radius:9px;font-size:11px;font-weight:700;white-space:nowrap}
  #tarefas.sig-weekly .sig-week-stats{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  #tarefas.sig-weekly .sig-stat{background:#fff;border:1px solid #e1e8f0;border-radius:12px;padding:8px 12px;min-width:108px;box-shadow:0 3px 10px rgba(16,44,85,.04)}
  #tarefas.sig-weekly .sig-stat b{display:block;font-size:19px;color:#102c55}
  #tarefas.sig-weekly .sig-stat span{font-size:10px;color:#73849a}
  #tarefas.sig-weekly .sig-week-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;width:100%;max-width:100%;overflow:visible;padding-bottom:2px}
  #tarefas.sig-weekly .sig-day{min-width:0;width:100%;background:#f8fbff;border:1px solid #dfe8f2;border-radius:13px;padding:7px;min-height:205px;overflow:hidden}
  #tarefas.sig-weekly .sig-day.today{border:2px solid #2f6fb7;background:#f3f8ff}
  #tarefas.sig-weekly .sig-day-head{text-align:center;padding:2px 1px 7px;border-bottom:1px solid #dfe8f2;margin-bottom:7px}
  #tarefas.sig-weekly .sig-day-name{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#173b72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #tarefas.sig-weekly .sig-day-date{font-family:Georgia,serif;font-size:22px;font-weight:700;color:#102c55;line-height:1.05}
  #tarefas.sig-weekly .sig-day-month{font-size:8px;color:#75869a;text-transform:uppercase;white-space:nowrap}
  #tarefas.sig-weekly .sig-task-card{position:relative;background:#fff;border:1px solid #e3eaf2;border-radius:10px;padding:8px 6px 7px 29px;margin-bottom:6px;box-shadow:0 3px 9px rgba(16,44,85,.05);cursor:pointer;transition:.15s ease;min-width:0;overflow:hidden}
  #tarefas.sig-weekly .sig-task-card:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(16,44,85,.09)}
  #tarefas.sig-weekly .sig-task-card.done{opacity:.62}
  #tarefas.sig-weekly .sig-task-check{position:absolute;left:6px;top:8px;width:17px;height:17px;border-radius:50%;display:grid;place-items:center;background:#eaf4ff;color:#173b72;font-size:10px;font-weight:900;border:1px solid #c9d9ec;padding:0}
  #tarefas.sig-weekly .sig-task-card.done .sig-task-check{background:#dff5ea;color:#087a4b;border-color:#bde8d2}
  #tarefas.sig-weekly .sig-task-title{font-size:10px;font-weight:700;color:#172033;line-height:1.2;overflow-wrap:anywhere}
  #tarefas.sig-weekly .sig-task-time{font-size:8.5px;color:#60758d;margin-top:4px;overflow-wrap:anywhere}
  #tarefas.sig-weekly .sig-task-prio{display:inline-block;margin-top:5px;padding:2px 5px;border-radius:999px;font-size:7.5px;font-weight:800;text-transform:uppercase;background:#eef3fb;color:#173b72}
  #tarefas.sig-weekly .sig-task-prio.urgente{background:#fee4e2;color:#b42318}
  #tarefas.sig-weekly .sig-task-prio.alta{background:#fff1dc;color:#b54708}
  #tarefas.sig-weekly .sig-task-actions{display:flex;gap:4px;margin-top:5px;flex-wrap:wrap}
  #tarefas.sig-weekly .sig-task-actions button{padding:4px 5px;border-radius:6px;font-size:8px;white-space:nowrap}
  #tarefas.sig-weekly .sig-empty{text-align:center;color:#a0adbb;font-size:9px;padding:22px 2px}
  #tarefas.sig-weekly .sig-week-foot{margin-top:12px;background:#fff;border:1px solid #e1e8f0;border-radius:12px;padding:8px 12px;color:#6b7d92;font-size:11px;display:flex;justify-content:space-between;gap:8px;align-items:center}
  #tarefas.sig-weekly .sig-progress{height:5px;background:#edf2f7;border-radius:999px;overflow:hidden;flex:1;max-width:280px}
  #tarefas.sig-weekly .sig-progress > i{display:block;height:100%;background:#173b72;border-radius:999px}
  @media(max-width:1180px){#tarefas.sig-weekly .sig-week-days{grid-template-columns:repeat(4,minmax(0,1fr))}}
  @media(max-width:900px){#tarefas.sig-weekly .sig-week-days{grid-template-columns:repeat(3,minmax(0,1fr))}#tarefas.sig-weekly .sig-week-top{align-items:flex-start;flex-direction:column}.main{min-width:0}}
  @media(max-width:650px){#tarefas.sig-weekly .sig-week-days{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:430px){#tarefas.sig-weekly .sig-week-days{grid-template-columns:1fr}}
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
