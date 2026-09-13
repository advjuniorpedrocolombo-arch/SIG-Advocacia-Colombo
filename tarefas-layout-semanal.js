(()=>{
  let semanaBase=inicioSemana(new Date());
  let arrastandoId=null;

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
  #tarefas.sig-weekly .sig-checklist{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
  #tarefas.sig-weekly .sig-day-list{background:#fff;border:1px solid #e1e8f0;border-radius:15px;overflow:hidden;box-shadow:0 4px 14px rgba(16,44,85,.04);transition:.15s ease}
  #tarefas.sig-weekly .sig-day-list.today{border:2px solid #2f6fb7}
  #tarefas.sig-weekly .sig-day-list.drag-over{border:2px dashed #2f6fb7;background:#f3f8ff;transform:scale(1.005)}
  #tarefas.sig-weekly .sig-day-list-head{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#f4f8fd;padding:10px 12px;border-bottom:1px solid #e4ebf3}
  #tarefas.sig-weekly .sig-day-list.today .sig-day-list-head{background:#eaf3ff}
  #tarefas.sig-weekly .sig-day-label{display:flex;align-items:baseline;gap:8px;color:#102c55}
  #tarefas.sig-weekly .sig-day-label strong{font-family:Georgia,serif;font-size:18px}
  #tarefas.sig-weekly .sig-day-label span{font-size:11px;color:#6f8196}
  #tarefas.sig-weekly .sig-day-tools{display:flex;gap:7px;align-items:center}
  #tarefas.sig-weekly .sig-day-count{font-size:10px;font-weight:700;color:#173b72;background:#eaf2fb;border-radius:999px;padding:4px 7px}
  #tarefas.sig-weekly .sig-add-day{width:26px;height:26px;border-radius:8px;border:1px solid #cbd9ea;background:#fff;color:#173b72;font-size:18px;line-height:1;padding:0;cursor:pointer;font-weight:800}
  #tarefas.sig-weekly .sig-add-day:hover{background:#173b72;color:#fff}
  #tarefas.sig-weekly .sig-day-body{padding:8px 10px;min-height:64px}
  #tarefas.sig-weekly .sig-check-row{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px 4px;border-bottom:1px solid #edf1f5;cursor:grab}
  #tarefas.sig-weekly .sig-check-row:active{cursor:grabbing}
  #tarefas.sig-weekly .sig-check-row.dragging{opacity:.38}
  #tarefas.sig-weekly .sig-check-row:last-child{border-bottom:0}
  #tarefas.sig-weekly .sig-check-row.done{opacity:.62}
  #tarefas.sig-weekly .sig-box{width:22px;height:22px;border:2px solid #6d86a5;border-radius:5px;background:#fff;display:grid;place-items:center;color:#fff;font-size:14px;font-weight:900;padding:0;cursor:pointer}
  #tarefas.sig-weekly .sig-check-row.done .sig-box{background:#173b72;border-color:#173b72}
  #tarefas.sig-weekly .sig-check-main{min-width:0;cursor:pointer}
  #tarefas.sig-weekly .sig-check-title{font-size:12px;font-weight:700;color:#172033;line-height:1.25}
  #tarefas.sig-weekly .sig-check-row.done .sig-check-title{text-decoration:line-through}
  #tarefas.sig-weekly .sig-check-meta{font-size:10px;color:#6b7e94;margin-top:3px;overflow-wrap:anywhere}
  #tarefas.sig-weekly .sig-check-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
  #tarefas.sig-weekly .sig-tag-prio{padding:3px 6px;border-radius:999px;font-size:8px;font-weight:800;text-transform:uppercase;background:#eef3fb;color:#173b72}
  #tarefas.sig-weekly .sig-tag-prio.urgente{background:#fee4e2;color:#b42318}
  #tarefas.sig-weekly .sig-tag-prio.alta{background:#fff1dc;color:#b54708}
  #tarefas.sig-weekly .sig-check-actions{display:flex;gap:5px;align-items:center}
  #tarefas.sig-weekly .sig-check-actions button{padding:5px 7px;border-radius:7px;font-size:9px;white-space:nowrap}
  #tarefas.sig-weekly .sig-empty{text-align:center;color:#a0adbb;font-size:10px;padding:18px 4px}
  #tarefas.sig-weekly .sig-week-foot{margin-top:12px;background:#fff;border:1px solid #e1e8f0;border-radius:12px;padding:8px 12px;color:#6b7d92;font-size:11px;display:flex;justify-content:space-between;gap:8px;align-items:center}
  #tarefas.sig-weekly .sig-progress{height:5px;background:#edf2f7;border-radius:999px;overflow:hidden;flex:1;max-width:280px}
  #tarefas.sig-weekly .sig-progress > i{display:block;height:100%;background:#173b72;border-radius:999px}
  @media(max-width:920px){#tarefas.sig-weekly .sig-checklist{grid-template-columns:1fr}#tarefas.sig-weekly .sig-week-top{align-items:flex-start;flex-direction:column}.main{min-width:0}}
  @media(max-width:520px){#tarefas.sig-weekly .sig-check-row{grid-template-columns:28px minmax(0,1fr)}#tarefas.sig-weekly .sig-check-actions{grid-column:2;justify-content:flex-start}}
  `;

  function inicioSemana(d){const x=new Date(d);x.setHours(0,0,0,0);const dia=x.getDay();const diff=dia===0?-6:1-dia;x.setDate(x.getDate()+diff);return x;}
  function fimSemana(inicio){const x=new Date(inicio);x.setDate(x.getDate()+6);x.setHours(23,59,59,999);return x;}
  function chaveDia(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;}
  function mesmoDia(a,b){return chaveDia(a)===chaveDia(b)}
  function cap(s){return s?String(s).charAt(0).toUpperCase()+String(s).slice(1):''}
  function fmtData(d){return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}
  function hora(v){if(!v)return '';return new Date(v).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
  function pad(n){return String(n).padStart(2,'0')}

  function garantirEstrutura(){
    const sec=document.getElementById('tarefas');if(!sec)return null;
    sec.classList.add('sig-weekly');
    if(!document.getElementById('sigTarefasSemanalStyle')){const st=document.createElement('style');st.id='sigTarefasSemanalStyle';st.textContent=css;document.head.appendChild(st);}else document.getElementById('sigTarefasSemanalStyle').textContent=css;
    let wrap=document.getElementById('sigTarefasSemanal');
    if(!wrap){wrap=document.createElement('div');wrap.id='sigTarefasSemanal';wrap.className='sig-week-wrap';const table=sec.querySelector('.table');sec.insertBefore(wrap,table||null);}
    return wrap;
  }

  function abrirNovaNoDia(chave){
    const form=document.getElementById('fTarefa'),modal=document.getElementById('mTarefa');
    if(!form||!modal)return;
    const botaoNova=document.querySelector('#tarefas .toolbar button.primary');
    if(botaoNova)botaoNova.click();
    setTimeout(()=>{
      const agora=new Date();
      if(form.elements.data_prevista)form.elements.data_prevista.value=`${chave}T${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
      openM('mTarefa');
    },0);
  }

  async function moverTarefa(id,chaveDestino){
    const t=(D.tarefas||[]).find(x=>String(x.id)===String(id));if(!t||!t.data_prevista)return;
    const antiga=new Date(t.data_prevista);
    const [a,m,d]=chaveDestino.split('-').map(Number);
    const nova=new Date(a,m-1,d,antiga.getHours(),antiga.getMinutes(),antiga.getSeconds(),antiga.getMilliseconds());
    if(mesmoDia(antiga,nova))return;
    const {error}=await sb.from('tarefas').update({data_prevista:nova.toISOString()}).eq('id',id);
    if(error){alert('Não foi possível mover a tarefa: '+error.message);return;}
    await load();
    renderSemanal();
  }

  function ativarDnD(wrap){
    wrap.querySelectorAll('.sig-check-row[draggable="true"]').forEach(row=>{
      row.addEventListener('dragstart',e=>{arrastandoId=row.dataset.taskId;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',arrastandoId);});
      row.addEventListener('dragend',()=>{row.classList.remove('dragging');arrastandoId=null;wrap.querySelectorAll('.sig-day-list').forEach(x=>x.classList.remove('drag-over'));});
    });
    wrap.querySelectorAll('.sig-day-list[data-date]').forEach(day=>{
      day.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';day.classList.add('drag-over');});
      day.addEventListener('dragleave',e=>{if(!day.contains(e.relatedTarget))day.classList.remove('drag-over');});
      day.addEventListener('drop',async e=>{e.preventDefault();day.classList.remove('drag-over');const id=e.dataTransfer.getData('text/plain')||arrastandoId;if(id)await moverTarefa(id,day.dataset.date);});
    });
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
      <div class="sig-week-top"><div><div class="sig-week-title">Semana de ${fmtData(ini)} a ${fmtData(fim)}</div><div class="sig-week-sub">Checklist semanal: marque, adicione e arraste tarefas entre os dias.</div></div><div class="sig-week-nav"><button type="button" id="sigSemanaAnterior">← Semana anterior</button><button type="button" id="sigSemanaHoje">Semana atual</button><button type="button" id="sigSemanaProxima">Próxima semana →</button></div></div>
      <div class="sig-week-stats"><div class="sig-stat"><b>${tarefas.length}</b><span>Tarefas da semana</span></div><div class="sig-stat"><b>${pend}</b><span>Pendentes</span></div><div class="sig-stat"><b>${concl}</b><span>Concluídas</span></div></div>
      <div class="sig-checklist">${dias.map(d=>{const doDia=tarefas.filter(t=>mesmoDia(t.data_prevista,d));const chave=chaveDia(d);return `<section class="sig-day-list ${mesmoDia(d,hoje)?'today':''}" data-date="${chave}"><div class="sig-day-list-head"><div class="sig-day-label"><strong>${cap(d.toLocaleDateString('pt-BR',{weekday:'long'}))}</strong><span>${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}</span></div><div class="sig-day-tools"><div class="sig-day-count">${doDia.length} tarefa${doDia.length===1?'':'s'}</div><button class="sig-add-day" type="button" title="Nova tarefa neste dia" data-add-date="${chave}">+</button></div></div><div class="sig-day-body">${doDia.length?doDia.map(t=>{const feito=t.status==='concluida';return `<div class="sig-check-row ${feito?'done':''}" draggable="true" data-task-id="${t.id}"><button class="sig-box" type="button" title="${feito?'Concluída':'Marcar como concluída'}" onclick="${feito?'':'done(\'tarefas\',\''+t.id+'\',\'concluida\')'}">${feito?'✓':''}</button><div class="sig-check-main" onclick="editarTarefa('${t.id}')"><div class="sig-check-title">${esc(t.titulo||'Tarefa')}</div><div class="sig-check-meta">${hora(t.data_prevista)}${t.processo_id?' · '+esc(procNome(t.processo_id)):''}</div><div class="sig-check-tags"><span class="sig-tag-prio ${esc(t.prioridade||'normal')}">${esc(t.prioridade||'normal')}</span></div></div><div class="sig-check-actions"><button type="button" class="secondary" onclick="editarTarefa('${t.id}')">Editar</button></div></div>`;}).join(''):'<div class="sig-empty">Sem tarefas para este dia</div>'}</div></section>`;}).join('')}</div>
      <div class="sig-week-foot"><span>${pct}% da semana concluída</span><div class="sig-progress"><i style="width:${pct}%"></i></div><span>${concl}/${tarefas.length}</span></div>`;
    document.getElementById('sigSemanaAnterior').onclick=()=>{semanaBase.setDate(semanaBase.getDate()-7);renderSemanal();};
    document.getElementById('sigSemanaHoje').onclick=()=>{semanaBase=inicioSemana(new Date());renderSemanal();};
    document.getElementById('sigSemanaProxima').onclick=()=>{semanaBase.setDate(semanaBase.getDate()+7);renderSemanal();};
    wrap.querySelectorAll('[data-add-date]').forEach(b=>b.onclick=()=>abrirNovaNoDia(b.dataset.addDate));
    ativarDnD(wrap);
  }

  const renderAnterior=window.render;if(typeof renderAnterior==='function')window.render=function(){renderAnterior();renderSemanal();};
  let tent=0;const ti=setInterval(()=>{if(typeof D!=='undefined'){renderSemanal();if(++tent>20)clearInterval(ti)}},250);
  document.addEventListener('click',e=>{if(e.target?.closest?.('#menu button[data-p="tarefas"]'))setTimeout(renderSemanal,50)},true);
})();
