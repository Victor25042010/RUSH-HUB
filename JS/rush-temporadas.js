/* RUSHHUB — seletor simples de temporadas. Mantém a temporada escolhida na URL. */
(() => {
  const path = location.pathname;
  const isCalendar = /\/calendarios\/[^/]+\.html$/i.test(path);
  if (!isCalendar) return;
  const page = path.split('/').pop().replace('.html','');
  const current = new URLSearchParams(location.search).get('ano') || String(new Date().getFullYear());
  const wrap = document.createElement('div');
  wrap.className = 'rush-season-picker';
  wrap.innerHTML = `<label for="rush-season">TEMPORADA</label><select id="rush-season"><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option><option value="2023">2023</option><option value="2012">2012</option></select><span class="rush-season-note">Escolha o ano para consultar o arquivo.</span>`;
  document.querySelector('main')?.prepend(wrap);
  const select = wrap.querySelector('select');
  select.value = ['2026','2025','2024','2023','2012'].includes(current) ? current : '2026';
  select.addEventListener('change', () => {
    const y = select.value;
    if (y === '2026') { location.href = `${page}.html`; return; }
    if (y === '2012' && page === 'f1') { location.href = 'f1-2012.html'; return; }
    const archive = document.createElement('section');
    archive.className = 'rush-season-archive';
    archive.innerHTML = `<strong>ARQUIVO ${y}</strong><p>Temporada histórica. Os melhores momentos são acessados somente por fontes oficiais.</p><a href="${page}.html?ano=${y}" class="rush-archive-open">Abrir mídia da temporada ↗</a>`;
    document.querySelectorAll('.rush-season-archive').forEach(x=>x.remove());
    wrap.after(archive);
  });
  if (current !== '2026' && !(current === '2012' && page === 'f1')) select.dispatchEvent(new Event('change'));
})();
