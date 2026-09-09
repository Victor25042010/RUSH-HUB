/* RUSHHUB — mídia automática
   F1: escolhe o vídeo oficial da FORMULA 1 pelo NOME DO GP.
   Importante: alguns vídeos da F1 bloqueiam iframe por decisão da Formula One Management.
   Nesses casos o RushHub mostra thumbnail + botão para abrir o vídeo oficial no YouTube.
*/
(() => {
  const slug = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  const race = window.RUSH_RACES && window.RUSH_RACES[slug];
  if (!race) return;

  const main = document.querySelector('main');
  if (!main) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const now = Date.now();
  const start = new Date(race.start).getTime();
  const end = start + (Number(race.durationHours || 1) * 3600000);
  const cancelled = !!race.cancelled;
  const live = !cancelled && now >= start && now < end;
  const finished = !cancelled && now >= end;
  const upcoming = !cancelled && now < start;
  const source = window.RUSH_LIVE?.[race.category];

  if (cancelled || upcoming) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'rush-media';

  /*
     Catálogo oficial da FORMULA 1.
     A chave é o nome do GP, não o slug da página.
     Assim qualquer página F1 que tenha o mesmo nome encontra o vídeo automaticamente.
  */
  const F1_VIDEOS = {
    'gp da australia': { title:'Race Highlights | 2026 Australian Grand Prix', id:'lL_d84cN1UY' },
    'gp da china': { title:'Race Highlights | 2026 Chinese Grand Prix', id:'t8HpVlineX4' },
    'gp do japao': { title:'Race Highlights | 2026 Japanese Grand Prix', id:'oAtYfF0_4-I' },
    'gp de miami': { title:'Race Highlights | 2026 Miami Grand Prix', id:'5gYys4GL7S0' },
    'gp do canada': { title:'Race Highlights | 2026 Canadian Grand Prix', id:'QrRh2vOJQbw' },
    'gp de monaco': { title:'Race Highlights | 2026 Monaco Grand Prix', id:'ipOT9ruRobc' },
    'gp da espanha': { title:'Race Highlights | 2026 Barcelona-Catalunya Grand Prix', id:'Ey8j_BlLvFM' },
    'gp da austria': { title:'Race Highlights | 2026 Austrian Grand Prix', id:'usP9O0zFVaA' },
    'gp da gra bretanha': { title:'Race Highlights | 2026 British Grand Prix', id:'rnjmSOUYVp8' },
    'gp da belgica': { title:'Race Highlights | 2026 Belgian Grand Prix', id:'I6RfOY_7leA' },
    'gp da hungria': { title:'Race Highlights | 2026 Hungarian Grand Prix', id:'_JeaXt_3Mhc' },
    'gp da holanda': { title:'Race Highlights | 2026 Dutch Grand Prix', id:null },
    'gp da italia': { title:'Race Highlights | 2026 Italian Grand Prix', id:'uptj3to1l7o' },
    'f1 gp da espanha madring': { title:'Race Highlights | 2026 Spanish Grand Prix', id:null },
    'gp do azerbaijao': { title:'Race Highlights | 2026 Azerbaijan Grand Prix', id:null },
    'gp de singapura': { title:'Race Highlights | 2026 Singapore Grand Prix', id:null },
    'gp dos estados unidos': { title:'Race Highlights | 2026 United States Grand Prix', id:null },
    'gp da cidade do mexico': { title:'Race Highlights | 2026 Mexico City Grand Prix', id:null },
    'gp de sao paulo': { title:'Race Highlights | 2026 São Paulo Grand Prix', id:null },
    'gp de las vegas': { title:'Race Highlights | 2026 Las Vegas Grand Prix', id:null },
    'gp do catar': { title:'Race Highlights | 2026 Qatar Grand Prix', id:null },
    'gp de abu dhabi': { title:'Race Highlights | 2026 Abu Dhabi Grand Prix', id:null }
  };

  const getF1Video = () => {
    if (race.category !== 'f1') return null;

    const key = normalize(race.name);
    const video = F1_VIDEOS[key];
    if (video) return video;

    // Tenta reconhecer nomes equivalentes usados em versões diferentes do calendário.
    const aliases = [
      ['australia','gp da australia'], ['china','gp da china'], ['japao','gp do japao'],
      ['miami','gp de miami'], ['canada','gp do canada'], ['monaco','gp de monaco'],
      ['barcelona','gp da espanha'], ['catalunya','gp da espanha'], ['austria','gp da austria'],
      ['gra bretanha','gp da gra bretanha'], ['belgica','gp da belgica'], ['hungria','gp da hungria'],
      ['holanda','gp da holanda'], ['italia','gp da italia'], ['madrid','f1 gp da espanha madring'],
      ['azerbaijao','gp do azerbaijao'], ['singapura','gp de singapura'], ['estados unidos','gp dos estados unidos'],
      ['mexico','gp da cidade do mexico'], ['sao paulo','gp de sao paulo'], ['las vegas','gp de las vegas'],
      ['catar','gp do catar'], ['abu dhabi','gp de abu dhabi']
    ];

    for (const [term, target] of aliases) {
      if (key.includes(term)) return F1_VIDEOS[target];
    }
    return null;
  };

  const officialChannelSearch = title => {
    const query = encodeURIComponent(title || `Race Highlights 2026 ${race.name}`);
    return `https://www.youtube.com/@F1/search?query=${query}`;
  };

  const f1Video = getF1Video();

  const renderF1Card = video => {
    const url = video?.id
      ? `https://www.youtube.com/watch?v=${video.id}`
      : officialChannelSearch(video?.title || race.name);

    const thumb = video?.id
      ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
      : '';

    return `
      <article class="rush-media-card rush-f1-video-card">
        ${thumb ? `<a class="rush-f1-thumb" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Assistir ${esc(video.title)}">
          <img src="${thumb}" alt="${esc(video.title)}" loading="lazy">
          <span class="rush-f1-play">▶</span>
        </a>` : `<div class="rush-f1-thumb rush-f1-no-thumb"><span>F1</span></div>`}
        <div class="rush-media-card-body">
          <span class="rush-f1-source">FORMULA 1 · YOUTUBE OFICIAL</span>
          <strong>${esc(video?.title || `Race Highlights | 2026 ${race.name}`)}</strong>
          <a class="rush-f1-watch" href="${url}" target="_blank" rel="noopener noreferrer">
            ${video?.id ? 'ASSISTIR NO YOUTUBE ↗' : 'ABRIR BUSCA NO CANAL F1 ↗'}
          </a>
        </div>
      </article>`;
  };

  if (live && source) {
    wrapper.innerHTML = `
      <div class="rush-media-title"><h2>Transmissão ao vivo</h2><span>AO VIVO AGORA</span></div>
      <section class="rush-media-panel">
        <div class="rush-media-live">
          <div>
            <span class="rush-media-kicker">🔴 TRANSMISSÃO OFICIAL</span>
            <h3>${esc(source.name)}</h3>
            <p>${esc(race.name)} está acontecendo agora.</p>
          </div>
          <a class="rush-media-button" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">ASSISTIR AO VIVO ↗</a>
        </div>
      </section>`;
  }

  if (finished && race.category === 'f1' && f1Video) {
    wrapper.innerHTML += `
      <div class="rush-media-title"><h2>Melhores momentos</h2><span>FORMULA 1 · CONTEÚDO OFICIAL</span></div>
      <section class="rush-media-grid rush-f1-grid">
        ${renderF1Card(f1Video)}
      </section>`;
    main.appendChild(wrapper);
    return;
  }

  if (finished && race.category !== 'f1') {
    const highlights = window.RUSH_HIGHLIGHTS?.[slug] || [];
    const videoCard = item => item.embed
      ? `<article class="rush-media-card rush-media-video-card"><div class="rush-media-video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.embed)}" title="${esc(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="rush-media-card-body"><strong>${esc(item.title)}</strong><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a></div></article>`
      : `<article class="rush-media-card"><div class="rush-media-icon">▶</div><div class="rush-media-card-body"><strong>${esc(item.title)}</strong><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte oficial ↗</a></div></article>`;

    if (highlights.length) {
      wrapper.innerHTML += `<div class="rush-media-title"><h2>Melhores momentos</h2><span>CONTEÚDO OFICIAL</span></div><section class="rush-media-grid">${highlights.map(videoCard).join('')}</section>`;
    }
  }

  if (wrapper.innerHTML.trim()) main.appendChild(wrapper);
})();
