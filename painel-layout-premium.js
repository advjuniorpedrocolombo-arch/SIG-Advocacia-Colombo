(()=>{
  const css=`
  #painel.sig-premium{font-family:Arial,sans-serif;color:#102c55}
  #painel.sig-premium .sig-panel-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:18px;padding:4px 4px 0}
  #painel.sig-premium .sig-panel-kicker{font-size:12px;letter-spacing:2px;color:#7b8aa0;text-transform:uppercase;margin-bottom:4px}
  #painel.sig-premium .sig-panel-title{font-family:Georgia,serif;font-size:38px;line-height:1;margin:0;color:#102c55}
  #painel.sig-premium .sig-panel-date{margin-top:10px;color:#53647b;font-size:14px}
  #painel.sig-premium .sig-panel-brand{text-align:center;flex:1;max-width:640px;padding-top:8px}
  #painel.sig-premium .sig-panel-brand h2{font-family:Georgia,serif;font-size:30px;letter-spacing:1px;margin:0;color:#102c55}
  #painel.sig-premium .sig-gold-line{width:110px;height:2px;background:#c59a3d;margin:12px auto 8px}
  #painel.sig-premium .sig-panel-brand small{letter-spacing:5px;font-size:10px;color:#7890ad;text-transform:uppercase}
  #painel.sig-premium .sig-oab-card{background:#eef4fb;border:1px solid #dce7f4;border-radius:999px;padding:10px 14px;font-weight:700;font-size:12px;white-space:nowrap;color:#173b72}
  #painel.sig-premium .sig-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}
  #painel.sig-premium .sig-metric{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px 20px 16px;min-height:150px;box-shadow:0 8px 24px rgba(16,44,85,.055);overflow:hidden;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
  #painel.sig-premium .sig-metric:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(16,44,85,.11);border-color:#cbd8e8}
  #painel.sig-premium .sig-metric:focus{outline:3px solid rgba(23,59,114,.16);outline-offset:2px}
  #painel.sig-premium .sig-metric::after{content:'';position:absolute;left:0;right:0;bottom:0;height:4px;background:var(--accent,#6aa5e8)}
  #painel.sig-premium .sig-metric-top{display:flex;align-items:center;gap:12px}
  #painel.sig-premium .sig-metric-icon{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;font-size:25px;background:var(--soft,#edf5ff);transition:transform .16s ease}
  #painel.sig-premium .sig-metric:hover .sig-metric-icon{transform:scale(1.06)}
  #painel.sig-premium .sig-metric-label{font-family:Georgia,serif;font-weight:700;font-size:17px;color:#102c55}
  #painel.sig-premium .sig-metric-value{font-family:Georgia,serif;font-weight:700;font-size:46px;line-height:1;margin:12px 0 4px 66px;color:#071b45}
  #painel.sig-premium .sig-metric-note{margin-left:66px;font-size:13px;color:#73849a}
  #painel.sig-premium .sig-metric.proc{--accent:#69b7ff;--soft:#eaf4ff}
  #painel.sig-premium .sig-metric.cli{--accent:#70d0a2;--soft:#eaf9f1}
  #painel.sig-premium .sig-metric.pra{--accent:#f2b45b;--soft:#fff4e5}
  #painel.sig-premium .sig-metric.tar{--accent:#9b7cf0;--soft:#f2edff}
  #painel.sig-premium .sig-upcoming{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:0;overflow:hidden;box-shadow:0 8px 24px rgba(16,44,85,.05)}
  #painel.sig-premium .sig-up-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #e8edf3}
  #painel.sig-premium .sig-up-title{display:flex;align-items:center;gap:12px}
  #painel.sig-premium .sig-up-icon{width:48px;height:48px;border-radius:14px;background:#123e7a;color:white;display:grid;place-items:center;font-size:23px}
  #painel.sig-premium .sig-up-title h3{font-family:Georgia,serif;font-size:27px;margin:0;color:#102c55}
  #painel.sig-premium .sig-up-title p{margin:3px 0 0;color:#6e7f94;font-size:14px}
  #painel.sig-premium .sig-link-agenda{border:1px solid #d9e4f2;background:#f7faff;color:#173b72;border-radius:999px;padding:10px 16px;font-weight:700;cursor:pointer}
  #painel.sig-premium #resumo{padding:6px 22px 12px}
  #painel.sig-premium #resumo p{display:grid;grid-template-columns:86px 80px 130px 1fr;align-items:center;gap:14px;margin:0;padding:12px 8px;border-bottom:1px solid #edf1f5;color:#1d3557;font-size:14px}
  #painel.sig-premium #resumo p:last-child{border-bottom:0}
  #painel.sig-premium #resumo p b{font-family:Georgia,serif;font-size:16px;color:#102c55}
  #painel.sig-premium .sig-jesus{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin:18px 4px 0;color:#7a8798;font-family:Georgia,serif;font-style:italic;font-size:13px}
  #painel.sig-premium .sig-jesus::before{content:'';width:40px;height:1px;background:#c59a3d}
  @media(max-width:1050px){#painel.sig-premium .sig-metrics{grid-template-columns:repeat(2,1fr)}#painel.sig-premium .sig-panel-brand{display:none}}
  @media(max-width:650px){#painel.sig-premium .sig-metrics{grid-template-columns:1fr}#painel.sig-premium .sig-panel-title{font-size:30px}#painel.sig-premium .sig-oab-card{display:none}#painel.sig-premium #resumo p{grid-template-columns:1fr;gap:4px}#painel.sig-premium .sig-up-head{align-items:flex-start;gap:10px}.sig-link-agenda{display:none}}
  `;

  function diaSemana(data){
    try{return new Date(data).toLocaleDateString('pt-BR',{weekday:'long'})}catch(_){return ''}
  }
  function dataCurta(data){
    try{return new Date(data).toLocaleDateString('pt-BR')}catch(_){return ''}
  }
  function horaCurta(data){
    try{return new Date(data).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(_){return ''}
  }
  function irPara(tela){
    const btn=document.querySelector(`#menu button[data-p="${tela}"]`);
    if(btn)btn.click();
  }

  function montar(){
    const p=document.getElementById('painel');
    if(!p||p.dataset.premium==='1')return;
    p.dataset.premium='1';p.classList.add('sig-premium');
    if(!document.getElementById('sigPainelPremiumStyle')){
      const s=document.createElement('style');s.id='sigPainelPremiumStyle';s.textContent=css;document.head.appendChild(s);
    }
    p.innerHTML=`
      <div class="sig-panel-hero">
        <div>
          <div class="sig-panel-kicker">Painel</div>
          <h1 class="sig-panel-title">Painel</h1>
          <div class="sig-panel-date" id="sigPainelData"></div>
        </div>
        <div class="sig-panel-brand"><h2>SIG - ADVOCACIA COLOMBO</h2><div class="sig-gold-line"></div><small>Gestão jurídica com propósito</small></div>
        <div class="sig-oab-card">⚖ OAB/SP 510.497</div>
      </div>
      <div class="sig-metrics">
        <div class="sig-metric proc" data-destino="processos" role="button" tabindex="0" aria-label="Abrir Processos"><div class="sig-metric-top"><div class="sig-metric-icon">📁</div><div class="sig-metric-label">Processos ativos</div></div><div class="sig-metric-value" id="mproc">0</div><div class="sig-metric-note">Em andamento</div></div>
        <div class="sig-metric cli" data-destino="clientes" role="button" tabindex="0" aria-label="Abrir Clientes"><div class="sig-metric-top"><div class="sig-metric-icon">👥</div><div class="sig-metric-label">Clientes ativos</div></div><div class="sig-metric-value" id="mcli">0</div><div class="sig-metric-note">Carteira de clientes</div></div>
        <div class="sig-metric pra" data-destino="prazos" role="button" tabindex="0" aria-label="Abrir Prazos"><div class="sig-metric-top"><div class="sig-metric-icon">🗓</div><div class="sig-metric-label">Prazos pendentes</div></div><div class="sig-metric-value" id="mpra">0</div><div class="sig-metric-note">A vencer</div></div>
        <div class="sig-metric tar" data-destino="tarefas" role="button" tabindex="0" aria-label="Abrir Tarefas"><div class="sig-metric-top"><div class="sig-metric-icon">☑</div><div class="sig-metric-label">Tarefas pendentes</div></div><div class="sig-metric-value" id="mtar">0</div><div class="sig-metric-note">Suas atividades</div></div>
      </div>
      <div class="sig-upcoming">
        <div class="sig-up-head"><div class="sig-up-title"><div class="sig-up-icon">▣</div><div><h3>Próximos compromissos</h3><p>Seus próximos eventos e audiências</p></div></div><button class="sig-link-agenda" type="button" id="sigIrAgenda">Ver agenda completa →</button></div>
        <div id="resumo"></div>
      </div>
      <div class="sig-jesus">“Eu sou o caminho, a verdade e a vida.” — Jesus.</div>`;
    const d=document.getElementById('sigPainelData');if(d)d.textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    const b=document.getElementById('sigIrAgenda');if(b)b.onclick=()=>irPara('agenda');
    p.querySelectorAll('.sig-metric[data-destino]').forEach(card=>{
      card.addEventListener('click',()=>irPara(card.dataset.destino));
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();irPara(card.dataset.destino)}});
    });
  }

  function aprimorarResumo(){
    const box=document.getElementById('resumo');
    if(!box||typeof D==='undefined')return;
    const futuros=(D.agenda||[]).filter(x=>x.inicio&&new Date(x.inicio)>=new Date()).sort((a,b)=>new Date(a.inicio)-new Date(b.inicio)).slice(0,5);
    box.innerHTML=futuros.map(x=>`<p><b>${dataCurta(x.inicio)}</b><span>${horaCurta(x.inicio)}</span><strong>${diaSemana(x.inicio)}</strong><span>${esc(x.titulo||'Compromisso')}</span></p>`).join('')||'<p><span>Nenhum compromisso futuro.</span></p>';
  }

  function atualizarNumeros(){
    if(typeof D==='undefined')return;
    const a=document.getElementById('mproc'),b=document.getElementById('mcli'),c=document.getElementById('mpra'),d=document.getElementById('mtar');
    if(a)a.textContent=(D.processos||[]).filter(x=>x.status==='ativo').length;
    if(b)b.textContent=(D.clientes||[]).filter(x=>x.ativo!==false).length;
    if(c)c.textContent=(D.prazos||[]).filter(x=>['pendente','em_andamento'].includes(x.status)).length;
    if(d)d.textContent=(D.tarefas||[]).filter(x=>['pendente','em_andamento'].includes(x.status)).length;
  }

  function aplicar(){montar();atualizarNumeros();aprimorarResumo();}
  let n=0;const t=setInterval(()=>{aplicar();if(++n>100)clearInterval(t)},180);
  document.addEventListener('click',()=>setTimeout(aplicar,30),true);
})();
