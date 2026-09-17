(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||typeof load!=='function'||typeof D==='undefined'){
      setTimeout(esperar,180);return;
    }
    const form=document.getElementById('fEditarProcessoSIG');
    if(!form){setTimeout(esperar,180);return;}
    instalar(form);
  };

  function norm(v){return String(v||'').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g,' ')}
  function soDigitos(v){return String(v||'').replace(/\D/g,'')}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function instalar(form){
    if(form.dataset.clienteInlineSig==='1')return;
    form.dataset.clienteInlineSig='1';

    const campo=form.elements.partes;
    if(!campo)return;
    const bloco=document.createElement('div');
    bloco.id='clienteVinculoInlineSIG';
    bloco.style.cssText='margin:-3px 0 12px;padding:10px;border:1px solid #dbe3ee;border-radius:10px;background:#f8fbff';
    bloco.innerHTML=`
      <div style="font-size:11px;color:#667085;margin-bottom:7px">Cliente cadastrado no SIG</div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center">
        <select id="clienteExistenteInlineSIG" style="margin:0;min-width:0"><option value="">Buscar / selecionar cliente existente</option></select>
        <button type="button" class="secondary" id="btnVincularClienteInlineSIG" style="white-space:nowrap">Vincular</button>
        <button type="button" class="primary" id="btnNovoClienteInlineSIG" style="white-space:nowrap">+ Cadastrar cliente</button>
      </div>
      <div id="clienteVinculoStatusSIG" style="font-size:11px;color:#667085;margin-top:6px"></div>
    `;
    campo.insertAdjacentElement('afterend',bloco);

    const style=document.createElement('style');
    style.textContent='@media(max-width:700px){#clienteVinculoInlineSIG>div:nth-child(2){grid-template-columns:1fr!important}#btnVincularClienteInlineSIG,#btnNovoClienteInlineSIG{width:100%}}';
    document.head.appendChild(style);

    garantirModalNovoCliente();
    preencherClientes();

    document.getElementById('btnVincularClienteInlineSIG').onclick=()=>{
      const id=document.getElementById('clienteExistenteInlineSIG').value;
      if(!id){alert('Selecione um cliente já cadastrado.');return;}
      vincularClienteAoProcesso(id);
    };
    document.getElementById('btnNovoClienteInlineSIG').onclick=abrirNovoClienteInline;

    const modal=document.getElementById('mEditarProcessoSIG');
    if(modal){
      const mo=new MutationObserver(()=>{
        if(!modal.classList.contains('hidden')){
          preencherClientes();
          sincronizarVinculoAtual();
        }
      });
      mo.observe(modal,{attributes:true,attributeFilter:['class']});
    }
  }

  function preencherClientes(){
    const sel=document.getElementById('clienteExistenteInlineSIG');if(!sel)return;
    const atual=sel.value;
    const clientes=[...(D.clientes||[])].sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'));
    sel.innerHTML='<option value="">Buscar / selecionar cliente existente</option>'+clientes.map(c=>`<option value="${esc(c.id)}">${esc(c.nome||'Sem nome')}${c.cpf_cnpj?' — '+esc(c.cpf_cnpj):''}</option>`).join('');
    if(clientes.some(c=>String(c.id)===String(atual)))sel.value=atual;
  }

  function processoAtual(){
    const form=document.getElementById('fEditarProcessoSIG');
    const id=form?.elements?.id?.value;
    return (D.processos||[]).find(p=>String(p.id)===String(id));
  }

  function sincronizarVinculoAtual(){
    const p=processoAtual();
    const sel=document.getElementById('clienteExistenteInlineSIG');
    const st=document.getElementById('clienteVinculoStatusSIG');
    if(!sel||!st)return;
    if(p?.cliente_id){
      sel.value=String(p.cliente_id);
      const c=(D.clientes||[]).find(x=>String(x.id)===String(p.cliente_id));
      st.textContent=c?.nome?`Vinculado atualmente a: ${c.nome}`:'Processo possui cliente vinculado.';
    }else{
      sel.value='';
      st.textContent='Este processo ainda não está vinculado a um cadastro de cliente.';
    }
  }

  async function vincularClienteAoProcesso(clienteId){
    const form=document.getElementById('fEditarProcessoSIG');
    const processoId=form?.elements?.id?.value;
    const cliente=(D.clientes||[]).find(c=>String(c.id)===String(clienteId));
    if(!processoId||!cliente){alert('Não foi possível identificar o processo ou o cliente.');return;}
    const btn=document.getElementById('btnVincularClienteInlineSIG');
    const old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Vinculando...';}
    const {error}=await sb.from('processos').update({cliente_id:cliente.id,partes:cliente.nome||null,atualizado_em:new Date().toISOString()}).eq('id',processoId);
    if(btn){btn.disabled=false;btn.textContent=old||'Vincular';}
    if(error){alert('Não foi possível vincular o cliente: '+error.message);return;}
    if(form.elements.partes)form.elements.partes.value=cliente.nome||'';
    await load();
    preencherClientes();
    const sel=document.getElementById('clienteExistenteInlineSIG');if(sel)sel.value=String(cliente.id);
    const st=document.getElementById('clienteVinculoStatusSIG');if(st)st.textContent=`Vinculado atualmente a: ${cliente.nome||'Cliente'}`;
  }

  function garantirModalNovoCliente(){
    if(document.getElementById('mNovoClienteInlineSIG'))return;
    const modal=document.createElement('div');
    modal.id='mNovoClienteInlineSIG';
    modal.className='modal hidden';
    modal.style.zIndex='1200';
    modal.innerHTML=`<div class="card" style="width:min(650px,100%);max-height:90vh;overflow:auto">
      <h3 style="margin-top:0">Cadastrar cliente e vincular</h3>
      <p class="small">O cliente será criado na aba Clientes e vinculado automaticamente ao processo que está sendo editado.</p>
      <form id="fNovoClienteInlineSIG">
        <label>Nome</label><input name="nome" required placeholder="Nome completo">
        <div class="formgrid">
          <div><label>CPF/CNPJ</label><input name="cpf_cnpj"></div>
          <div><label>Telefone</label><input name="telefone"></div>
          <div><label>E-mail</label><input name="email" type="email"></div>
          <div><label>Endereço</label><input name="endereco"></div>
          <div class="span2"><label>Observações</label><textarea name="observacoes" rows="3"></textarea></div>
        </div>
        <div class="actions">
          <button type="button" class="secondary" id="cancelarNovoClienteInlineSIG">Cancelar</button>
          <button type="submit" class="primary">Cadastrar e vincular</button>
        </div>
      </form>
    </div>`;
    document.body.appendChild(modal);
    document.getElementById('cancelarNovoClienteInlineSIG').onclick=()=>modal.classList.add('hidden');
    document.getElementById('fNovoClienteInlineSIG').onsubmit=cadastrarEVincular;
  }

  function abrirNovoClienteInline(){
    const form=document.getElementById('fNovoClienteInlineSIG');
    form.reset();
    const nomeAtual=String(document.getElementById('fEditarProcessoSIG')?.elements?.partes?.value||'').trim();
    if(nomeAtual)form.elements.nome.value=nomeAtual;
    document.getElementById('mNovoClienteInlineSIG').classList.remove('hidden');
    setTimeout(()=>form.elements.nome.focus(),30);
  }

  async function cadastrarEVincular(e){
    e.preventDefault();
    const f=e.currentTarget;
    const processoId=document.getElementById('fEditarProcessoSIG')?.elements?.id?.value;
    if(!processoId){alert('Processo não identificado.');return;}
    const payload={
      nome:String(f.elements.nome.value||'').trim(),
      cpf_cnpj:String(f.elements.cpf_cnpj.value||'').trim()||null,
      telefone:String(f.elements.telefone.value||'').trim()||null,
      email:String(f.elements.email.value||'').trim()||null,
      endereco:String(f.elements.endereco.value||'').trim()||null,
      observacoes:String(f.elements.observacoes.value||'').trim()||null
    };
    if(!payload.nome){alert('Informe o nome do cliente.');return;}

    const cpf=soDigitos(payload.cpf_cnpj);
    const existente=(D.clientes||[]).find(c=>(cpf&&soDigitos(c.cpf_cnpj)===cpf)||norm(c.nome)===norm(payload.nome));
    if(existente){
      if(confirm(`Já existe um cliente cadastrado como “${existente.nome}”.\n\nDeseja vincular esse cadastro ao processo em vez de criar outro?`)){
        document.getElementById('mNovoClienteInlineSIG').classList.add('hidden');
        await vincularClienteAoProcesso(existente.id);
      }
      return;
    }

    const btn=f.querySelector('button[type="submit"]');
    const old=btn.textContent;btn.disabled=true;btn.textContent='Cadastrando...';
    const {data,error}=await sb.from('clientes').insert(payload).select('*').single();
    if(error){btn.disabled=false;btn.textContent=old;alert('Não foi possível cadastrar o cliente: '+error.message);return;}
    const {error:erroVinculo}=await sb.from('processos').update({cliente_id:data.id,partes:data.nome||payload.nome,atualizado_em:new Date().toISOString()}).eq('id',processoId);
    btn.disabled=false;btn.textContent=old;
    if(erroVinculo){alert('O cliente foi cadastrado, mas não foi possível vinculá-lo ao processo: '+erroVinculo.message);await load();return;}

    document.getElementById('mNovoClienteInlineSIG').classList.add('hidden');
    const editar=document.getElementById('fEditarProcessoSIG');if(editar?.elements?.partes)editar.elements.partes.value=data.nome||payload.nome;
    await load();
    preencherClientes();
    const sel=document.getElementById('clienteExistenteInlineSIG');if(sel)sel.value=String(data.id);
    const st=document.getElementById('clienteVinculoStatusSIG');if(st)st.textContent=`Vinculado atualmente a: ${data.nome||payload.nome}`;
    alert('Cliente cadastrado e vinculado ao processo com sucesso.');
  }

  esperar();
})();
