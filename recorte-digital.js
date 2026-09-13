(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||typeof D==='undefined'||!document.getElementById('menu')){setTimeout(esperar,180);return;}

    function escRD(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))}
    function fmtData(v){if(!v)return '—';const d=new Date(v+'T12:00:00');return d.toLocaleDateString('pt-BR')}
    function processoTitulo(id,cnj){const p=(D.processos||[]).find(x=>x.id===id);return p?.titulo||cnj||'Não vinculado'}

    function garantirTela(){
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
          <div class="toolbar">
            <div><h3 style="margin-bottom:4px">Recorte Digital / Publicações</h3><div class="small">Publicações recebidas no Recorte Digital OAB/SP e vinculadas aos processos do SIG pelo número CNJ.</div></div>
            <div><button type="button" class="secondary" id="btnAtualizarRecortes">Atualizar lista</button></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
            <div class="card"><div class="small">Não analisadas</div><b id="rdNovas" style="font-size:24px">0</b></div>
            <div class="card"><div class="small">Total de publicações</div><b id="rdTotal" style="font-size:24px">0</b></div>
            <div class="card"><div class="small">Sem processo vinculado</div><b id="rdSemVinculo" style="font-size:24px">0</b></div>
          </div>
          <div class="table"><table style="min-width:1250px"><thead><tr><th>Publicação</th><th>Processo</th><th>Tipo</th><th>Vara/Local</th><th>Resumo</th><th>Status</th><th>Ações</th></tr></thead><tbody id="tbRecortes"></tbody></table></div>
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
      const tb=document.getElementById('tbRecortes');if(!tb)return;
      tb.innerHTML='<tr><td colspan="7">Carregando publicações...</td></tr>';
      const {data,error}=await sb.from('publicacoes_recorte').select('*').order('data_publicacao',{ascending:false}).order('criado_em',{ascending:false});
      if(error){tb.innerHTML=`<tr><td colspan="7">Erro ao carregar: ${escRD(error.message)}</td></tr>`;return;}
      const rec=data||[];window.__recortesSIG=rec;
      const nao=rec.filter(x=>!x.analisada).length, sem=rec.filter(x=>!x.processo_id).length;
      document.getElementById('rdNovas').textContent=nao;
      document.getElementById('rdTotal').textContent=rec.length;
      document.getElementById('rdSemVinculo').textContent=sem;
      tb.innerHTML=rec.map(r=>{
        const status=r.analisada?'<span class="tag ok">Analisada</span>':'<span class="tag warn">Nova</span>';
        const btnAnalisar=r.analisada?'':`<button type="button" class="secondary" onclick="marcarRecorteAnalisado('${r.id}')">Analisar</button>`;
        const btnProc=r.processo_id?`<button type="button" class="secondary" style="margin-left:6px" onclick="abrirProcessoDoRecorte('${r.processo_id}')">Tribunal ↗</button>`:'';
        const resumo=String(r.texto||'').length>180?String(r.texto||'').slice(0,180)+'…':String(r.texto||'');
        return `<tr><td style="white-space:nowrap"><b>${fmtData(r.data_publicacao)}</b><br><span class="small">Disponib.: ${fmtData(r.data_disponibilizacao)}</span></td><td>${escRD(processoTitulo(r.processo_id,r.numero_cnj))}<br><span class="small">${escRD(r.numero_cnj||'')}</span></td><td>${escRD(r.tipo_publicacao||'Publicação')}</td><td>${escRD(r.vara||r.local_publicacao||'—')}</td><td>${escRD(resumo||'—')}</td><td>${status}</td><td style="white-space:nowrap"><button type="button" class="secondary" onclick="verRecorteDigital('${r.id}')">Ver texto</button> ${btnAnalisar}${btnProc}</td></tr>`;
      }).join('')||'<tr><td colspan="7">Nenhuma publicação importada.</td></tr>';
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
