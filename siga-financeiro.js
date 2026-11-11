(() => {
  'use strict';

  const menu = document.getElementById('menu');
  const main = document.querySelector('main.main');
  const title = document.getElementById('titulo');
  if (!menu || !main || !title || document.getElementById('financeiro')) return;

  const url = 'https://script.google.com/macros/s/AKfycbznXmxN8cU55IZNG4t5nkxrazWA1W0rb--3iztrnoLLw-zdQYsAlbekTXi2rBq0i6f2UA/exec';

  const section = document.createElement('section');
  section.id = 'financeiro';
  section.className = 'pg hidden';
  section.innerHTML = `
    <div class="toolbar">
      <a href="${url}" target="_blank" rel="noopener noreferrer">Abrir SIGA Financeiro em nova aba</a>
      <small>Use este link se o Google solicitar login ou se o módulo não aparecer abaixo.</small>
    </div>
    <iframe title="SIGA Financeiro" style="display:block;width:100%;height:78vh;min-height:420px;border:0;background:#fff"></iframe>
  `;

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.p = section.id;
  button.textContent = 'SIGA Financeiro';
  button.addEventListener('click', () => {
    main.querySelectorAll('.pg').forEach(page => page.classList.toggle('hidden', page !== section));
    menu.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    title.textContent = button.textContent;
    const frame = section.querySelector('iframe');
    if (!frame.hasAttribute('src')) frame.src = url;
  });

  main.appendChild(section);
  menu.appendChild(button);
})();
