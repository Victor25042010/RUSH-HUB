/* RUSHHUB — corrida automática: estado, classificação, Race Control e cores por equipe */
(() => {
  const races = window.RUSH_RACES || {};
  const slug = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  const race = races[slug];
  if (!race) return;
  const F1 = window.RUSH_F1 || null;
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const start = new Date(race.start);
  const end = new Date(start.getTime() + Number(race.durationHours || 1) * 3600000);
  let session = null, liveTimer = null;

  function state() {
    if (race.cancelled) return 'cancelled';
    const now = Date.now();
    if (now < start) return 'upcoming';
    if (now < end) return 'live';
    return 'finished';
  }
  function duration(ms) {
    const t=Math.max(0,Math.floor(ms/1000)),d=Math.floor(t/86400),h=Math.floor(t%86400/3600),m=Math.floor(t%3600/60),s=t%60;
    return d ? `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function label(s){return {upcoming:'PRÓXIMA',live:'AO VIVO',finished:'ENCERRADA',cancelled:'CANCELADA'}[s];}
  function teamColor(team){ return F1?.teams?.[team] || '#888'; }

  function updateHud(s){
    const status=$('#raceStatus')||$('#status'), mode=$('#raceMode')||$('#mode'), counter=$('#raceCounter')||$('#counter'), bar=$('#progressBar')||$('#bar');
    if(status){status.className=s;status.innerHTML=s==='live'?'<span class="dot live-dot"></span> AO VIVO':label(s);}
    if(mode&&counter){
      if(s==='upcoming'){mode.textContent='COMEÇA EM';counter.textContent=duration(start-Date.now());}
      else if(s==='live'){mode.textContent=race.raceType==='laps'&&race.totalLaps?'VOLTA':'TEMPO RESTANTE';counter.textContent=race.raceType==='laps'&&race.totalLaps?`— / ${race.totalLaps}`:duration(end-Date.now());}
      else {mode.textContent='EVENTO';counter.textContent=s==='cancelled'?'CANCELADO':'FINALIZADO';}
    }
    if(bar){const pct=s==='upcoming'?0:s==='finished'||s==='cancelled'?100:(Date.now()-start)/(end-start)*100;bar.style.width=`${Math.max(0,Math.min(100,pct))}%`;}
  }

  function autoPanel(s){
    let p=$('#rush-auto-panel'); if(!p){p=document.createElement('section');p.id='rush-auto-panel';p.className='rush-auto-panel';$('main')?.prepend(p);}
    p.innerHTML=`<div class="rush-auto-head"><div><span class="rush-auto-kicker">RUSHHUB AUTOMÁTICO</span><h2>${label(s)}</h2></div><span class="rush-auto-badge ${s}">${s==='live'?'LIVE':s.toUpperCase()}</span></div><div class="rush-auto-grid"><div><small>EVENTO</small><strong>${esc(race.name)}</strong></div><div><small>STATUS</small><strong id="rushAutoCounter">${s==='upcoming'?duration(start-Date.now()):s==='live'?duration(end-Date.now()):s==='finished'?'FINALIZADO':'CANCELADO'}</strong></div><div><small>INÍCIO</small><strong>${start.toLocaleString('pt-BR')}</strong></div><div><small>FONTE</small><strong>${race.category==='f1'?'OpenF1 + F1 2026':'RushHub'}</strong></div></div><div id="rush-data-area" class="rush-results-area"><strong>${s==='live'?'Race Control':s==='finished'?'Classificação final':'Campeonato'}</strong><span>Carregando dados...</span></div>`;
  }

  async function getJSON(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}
  async function findSession(){
    if(race.category!=='f1') return null;
    const sessions=await getJSON('https://api.openf1.org/v1/sessions?year=2026&session_name=Race');
    return sessions.filter(x=>!x.is_cancelled&&x.date_start).sort((a,b)=>Math.abs(new Date(a.date_start)-start)-Math.abs(new Date(b.date_start)-start))[0]||null;
  }
  function driverMap(drivers){return Object.fromEntries(drivers.map(d=>[d.driver_number,d]));}
  function resultRows(results, drivers){
    const map=driverMap(drivers), ordered=results.filter(x=>x.position!=null).sort((a,b)=>a.position-b.position);
    return ordered.map(r=>{const d=map[r.driver_number]||{};const team=d.team_name||'Equipe';const gap=r.position===1?'LÍDER':typeof r.gap_to_leader==='number'?`+${r.gap_to_leader.toFixed(3)}s`:r.gap_to_leader||'—';const flags=[r.dnf?'DNF':'',r.dns?'DNS':'',r.dsq?'DSQ':''].filter(Boolean).join(' · ');return `<div class="rush-result-row team-row" style="--team-color:${teamColor(team)}"><i class="team-color"></i><b>${String(r.position).padStart(2,'0')}</b><span><strong>${esc(d.full_name||`CARRO ${r.driver_number}`)}</strong><small>${esc(team)}</small></span><strong>${esc(flags||gap)}</strong><span>${r.number_of_laps??'—'} voltas</span></div>`;}).join('');
  }
  async function loadFinished(){
    const area=$('#rush-data-area'); if(!area||race.category!=='f1')return;
    try{session=await findSession();if(!session)throw 0;const [results,drivers,events]=await Promise.all([getJSON(`https://api.openf1.org/v1/session_result?session_key=${session.session_key}`),getJSON(`https://api.openf1.org/v1/drivers?session_key=${session.session_key}`),getJSON(`https://api.openf1.org/v1/race_control?session_key=${session.session_key}`)]);area.innerHTML=`<div class="rush-result-head"><strong>CLASSIFICAÇÃO FINAL</strong><span>${esc(session.circuit_short_name||'F1 2026')}</span></div><div class="rush-result-list">${resultRows(results,drivers)}</div><div class="rush-events"><strong>RACE CONTROL</strong>${events.slice(-18).reverse().map(e=>`<div><b>${esc(e.date?new Date(e.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'')}</b><span>${esc(e.category||'EVENTO')} · ${esc(e.message||'')}</span></div>`).join('')}</div>`;paintLegacy(results,drivers);}
    catch(e){area.innerHTML='<strong>Dados históricos</strong><span>Não foi possível consultar a fonte agora. O RushHub não inventa classificação.</span>';}
  }
  async function loadStandings(){
    const area=$('#rush-data-area');if(!area)return;
    if(race.category!=='f1'||!F1)return;
    area.innerHTML=`<div class="rush-result-head"><strong>CLASSIFICAÇÃO DO CAMPEONATO</strong><span>APÓS ITÁLIA</span></div><div class="rush-result-list">${F1.drivers.map(d=>`<div class="rush-result-row team-row" style="--team-color:${teamColor(d.team)}"><i class="team-color"></i><b>${String(d.pos).padStart(2,'0')}</b><span><strong>${esc(d.name)}</strong><small>${esc(d.team)}</small></span><strong>${d.points} pts</strong><span>#${d.number}</span></div>`).join('')}</div>`;
  }
  async function loadLive(){
    const area=$('#rush-data-area');if(!area||race.category!=='f1')return;
    try{session=await findSession();if(!session)throw 0;const [pos,drivers,pits,events]=await Promise.all([getJSON(`https://api.openf1.org/v1/position?session_key=${session.session_key}`),getJSON(`https://api.openf1.org/v1/drivers?session_key=${session.session_key}`),getJSON(`https://api.openf1.org/v1/pit?session_key=${session.session_key}`),getJSON(`https://api.openf1.org/v1/race_control?session_key=${session.session_key}`)]);const map=driverMap(drivers), latest={};pos.forEach(x=>{latest[x.driver_number]=x});const pitSet=new Set(pits.filter(x=>x.date&&Date.now()-new Date(x.date).getTime()<90000).map(x=>x.driver_number));const rows=Object.values(latest).sort((a,b)=>a.position-b.position).map(x=>{const d=map[x.driver_number]||{},team=d.team_name||'Equipe',inPit=pitSet.has(x.driver_number);return `<div class="rush-result-row team-row" style="--team-color:${teamColor(team)}"><i class="team-color"></i><b>${String(x.position).padStart(2,'0')}</b><span><strong>${esc(d.full_name||x.driver_number)}</strong><small>${esc(team)} · ${inPit?'PIT LANE':'PISTA'}</small></span><strong>${inPit?'PIT STOP':'ON TRACK'}</strong><span>ao vivo</span></div>`;}).join('');area.innerHTML=`<div class="rush-result-head"><strong>RACE CONTROL · AO VIVO</strong><span>OpenF1</span></div><div class="rush-result-list">${rows}</div><div class="rush-events"><strong>ÚLTIMOS EVENTOS</strong>${events.slice(-10).reverse().map(e=>`<div><b>${esc(e.date?new Date(e.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'')}</b><span>${esc(e.message||e.category||'Evento')}</span></div>`).join('')}</div>`;paintLegacyLive(latest,map,pitSet);}
    catch(e){area.innerHTML='<strong>Race Control</strong><span>A telemetria ao vivo desta fonte não está disponível neste momento. A página continua automática e não exibe dados inventados.</span>';}
  }
  function paintLegacy(results,drivers){
    const map=driverMap(drivers);const rows=results.filter(x=>x.position!=null).sort((a,b)=>a.position-b.position).slice(0,10);const grid=$('.result-grid');
    if(grid)grid.innerHTML=`<div class="muted">POS</div><div class="muted">PILOTO / EQUIPE</div><div class="muted">TEMPO / GAP</div><div class="muted">VOLTA</div>`+rows.map(r=>{const d=map[r.driver_number]||{},team=d.team_name||'Equipe',gap=r.position===1?'LÍDER':r.gap_to_leader!=null?`+${Number(r.gap_to_leader).toFixed(3)}s`:'—';return `<div>${String(r.position).padStart(2,'0')}</div><div class="team-cell" style="--team-color:${teamColor(team)}"><i></i><b>${esc(d.full_name||'—')}</b><br><span class="muted">${esc(team)}</span></div><div>${esc(gap)}</div><div>${r.number_of_laps??'—'}</div>`}).join('');
    const podium=$('.podium');if(podium)podium.innerHTML=rows.slice(0,3).map(r=>{const d=map[r.driver_number]||{},team=d.team_name||'Equipe';return `<div class="podium-card" style="--team-color:${teamColor(team)}"><b>${r.position}º</b><strong>${esc(d.full_name||'—')}</strong><small>${esc(team)}</small></div>`}).join('');
  }
  function paintLegacyLive(latest,map,pits){const grid=$('.positions');if(!grid)return;grid.innerHTML=Object.values(latest).sort((a,b)=>a.position-b.position).slice(0,10).map(x=>{const d=map[x.driver_number]||{},team=d.team_name||'Equipe',pit=pits.has(x.driver_number);return `<div class="driver team-row" style="--team-color:${teamColor(team)}"><i class="team-color"></i><span class="pos">${String(x.position).padStart(2,'0')}</span><div class="driver-name">${esc(d.full_name||x.driver_number)}<span class="team">${esc(team)} · ${pit?'PIT LANE':'PISTA'}</span></div><span class="gap">${pit?'PIT STOP':'AO VIVO'}</span><span class="lap">—</span></div>`}).join('');}
  function init(){const s=state();updateHud(s);autoPanel(s);if(s==='finished')loadFinished();else if(s==='upcoming')loadStandings();else if(s==='live'){loadLive();liveTimer=setInterval(loadLive,5000);}setInterval(()=>{const now=state();updateHud(now);const c=$('#rushAutoCounter');if(c)c.textContent=now==='upcoming'?duration(start-Date.now()):now==='live'?duration(end-Date.now()):now==='finished'?'FINALIZADO':'CANCELADO';},1000);}
  document.addEventListener('DOMContentLoaded',init);
})();
