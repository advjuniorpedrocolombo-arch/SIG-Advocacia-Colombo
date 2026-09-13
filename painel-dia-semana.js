(()=>{
  const esperar=()=>{
    if(typeof render!=='function'||typeof D==='undefined'||typeof fmt!=='function'){
      setTimeout(esperar,150);return;
    }

    function fmtComDia(v){
      if(!v)return '—';
      const d=new Date(v);
      if(Number.isNaN(d.getTime()))return fmt(v);
      const dia=d.toLocaleDateString('pt-BR',{weekday:'long'});
      const dataHora=d.toLocaleString('pt-BR');
      return dataHora+' — '+dia.charAt(0).toUpperCase()+dia.slice(1);
    }

    function renderResumoComDia(){
      const resumo=document.getElementById('resumo');
      if(!resumo)return;
      const futuros=(D.agenda||[])
        .filter(x=>new Date(x.inicio)>=new Date())
        .slice(0,5);
      resumo.innerHTML=futuros.map(x=>`<p><b>${fmtComDia(x.inicio)}</b> — ${esc(x.titulo)}</p>`).join('')||'<p>Nenhum compromisso futuro.</p>';
    }

    const original=render;
    render=function(){original();renderResumoComDia();};
    renderResumoComDia();
  };
  esperar();
})();
