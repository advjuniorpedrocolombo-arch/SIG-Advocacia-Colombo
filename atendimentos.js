(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||typeof D==='undefined'||!document.getElementById('menu')){setTimeout(esperar,180);return;}

    let lista=[];
    let editandoId=null;

    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const usuarioAtual=()=>typeof U!=='undefined'?U:window.U;
    const fmt=v=>{if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});};
    const paraLocal=v=>{if(!v)return '';const d=new Date(v);if(Number.isNaN(d.getTime()))return '';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;};
    const statusLabel=s=>({novo_contato:'Novo contato',em_analise:'Em análise',aguardando_documentos:'Aguardando documentos',aguardando_cliente:'Aguardando cliente',proposta_enviada:'Proposta enviada',contratado:'Contratado',nao_contratado:'Não contratado',encerrado:'Encerrado'}[s]||s||'—');
    const urgLabel=s=>({baixa:'Baixa',normal:'Normal',alta:'Alta',urgente:'Urgente'}[s]||s||'Normal');

    const css=`
    #atendimentos{min-width:0;overflow-x:hidden}
    #atendimentos .at-hero{display:flex;justify-content:space-between;align-items:center;gap:18px;background:linear-gradient(135deg,#102c55 0%,#173b72 70%,#204d8d 100%);color:#fff;padding:20px;border-radius:20px;margin-bottom:14px;box-shadow:0 12px 30px rgba(16,44,85,.14);border:1px solid rgba(255,255,255,.08)}
    #atendimentos .at-hero h2{margin:0;font-family:Georgia,serif;font-size:27px;letter-spacing:-.2px}
    #atendimentos .at-hero p{margin:5px 0 0;color:#dbe7f5;font-size:12px;max-width:720px;line-height:1.5}
    #atendimentos .at-new{background:#fff;color:#173b72;font-weight:800;white-space:nowrap;border:0;box-shadow:0 4px 14px rgba(0,0,0,.08)}
    #atendimentos .at-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
    #atendimentos .at-stat{position:relative;overflow:hidden;background:#fff;border:1px solid #e1e8f0;border-radius:15px;padding:13px 14px;box-shadow:0 4px 14px rgba(16,44,85,.045)}
    #atendimentos .at-stat:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:#c9a227}
    #atendimentos .at-stat b{display:block;font-size:23px;color:#102c55;line-height:1.1}.at-stat span{font-size:10px;color:#718198}
    #atendimentos .at-tools{display:grid;grid-template-columns:minmax(220px,1fr) 220px 190px auto;gap:8px;margin-bottom:12px;background:#fff;border:1px solid #e1e8f0;padding:10px;border-radius:14px;box-shadow:0 3px 12px rgba(16,44,85,.035)}
    #atendimentos .at-tools input,#atendimentos .at-tools select{margin:0;width:100%;min-width:0}
    #atendimentos .at-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    #atendimentos .at-card{background:#fff;border:1px solid #e1e8f0;border-radius:17px;padding:14px 15px;box-shadow:0 5px 16px rgba(16,44,85,.05);min-width:0;transition:.15s ease}
    #atendimentos .at-card:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(16,44,85,.08)}
    #atendimentos .at-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
    #atendimentos .at-name{font-family:Georgia,serif;font-size:19px;font-weight:700;color:#102c55;overflow-wrap:anywhere}
    #atendimentos .at-meta{font-size:10px;color:#6f8196;margin-top:3px;overflow-wrap:anywhere}
    #atendimentos .at-badges{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
    #atendimentos .at-badge{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.15px;padding:4px 7px;border-radius:999px;background:#eef3fb;color:#173b72}
    #atendimentos .at-badge.urgente{background:#fee4e2;color:#b42318}.at-badge.alta{background:#fff1dc;color:#b54708}.at-badge.baixa{background:#eef6ee;color:#4f7357}.at-badge.contratado{background:#eaf7ee;color:#287a45}.at-badge.nao_contratado,.at-badge.encerrado{background:#f1f3f5;color:#667085}.at-badge.novo_contato{background:#eaf3ff;color:#245f9e}.at-badge.proposta_enviada{background:#fff7dc;color:#8f6a00}
    #atendimentos .at-area{font-size:10px;font-weight:800;color:#94751d;background:#fff9e7;padding:4px 7px;border-radius:999px;white-space:nowrap}
    #atendimentos .at-resumo{font-size:12px;line-height:1.5;color:#27364a;background:#f8fafc;border:1px solid #edf1f5;border-radius:11px;padding:10px;overflow-wrap:anywhere;min-height:56px}
    #atendimentos .at-follow{margin-top:9px;font-size:11px;color:#607188}.at-follow strong{color:#102c55}
    #atendimentos .at-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px;padding-top:10px;border-top:1px solid #edf1f5}.at-actions button{font-size:10px;padding:6px 8px}
    #atendimentos .at-empty{grid-column:1/-1;background:#fff;border:1px dashed #cfd9e6;border-radius:16px;padding:34px;text-align:center;color:#74869b}
    #atModal{position:fixed;inset:0;background:rgba(5,18,38,.62);z-index:9999;display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(2px)}
    #atModal.show{display:flex}
    #atModal .at-modal-card{background:#fff;width:min(900px,96vw);max-height:92vh;overflow:auto;border-radius:20px;box-shadow:0 28px 70px rgba(0,0,0,.28);padding:0}
    #atModal .at-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:17px 18px;background:linear-gradient(135deg,#102c55,#173b72);color:#fff}.at-modal-head h3{margin:0;font-family:Georgia,serif;font-size:22px}.at-modal-head button{background:#fff;color:#173b72;border:0;padding:6px 10px}
    #atModal form{padding:18px}
    #atModal .at-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.at-form-grid .full{grid-column:1/-1}
    #atModal label{display:block;font-size:10px;font-weight:800;color:#5f7187;margin-bottom:4px;text-transform:uppercase;letter-spacing:.15px}#atModal input,#atModal select,#atModal textarea{width:100%;margin:0}#atModal textarea{min-height:92px;resize:vertical}
    #atModal .at-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px;padding-top:12px;border-top:1px solid #edf1f5;flex-wrap:wrap}
    @media(max-width:920px){#atendimentos .at-stats{grid-template-columns:1fr 1fr}#atendimentos .at-tools{grid-template-columns:1fr 1fr}#atendimentos .at-list{grid-template-columns:1fr}}
    @media(max-width:620px){#atendimentos .at-hero{align-items:flex-start;flex-direction:column}#atendimentos .at-stats,#atendimentos .at-tools{grid-template-columns:1fr}#atModal .at-form-grid{grid-template-columns:1fr}.at-form-grid .full{grid-column:auto}}
    `;

    function garantirTela(){
      if(!document.getElementById('atStyle')){const st=document.createElement('style');st.id='atStyle';st.textContent=css;document.head.appendChild(st);}
      const menu=document.getElementById('menu');
      let btn=document.getElementById('menuAtendimentos');
      if(!btn){btn=document.createElement('button');btn.id='menuAtendimentos';btn.dataset.p='atendimentos';btn.textContent='Atendimentos';menu.appendChild(btn);btn.addEventListener('click',()=>abrirModulo(btn),true);}
      if(!document.getElementById('atendimentos')){
        const sec=document.createElement('section');sec.id='atendimentos';sec.className='pg hidden';
        sec.innerHTML=`<div class="at-hero"><div><h2>Atendimentos Jurídicos</h2><p>Triagem e acompanhamento dos contatos iniciais de clientes antes da contratação ou abertura de processo.</p></div><button type="button" class="at-new" id="btnNovoAtendimento">+ Novo atendimento</button></div><div class="at-stats"><div class="at-stat"><b id="atNovos">0</b><span>Novos contatos</span></div><div class="at-stat"><b id="atAnalise">0</b><span>Em análise</span></div><div class="at-stat"><b id="atAguardando">0</b><span>Aguardando retorno</span></div><div class="at-stat"><b id="atContratados">0</b><span>Contratados</span></div></div><div class="at-tools"><input id="atBusca" type="search" placeholder="Buscar por nome, telefone ou problema"><select id="atFiltroStatus"><option value="">Todos os status</option><option value="novo_contato">Novo contato</option><option value="em_analise">Em análise</option><option value="aguardando_documentos">Aguardando documentos</option><option value="aguardando_cliente">Aguardando cliente</option><option value="proposta_enviada">Proposta enviada</option><option value="contratado">Contratado</option><option value="nao_contratado">Não contratado</option><option value="encerrado">Encerrado</option></select><select id="atFiltroArea"><option value="">Todas as áreas</option><option>Família</option><option>Cível/Consumidor</option><option>Trabalhista</option><option>Penal</option><option>Previdenciário</option><option>Sucessões</option><option>Tributário</option><option>Outra</option></select><button type="button" class="secondary" id="atAtualizar">Atualizar</button></div><div class="at-list" id="atLista"></div>`;
        document.querySelector('main.main')?.appendChild(sec);
      }
      if(!document.getElementById('atModal')){
        const modal=document.createElement('div');modal.id='atModal';modal.innerHTML=`<div class="at-modal-card"><div class="at-modal-head"><h3 id="atModalTitulo">Novo atendimento</h3><button type="button" id="atFechar">Fechar</button></div><form id="atForm"><div class="at-form-grid"><div><label>Nome do contato *</label><input name="nome_contato" required></div><div><label>Telefone / WhatsApp</label><input name="telefone" placeholder="(15) 99999-9999"></div><div><label>E-mail</label><input name="email" type="email"></div><div><label>Área jurídica</label><select name="area_juridica"><option value="">Selecione</option><option>Família</option><option>Cível/Consumidor</option><option>Trabalhista</option><option>Penal</option><option>Previdenciário</option><option>Sucessões</option><option>Tributário</option><option>Outra</option></select></div><div><label>Urgência</label><select name="urgencia"><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option><option value="baixa">Baixa</option></select></div><div><label>Status</label><select name="status"><option value="novo_contato">Novo contato</option><option value="em_analise">Em análise</option><option value="aguardando_documentos">Aguardando documentos</option><option value="aguardando_cliente">Aguardando cliente</option><option value="proposta_enviada">Proposta enviada</option><option value="contratado">Contratado</option><option value="nao_contratado">Não contratado</option><option value="encerrado">Encerrado</option></select></div><div class="full"><label>Resumo do problema jurídico *</label><textarea name="resumo_problema" required placeholder="Descreva objetivamente o relato inicial do cliente..."></textarea></div><div class="full"><label>Documentos necessários</label><textarea name="documentos_necessarios" placeholder="Documentos que deverão ser enviados pelo cliente..."></textarea></div><div class="full"><label>Orientação inicial</label><textarea name="orientacao_inicial" placeholder="Orientação fornecida no primeiro atendimento..."></textarea></div><div><label>Próximo contato / retorno</label><input name="proximo_contato" type="datetime-local"></div><div><label>Data do primeiro contato</label><input name="data_primeiro_contato" type="datetime-local"></div><div class="full"><label>Observações</label><textarea name="observacoes"></textarea></div></div><div class="at-modal-actions"><button type="button" class="secondary" id="atCancelar">Cancelar</button><button type="submit" class="primary" id="atSalvar">Salvar atendimento</button></div></form></div>`;document.body.appendChild(modal);
      }
      ligarEventos();
    }

    function abrirModulo(btn){
      document.querySelectorAll('.pg').forEach(p=>p.classList.add('hidden'));
      document.getElementById('atendimentos')?.classList.remove('hidden');
      document.querySelectorAll('#menu button').forEach(x=>x.classList.remove('active'));btn?.classList.add('active');
      const t=document.getElementById('titulo');if(t)t.textContent='Atendimentos Jurídicos';
      carregar();
    }

    function ligarEventos(){
      const novo=document.getElementById('btnNovoAtendimento');if(novo&&!novo.dataset.on){novo.dataset.on='1';novo.onclick=()=>abrirModal();}
      const fechar=document.getElementById('atFechar');if(fechar&&!fechar.dataset.on){fechar.dataset.on='1';fechar.onclick=fecharModal;}
      const cancelar=document.getElementById('atCancelar');if(cancelar&&!cancelar.dataset.on){cancelar.dataset.on='1';cancelar.onclick=fecharModal;}
      const atualizar=document.getElementById('atAtualizar');if(atualizar&&!atualizar.dataset.on){atualizar.dataset.on='1';atualizar.onclick=carregar;}
      ['atBusca','atFiltroStatus','atFiltroArea'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.on){el.dataset.on='1';el.addEventListener(id==='atBusca'?'input':'change',renderLista);}});
      const form=document.getElementById('atForm');if(form&&!form.dataset.on){form.dataset.on='1';form.onsubmit=salvar;}
    }

    function abrirModal(item=null){
      editandoId=item?.id||null;const form=document.getElementById('atForm');form.reset();
      document.getElementById('atModalTitulo').textContent=item?'Editar atendimento':'Novo atendimento';
      if(item){Object.entries(item).forEach(([k,v])=>{if(form.elements[k]&&v!=null)form.elements[k].value=(k==='proximo_contato'||k==='data_primeiro_contato')?paraLocal(v):v;});}
      else form.elements.data_primeiro_contato.value=paraLocal(new Date());
      document.getElementById('atModal').classList.add('show');
    }
    function fecharModal(){document.getElementById('atModal')?.classList.remove('show');editandoId=null;}

    async function salvar(e){
      e.preventDefault();const form=e.target;const btn=document.getElementById('atSalvar');
      const dados={nome_contato:form.nome_contato.value.trim(),telefone:form.telefone.value.trim()||null,email:form.email.value.trim()||null,area_juridica:form.area_juridica.value||null,resumo_problema:form.resumo_problema.value.trim(),urgencia:form.urgencia.value,documentos_necessarios:form.documentos_necessarios.value.trim()||null,orientacao_inicial:form.orientacao_inicial.value.trim()||null,proximo_contato:form.proximo_contato.value?new Date(form.proximo_contato.value).toISOString():null,status:form.status.value,observacoes:form.observacoes.value.trim()||null,data_primeiro_contato:form.data_primeiro_contato.value?new Date(form.data_primeiro_contato.value).toISOString():new Date().toISOString(),atualizado_em:new Date().toISOString()};
      try{btn.disabled=true;btn.textContent='Salvando...';if(editandoId){const {error}=await sb.from('atendimentos').update(dados).eq('id',editandoId);if(error)throw error;}else{const u=usuarioAtual();if(!u?.id)throw new Error('Usuário não identificado.');const {error}=await sb.from('atendimentos').insert({...dados,user_id:u.id});if(error)throw error;}fecharModal();await carregar();}catch(err){alert('Não foi possível salvar o atendimento: '+(err?.message||err));}finally{btn.disabled=false;btn.textContent='Salvar atendimento';}
    }

    async function carregar(){
      const box=document.getElementById('atLista');if(!box)return;box.innerHTML='<div class="at-empty">Carregando atendimentos...</div>';
      const {data,error}=await sb.from('atendimentos').select('*').order('criado_em',{ascending:false});
      if(error){box.innerHTML=`<div class="at-empty">Erro ao carregar: ${esc(error.message)}</div>`;return;}lista=data||[];atualizarStats();renderLista();
    }

    function atualizarStats(){
      const n=s=>lista.filter(x=>x.status===s).length;
      document.getElementById('atNovos').textContent=n('novo_contato');document.getElementById('atAnalise').textContent=n('em_analise');document.getElementById('atAguardando').textContent=lista.filter(x=>['aguardando_documentos','aguardando_cliente'].includes(x.status)).length;document.getElementById('atContratados').textContent=n('contratado');
    }

    function renderLista(){
      const box=document.getElementById('atLista');if(!box)return;const busca=(document.getElementById('atBusca')?.value||'').toLowerCase();const st=document.getElementById('atFiltroStatus')?.value||'';const ar=document.getElementById('atFiltroArea')?.value||'';
      const itens=lista.filter(x=>(!st||x.status===st)&&(!ar||x.area_juridica===ar)&&(!busca||[x.nome_contato,x.telefone,x.email,x.resumo_problema].some(v=>String(v||'').toLowerCase().includes(busca))));
      box.innerHTML=itens.map(x=>`<article class="at-card"><div class="at-card-top"><div><div class="at-name">${esc(x.nome_contato)}</div><div class="at-meta">${esc(x.telefone||'Sem telefone')}${x.email?' · '+esc(x.email):''}<br>Primeiro contato: ${fmt(x.data_primeiro_contato)}</div></div>${x.area_juridica?`<span class="at-area">${esc(x.area_juridica)}</span>`:''}</div><div class="at-badges"><span class="at-badge ${esc(x.status)}">${esc(statusLabel(x.status))}</span><span class="at-badge ${esc(x.urgencia)}">${esc(urgLabel(x.urgencia))}</span></div><div class="at-resumo">${esc(x.resumo_problema)}</div><div class="at-follow"><strong>Próximo contato:</strong> ${fmt(x.proximo_contato)}</div><div class="at-actions"><button type="button" class="secondary" data-editar="${x.id}">Editar</button>${x.telefone?`<button type="button" class="secondary" data-whats="${esc(x.telefone)}">WhatsApp ↗</button>`:''}<button type="button" class="secondary" data-status="${x.id}" data-novo-status="em_analise">Em análise</button><button type="button" class="secondary" data-status="${x.id}" data-novo-status="contratado">Contratado</button></div></article>`).join('')||'<div class="at-empty">Nenhum atendimento encontrado.</div>';
      box.querySelectorAll('[data-editar]').forEach(b=>b.onclick=()=>abrirModal(lista.find(x=>x.id===b.dataset.editar)));
      box.querySelectorAll('[data-whats]').forEach(b=>b.onclick=()=>{const n=String(b.dataset.whats).replace(/\D/g,'');window.open(`https://wa.me/55${n}`,'_blank','noopener');});
      box.querySelectorAll('[data-status]').forEach(b=>b.onclick=async()=>{const {error}=await sb.from('atendimentos').update({status:b.dataset.novoStatus,atualizado_em:new Date().toISOString()}).eq('id',b.dataset.status);if(error)return alert(error.message);await carregar();});
    }

    garantirTela();
  };
  esperar();
})();