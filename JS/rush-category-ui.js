/* RUSHHUB — camada automática comum às categorias não-F1.
   Replica o fluxo visual da F1 sem inventar telemetria ou resultados.
   Quando a categoria não oferece API pública estável, abre a fonte oficial.
*/
(() => {
  const file = location.pathname.split('/').pop().replace('.html','');
  const map = {
    f2: {name:'Fórmula 2', key:'f2', source:'https://www.fiaformula2.com/', results:'https://www.fiaformula2.com/', team:'FIA Formula 2'},
    wec: {name:'FIA WEC', key:'wec', source:'https://www.fiawec.com/', results:'https://www.fiawec.com/en/season/2026', team:'FIA WEC'},
    stockcar: {name:'Stock Car', key:'stockcar', source:'https://www.stockcar.com.br/', results:'https://www.stockcar.com.br/', team:'Stock Car BRB'},
    porschecup: {name:'Porsche Cup Brasil', key:'porschecup', source:'https://www.porschegt3cup.com.br/', results:'https://www.porschegt3cup.com.br/', team:'Porsche Cup Brasil'},
    formulae: {name:'Fórmula E', key:'formulae', source:'https://www.fiaformulae.com/', results:'https://www.fiaformulae.com/en/standings', team:'FIA Formula E'}
  };
  const cat = map[file] || Object.values(map).find(x => file.startsWith(x.key+'-'));
  if (!cat || !window.RUSH_RACES) return;

  const raceId = file.startsWith(cat.key+'-') ? file : null;
  const race = raceId ? window.RUSH_RACES[raceId] : null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getState = r => {
    if (!r) return 'calendar';
    if (r.cancelled) return 'cancelled';
    const start = new Date(r.start).getTime(), end = start + Number(r.durationHours || 1) * 3600000, now = Date.now();
    return now < start ? 'upcoming' : now < end ? 'live' : 'finished';
  };
  const label = s => ({calendar:'CAMPEONATO',upcoming:'EM BREVE',live:'AO VIVO',finished:'ENCERRADA',cancelled:'CANCELADA'})[s];
  const fmt = ms => {
    ms = Math.max(0, ms); const sec = Math.floor(ms/1000), d=Math.floor(sec/86400), h=Math.floor(sec%86400/3600), m=Math.floor(sec%3600/60), s=sec%60;
    return d ? `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  function officialUrl(year, mode='results') {
    if (cat.key === 'wec') return year === 2026 ? cat.results : `https://www.fiawec.com/en/season/${year}`;
    if (cat.key === 'f2') return cat.results;
    return cat.results;
  }

  function addCalendarPanel() {
    if (document.querySelector('.rush-category-panel')) return;
    const main = document.querySelector('main'); if (!main) return;
    const races = Object.entries(window.RUSH_RACES).filter(([id,r]) => r.category === cat.key);
    const finished = races.filter(([,r])=>getState(r)==='finished').length;
    const upcoming = races.filter(([,r])=>getState(r)==='upcoming').length;
    const live = races.filter(([,r])=>getState(r)==='live').length;
    const sec = document.createElement('section'); sec.className='rush-category-panel';
    sec.innerHTML = `<div class="rush-category-head"><div><span>RUSHHUB / ${esc(cat.name)}</span><h2>Classificação & controle</h2></div><a href="${cat.results}" target="_blank" rel="noopener">FONTE OFICIAL ↗</a></div>
      <div class="rush-category-grid">
        <div><small>ETAPAS</small><strong>${races.length}</strong></div>
        <div><small>ENCERRADAS</small><strong>${finished}</strong></div>
        <div><small>EM BREVE</small><strong>${upcoming}</strong></div>
        <div><small>AO VIVO</small><strong>${live}</strong></div>
      </div>
      <div class="rush-category-note">A estrutura agora funciona como a F1: calendário, status automático, mídia oficial, classificação, Race Control e acesso à fonte oficial. Para não inventar posições ou pontos, os dados competitivos vêm da categoria oficial.</div>`;
    main.prepend(sec);
  }

  function addRacePanel() {
    if (!race || document.querySelector('.rush-category-race-panel')) return;
    const main = document.querySelector('main'); if (!main) return;
    const state = getState(race), start = new Date(race.start).getTime(), end = start + Number(race.durationHours || 1)*3600000;
    const sec = document.createElement('section'); sec.className='rush-category-race-panel';
    sec.innerHTML = `<div class="rush-category-head"><div><span>RUSHHUB AUTOMÁTICO · ${esc(cat.name)}</span><h2>${esc(label(state))}</h2></div><span class="rush-category-badge ${state}">${state==='live'?'LIVE':state.toUpperCase()}</span></div>
      <div class="rush-category-grid">
        <div><small>EVENTO</small><strong>${esc(race.name)}</strong></div>
        <div><small id="rcMode">STATUS</small><strong id="rcCounter">${state==='upcoming'?fmt(start-Date.now()):state==='live'?fmt(end-Date.now()):state==='finished'?'FINALIZADO':'CANCELADO'}</strong></div>
        <div><small>INÍCIO</small><strong>${new Date(race.start).toLocaleString('pt-BR')}</strong></div>
        <div><small>FONTE</small><strong>${esc(cat.team)}</strong></div>
      </div>
      <div class="rush-category-control"><div class="rush-category-control-head"><strong>${state==='live'?'RACE CONTROL · AO VIVO':state==='finished'?'CLASSIFICAÇÃO FINAL':state==='upcoming'?'CAMPEONATO':'EVENTO'}</strong><span>${esc(cat.name)}</span></div>
        <p>${state==='live'?'Acompanhe o controle oficial da etapa em tempo real.':state==='finished'?'O resultado oficial desta etapa está disponível na fonte da categoria.':state==='upcoming'?'A classificação e as informações do campeonato ficam na fonte oficial.':'Esta etapa foi cancelada.'}</p>
        ${state!=='cancelled'?`<a class="rush-category-button" href="${officialUrl(2026,state==='finished'?'results':'source')}" target="_blank" rel="noopener">ABRIR ${state==='live'?'LIVE':state==='finished'?'RESULTADO':'CAMPEONATO'} OFICIAL ↗</a>`:''}
      </div>`;
    main.prepend(sec);
    const counter = sec.querySelector('#rcCounter');
    if (counter && (state==='upcoming'||state==='live')) setInterval(()=>{const s=getState(race); counter.textContent=s==='upcoming'?fmt(start-Date.now()):s==='live'?fmt(end-Date.now()):s==='finished'?'FINALIZADO':'CANCELADO';},1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('rush-enhanced-category');
    if (race) addRacePanel(); else addCalendarPanel();
  });
})();
