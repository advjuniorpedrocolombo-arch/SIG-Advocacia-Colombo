(()=>{
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const digits=v=>String(v||'').replace(/\D/g,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function clienteNome(p){
    const cs=Array.isArray(window.D?.clientes)?window.D.clientes:[];
    const c=cs.find(x=>String(x.id)===String(p.cliente_id));
    return c?.nome || p.partes || 'Sem cliente vinculado';
  }

  function garantirLista(){
    let l=document.getElementById('sigSugestoesProcessos');
    if(l)return l;
    l=document.createElement('div');
    l.id='sigSugestoesProcessos';
    l.style.cssText='display:none;position:fixed;z-index:2147483647;max-height:330px;overflow:auto;background:#fff;border:1px solid #cfd9e6;border-radius:10px;box-shadow:0 14px 34px rgba(16,44,85,.22);padding:5px;box-sizing:border-box';
    document.body.appendChild(l);
    return l;
  }

  function posicionarLista(){
    const campo=document.getElementById('buscaProcesso'),l=garantirLista();
    if(!campo)return;
    const r=campo.getBoundingClientRect();
    l.style.left=r.left+'px';
    l.style.top=(r.bottom+4)+'px';
    l.style.width=Math.max(r.width,480)+'px';
    l.style.maxWidth=Math.max(280,window.innerWidth-r.left-12)+'px';
  }

  function fecharLista(){const l=document.getElementById('sigSugestoesProcessos');if(l){l.style.display='none';l.innerHTML='';}}

  function resultados(termo){
    const t=norm(termo),d=digits(termo);
    return (Array.isArray(window.D?.processos)?window.D.processos:[]).filter(p=>{
      const n=norm(clienteNome(p));
      const c=norm(p.numero_cnj||'');
      const cd=digits(p.numero_cnj||'');
      return n.includes(t)||c.includes(t)||(d.length>=3&&cd.includes(d));
    }).slice(0,12);
  }

  function mostrarLista(){
    const campo=document.getElementById('buscaProcesso');if(!campo)return;
    const termo=String(campo.value||'').trim(),l=garantirLista();
    if(termo.length<3){fecharLista();return;}
    const rs=resultados(termo);posicionarLista();
    if(!rs.length){
      l.innerHTML='<div style="padding:10px 12px;font:12px Arial;color:#748398">Nenhum processo encontrado.</div>';
      l.style.display='block';return;
    }
    l.innerHTML=rs.map(p=>`<button type="button" data-proc-id="${esc(p.id)}" style="display:block;width:100%;border:0;background:#fff;text-align:left;padding:9px 10px;border-radius:8px;cursor:pointer;color:#172033"><strong style="display:block;font:600 12px Arial">${esc(clienteNome(p))}</strong><span style="display:block;margin-top:2px;font:10px Arial;color:#66788d">${esc(p.numero_cnj||'Sem número')}${p.area?' · '+esc(p.area):''}</span></button>`).join('');
    l.style.display='block';
    l.querySelectorAll('button[data-proc-id]').forEach(b=>{
      b.onmouseenter=()=>b.style.background='#f3f7fc';
      b.onmouseleave=()=>b.style.background='#fff';
      b.onclick=()=>{
        const p=(window.D?.processos||[]).find(x=>String(x.id)===String(b.dataset.procId));
        if(!p)return;
        campo.value=p.numero_cnj||clienteNome(p);
        fecharLista();
        if(typeof window.renderProcessosAprimorados==='function')window.renderProcessosAprimorados();
        setTimeout(()=>aplicarFiltroTexto(campo.value),30);
      };
    });
  }

  function aplicarFiltroTexto(valor){
    const termo=String(valor||'').trim();
    if(!termo)return;
    const temLetras=/[A-Za-zÀ-ÿ]/.test(termo);
    if(!temLetras)return;
    const alvo=norm(termo);
    document.querySelectorAll('#tbProcessos tr').forEach(tr=>{
      const tds=tr.querySelectorAll('td');
      const cliente=norm(tds[1]?.innerText||'');
      const numero=norm(tds[0]?.innerText||'');
      tr.style.display=(cliente.includes(alvo)||numero.includes(alvo))?'':'none';
    });
  }

  function adicionarEditar(){
    const ps=Array.isArray(window.D?.processos)?window.D.processos:[];
    document.querySelectorAll('#tbProcessos tr').forEach(tr=>{
      const td=tr.querySelector('td');if(!td||td.querySelector('.sig-editar-mini'))return;
      const num=(String(td.innerText||'').match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)||[])[0];
      if(!num)return;
      const p=ps.find(x=>String(x.numero_cnj||'').trim()===num.trim());if(!p)return;
      const b=document.createElement('button');
      b.type='button';b.className='secondary sig-editar-mini';b.textContent='Editar';b.title='Editar processo';
      b.style.cssText='padding:1px 5px!important;margin-left:5px!important;font-size:8px!important;line-height:14px!important;height:18px!important;min-height:18px!important;border-radius:5px!important;vertical-align:middle!important';
      b.onclick=e=>{e.preventDefault();e.stopPropagation();if(typeof window.editarProcessoSIG==='function')window.editarProcessoSIG(p.id);};
      td.appendChild(b);
    });
  }

  function instalar(){
    const campo=document.getElementById('buscaProcesso');
    const tb=document.getElementById('tbProcessos');
    if(!campo||!tb){setTimeout(instalar,200);return;}
    if(document.documentElement.dataset.sigBuscaEditFix==='1')return;
    document.documentElement.dataset.sigBuscaEditFix='1';

    campo.placeholder='Digite número do processo ou nome do cliente';
    campo.autocomplete='off';
    campo.addEventListener('input',()=>{
      const v=String(campo.value||'').trim();
      if(v.length>=3){mostrarLista();if(typeof window.renderProcessosAprimorados==='function')window.renderProcessosAprimorados();setTimeout(()=>aplicarFiltroTexto(v),20);}else{fecharLista();}
    });
    campo.addEventListener('focus',()=>{if(String(campo.value||'').trim().length>=3)mostrarLista();});
    campo.addEventListener('keydown',e=>{if(e.key==='Escape')fecharLista();});
    document.addEventListener('click',e=>{if(e.target!==campo&&!e.target.closest('#sigSugestoesProcessos'))fecharLista();});
    window.addEventListener('resize',()=>{const l=document.getElementById('sigSugestoesProcessos');if(l&&l.style.display!=='none')posicionarLista();});
    window.addEventListener('scroll',()=>{const l=document.getElementById('sigSugestoesProcessos');if(l&&l.style.display!=='none')posicionarLista();},true);

    const mo=new MutationObserver(()=>{adicionarEditar();const v=String(campo.value||'').trim();if(v&&/[A-Za-zÀ-ÿ]/.test(v))setTimeout(()=>aplicarFiltroTexto(v),0);});
    mo.observe(tb,{childList:true,subtree:true});
    adicionarEditar();
  }

  instalar();
})();
