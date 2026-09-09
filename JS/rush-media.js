/* RUSHHUB — mídia automática para TODAS as categorias. */
(() => {
  const slug = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  const race = window.RUSH_RACES && window.RUSH_RACES[slug];
  if (!race) return;
  const main = document.querySelector('main');
  if (!main) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const now = Date.now();
  const start = new Date(race.start).getTime();
  const end = start + (Number(race.durationHours || 1) * 3600000);
  const cancelled = !!race.cancelled;
  const live = !cancelled && now >= start && now < end;
  const finished = !cancelled && now >= end;
  const upcoming = !cancelled && now < start;
  const source = window.RUSH_LIVE?.[race.category];
  const highlights = window.RUSH_HIGHLIGHTS?.[slug] || [];
  if (cancelled || upcoming) return;

  const title = race.name.replace(/^[^·]+·\s*/, '');
  const wrapper = document.createElement('div');
  wrapper.id = 'rush-media';

  const videoCard = item => item.embed
    ? `<article class="rush-media-card rush-media-video-card"><div class="rush-media-video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.embed)}" title="${esc(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="rush-media-card-body"><strong>${esc(item.title)}</strong><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a></div></article>`
    : `<article class="rush-media-card"><div class="rush-media-icon">▶</div><div class="rush-media-card-body"><strong>${esc(item.title)}</strong><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte oficial ↗</a></div></article>`;

  if (live && source) {
    wrapper.innerHTML = `<div class="rush-media-title"><h2>Transmissão ao vivo</h2><span>AO VIVO AGORA</span></div><section class="rush-media-panel"><div class="rush-media-live"><div><span class="rush-media-kicker">🔴 TRANSMISSÃO OFICIAL</span><h3>${esc(source.name)}</h3><p>${esc(title)} está acontecendo agora.</p></div><a class="rush-media-button" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">ASSISTIR AO VIVO ↗</a></div></section>`;
  }

  if (finished && highlights.length) {
    wrapper.innerHTML += `<div class="rush-media-title"><h2>Melhores momentos</h2><span>CONTEÚDO OFICIAL</span></div><section class="rush-media-grid">${highlights.map(videoCard).join('')}</section>`;
  }

  if (wrapper.innerHTML.trim()) main.appendChild(wrapper);
})();
