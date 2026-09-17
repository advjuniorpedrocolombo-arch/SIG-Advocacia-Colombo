(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||typeof D==='undefined'||!document.getElementById('menu')){setTimeout(esperar,180);return;}

    function escRD(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
    function fmtData(v){if(!v)return '—';const d=new Date(v+'T12:00:00');return d.toLocaleDateString('pt-BR')}
    function processoTitulo(id,cnj){const p=(D.processos||[]).find(x=>x.id===id);return p?.titulo||cnj||'Não vinculado'}

    const css=`
      #recorte{min-width:0;overflow-x:hidden}
      #recorte .rd-hero{display:flex;justify-content:space-between;align-items:center;gap:16px;background:linear-gradient(135deg,#102c55,#173b72);color:#fff;border-radius:20px;padding:18px 20px;margin:4px 0 14px;box-shadow:0 10px 28px rgba(16,44,85,.14)}
      #recorte .rd-hero h3{margin:0 0 4px;font-family:Georgia,serif;font-size:24px}
      #recorte .rd-hero p{margin:0;color:#d8e4f3;font-size:12px;line-height:1.45;max-width:760px}
      #recorte .rd-hero button{background:#fff;color:#173b72;border:0;border-radius:10px;padding:9px 12px;font-weight:700;white-space:nowrap}
      #recorte .rd-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}
      #recorte .rd-stat{background:#fff;border:1px solid #e1e8f0;border-radius:15px;padding:12px 14px;box-shadow:0 4px 14px rgba(16,44,85,.04)}
      #recorte .rd-stat .small{font-size:10px;color:#718398;text-transform:uppercase;letter-spacing:.35px}
      #recorte .rd-stat b{display:block;font-size:26px;color:#102c55;margin-top:3px}
      #recorte .rd-list{display:grid;gap:10px;min-width:0}
      #recorte .rd-card{background:#fff;border:1px solid #e1e8f0;border-radius:16px;padding:13px 14px;box-shadow:0 4px 16px rgba(16,44,85,.04);min-width:0}
      #recorte .rd-card.nova{border-left:4px solid #c88a1c}
      #recorte .rd-card.analisada{border-left:4px solid #1d7a55}
      #recorte .rd-card-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:9px;min-width:0}
      #recorte .rd-date{font-size:12px;color:#6c7d91;white-space:nowrap}
      #recorte .rd-date b{display:block;font-size:15px;color:#102c55}
      #recorte .rd-title{min-width:0;flex:1}
      #recorte .rd-title strong{display:block;font-size:13px;color:#172033;overflow-wrap:anywhere}
      #recorte .rd-cnj{font-size:10px;color:#75869a;margin-top:2px;overflow-wrap:anywhere}
      #recorte .rd-meta{display:grid;grid-template-columns:minmax(120px,.7fr) minmax(160px,1fr);gap:8px 14px;margin-bottom:9px}
      #recorte .rd-meta-item{min-width:0}
      #recorte .rd-meta-label{font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:#8b99aa;margin-bottom:2px}
      #recorte .rd-meta-value{font-size:11px;color:#354357;overflow-wrap:anywhere}
      #recorte .rd-resumo{font-size:11px;color:#4b5a6c;line-height:1.48;background:#f8fbff;border-radius:10px;padding:9px 10px;margin-bottom:10px;overflow-wrap:anywhere}
      #recorte .rd-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
      #recorte .rd-actions button{padding:6px 8px;border-radius:8px;font-size:10px}
      #recorte .rd-status{margin-left:auto}
      #recorte .rd-empty{background:#fff;border:1px dashed #ccd7e4;border-radius:14px;padding:24px;text-align:center;color:#8492a4}
      @media(max-width:850px){#recorte .rd-hero{align-items:flex-start;flex-direction:column}#recorte .rd-stats{grid-template-columns:1fr 1fr}#recorte .rd-meta{grid-template-columns:1fr}}
      @media(max-width:520px){#recorte .rd-stats{grid-template-columns:1fr}#recorte .rd-card-top{flex-direction:column}#recorte .rd-status{margin-left:0}.main{min-width:0}}
    `;

    function garantirEstilo(){
      let st=document.getElementById('recorteDigitalStyle');
      if(!st){st=document.createElement('style');st.id='recorteDigitalStyle';document.head.appendChild(st);}
      st.textContent=css;
    }

    function garantirTela(){
      garantirEstilo();
      const menu=document.getElementById('menu');
      if(!document.getElementById('menuRecorteDigital')){
        const b=document.createElement('button');
        b.id='menuRecorteDigital';b.dataset.p='recorte';b.textContent='Recorte Digital';
        menu.appendChild(b);
        b.onclick=()=>{
          document.querySelectorAll('.pg').forEach(p=>p.classList.add('hidden'));
          document.getElementById('recorte')?.classList.remove('hidden');
          document.querySelectorAll('#menu button').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          const t=document.getElementById('titulo');if(t)t.textContent='Recorte Digital / Publicações';
          carregarRecortes();
        };
      }
      if(!document.getElementById('recorte')){
        const main=document.querySelector('main.main');
        const sec=document.createElement('section');
        sec.id='recorte';sec.className='pg hidden';
        sec.innerHTML=`
          <div class="rd-hero">
            <div><h3>Recorte Digital / Publicações</h3><p>Publicações recebidas no Recorte Digital OAB/SP e vinculadas aos processos do SIG pelo número CNJ.</p></div>
            <button type="button" id="btnAtualizarRecortes">Atualizar lista</button>
          </div>
          <div class="rd-stats">
            <div class="rd-stat"><div class="small">Não analisadas</div><b id="rdNovas">0</b></div>
            <div class="rd-stat"><div class="small">Total de publicações</div><b id="rdTotal">0</b></div>
            <div class="rd-stat"><div class="small">Sem processo vinculado</div><b id="rdSemVinculo">0</b></div>
          </div>
          <div id="rdLista" class="rd-list"></div>
        `;
        main.appendChild(sec);
        document.getElementById('btnAtualizarRecortes').onclick=carregarRecortes;
      }
    }

    window.verRecorteDigital=function(id){
      const r=(window.__recortesSIG||[]).find(x=>x.id===id);if(!r)return;
      alert(`RECORTE DIGITAL OAB/SP\n\nProcesso: ${r.numero_cnj||'Não identificado'}\nData de disponibilização: ${fmtData(r.data_disponibilizacao)}\nData de publicação: ${fmtData(r.data_publicacao)}\nTipo: ${r.tipo_publicacao||'Publicação'}\nVara/Local: ${r.vara||r.local_publicacao||'—'}\n\n${r.texto||''}`);
    };

    window.marcarRecorteAnalisado=async function(id){
      const {error}=await sb.from('publicacoes_recorte').update({analisada:true,lida:true}).eq('id',id);
      if(error){alert('Não foi possível marcar como analisada: '+error.message);return;}
      carregarRecortes();
    };

    window.abrirProcessoDoRecorte=function(processoId){
      if(!processoId){alert('Esta publicação ainda não está vinculada a um processo do SIG.');return;}
      if(typeof abrirProcessoTribunal==='function')abrirProcessoTribunal(processoId);
      else alert('Atalho do tribunal indisponível nesta tela.');
    };

    async function carregarRecortes(){
      garantirTela();
      const lista=document.getElementById('rdLista');if(!lista)return;
      lista.innerHTML='<div class="rd-empty">Carregando publicações...</div>';
      const {data,error}=await sb.from('publicacoes_recorte').select('*').order('data_publicacao',{ascending:false}).order('criado_em',{ascending:false});
      if(error){lista.innerHTML=`<div class="rd-empty">Erro ao carregar: ${escRD(error.message)}</div>`;return;}
      const rec=data||[];window.__recortesSIG=rec;
      const nao=rec.filter(x=>!x.analisada).length, sem=rec.filter(x=>!x.processo_id).length;
      document.getElementById('rdNovas').textContent=nao;
      document.getElementById('rdTotal').textContent=rec.length;
      document.getElementById('rdSemVinculo').textContent=sem;
      lista.innerHTML=rec.map(r=>{
        const status=r.analisada?'<span class="tag ok">Analisada</span>':'<span class="tag warn">Nova</span>';
        const btnAnalisar=r.analisada?'':`<button type="button" class="secondary" onclick="marcarRecorteAnalisado('${r.id}')">Marcar analisada</button>`;
        const btnProc=r.processo_id?`<button type="button" class="secondary" onclick="abrirProcessoDoRecorte('${r.processo_id}')">Tribunal ↗</button>`:'';
        const resumo=String(r.texto||'').length>320?String(r.texto||'').slice(0,320)+'…':String(r.texto||'');
        return `<article class="rd-card ${r.analisada?'analisada':'nova'}">
          <div class="rd-card-top">
            <div class="rd-date"><b>${fmtData(r.data_publicacao)}</b><span>Disponib.: ${fmtData(r.data_disponibilizacao)}</span></div>
            <div class="rd-title"><strong>${escRD(processoTitulo(r.processo_id,r.numero_cnj))}</strong><div class="rd-cnj">${escRD(r.numero_cnj||'Sem número CNJ identificado')}</div></div>
            <div class="rd-status">${status}</div>
          </div>
          <div class="rd-meta">
            <div class="rd-meta-item"><div class="rd-meta-label">Tipo</div><div class="rd-meta-value">${escRD(r.tipo_publicacao||'Publicação')}</div></div>
            <div class="rd-meta-item"><div class="rd-meta-label">Vara / Local</div><div class="rd-meta-value">${escRD(r.vara||r.local_publicacao||'—')}</div></div>
          </div>
          <div class="rd-resumo">${escRD(resumo||'Sem resumo disponível.')}</div>
          <div class="rd-actions"><button type="button" class="secondary" onclick="verRecorteDigital('${r.id}')">Ver texto completo</button>${btnAnalisar}${btnProc}</div>
        </article>`;
      }).join('')||'<div class="rd-empty">Nenhuma publicação importada.</div>';
    }

    garantirTela();
    if(!document.getElementById('sigMovimentacoesProcessoLink')){
      const s=document.createElement('script');
      s.id='sigMovimentacoesProcessoLink';
      s.src='movimentacoes-processo-link.js?v=20260913-1435';
      document.head.appendChild(s);
    }
  };
  esperar();
})();
