(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||typeof D==='undefined'||typeof U==='undefined'||typeof load!=='function'){
      setTimeout(esperar,180);return;
    }

    function norm(v){return String(v||'').replace(/\D/g,'')}
    function fmt(n){n=norm(n);return n.replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,'$1-$2.$3.$4.$5.$6')}
    function tribunalTrabalhista(n){
      n=norm(n);if(n.length!==20||n[13]!=='5')return null;
      return 'TRT'+Number(n.slice(14,16));
    }
    function varaCodigo(n){n=norm(n);return n.length===20?n.slice(-4):null}
    function extrairNumeros(txt){
      const texto=String(txt||'').replace(/\u00a0/g,' ');
      const candidatos=[];
      const padroes=[
        /\d{7}-\d{2}\.\d{4}\.5\.\d{2}\.\d{4}/g,
        /\d{20}/g
      ];
      for(const re of padroes){
        for(const m of texto.matchAll(re)){
          const n=norm(m[0]);
          if(n.length===20&&n[13]==='5')candidatos.push(n);
        }
      }
      for(const linha of texto.split(/[\r\n;,]+/)){
        const n=norm(linha);
        if(n.length===20&&n[13]==='5')candidatos.push(n);
      }
      return [...new Set(candidatos)];
    }
    function existentes(){return new Set((D.processos||[]).map(p=>norm(p.numero_cnj)).filter(Boolean))}

    function garantirModal(){
      if(document.getElementById('mImportarTrabalhistasSIG'))return;
      const modal=document.createElement('div');
      modal.id='mImportarTrabalhistasSIG';
      modal.className='modal hidden';
      modal.innerHTML=`<div class="card" style="width:min(900px,100%);max-height:92vh;overflow:auto">
        <h3 style="margin-top:0">Importar processos trabalhistas</h3>
        <p class="small">Cole os números CNJ dos processos trabalhistas. O SIG identifica o TRT, elimina duplicidades e permite importar em lote.</p>
        <div class="formgrid">
          <div><label>OAB</label><input id="impTrabOab" value="510497" readonly style="background:#f2f4f7"></div>
          <div><label>UF</label><input id="impTrabUf" value="SP" readonly style="background:#f2f4f7"></div>
          <div><label>Tribunal para consulta</label><select id="impTrabTribunal"><option value="TRT15">TRT-15</option><option value="TRT2">TRT-2</option></select></div>
          <div style="display:flex;align-items:end"><button type="button" class="secondary" id="impTrabAbrirConsulta" style="width:100%;margin-bottom:12px">Abrir consulta por OAB ↗</button></div>
        </div>
        <label>Números dos processos trabalhistas</label>
        <textarea id="impTrabLista" rows="8" placeholder="Cole aqui um ou vários números CNJ, um por linha.\nEx.: 1000151-46.2025.5.02.0242"></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <button type="button" class="secondary" id="impTrabPrever">Gerar prévia</button>
          <button type="button" class="secondary" id="impTrabSelecionarTodos">Selecionar todos</button>
          <button type="button" class="secondary" id="impTrabDesmarcarTodos">Desmarcar todos</button>
        </div>
        <div id="impTrabResumo" class="small" style="margin-bottom:8px"></div>
        <div class="table" style="max-height:330px;overflow:auto">
          <table style="min-width:720px"><thead><tr><th></th><th>Processo</th><th>Tribunal</th><th>Vara</th><th>Situação</th></tr></thead><tbody id="impTrabPreview"></tbody></table>
        </div>
        <div class="actions">
          <button type="button" class="secondary" id="impTrabCancelar">Cancelar</button>
          <button type="button" class="primary" id="impTrabImportar">Importar processos</button>
        </div>
      </div>`;
      document.body.appendChild(modal);

      document.getElementById('impTrabCancelar').onclick=()=>modal.classList.add('hidden');
      document.getElementById('impTrabAbrirConsulta').onclick=()=>{
        const t=document.getElementById('impTrabTribunal').value;
        const url=t==='TRT15'?'https://trt15.jus.br/servicos/numero-da-oab':'https://pje.trt2.jus.br/consultaprocessual/';
        window.open(url,'_blank','noopener');
      };
      document.getElementById('impTrabPrever').onclick=renderPreview;
      document.getElementById('impTrabLista').oninput=()=>{document.getElementById('impTrabResumo').textContent='';};
      document.getElementById('impTrabSelecionarTodos').onclick=()=>document.querySelectorAll('#impTrabPreview input[type=checkbox]:not(:disabled)').forEach(x=>x.checked=true);
      document.getElementById('impTrabDesmarcarTodos').onclick=()=>document.querySelectorAll('#impTrabPreview input[type=checkbox]').forEach(x=>x.checked=false);
      document.getElementById('impTrabImportar').onclick=importarSelecionados;
    }

    function renderPreview(){
      const nums=extrairNumeros(document.getElementById('impTrabLista').value);
      const ex=existentes();
      const tb=document.getElementById('impTrabPreview');
      if(!nums.length){tb.innerHTML='';document.getElementById('impTrabResumo').textContent='Nenhum número CNJ trabalhista válido identificado.';return [];}
      tb.innerHTML=nums.map(n=>{
        const trib=tribunalTrabalhista(n)||'—',dup=ex.has(n),vara=varaCodigo(n)||'—';
        return `<tr><td><input type="checkbox" class="impTrabCk" value="${n}" ${dup?'disabled':'checked'}></td><td>${fmt(n)}</td><td>${trib}</td><td>${vara}</td><td>${dup?'<span class="tag warn">Já cadastrado</span>':'<span class="tag ok">Novo</span>'}</td></tr>`;
      }).join('');
      const novos=nums.filter(n=>!ex.has(n)).length;
      document.getElementById('impTrabResumo').textContent=`${nums.length} processo(s) trabalhista(s) identificado(s) — ${novos} novo(s) e ${nums.length-novos} já cadastrado(s).`;
      return nums;
    }

    async function importarSelecionados(){
      let nums=extrairNumeros(document.getElementById('impTrabLista').value);
      if(!nums.length){alert('Nenhum número CNJ trabalhista válido foi identificado no campo.');return;}
      const ex=existentes();
      let selecionados=[...document.querySelectorAll('#impTrabPreview .impTrabCk:checked')].map(x=>x.value);
      if(!selecionados.length){
        selecionados=nums.filter(n=>!ex.has(n));
      }
      selecionados=[...new Set(selecionados)].filter(n=>!ex.has(n)&&tribunalTrabalhista(n));
      if(!selecionados.length){alert('Todos os processos informados já estão cadastrados ou não são processos trabalhistas válidos.');return;}

      const btn=document.getElementById('impTrabImportar');
      const antigo=btn.textContent;btn.disabled=true;btn.textContent='Importando...';
      try{
        const rows=selecionados.map(n=>({
          user_id:U.id,
          numero_cnj:fmt(n),
          titulo:'Processo '+fmt(n),
          tribunal:tribunalTrabalhista(n),
          area:'Trabalhista',
          status:'ativo',
          monitorar_datajud:true
        }));
        const {data:inseridos,error}=await sb.from('processos').insert(rows).select('id,numero_cnj,tribunal');
        if(error)throw error;
        await load();
        document.getElementById('mImportarTrabalhistasSIG').classList.add('hidden');
        alert(`Importação concluída.\n\n${rows.length} processo(s) trabalhista(s) importado(s) com sucesso.\n\nUse “Atualizar todos” para buscar as movimentações no DataJud.`);
      }catch(e){
        alert('Não foi possível importar os processos trabalhistas: '+(e?.message||e));
      }finally{
        btn.disabled=false;btn.textContent=antigo;
      }
    }

    window.abrirImportadorTrabalhistaSIG=function(){
      garantirModal();
      document.getElementById('impTrabLista').value='';
      document.getElementById('impTrabPreview').innerHTML='';
      document.getElementById('impTrabResumo').textContent='';
      document.getElementById('mImportarTrabalhistasSIG').classList.remove('hidden');
    };

    function inserirBotao(){
      const sec=document.getElementById('processos');if(!sec)return;
      const toolbar=sec.querySelector('.toolbar');if(!toolbar)return;
      let actions=toolbar.lastElementChild;
      if(!actions||actions===toolbar.firstElementChild)return;
      if(document.getElementById('btnImportarTrabalhistasSIG'))return;
      const b=document.createElement('button');
      b.type='button';b.className='secondary';b.id='btnImportarTrabalhistasSIG';b.textContent='Importar trabalhistas';b.onclick=abrirImportadorTrabalhistaSIG;
      actions.insertBefore(b,actions.firstChild);
    }

    garantirModal();
    inserirBotao();
    const obs=new MutationObserver(()=>inserirBotao());
    obs.observe(document.body,{childList:true,subtree:true});
  };
  esperar();
})();
