(() => {
  const data = window.RUSH_F1;
  if (!data) return;
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const area = document.querySelector('#f1-classificacao');
  if (!area) return;

  const rows = data.drivers.map(d => `
    <div class="f1-standing-row" style="--team-color:${esc(data.color(d.team))}">
      <span class="f1-standing-pos">${String(d.pos).padStart(2,'0')}</span>
      <span class="f1-team-bar"></span>
      <span class="f1-standing-driver"><b>${esc(d.name)}</b><small>${esc(d.team)} · #${d.number}</small></span>
      <strong>${d.points}</strong><span class="pts-label">PTS</span>
    </div>`).join('');
  area.innerHTML = `
    <div class="f1-standing-head"><div><span class="eyebrow">RUSH HUB / F1</span><h2>Classificação geral</h2></div><span>APÓS O GP DA ITÁLIA</span></div>
    <div class="f1-standing-list">${rows}</div>`;
})();
