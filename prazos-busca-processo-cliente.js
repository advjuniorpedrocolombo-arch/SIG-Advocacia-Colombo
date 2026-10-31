/* Busca de processo por número CNJ ou nome do cliente no cadastro de prazos. */
(function(){
  'use strict';
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const digits=s=>String(s??'').replace(/\D/g,'');
  function setup(){
    const form=document.getElementById('fPrazo');
    if(!form||form.querySelector('#buscaPrazoProcesso'))return;
    const sel=form.querySelector('select[name="processo_id"]');
    if(!sel)return;
    const wrap=document.createElement('div');
    wrap.style.cssText='margin:0 0 10px;position:relative';
    const label=document.createElement('label');
    label.htmlFor='buscaPrazoProcesso';
    label.textContent='Buscar processo por número ou nome do cliente';
    const input=document.createElement('input');
    input.id='buscaPrazoProcesso';input.type='search';
    input.placeholder='Digite o número CNJ ou o nome do cliente';
    input.autocomplete='off';
    input.style.cssText='width:100%;margin:5px 0 0';
    const list=document.createElement('div');
    list.id='resultadosBuscaPrazo';
    list.style.cssText='display:none;max-height:210px;overflow-y:auto;border:1px solid #cbd5e1;border-radius:8px;background:white;color:#14213d;margin-top:5px';
    const hint=document.createElement('small');
    hint.style.cssText='display:block;margin-top:5px;color:#64748b';
    hint.textContent='Pesquise e selecione um resultado para vincular o prazo.';
    wrap.append(label,input,list,hint);
    sel.parentElement.insertBefore(wrap,sel.previousElementSibling===null?sel:sel);
    function lookup(){
      list.replaceChildren();
      const q=norm(input.value),qdig=digits(input.value);
      if(!q){list.style.display='none';hint.textContent='Pesquise e selecione um resultado para vincular o prazo.';return;}
      const processos=(typeof D!=='undefined'&&Array.isArray(D.processos))?D.processos:[];
      const clientes=(typeof D!=='undefined'&&Array.isArray(D.clientes))?D.clientes:[];
      const byId=new Map(clientes.map(c=>[String(c.id),c.nome||'']));
      const hits=processos.filter(p=>{
        const nome=byId.get(String(p.cliente_id))||'';
        return norm(p.numero_cnj).includes(q)||norm(p.titulo).includes(q)||norm(nome).includes(q)||
          (qdig.length>=4&&digits(p.numero_cnj).includes(qdig));
      }).slice(0,35);
      if(!hits.length){
        const empty=document.createElement('div');empty.textContent='Nenhum processo encontrado.';
        empty.style.cssText='padding:12px';list.append(empty);
      }
      hits.forEach(p=>{
        const b=document.createElement('button');b.type='button';
        b.style.cssText='display:block;width:100%;text-align:left;padding:10px 12px;border:0;border-bottom:1px solid #e5e7eb;background:white;color:#14213d;cursor:pointer;white-space:normal';
        const nome=byId.get(String(p.cliente_id))||'Cliente não vinculado';
        b.textContent=(p.numero_cnj||'Sem número CNJ')+' — '+nome+' — '+(p.titulo||'Processo');
        b.addEventListener('click',()=>{
          if(!Array.from(sel.options).some(o=>o.value===String(p.id))){
            const opt=new Option(p.titulo||p.numero_cnj||'Processo',String(p.id));sel.add(opt);
          }
          sel.value=String(p.id);sel.dispatchEvent(new Event('change',{bubbles:true}));
          input.value=(p.numero_cnj||p.titulo||'')+' — '+nome;
          list.style.display='none';
          hint.textContent='Processo selecionado e vinculado ao prazo.';
        });
        list.append(b);
      });
      list.style.display='block';
      hint.textContent=hits.length+' resultado(s) encontrado(s).';
    }
    input.addEventListener('input',lookup);
    input.addEventListener('focus',()=>{if(input.value)lookup()});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))list.style.display='none'});
    form.addEventListener('reset',()=>{input.value='';list.style.display='none'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
  const observer=new MutationObserver(setup);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
