(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||typeof D==='undefined'||!document.getElementById('menu')){setTimeout(esperar,180);return;}
    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const fmt=v=>{if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});};
    const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const dig=v=>String(v||'').replace(/\D/g,'');

    const css=`
      #atendimentos .at-list{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
      #atendimentos .at-card{padding:10px 11px!important;border-radius:13px!important;cursor:pointer;min-height:0!important}
      #atendimentos .at-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 22px rgba(16,44,85,.10)!important;border-color:#c7d5e6!important}
      #atendimentos .at-name{font-size:15px!important}
      #atendimentos .at-meta{font-size:9px!important;line-height:1.35!important}
      #atendimentos .at-badges{margin:6px 0!important;gap:4px!important}
      #atendimentos .at-badge,#atendimentos .at-area{font-size:8px!important;padding:3px 6px!important}
      #atendimentos .at-resumo{font-size:10px!important;line-height:1.35!important;padding:7px!important;min-height:0!important;max-height:48px;overflow:hidden}
      #atendimentos .at-follow{margin-top:6px!important;font-size:10px!important;padding:6px 7px;background:#f3f7fc;border-radius:8px}
      #atendimentos .at-actions{margin-top:7px!important;padding-top:7px!important;gap:4px!important}
      #atendimentos .at-actions button{font-size:9px!important;padding:5px 6px!important}
      #atDetalheModal{position:fixed;inset:0;background:rgba(5,18,38,.64);z-index:10020;display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(2px)}
      #atDetalheModal.show{display:flex}
      #atDetalheModal .fd-card{background:#fff;width:min(860px,96vw);max-height:92vh;overflow:auto;border-radius:20px;box-shadow:0 28px 70px rgba(0,0,0,.28)}
      #atDetalheModal .fd-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px;background:linear-gradient(135deg,#102c55,#173b72);color:#fff}
      #atDetalheModal .fd-head h3{margin:0;font-family:Georgia,serif;font-size:23px}#atDetalheModal .fd-head p{margin:4px 0 0;font-size:11px;color:#dbe7f5}
      #atDetalheModal .fd-head button{background:#fff;color:#173b72;padding:7px 10px}
      #atDetalheModal .fd-body{padding:18px 20px}.fd-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fd-box{border:1px solid #e2e8f0;background:#f8fafc;border-radius:12px;padding:10px}.fd-box.full{grid-column:1/-1}.fd-lab{font-size:9px;font-weight:800;text-transform:uppercase;color:#718198;margin-bottom:3px}.fd-val{font-size:12px;color:#27364a;white-space:pre-wrap;overflow-wrap:anywhere}.fd-client{background:#eef5ff;border-color:#d7e5f6}.fd-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #e5e7eb}
      @media(max-width:1100px){#atendimentos .at-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:700px){#atendimentos .at-list{grid-template-columns:1fr!important}.fd-grid{grid-template-columns:1fr}.fd-box.full{grid-column:auto}}
    `;
    let st=document.getElementById('atFollowupStyle');if(!st){st=document.createElement('style');st.id='atFollowupStyle';st.textContent=css;document.head.appendChild(st);}

    function garantirModal(){
      if(document.getElementById('atDetalheModal'))return;
      const m=document.createElement('div');m.id='atDetalheModal';m.innerHTML='<div class="fd-card"><div class="fd-head"><div><h3 id="fdNome">Cliente</h3><p id="fdSub"></p></div><button type="button" id="fdFechar">Fechar</button></div><div class="fd-body" id="fdBody"></div></div>';
      document.body.appendChild(m);document.getElementById('fdFechar').onclick=()=>m.classList.remove('show');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');});
    }

    function acharCliente(a){
      const cs=D.clientes||[];const nt=dig(a.telefone),ne=norm(a.email),nn=norm(a.nome_contato);
      return cs.find(c=>(nt&&dig(c.telefone)===nt)||(ne&&norm(c.email)===ne)||(nn&&norm(c.nome)===nn))||null;
    }

    async function abrirDetalhe(id){
      garantirModal();const {data:a,error}=await sb.from('atendimentos').select('*').eq('id',id).single();if(error||!a){alert('Não foi possível abrir o atendimento.');return;}
      const c=acharCliente(a);document.getElementById('fdNome').textContent=a.nome_contato||'Atendimento';document.getElementById('fdSub').textContent=`Próximo contato: ${fmt(a.proximo_contato)}`;
      const clienteHtml=c?`<div class="fd-box fd-client"><div class="fd-lab">Cliente cadastrado no SIG</div><div class="fd-val"><strong>${esc(c.nome||'')}</strong><br>${esc(c.telefone||'Sem telefone')}<br>${esc(c.email||'Sem e-mail')}</div></div><div class="fd-box fd-client"><div class="fd-lab">CPF/CNPJ · Endereço</div><div class="fd-val">${esc(c.cpf_cnpj||'—')}<br>${esc(c.endereco||'—')}</div></div>`:`<div class="fd-box full"><div class="fd-lab">Cadastro de cliente</div><div class="fd-val">Este contato ainda não foi localizado na base de Clientes do SIG.</div></div>`;
      document.getElementById('fdBody').innerHTML=`<div class="fd-grid">${clienteHtml}<div class="fd-box"><div class="fd-lab">Telefone / WhatsApp</div><div class="fd-val">${esc(a.telefone||'—')}</div></div><div class="fd-box"><div class="fd-lab">E-mail</div><div class="fd-val">${esc(a.email||'—')}</div></div><div class="fd-box"><div class="fd-lab">Área jurídica</div><div class="fd-val">${esc(a.area_juridica||'—')}</div></div><div class="fd-box"><div class="fd-lab">Status · Urgência</div><div class="fd-val">${esc(a.status||'—')} · ${esc(a.urgencia||'normal')}</div></div><div class="fd-box"><div class="fd-lab">Primeiro contato</div><div class="fd-val">${fmt(a.data_primeiro_contato)}</div></div><div class="fd-box"><div class="fd-lab">Próximo atendimento</div><div class="fd-val"><strong>${fmt(a.proximo_contato)}</strong></div></div><div class="fd-box full"><div class="fd-lab">Resumo do problema</div><div class="fd-val">${esc(a.resumo_problema||'—')}</div></div><div class="fd-box full"><div class="fd-lab">Documentos necessários</div><div class="fd-val">${esc(a.documentos_necessarios||'—')}</div></div><div class="fd-box full"><div class="fd-lab">Orientação inicial</div><div class="fd-val">${esc(a.orientacao_inicial||'—')}</div></div><div class="fd-box full"><div class="fd-lab">Observações</div><div class="fd-val">${esc(a.observacoes||'—')}</div></div></div><div class="fd-actions">${a.telefone?'<button type="button" class="secondary" id="fdWhats">WhatsApp ↗</button>':''}<button type="button" class="primary" id="fdEditar">Editar atendimento</button></div>`;
      if(a.telefone)document.getElementById('fdWhats').onclick=()=>window.open(`https://wa.me/55${dig(a.telefone)}`,'_blank','noopener');
      document.getElementById('fdEditar').onclick=()=>{document.getElementById('atDetalheModal').classList.remove('show');const b=document.querySelector(`#atLista [data-editar="${CSS.escape(id)}"]`);if(b)b.click();};
      document.getElementById('atDetalheModal').classList.add('show');
    }

    function dataDoCard(card){
      const t=card.querySelector('.at-follow')?.textContent||'';const m=t.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);if(!m)return Number.POSITIVE_INFINITY;return new Date(+m[3],+m[2]-1,+m[1],+m[4],+m[5]).getTime();
    }

    let ajustando=false;
    function organizar(){
      if(ajustando)return;const box=document.getElementById('atLista');if(!box)return;ajustando=true;
      const cards=[...box.querySelectorAll('.at-card')];cards.sort((a,b)=>dataDoCard(a)-dataDoCard(b));cards.forEach(card=>{box.appendChild(card);const edit=card.querySelector('[data-editar]');if(edit){card.dataset.atendimentoId=edit.dataset.editar;if(!card.dataset.clickDetalhe){card.dataset.clickDetalhe='1';card.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea'))return;abrirDetalhe(card.dataset.atendimentoId);});}}});
      ajustando=false;
    }

    const iniciarObserver=()=>{const box=document.getElementById('atLista');if(!box){setTimeout(iniciarObserver,250);return;}organizar();const ob=new MutationObserver(()=>setTimeout(organizar,30));ob.observe(box,{childList:true,subtree:true});};
    garantirModal();iniciarObserver();
  };
  esperar();
})();