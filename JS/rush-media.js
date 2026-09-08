/* RUSHHUB — AUTOMÁTICO: MÍDIA WEC / 24H
   NÃO É PRECISO EDITAR ESTE ARQUIVO.
   Regra:
   - corrida futura  -> não mostra mídia
   - corrida ao vivo  -> mostra transmissão ao vivo
   - corrida encerrada -> mostra melhores momentos
*/
(() => {
  const slug = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  if (!slug.startsWith('wec-')) return;

  const races = window.RUSH_RACES || {};
  const race = races[slug];
  if (!race || race.cancelled) return;

  const start = new Date(race.start).getTime();
  const end = start + (Number(race.durationHours || 0) * 60 * 60 * 1000);
  const now = Date.now();
  const isUpcoming = now < start;
  const isLive = now >= start && now < end;
  const isFinished = now >= end;

  const live = (window.RUSH_LIVE_TRANSMISSIONS || {})[slug];
  const highlights = (window.RUSH_HIGHLIGHTS || {})[slug] || [];
  const main = document.querySelector('main');
  if (!main) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  function removeOldMedia() {
    document.querySelector('#rush-media')?.remove();
  }

  function sectionTitle(title, kicker) {
    return `<div class="rush-media-title"><h2>${title}</h2><span>${kicker}</span></div>`;
  }

  function renderHighlight(item) {
    if (item.embed) {
      return `<article class="rush-media-card rush-media-video-card">
        <div class="rush-media-video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.embed)}" title="${esc(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
        <div class="rush-media-card-body"><strong>${esc(item.title)}</strong><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a></div>
      </article>`;
    }
    return `<article class="rush-media-card"><div class="rush-media-icon">▶</div><div class="rush-media-card-body"><strong>${esc(item.title)}</strong><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir vídeo ↗</a></div></article>`;
  }

  removeOldMedia();

  // Corrida ainda não começou: não mostra transmissão nem melhores momentos.
  if (isUpcoming) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'rush-media';

  // Corrida acontecendo: SOMENTE transmissão ao vivo.
  if (isLive) {
    if (!live || !live.url) return;
    wrapper.innerHTML = `
      ${sectionTitle('Transmissão ao vivo', 'RUSH LIVE · WEC / 24H')}
      <section class="rush-media-panel">
        <div class="rush-media-live">
          <div>
            <span class="rush-media-kicker">🔴 AO VIVO</span>
            <h3>Assistir ${esc(race.name || 'à corrida')}</h3>
            <p>Transmissão: <strong>${esc(live.name || 'Fonte oficial')}</strong></p>
          </div>
          <a class="rush-media-button" href="${esc(live.url)}" target="_blank" rel="noopener noreferrer">ABRIR TRANSMISSÃO ↗</a>
        </div>
      </section>`;
    main.appendChild(wrapper);
    return;
  }

  // Corrida encerrada: SOMENTE melhores momentos, se já cadastrados.
  if (isFinished && highlights.length) {
    wrapper.innerHTML = `
      ${sectionTitle('Melhores momentos', 'VÍDEOS OFICIAIS / AUTORIZADOS')}
      <section class="rush-media-grid">${highlights.map(renderHighlight).join('')}</section>
      <div class="rush-media-note">Os vídeos aparecem aqui depois que forem cadastrados no arquivo de melhores momentos.</div>`;
    main.appendChild(wrapper);
  }
})();
