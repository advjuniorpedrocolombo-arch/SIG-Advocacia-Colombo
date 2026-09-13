(()=>{
  const esperar=()=>{
    if(typeof render!=='function'||typeof sb==='undefined'||typeof load!=='function'||typeof D==='undefined'){
      setTimeout(esperar,150);return;
    }

    function garantirModalEditarCliente(){
      if(document.getElementById('mEditarClienteSIG'))return;
      const modal=document.createElement('div');
      modal.id='mEditarClienteSIG';
      modal.className='modal hidden';
      modal.innerHTML=`<div class="card" style="width:min(720px,100%);max-height:90vh;overflow:auto">
        <h3>Editar cliente</h3>
        <form id="fEditarClienteSIG">
          <input type="hidden" name="id">
          <label>Nome</label>
          <input name="nome" required>
          <div class="formgrid">
            <div><label>CPF/CNPJ</label><input name="cpf_cnpj"></div>
            <div><label>Telefone</label><input name="telefone"></div>
            <div><label>E-mail</label><input name="email" type="email"></div>
            <div><label>Endereço</label><input name="endereco"></div>
            <div class="span2"><label>Observações</label><textarea name="observacoes" rows="4"></textarea></div>
          </div>
          <div class="actions">
            <button type="button" class="secondary" id="cancelarEditarClienteSIG">Cancelar</button>
            <button type="submit" class="primary">Salvar alterações</button>
          </div>
        </form>
      </div>`;
      document.body.appendChild(modal);
      document.getElementById('cancelarEditarClienteSIG').onclick=()=>modal.classList.add('hidden');
      document.getElementById('fEditarClienteSIG').onsubmit=async e=>{
        e.preventDefault();
        const f=e.currentTarget;
        const id=f.elements.id.value;
        const payload={
          nome:String(f.elements.nome.value||'').trim(),
          cpf_cnpj:String(f.elements.cpf_cnpj.value||'').trim()||null,
          telefone:String(f.elements.telefone.value||'').trim()||null,
          email:String(f.elements.email.value||'').trim()||null,
          endereco:String(f.elements.endereco.value||'').trim()||null,
          observacoes:String(f.elements.observacoes.value||'').trim()||null,
          atualizado_em:new Date().toISOString()
        };
        const btn=f.querySelector('button[type="submit"]');
        const txt=btn.textContent;btn.disabled=true;btn.textContent='Salvando...';
        const {error}=await sb.from('clientes').update(payload).eq('id',id);
        btn.disabled=false;btn.textContent=txt;
        if(error){alert('Não foi possível editar o cliente: '+error.message);return;}
        modal.classList.add('hidden');
        await load();
        alert('Cliente atualizado com sucesso.');
      };
    }

    window.editarClienteSIG=function(id){
      garantirModalEditarCliente();
      const c=(D.clientes||[]).find(x=>x.id===id);
      if(!c){alert('Cliente não encontrado.');return;}
      const f=document.getElementById('fEditarClienteSIG');
      f.elements.id.value=c.id||'';
      f.elements.nome.value=c.nome||'';
      f.elements.cpf_cnpj.value=c.cpf_cnpj||'';
      f.elements.telefone.value=c.telefone||'';
      f.elements.email.value=c.email||'';
      f.elements.endereco.value=c.endereco||'';
      f.elements.observacoes.value=c.observacoes||'';
      document.getElementById('mEditarClienteSIG').classList.remove('hidden');
    };

    window.excluirClienteSIG=async function(id,nome){
      const vinculados=(D.processos||[]).filter(p=>p.cliente_id===id);
      let msg=`Excluir o cliente "${nome||'sem nome'}"?\n\nEsta ação não poderá ser desfeita.`;
      if(vinculados.length)msg+=`\n\nAtenção: há ${vinculados.length} processo(s) vinculado(s) a este cliente. Se o banco impedir a exclusão, primeiro será necessário remover o vínculo desses processos.`;
      if(!confirm(msg))return;
      const {error}=await sb.from('clientes').delete().eq('id',id);
      if(error){alert('Não foi possível excluir o cliente: '+error.message);return;}
      await load();
      alert('Cliente excluído com sucesso.');
    };

    function renderClientesAprimorados(){
      const sec=document.getElementById('clientes');
      const tb=document.getElementById('tbClientes');
      if(!sec||!tb)return;
      const th=sec.querySelector('thead tr');
      if(th)th.innerHTML='<th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>E-mail</th><th>Ações</th>';
      tb.innerHTML=(D.clientes||[]).map(c=>{
        const nomeSeguro=String(c.nome||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
        return `<tr><td>${esc(c.nome||'')}</td><td>${esc(c.cpf_cnpj||'')}</td><td>${esc(c.telefone||'')}</td><td>${esc(c.email||'')}</td><td style="white-space:nowrap"><button type="button" class="secondary" onclick="editarClienteSIG('${c.id}')">Editar</button> <button type="button" class="secondary" style="color:#b42318;margin-left:6px" onclick="excluirClienteSIG('${c.id}','${nomeSeguro}')">Excluir</button></td></tr>`;
      }).join('');
    }

    garantirModalEditarCliente();
    const original=render;
    render=function(){original();renderClientesAprimorados();};
    renderClientesAprimorados();
  };
  esperar();
})();
