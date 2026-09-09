/* RUSHHUB V4 — tabela de posições automática
   F1: busca sessão e classificação no OpenF1.
   Histórico é público; dados em tempo real dependem da disponibilidade da API.
   Outras categorias não recebem posições inventadas: mostram a fonte oficial.
*/
(() => {
  const slug = document.body.dataset.race;
  const race = window.RUSH_RACES?.[slug];
  const box = document.getElementById('rush-positions');
  if (!race || !box) return;

  const F1_SOURCE = 'https://www.formula1.com/en/results/2026/races';
  const API = 'https://api.openf1.org/v1';
  const REFRESH_MS = 5000;

  const sourceMap = {
    f2: 'https://www.fia.com/events/formula-2-championship/season-2026/fia-formula-2',
    formulae: 'https://www.fiaformulae.com/en/results?tab=race',
    wec: 'https://www.fiawec.com/en/season/2026',
    stockcar: 'https://www.stockcar.com.br/',
    porschecup: 'https://www.porschegt3cup.com.br/'
  };

  const f1Country = {
    'f1-australia':'Australia','f1-china':'China','f1-japao':'Japan','f1-bahrein':'Bahrain',
    'f1-arabia-saudita':'Saudi Arabia','f1-miami':'United States','f1-canada':'Canada',
    'f1-monaco':'Monaco','f1-espanha':'Spain','f1-austria':'Austria','f1-gra-bretanha':'Great Britain',
    'f1-belgica':'Belgium','f1-hungria':'Hungary','f1-holanda':'Netherlands','f1-italia':'Italy',
    'f1-madrid':'Spain','f1-azerbaijao':'Azerbaijan','f1-singapura':'Singapore','f1-eua':'United States',
    'f1-mexico':'Mexico','f1-sao-paulo':'Brazil','f1-las-vegas':'United States','f1-catar':'Qatar','f1-abu-dhabi':'United Arab Emirates'
  };

  function escapeHTML(v){
    return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function formatGap(v){
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'number') return v === 0 ? 'LÍDER' : `+${v.toFixed(3)}s`;
    return String(v).replace(/^\+?/, '+');
  }

  function status(){
    const start = new Date(race.start).getTime();
    const end = start + Number(race.durationHours || 1) * 3600000;
    const now = Date.now();
    if (race.cancelled) return 'cancelled';
    if (now < start) return 'upcoming';
    if (now < end) return 'live';
    return 'finished';
  }

  function renderLoading(text='Carregando posições…'){
    box.innerHTML = `<div class="rush-pos-state"><span class="rush-pos-dot"></span><b>${escapeHTML(text)}</b><small>A tabela é atualizada automaticamente.</small></div>`;
  }

  function renderEmpty(title, text, url, label='FONTE OFICIAL ↗'){
    box.innerHTML = `<div class="rush-pos-state"><b>${escapeHTML(title)}</b><small>${escapeHTML(text)}</small>${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>` : ''}</div>`;
  }

  function renderTable(rows, mode='final'){
    const live = mode === 'live';
    const title = live ? 'POSIÇÕES EM PISTA' : 'CLASSIFICAÇÃO DA CORRIDA';
    const sub = live ? 'ATUALIZAÇÃO AUTOMÁTICA' : 'RESULTADO ATUALIZADO';
    const body = rows.map((r, i) => {
      const pos = r.position ?? (i + 1);
      const driver = r.driver || {};
      const team = driver.team_name || driver.team || '—';
      const acronym = driver.name_acronym || '';
      const gap = r.gap_to_leader;
      const laps = r.number_of_laps ?? '—';
      let state = '';
      if (r.dnf) state = 'DNF';
      else if (r.dns) state = 'DNS';
      else if (r.dsq) state = 'DSQ';
      return `<tr class="${pos <= 3 ? 'top-three' : ''}">
        <td class="pos">${escapeHTML(pos)}</td>
        <td><div class="driver-name"><strong>${escapeHTML(driver.full_name || driver.name || `Piloto #${r.driver_number}`)}</strong><span>${escapeHTML(acronym)}</span></div></td>
        <td class="team">${escapeHTML(team)}</td>
        <td class="gap">${escapeHTML(state || formatGap(gap))}</td>
        <td class="laps">${escapeHTML(laps)}</td>
      </tr>`;
    }).join('');

    box.innerHTML = `<div class="rush-pos-head"><div><b>${title}</b><span>${sub}</span></div><span class="rush-pos-live">${live ? '● AO VIVO' : '✓ CONFIRMADO'}</span></div>
      <div class="rush-pos-scroll"><table class="rush-pos-table"><thead><tr><th>#</th><th>PILOTO</th><th>EQUIPE</th><th>INTERVALO</th><th>VOLTAS</th></tr></thead><tbody>${body}</tbody></table></div>
      <div class="rush-pos-foot">Fonte de dados: OpenF1 · <a href="${F1_SOURCE}" target="_blank" rel="noopener noreferrer">resultados oficiais da Formula 1 ↗</a></div>`;
  }

  async function fetchJSON(url){
    const response = await fetch(url, {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function findRaceSession(){
    const date = new Date(race.start);
    const day = date.toISOString().slice(0,10);
    const next = new Date(date.getTime()+86400000).toISOString().slice(0,10);
    const country = f1Country[slug];
    if (!country) return null;
    const params = new URLSearchParams({year:'2026', session_name:'Race', country_name:country});
    // A API aceita filtros de data. Isso diferencia Barcelona e Madrid, ambos na Espanha.
    const url = `${API}/sessions?${params.toString()}&date_start%3E=${encodeURIComponent(day)}&date_start%3C=${encodeURIComponent(next)}`;
    let sessions = await fetchJSON(url);
    if (!Array.isArray(sessions) || !sessions.length) {
      const fallback = new URLSearchParams({year:'2026', session_name:'Race', country_name:country});
      sessions = await fetchJSON(`${API}/sessions?${fallback.toString()}`);
    }
    if (!Array.isArray(sessions) || !sessions.length) return null;
    return sessions.sort((a,b)=>Math.abs(new Date(a.date_start)-date)-Math.abs(new Date(b.date_start)-date))[0];
  }

  async function loadDrivers(sessionKey){
    const list = await fetchJSON(`${API}/drivers?session_key=${encodeURIComponent(sessionKey)}`);
    const map = {};
    (list || []).forEach(d => { map[d.driver_number] = d; });
    return map;
  }

  async function finished(session){
    const [results, drivers] = await Promise.all([
      fetchJSON(`${API}/session_result?session_key=${encodeURIComponent(session.session_key)}`),
      loadDrivers(session.session_key)
    ]);
    const rows = (results || []).sort((a,b)=>(a.position||999)-(b.position||999)).map(r=>({...r, driver:drivers[r.driver_number]||{}}));
    if (!rows.length) throw new Error('Sem resultado');
    renderTable(rows, 'final');
  }

  async function live(session){
    const [positions, drivers] = await Promise.all([
      fetchJSON(`${API}/position?session_key=${encodeURIComponent(session.session_key)}`),
      loadDrivers(session.session_key)
    ]);
    const latest = {};
    (positions || []).forEach(p => {
      const old = latest[p.driver_number];
      if (!old || new Date(p.date) > new Date(old.date)) latest[p.driver_number] = p;
    });
    const rows = Object.values(latest).sort((a,b)=>(a.position||999)-(b.position||999)).map(p=>({...p, driver:drivers[p.driver_number]||{}}));
    if (!rows.length) throw new Error('Sem posições ao vivo');
    renderTable(rows, 'live');
  }

  async function startF1(){
    renderLoading('Localizando a sessão da corrida…');
    const session = await findRaceSession();
    if (!session) throw new Error('Sessão não encontrada');
    const s = status();
    if (s === 'finished') {
      await finished(session);
      return;
    }
    if (s === 'live') {
      await live(session);
      setInterval(async()=>{
        try { await live(session); } catch(e) { /* mantém a última tabela */ }
      }, REFRESH_MS);
      return;
    }
    renderEmpty('Corrida ainda não começou', 'A classificação aparecerá automaticamente quando a sessão começar.', F1_SOURCE);
  }

  async function start(){
    const s = status();
    if (s === 'cancelled') {
      renderEmpty('Corrida cancelada', 'Não há classificação oficial para esta etapa.', sourceMap[race.category]);
      return;
    }
    if (race.category !== 'f1') {
      const src = sourceMap[race.category];
      renderEmpty('Classificação automática', 'Para esta categoria, o RushHub não inventa posições. A tabela oficial fica disponível na fonte da categoria.', src);
      return;
    }
    try {
      await startF1();
    } catch (e) {
      renderEmpty('Não foi possível atualizar agora', 'A fonte automática está indisponível neste momento. Tente novamente em alguns segundos ou abra o resultado oficial.', F1_SOURCE);
    }
  }

  start();
})();
