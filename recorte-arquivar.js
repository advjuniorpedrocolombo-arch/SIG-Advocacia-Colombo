(()=>{
  let mostrarArquivados=false;

  const esperar=()=>{
    if(typeof sb==='undefined'||!document.getElementById('menu')){setTimeout(esperar,180);return;}
    instalar();
  };

  function instalar(){
    const aguardarTela=()=>{
      const sec=document.getElementById('recorte');
      const lista=document.getElementById('rdLista');
      if(!sec||!lista){setTimeout(aguardarTela,250);return;}
      garantirControle(sec);
      observarLista(lista);
      aplicar();
    };
    aguardarTela();
  }

  function garantirControle(sec){
    if(document.getElementById('btnVerArquivadosRecorte'))return;
    const hero=sec.querySelector('.rd-hero');
    if(!hero)return;
    const box=hero.querySelector('div:last-child')||hero;
    const btn=document.createElement('button');
    btn.type='button';
    btn.id='btnVerArquivadosRecorte';
    btn.textContent='Ver arquivados';
    btn.style.marginLeft='8px';
    btn.onclick=()=>{
      mostrarArquivados=!mostrarArquivados;
      btn.textContent=mostrarArquivados?'Ver ativos':'Ver arquivados';
      aplicar();
    };
    hero.appendChild(btn);
  }

  function observarLista(lista){
    if(lista.dataset.arquivarObserver==='1')return;
    lista.dataset.arquivarObserver='1';
    const mo=new MutationObserver(()=>setTimeout(aplicar,0));
    mo.observe(lista,{childList:true,subtree:true});
  }

  function idDoCard(card){
    const b=[...card.querySelectorAll('button')].find(x=>(x.getAttribute('onclick')||'').includes('verRecorteDigital'));
    const m=(b?.getAttribute('onclick')||'').match(/verRecorteDigital\('([^']+)'\)/);
    return m?.[1]||null;
  }

  async function arquivar(id){
    const {error}=await sb.from('publicacoes_recorte').update({arquivada:true}).eq('id',id);
    if(error){alert('Não foi possível arquivar: '+error.message);return;}
    const r=(window.__recortesSIG||[]).find(x=>x.id===id);if(r)r.arquivada=true;
    aplicar();
  }

  async function restaurar(id){
    const {error}=await sb.from('publicacoes_recorte').update({arquivada:false}).eq('id',id);
    if(error){alert('Não foi possível restaurar: '+error.message);return;}
    const r=(window.__recortesSIG||[]).find(x=>x.id===id);if(r)r.arquivada=false;
    aplicar();
  }

  function aplicar(){
    const lista=document.getElementById('rdLista');if(!lista)return;
    const recs=window.__recortesSIG||[];
    const mapa=new Map(recs.map(r=>[r.id,r]));

    [...lista.querySelectorAll('.rd-card')].forEach(card=>{
      const id=idDoCard(card);if(!id)return;
      const r=mapa.get(id);if(!r)return;
      const arquivada=!!r.arquivada;
      card.style.display=(mostrarArquivados===arquivada)?'':'none';

      let btn=card.querySelector('.btn-recorte-arquivar');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='secondary btn-recorte-arquivar';
        card.querySelector('.rd-actions')?.appendChild(btn);
      }
      btn.textContent=arquivada?'Restaurar':'Arquivar';
      btn.onclick=()=>arquivada?restaurar(id):arquivar(id);

      if(arquivada){
        card.style.opacity='.78';
        card.style.borderLeft='4px solid #6f7f90';
      }else{
        card.style.opacity='';
      }
    });
  }

  esperar();
})();
