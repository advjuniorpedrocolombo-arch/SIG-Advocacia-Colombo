(()=>{
  const CSS=`
  #painel.sig-premium .sig-metrics{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important}
  #painel.sig-premium .sig-metric{min-width:0!important;padding:11px 12px 10px!important;min-height:108px!important}
  #painel.sig-premium .sig-metric-icon{width:38px!important;height:38px!important;font-size:18px!important}
  #painel.sig-premium .sig-metric-label{font-size:13px!important}
  #painel.sig-premium .sig-metric-value{font-size:29px!important;margin-left:46px!important}
  #painel.sig-premium .sig-metric-note{margin-left:46px!important;font-size:10.5px!important}
  #painel.sig-premium .sig-metric.ate{--accent:#c59a3d;--soft:#fff8e7}
  @media(max-width:930px){#painel.sig-premium .sig-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
  @media(max-width:650px){#painel.sig-premium .sig-metrics{grid-template-columns:1fr!important}}
  `;

  function irParaAtendimentos(){
    const btn=document.querySelector('#menu button[data-p="atendimentos"]');
    if(btn)btn.click();
  }

  async function atualizarNumero(){
    const el=document.getElementById('mate');
    if(!el||typeof sb==='undefined')return;
    try{
      const {count,error}=await sb.from('atendimentos').select('id',{count:'exact',head:true}).not('status','in','("contratado","nao_contratado","encerrado")');
      if(!error)el.textContent=count||0;
    }catch(_){ }
  }

  function aplicar(){
    const painel=document.getElementById('painel');
    if(!painel)return;
    let st=document.getElementById('sigPainelAtendimentosCardStyle');
    if(!st){st=document.createElement('style');st.id='sigPainelAtendimentosCardStyle';document.head.appendChild(st)}
    st.textContent=CSS;
    const grade=painel.querySelector('.sig-metrics');
    if(!grade)return;
    let card=document.getElementById('sigCardAtendimentos');
    if(!card){
      card=document.createElement('div');
      card.id='sigCardAtendimentos';
      card.className='sig-metric ate';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label','Abrir Atendimentos');
      card.innerHTML='<div class="sig-metric-top"><div class="sig-metric-icon">💬</div><div class="sig-metric-label">Atendimentos</div></div><div class="sig-metric-value" id="mate">0</div><div class="sig-metric-note">Em acompanhamento</div>';
      grade.appendChild(card);
      card.addEventListener('click',irParaAtendimentos);
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();irParaAtendimentos()}});
    }
    atualizarNumero();
  }

  let tentativas=0;
  const timer=setInterval(()=>{aplicar();if(++tentativas>120)clearInterval(timer)},200);
  document.addEventListener('click',()=>setTimeout(aplicar,50),true);
})();
