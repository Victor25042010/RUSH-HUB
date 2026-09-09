/* RUSHHUB — MÍDIA F1 POR NOME DO GP
   Não usa iframe para os vídeos da F1, pois alguns vídeos oficiais têm a incorporação bloqueada pela FOM.
   O card aparece DENTRO da área "Melhores momentos" já existente na página.
*/
(() => {
  const slug = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  const race = window.RUSH_RACES?.[slug];
  if (!race) return;

  const esc = value => String(value ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  const start = new Date(race.start).getTime();
  const end = start + Number(race.durationHours || 1) * 3600000;
  const now = Date.now();
  const finished = !race.cancelled && now >= end;
  const live = !race.cancelled && now >= start && now < end;
  if (race.cancelled) return;

  // Catálogo oficial da FORMULA 1. A associação principal é pelo NOME DO GP.
  const F1_VIDEOS = {
    'gp da australia': {title:'Race Highlights | 2026 Australian Grand Prix', id:'lL_d84cN1UY'},
    'gp da china': {title:'Race Highlights | 2026 Chinese Grand Prix', id:'t8HpVlineX4'},
    'gp do japao': {title:'Race Highlights | 2026 Japanese Grand Prix', id:'oAtYfF0_4-I'},
    'gp de miami': {title:'Race Highlights | 2026 Miami Grand Prix', id:'5gYys4GL7S0'},
    'gp do canada': {title:'Race Highlights | 2026 Canadian Grand Prix', id:'QrRh2vOJQbw'},
    'gp de monaco': {title:'Race Highlights | 2026 Monaco Grand Prix', id:'ipOT9ruRobc'},
    'gp da espanha': {title:'Race Highlights | 2026 Barcelona-Catalunya Grand Prix', id:'Ey8j_BlLvFM'},
    'gp da austria': {title:'Race Highlights | 2026 Austrian Grand Prix', id:'usP9O0zFVaA'},
    'gp da gra bretanha': {title:'Race Highlights | 2026 British Grand Prix', id:'rnjmSOUYVp8'},
    'gp da belgica': {title:'Race Highlights | 2026 Belgian Grand Prix', id:'I6RfOY_7leA'},
    'gp da hungria': {title:'Race Highlights | 2026 Hungarian Grand Prix', id:'_JeaXt_3Mhc'},
    'gp da holanda': {title:'Race Highlights | 2026 Dutch Grand Prix', id:null},
    'gp da italia': {title:'Race Highlights | 2026 Italian Grand Prix', id:'uptj3to1l7o'},
    'gp da espanha madring': {title:'Race Highlights | 2026 Spanish Grand Prix', id:null},
    'gp do azerbaijao': {title:'Race Highlights | 2026 Azerbaijan Grand Prix', id:null},
    'gp de singapura': {title:'Race Highlights | 2026 Singapore Grand Prix', id:null},
    'gp dos estados unidos': {title:'Race Highlights | 2026 United States Grand Prix', id:null},
    'gp da cidade do mexico': {title:'Race Highlights | 2026 Mexico City Grand Prix', id:null},
    'gp de sao paulo': {title:'Race Highlights | 2026 São Paulo Grand Prix', id:null},
    'gp de las vegas': {title:'Race Highlights | 2026 Las Vegas Grand Prix', id:null},
    'gp do catar': {title:'Race Highlights | 2026 Qatar Grand Prix', id:null},
    'gp de abu dhabi': {title:'Race Highlights | 2026 Abu Dhabi Grand Prix', id:null}
  };

  const aliases = [
    ['barcelona','gp da espanha'],['catalunya','gp da espanha'],['madring','gp da espanha madring'],
    ['australia','gp da australia'],['china','gp da china'],['japao','gp do japao'],['miami','gp de miami'],
    ['canada','gp do canada'],['monaco','gp de monaco'],['austria','gp da austria'],['gra bretanha','gp da gra bretanha'],
    ['belgica','gp da belgica'],['hungria','gp da hungria'],['holanda','gp da holanda'],['italia','gp da italia'],
    ['azerbaijao','gp do azerbaijao'],['singapura','gp de singapura'],['estados unidos','gp dos estados unidos'],
    ['mexico','gp da cidade do mexico'],['sao paulo','gp de sao paulo'],['las vegas','gp de las vegas'],['catar','gp do catar'],['abu dhabi','gp de abu dhabi']
  ];

  function getF1Video(){
    if (race.category !== 'f1') return null;
    const key = normalize(race.name);
    if (F1_VIDEOS[key]) return F1_VIDEOS[key];
    for (const [term,target] of aliases) if (key.includes(term)) return F1_VIDEOS[target];
    return null;
  }

  function youtubeSearchUrl(title){
    const q = `site:youtube.com/@F1 ${title || `Race Highlights 2026 ${race.name}`}`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  }

  function renderF1(video){
    const title = video?.title || `Race Highlights | 2026 ${race.name}`;
    const url = video?.id ? `https://www.youtube.com/watch?v=${video.id}` : youtubeSearchUrl(title);
    const thumb = video?.id ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : '';
    return `
      <div class="rush-f1-official-card">
        ${thumb ? `<a class="rush-f1-thumb" href="${url}" target="_blank" rel="noopener noreferrer"><img src="${thumb}" alt="${esc(title)}" loading="lazy"><span class="rush-f1-play">▶</span></a>` : `<a class="rush-f1-thumb rush-f1-no-thumb" href="${url}" target="_blank" rel="noopener noreferrer"><span>F1</span></a>`}
        <div class="rush-f1-body">
          <span class="rush-f1-source">FORMULA 1 · YOUTUBE OFICIAL</span>
          <strong>${esc(title)}</strong>
          <a class="rush-f1-watch" href="${url}" target="_blank" rel="noopener noreferrer">${video?.id ? 'ASSISTIR NO YOUTUBE ↗' : 'PROCURAR NO CANAL F1 ↗'}</a>
        </div>
      </div>`;
  }

  // Encontra a seção estática já existente e usa ela. Assim não fica um segundo bloco vazio.
  const headings = [...document.querySelectorAll('.section-title')];
  const title = headings.find(el => normalize(el.querySelector('h2')?.textContent) === 'melhores momentos');
  const panel = title?.nextElementSibling?.classList?.contains('panel') ? title.nextElementSibling : null;

  if (race.category === 'f1' && finished) {
    const video = getF1Video();
    if (title && panel) {
      panel.innerHTML = video ? renderF1(video) : `<div class="rush-f1-missing"><strong>Melhores momentos oficiais</strong><p>O GP terminou, mas o vídeo ainda não foi identificado no catálogo. Use o botão abaixo para procurar pelo nome do GP diretamente no YouTube.</p><a class="rush-f1-watch" href="${youtubeSearchUrl(`Race Highlights 2026 ${race.name}`)}" target="_blank" rel="noopener noreferrer">PROCURAR NO CANAL F1 ↗</a></div>`;
      panel.classList.add('rush-f1-panel');
      const note = panel.querySelector('.video-note'); if (note) note.remove();
    }
    return;
  }

  // Para não-F1, mantém o sistema anterior de fontes oficiais.
  if (finished && race.category !== 'f1') {
    const highlights = window.RUSH_HIGHLIGHTS?.[slug] || [];
    if (!title || !panel || !highlights.length) return;
    panel.innerHTML = highlights.map(item => item.embed
      ? `<div class="rush-media-video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.embed)}" title="${esc(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`
      : `<div class="rush-f1-missing"><strong>${esc(item.title)}</strong><a class="rush-f1-watch" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">ABRIR FONTE OFICIAL ↗</a></div>`).join('');
    panel.classList.add('rush-f1-panel');
  }
})();
