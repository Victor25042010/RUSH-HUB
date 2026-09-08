/* RUSHHUB — status automático dos calendários */
(() => {
  const races = window.RUSH_RACES || {};
  function stateOf(race) {
    if (race.cancelled) return 'cancelled';
    const start = new Date(race.start).getTime();
    const end = start + Number(race.durationHours || 1) * 3600000;
    const now = Date.now();
    if (now < start) return 'upcoming';
    if (now < end) return 'live';
    return 'finished';
  }
  function label(state) {
    return {upcoming:'EM BREVE',live:'AO VIVO',finished:'ENCERRADA',cancelled:'CANCELADA'}[state];
  }
  function run() {
    document.querySelectorAll('a[href*="../corridas/"]').forEach(card => {
      const href = card.getAttribute('href') || '';
      const slug = href.split('/').pop().replace(/\.html$/i,'');
      const race = races[slug];
      if (!race) return;
      const el = card.querySelector('.status');
      if (!el) return;
      const state = stateOf(race);
      el.className = `status ${state}`;
      el.textContent = label(state);
      card.dataset.raceState = state;
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    run();
    setInterval(run, 1000);
  });
})();
