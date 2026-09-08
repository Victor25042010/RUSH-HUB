/*
  RUSHHUB — SISTEMA AUTOMÁTICO DE CORRIDAS
  - Estado: PRÓXIMA / AO VIVO / ENCERRADA / CANCELADA
  - Countdown automático
  - Progresso automático
  - Calendário e páginas de corrida usam a mesma base de dados
  - F1: tenta carregar resultados/standings históricos pelo OpenF1 (gratuito para histórico)

  IMPORTANTE:
  dados de telemetria/posição AO VIVO de F1 no OpenF1 exigem assinatura.
  Para outras categorias, o sistema não inventa dados: mostra que a fonte ao vivo ainda não foi conectada.
*/

(() => {
  const races = window.RUSH_RACES || {};
  const slug = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  const race = races[slug];
  if (!race) return;

  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const start = new Date(race.start);
  const end = new Date(start.getTime() + Number(race.durationHours || 1) * 3600000);

  function getState() {
    if (race.cancelled) return 'cancelled';
    const now = Date.now();
    if (now < start.getTime()) return 'upcoming';
    if (now < end.getTime()) return 'live';
    return 'finished';
  }

  function formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (d > 0) return `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function statusText(state) {
    return {
      upcoming: 'PRÓXIMA',
      live: 'AO VIVO',
      finished: 'ENCERRADA',
      cancelled: 'CANCELADA'
    }[state];
  }

  function updateLegacyHud(state) {
    const status = $('#raceStatus') || $('#status');
    const mode = $('#raceMode') || $('#mode');
    const counter = $('#raceCounter') || $('#counter');
    const progress = $('#progressBar') || $('#bar');
    if (!status) return;

    status.className = state === 'live' ? 'live' : state === 'finished' ? 'finished' : state === 'cancelled' ? 'cancelled' : 'upcoming';
    status.innerHTML = state === 'live' ? '<span class="dot live-dot"></span> AO VIVO' : statusText(state);

    if (mode && counter) {
      if (state === 'upcoming') {
        mode.textContent = 'COMEÇA EM';
        counter.textContent = formatDuration(start.getTime() - Date.now());
      } else if (state === 'live') {
        if (race.raceType === 'laps' && race.totalLaps) {
          const elapsed = Date.now() - start.getTime();
          const estimatedLap = Math.min(race.totalLaps, Math.max(1, Math.floor((elapsed / (race.durationHours * 3600000)) * race.totalLaps)));
          mode.textContent = 'VOLTA';
          counter.textContent = `${estimatedLap} / ${race.totalLaps}`;
        } else {
          mode.textContent = 'TEMPO RESTANTE';
          counter.textContent = formatDuration(end.getTime() - Date.now());
        }
      } else if (state === 'finished') {
        mode.textContent = 'EVENTO';
        counter.textContent = 'FINALIZADO';
      } else {
        mode.textContent = 'EVENTO';
        counter.textContent = 'CANCELADO';
      }
    }

    if (progress) {
      const pct = state === 'upcoming' ? 0 : state === 'finished' || state === 'cancelled' ? 100 : ((Date.now() - start) / (end - start)) * 100;
      progress.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    }
  }

  function createAutoPanel() {
    if ($('#rush-auto-panel')) return $('#rush-auto-panel');
    const panel = document.createElement('section');
    panel.id = 'rush-auto-panel';
    panel.className = 'rush-auto-panel';
    const main = $('main');
    if (main) main.insertBefore(panel, main.firstChild);
    else document.body.prepend(panel);
    return panel;
  }

  function renderBase(state) {
    const panel = createAutoPanel();
    const countdown = state === 'upcoming' ? formatDuration(start - Date.now()) : state === 'live' ? formatDuration(end - Date.now()) : '—';
    const mode = state === 'live' ? (race.raceType === 'time' ? 'TEMPO' : 'VOLTAS') : state === 'upcoming' ? 'CONTAGEM REGRESSIVA' : 'STATUS';
    panel.innerHTML = `
      <div class="rush-auto-head">
        <div><span class="rush-auto-kicker">RUSHHUB AUTOMÁTICO</span><h2>${esc(statusText(state))}</h2></div>
        <span class="rush-auto-badge ${state}">${esc(state === 'live' ? 'LIVE' : state.toUpperCase())}</span>
      </div>
      <div class="rush-auto-grid">
        <div><small>EVENTO</small><strong>${esc(race.name)}</strong></div>
        <div><small>${esc(mode)}</small><strong id="rushAutoCounter">${esc(countdown)}</strong></div>
        <div><small>INÍCIO</small><strong>${start.toLocaleString('pt-BR')}</strong></div>
        <div><small>FONTE</small><strong>${race.liveData === 'openf1' ? 'OpenF1 / histórico' : 'Sistema RushHub'}</strong></div>
      </div>
      ${state === 'upcoming' ? '<p class="rush-auto-note">O contador muda sozinho. Você não precisa editar esta página quando chegar o dia da corrida.</p><div id="rush-standings-area" class="rush-results-area"><strong>Campeonato</strong><span>Carregando classificação quando houver fonte disponível...</span></div>' : ''}
      ${state === 'live' ? '<div id="rush-live-area" class="rush-live-area"><strong>Race Control</strong><span>Conectando à fonte de dados...</span></div>' : ''}
      ${state === 'finished' ? '<div id="rush-results-area" class="rush-results-area"><strong>Resultados</strong><span>Carregando dados históricos quando houver fonte disponível...</span></div>' : ''}
      ${state === 'cancelled' ? '<p class="rush-auto-note">Esta etapa está marcada como cancelada na base do RushHub.</p>' : ''}
    `;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function loadF1Historical() {
    if (race.category !== 'f1') return;
    const resultsArea = $('#rush-results-area');
    if (!resultsArea) return;

    try {
      const sessions = await fetchJson('https://api.openf1.org/v1/sessions?year=2026&session_name=Race');
      const target = sessions
        .filter(s => !s.is_cancelled && s.date_start)
        .sort((a,b) => Math.abs(new Date(a.date_start) - start) - Math.abs(new Date(b.date_start) - start))[0];
      if (!target) throw new Error('sessão não encontrada');

      const results = await fetchJson(`https://api.openf1.org/v1/session_result?session_key=${target.session_key}`);
      const drivers = await fetchJson(`https://api.openf1.org/v1/drivers?session_key=${target.session_key}`);
      const byNumber = Object.fromEntries(drivers.map(d => [d.driver_number, d]));
      const ordered = results.filter(r => r.position != null).sort((a,b) => a.position - b.position);

      resultsArea.innerHTML = `
        <div class="rush-result-head"><strong>CLASSIFICAÇÃO AUTOMÁTICA</strong><span>OpenF1 · ${esc(target.circuit_short_name || '')}</span></div>
        <div class="rush-result-list">${ordered.map(r => {
          const d = byNumber[r.driver_number] || {};
          const gap = r.position === 1 ? 'LÍDER' : (typeof r.gap_to_leader === 'number' ? `+${r.gap_to_leader.toFixed(3)}s` : (r.gap_to_leader || '—'));
          const flags = [r.dnf?'DNF':'',r.dns?'DNS':'',r.dsq?'DSQ':''].filter(Boolean).join(' · ');
          return `<div class="rush-result-row"><b>${String(r.position).padStart(2,'0')}</b><span>${esc(d.full_name || `CARRO ${r.driver_number}`)}<small>${esc(d.team_name || '')}</small></span><strong>${esc(flags || gap)}</strong><span>${r.number_of_laps ?? '—'} voltas</span></div>`;
        }).join('')}</div>
      `;
    } catch (err) {
      resultsArea.innerHTML = '<strong>Resultados automáticos</strong><span>Fonte histórica indisponível no momento. O RushHub não inventa posições.</span>';
    }
  }


  async function loadF1Standings() {
    if (race.category !== 'f1') return;
    const area = $('#rush-standings-area');
    if (!area) return;
    if (getState() !== 'upcoming') return;
    try {
      const sessions = await fetchJson('https://api.openf1.org/v1/sessions?year=2026&session_name=Race');
      const previous = sessions
        .filter(s => !s.is_cancelled && s.date_start && new Date(s.date_start) < start)
        .sort((a,b) => new Date(b.date_start) - new Date(a.date_start))[0];
      if (!previous) return;
      const standings = await fetchJson(`https://api.openf1.org/v1/championship_drivers?session_key=${previous.session_key}`);
      const drivers = await fetchJson(`https://api.openf1.org/v1/drivers?session_key=${previous.session_key}`);
      const byNumber = Object.fromEntries(drivers.map(d => [d.driver_number, d]));
      standings.sort((a,b) => (a.position_current ?? 999) - (b.position_current ?? 999));
      const rows = standings.slice(0, 10).map(r => {
        const d = byNumber[r.driver_number] || {};
        return `<div class="rush-result-row"><b>${String(r.position_current).padStart(2,'0')}</b><span>${esc(d.full_name || `CARRO ${r.driver_number}`)}<small>${esc(d.team_name || '')}</small></span><strong>${r.points_current ?? 0} pts</strong><span>antes do GP</span></div>`;
      }).join('');
      area.innerHTML = `<div class="rush-result-head"><strong>CAMPEONATO AUTOMÁTICO</strong><span>após ${esc(previous.circuit_short_name || 'última etapa')}</span></div><div class="rush-result-list">${rows}</div>`;
    } catch (err) {
      // Sem fonte: mantém o painel de contagem regressiva, sem inventar posições.
    }
  }

  function tick(state) {
    const auto = $('#rushAutoCounter');
    if (!auto) return;
    if (state === 'upcoming') auto.textContent = formatDuration(start - Date.now());
    else if (state === 'live') auto.textContent = formatDuration(end - Date.now());
  }

  function cleanLegacyPlaceholders() {
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length) return;
      const text = (el.textContent || '').trim();
      if (/^ADICIONE( O PILOTO| O LÍDER)?$/.test(text) || text === 'ADICIONE') el.textContent = 'AGUARDANDO DADOS';
      if (/^EDITE MANUALMENTE/.test(text)) el.textContent = 'AUTOMÁTICO';
    });
  }

  function init() {
    cleanLegacyPlaceholders();
    let state = getState();
    updateLegacyHud(state);
    renderBase(state);
    if (state === 'finished') loadF1Historical();
    if (state === 'upcoming') loadF1Standings();

    setInterval(() => {
      const nextState = getState();
      if (nextState !== state) {
        state = nextState;
        updateLegacyHud(state);
        renderBase(state);
        if (state === 'finished') loadF1Historical();
        if (state === 'upcoming') loadF1Standings();
      } else {
        updateLegacyHud(state);
        tick(state);
      }
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
