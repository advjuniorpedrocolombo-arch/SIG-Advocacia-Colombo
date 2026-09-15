(()=>{
  const esperar=()=>{
    if(typeof sb==='undefined'||!document.getElementById('painel')||!document.getElementById('menuRecorteDigital')){setTimeout(esperar,180);return;}

    function abrirRecorte(){
      const b=document.getElementById('menuRecorteDigital');
      if(b){b.click();return;}
      document.querySelectorAll('.pg').forEach(p=>p.classList.add('hidden'));
      document.getElementById('recorte')?.classList.remove('hidden');
    }

    function garantirCard(){
      const grid=document.querySelector('#painel .grid4');
      if(!grid||document.getElementById('mrecorte'))return;
      const card=document.createElement('div');
      card.className='card metric';
      card.style.cursor='pointer';
      card.title='Abrir Recorte Digital';
      card.innerHTML='Recorte Digital<b id="mrecorte">0</b><span class="small">publicações não analisadas</span>';
      card.onclick=abrirRecorte;
      grid.appendChild(card);
    }

    async function atualizarCard(){
      garantirCard();
      const n=document.getElementById('mrecorte');if(!n)return;
      const {count,error}=await sb.from('publicacoes_recorte').select('id',{count:'exact',head:true}).eq('analisada',false);
      if(error){n.textContent='—';n.title=error.message;return;}
      n.textContent=String(count||0);
      n.title=(count||0)?`${count} publicação(ões) pendente(s) de análise`:'Nenhuma publicação pendente de análise';
    }

    garantirCard();
    atualizarCard();
    const originalCarregar=window.carregarRecortes;
    if(typeof originalCarregar==='function'){
      window.carregarRecortes=async function(...args){
        const r=await originalCarregar.apply(this,args);
        atualizarCard();
        return r;
      };
    }
    window.atualizarCardRecorteDigitalSIG=atualizarCard;
  };
  esperar();
})();
