(()=>{
  function norm(v){return String(v||'').replace(/\D/g,'')}
  function escLocal(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function instalar(formId){
    const form=document.getElementById(formId);
    if(!form || form.__sigBuscaProcessoAgenda)return;
    const sel=form.elements.processo_id;
    if(!sel)return;
    form.__sigBuscaProcessoAgenda=true;

    const box=document.createElement('div');
    box.className='span2';
    box.style.marginBottom='8px';
    box.innerHTML=`
      <label>Pesquisar processo pelo número</label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="search" class="sigBuscaProcAgenda" placeholder="Digite o número CNJ ou parte dele" style="margin:5px 0 8px;flex:1;min-width:240px">
        <button type="button" class="secondary sigBtnBuscaProcAgenda" style="margin-bottom:3px">Pesquisar</button>
        <button type="button" class="secondary sigBtnLimpaProcAgenda" style="margin-bottom:3px">Limpar</button>
      </div>
      <div class="small sigResultadoProcAgenda"></div>`;

    const alvo=sel.closest('div');
    if(alvo?.parentElement) alvo.parentElement.insertBefore(box,alvo);
    else sel.parentElement?.insertBefore(box,sel);

    const input=box.querySelector('.sigBuscaProcAgenda');
    const btn=box.querySelector('.sigBtnBuscaProcAgenda');
    const limpar=box.querySelector('.sigBtnLimpaProcAgenda');
    const saida=box.querySelector('.sigResultadoProcAgenda');

    function reporTodos(){
      const atual=sel.value;
      sel.innerHTML='<option value="">Sem vínculo</option>'+((typeof D!=='undefined'&&Array.isArray(D.processos)?D.processos:[]).map(p=>`<option value="${p.id}">${escLocal((p.numero_cnj||'')+' — '+(p.titulo||p.partes||'Processo'))}</option>`).join(''));
      if([...sel.options].some(o=>o.value===atual))sel.value=atual;
    }

    function buscar(){
      const q=norm(input.value);
      if(!q){reporTodos();saida.textContent='Digite o número do processo para pesquisar.';return;}
      const lista=(typeof D!=='undefined'&&Array.isArray(D.processos)?D.processos:[]).filter(p=>norm(p.numero_cnj).includes(q));
      sel.innerHTML='<option value="">Sem vínculo</option>'+lista.map(p=>`<option value="${p.id}">${escLocal((p.numero_cnj||'')+' — '+(p.titulo||p.partes||'Processo'))}</option>`).join('');
      if(lista.length===1){sel.value=lista[0].id;saida.textContent='1 processo encontrado e selecionado.';}
      else if(lista.length>1){saida.textContent=lista.length+' processos encontrados. Selecione abaixo.';}
      else{saida.textContent='Nenhum processo encontrado com esse número.';}
    }

    btn.onclick=buscar;
    input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();buscar();}};
    limpar.onclick=()=>{input.value='';reporTodos();sel.value='';saida.textContent='Pesquisa limpa.';input.focus();};

    reporTodos();
  }

  function iniciar(){
    instalar('fAgenda');
    instalar('fEditarAgendaSIG');
  }

  let n=0;
  const t=setInterval(()=>{iniciar();if(++n>120)clearInterval(t);},250);
  document.addEventListener('click',()=>setTimeout(iniciar,0),true);
})();
