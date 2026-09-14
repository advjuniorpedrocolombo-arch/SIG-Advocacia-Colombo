(()=>{
  const CSS=`
  #painel.sig-premium .sig-metrics{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important}
  #painel.sig-premium .sig-metric{min-width:0!important;padding:10px 10px 9px!important;min-height:104px!important}
  #painel.sig-premium .sig-metric-icon{width:34px!important;height:34px!important;font-size:17px!important;border-radius:11px!important}
  #painel.sig-premium .sig-metric-top{gap:7px!important}
  #painel.sig-premium .sig-metric-label{font-size:12px!important;line-height:1.12!important}
  #painel.sig-premium .sig-metric-value{font-size:27px!important;margin:7px 0 2px 41px!important}
  #painel.sig-premium .sig-metric-note{margin-left:41px!important;font-size:9.5px!important}
  #painel.sig-premium .sig-metric.ate{--accent:#c59a3d;--soft:#fff8e7}
  #painel.sig-premium .sig-metric.age{--accent:#4f9fcf;--soft:#eaf6fc}
  @media(max-width:1080px){
    #painel.sig-premium .sig-metrics{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  }
  @media(max-width:760px){
    #painel.sig-premium .sig-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  }
  @media(max-width:520px){
    #painel.sig-premium .sig-metrics{grid-template-columns:1fr!important}
  }
  `;

  function irPara(tela){
    const btn=document.querySelector(`#menu button[data-p="${tela}"]`);
    if(btn)btn.click();
  }

  async function atualizarAtendimentos(){
    const el=document.getElementById('mate');
    if(!el||typeof sb==='undefined')return;
    try{
      const {count,error}=await sb.from('atendimentos').select('id',{count:'exact',head:true}).not('status','in','("contratado","nao_contratado","encerrado")');
      if(!error)el.textContent=count||0;
    }catch(_){ }
  }

  function atualizarAgenda(){
    const el=document.getElementById('magenda');
    if(!el||typeof D==='undefined')return;
    const agora=new Date();
    const total=(D.agenda||[]).filter(x=>x.inicio&&new Date(x.inicio)>=agora).length;
    el.textContent=total;
  }

  function criarCard({id,classe,destino,icone,titulo,valorId,nota,aria}){
    const card=document.createElement('div');
    card.id=id;
    card.className=`sig-metric ${classe}`;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label',aria);
    card.innerHTML=`<div class="sig-metric-top"><div class="sig-metric-icon">${icone}</div><div class="sig-metric-label">${titulo}</div></div><div class="sig-metric-value" id="${valorId}">0</div><div class="sig-metric-note">${nota}</div>`;
    card.addEventListener('click',()=>irPara(destino));
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();irPara(destino)}});
    return card;
  }

  function aplicar(){
    const painel=document.getElementById('painel');
    if(!painel)return;
    let st=document.getElementById('sigPainelAtendimentosCardStyle');
    if(!st){st=document.createElement('style');st.id='sigPainelAtendimentosCardStyle';document.head.appendChild(st)}
    st.textContent=CSS;
    const grade=painel.querySelector('.sig-metrics');
    if(!grade)return;

    if(!document.getElementById('sigCardAtendimentos')&&!grade.querySelector('[data-destino="atendimentos"]')){
      grade.appendChild(criarCard({id:'sigCardAtendimentos',classe:'ate',destino:'atendimentos',icone:'💬',titulo:'Atendimentos',valorId:'mate',nota:'Em acompanhamento',aria:'Abrir Atendimentos'}));
    }

    if(!document.getElementById('sigCardAgenda')&&!grade.querySelector('[data-destino="agenda"]')){
      grade.appendChild(criarCard({id:'sigCardAgenda',classe:'age',destino:'agenda',icone:'📅',titulo:'Agenda',valorId:'magenda',nota:'Próximos eventos',aria:'Abrir Agenda'}));
    }

    atualizarAtendimentos();
    atualizarAgenda();
  }

  let tentativas=0;
  const timer=setInterval(()=>{aplicar();if(++tentativas>120)clearInterval(timer)},200);
  document.addEventListener('click',()=>setTimeout(aplicar,50),true);
})();
