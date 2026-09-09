/* RUSHHUB V5 — Race Command Center */
(() => {
  const slug = document.body.dataset.race;
  const race = window.RUSH_RACES?.[slug];
  if (!race) return;

  const cat = race.category;
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtTime = d => new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d);
  const status = () => {
    if (race.cancelled) return 'cancelled';
    const s = new Date(race.start).getTime(), e = s + Number(race.durationHours || 1)*3600000, n=Date.now();
    return n < s ? 'upcoming' : n < e ? 'live' : 'finished';
  };

  const builtIns = {
    f1:{name:'TV Globo / Globoplay — F1',url:'https://globoplay.globo.com/',type:'tv-digital'},
    f2:{name:'F1 TV — F2 (pago)',url:'https://f1tv.formula1.com/',type:'paid'},
    wec:{name:'YouTube oficial FIA WEC — corrida/GP',url:'https://www.youtube.com/@FIAWEC/search?query=2026',type:'youtube'},
    formulae:{name:'YouTube oficial Formula E — corrida',url:'https://www.youtube.com/@FIAFormulaE/search?query=2026',type:'youtube'},
    stockcar:{name:'YouTube oficial Stock Car — corrida',url:'https://www.youtube.com/@StockCarBRB/search?query=2026',type:'youtube'},
    porschecup:{name:'YouTube oficial Porsche Cup Brasil — corrida',url:'https://www.youtube.com/@PorscheCupBrasil/search?query=2026',type:'youtube'}
  };

  function getCustom(){
    try { return JSON.parse(localStorage.getItem('RUSHHUB_TRANSMISSIONS') || '{}'); } catch { return {}; }
  }
  function getTransmission(){
    const all=getCustom();
    return all[slug] || builtIns[cat] || null;
  }

  function addStyles(){
    if(document.getElementById('rh-command-style')) return;
    const s=document.createElement('style'); s.id='rh-command-style'; s.textContent=`
      .rh-command{margin-top:18px}.rh-command-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px}.rh-cmd-box{border:1px solid #242424;background:linear-gradient(145deg,#101010,#080808);border-radius:7px;overflow:hidden}.rh-cmd-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #202020}.rh-cmd-head b{font-size:11px;letter-spacing:1.2px}.rh-cmd-head small{font-size:8px;color:#666;letter-spacing:1px}.rh-cmd-body{padding:16px}.rh-transmission{display:flex;align-items:center;gap:14px;min-height:82px}.rh-live-dot{width:10px;height:10px;border-radius:50%;background:#e11;box-shadow:0 0 0 5px #e1122a22;animation:rhPulse 1.3s infinite}.rh-live-dot.off{background:#555;box-shadow:none;animation:none}.rh-transmission b{font-size:13px;display:block}.rh-transmission span{display:block;color:#777;font-size:9px;margin-top:4px}.rh-transmission a{display:inline-flex;margin-top:10px;background:#fff;color:#000!important;text-decoration:none;padding:9px 12px;border-radius:3px;font-size:8px;font-weight:900;letter-spacing:1px}.rh-driver-day{display:flex;align-items:center;justify-content:space-between;gap:15px}.rh-driver-day .driver-number{font-size:48px;font-weight:950;line-height:1;color:#202020}.rh-driver-day strong{font-size:16px}.rh-driver-day small{display:block;color:#777;font-size:8px;letter-spacing:1px;margin-top:4px}.rh-winner{position:relative;margin-top:18px;overflow:hidden;border:1px solid #2a2a2a;background:radial-gradient(circle at 75% 25%,#2b173a,#0a0a0a 55%);min-height:135px}.rh-winner::before{content:'RACE WINNER';position:absolute;right:-2px;top:14px;font-size:44px;font-weight:950;color:#fff;opacity:.035}.rh-winner-inner{position:relative;padding:20px}.rh-winner .tag{font-size:8px;color:#aaa;letter-spacing:1.8px}.rh-winner h3{font-size:25px;margin:8px 0 3px}.rh-winner p{font-size:9px;color:#777;margin:0}.rh-confetti{position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden}.rh-confetti i{position:absolute;top:-20px;width:7px;height:13px;background:#fff;animation:rhFall 1.8s linear forwards}.rh-hud-line{display:flex;gap:7px;flex-wrap:wrap}.rh-chip{padding:7px 9px;border:1px solid #282828;background:#0b0b0b;color:#aaa;font-size:8px;letter-spacing:1px}.rh-chip strong{color:#fff}.rh-onboard-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rh-onboard-btn{border:1px solid #292929;background:#0b0b0b;color:#fff;padding:12px;text-align:left;cursor:pointer}.rh-onboard-btn:hover{background:#161616}.rh-onboard-btn strong{display:block;font-size:10px}.rh-onboard-btn span{display:block;color:#666;font-size:8px;margin-top:4px}.rh-modal{position:fixed;inset:0;background:#000c;display:none;align-items:center;justify-content:center;z-index:9998;padding:20px}.rh-modal.open{display:flex}.rh-modal-card{width:min(980px,100%);background:#0a0a0a;border:1px solid #333;border-radius:7px;overflow:hidden}.rh-modal-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #222}.rh-modal-head strong{font-size:11px}.rh-modal-head button{background:none;border:0;color:#fff;font-size:24px;cursor:pointer}.rh-modal-body{aspect-ratio:16/9}.rh-modal-body iframe{width:100%;height:100%;border:0}.rh-modal-note{padding:12px 16px;color:#777;font-size:9px}.rh-admin-link{font-size:8px;color:#666;text-decoration:none}.rh-admin-link:hover{color:#fff}@keyframes rhPulse{50%{opacity:.35;transform:scale(.75)}}@keyframes rhFall{to{transform:translateY(110vh) rotate(600deg);opacity:0}}@media(max-width:800px){.rh-command-grid{grid-template-columns:1fr}.rh-onboard-list{grid-template-columns:1fr 1fr}}@media(max-width:520px){.rh-onboard-list{grid-template-columns:1fr}}
    `; document.head.appendChild(s);
  }

  function getWinner(){
    const podium=document.querySelector('.podium.p1 strong');
    return podium?.textContent?.trim() || null;
  }
  function getWinnerTeam(){
    const podium=document.querySelector('.podium.p1 small');
    return podium?.textContent?.trim() || '';
  }
  function getCustomRace(){
    try { return (JSON.parse(localStorage.getItem('RUSHHUB_TRANSMISSIONS') || '{}'))[slug] || {}; } catch { return {}; }
  }
  function getDrivers(){
    const out=[];
    document.querySelectorAll('.podium strong').forEach(x=>{const n=x.textContent.trim();if(n&&!out.includes(n))out.push(n)});
    const catalog=(window.RUSHHUB_ONBOARDS?.[cat]||[]).map(x=>x.driver).filter(Boolean);
    catalog.forEach(n=>{if(!out.includes(n))out.push(n)});
    return out.slice(0,6);
  }
  function getDriverTeam(driver){
    const known={
      'Kimi Antonelli':'Mercedes','George Russell':'Mercedes','Lewis Hamilton':'Ferrari',
      'Lando Norris':'McLaren','Charles Leclerc':'Ferrari','Max Verstappen':'Red Bull Racing',
      'Oscar Piastri':'McLaren','Isack Hadjar':'Red Bull Racing','Liam Lawson':'Racing Bulls',
      'Pierre Gasly':'Alpine','Arvid Lindblad':'Racing Bulls','Franco Colapinto':'Alpine',
      'Oliver Bearman':'Haas F1 Team','Gabriel Bortoleto':'Audi','Nico Hulkenberg':'Audi',
      'Carlos Sainz':'Williams','Alexander Albon':'Williams','Esteban Ocon':'Haas F1 Team',
      'Fernando Alonso':'Aston Martin','Yuki Tsunoda':'Racing Bulls','Lance Stroll':'Aston Martin',
      'Valtteri Bottas':'Cadillac','Sergio Perez':'Cadillac'
    };
    if(known[driver]) return known[driver];
    const item=(window.RUSHHUB_ONBOARDS?.[cat]||[]).find(x=>x.driver===driver);
    if(item?.team) return item.team;
    const standings=window.RUSH_V7?.standings?.[cat]||[];
    const hit=standings.find(x=>String(x[1]).trim()===String(driver).trim());
    if(hit?.[2]) return hit[2];
    const rows=window.RUSH_V7?.raceResults?.[slug]||[];
    for(const r of rows){
      if(String(r[1]).includes(driver)) return r[2]||'';
      if(String(r[2]).includes(driver)) return r[1]||'';
    }
    return '';
  }
  function teamChannel(team){
    const map=window.RUSHHUB_TEAM_CHANNELS||{};
    if(map[team]) return map[team];
    const key=Object.keys(map).find(k=>team && (team.includes(k)||k.includes(team)));
    return key?map[key]:null;
  }
  function onboardUrl(driver){
    const item=(window.RUSHHUB_ONBOARDS?.[cat]||[]).find(x=>x.driver===driver);
    if(item?.url) return item.url;
    const team=getDriverTeam(driver);
    const channel=teamChannel(team);
    const q=encodeURIComponent(`${driver} onboard ${race.name.replace(/^.*?·\s*/,'')}`);
    return channel ? `${channel}/search?query=${q}` : `https://www.youtube.com/results?search_query=${q}`;
  }
  function onboardLabel(driver){
    const team=getDriverTeam(driver);
    return team ? `CANAL ${team}` : 'CANAL OFICIAL';
  }
  function render(){
    addStyles();
    const main=document.querySelector('.rh-main'); if(!main || document.getElementById('rh-command')) return;
    const s=status(), t=getTransmission(), custom=getCustomRace(), winner=getWinner(), winnerTeam=getWinnerTeam(), drivers=getDrivers();
    const dayDriver=custom.driverOfDay || winner;
    const wrap=document.createElement('section'); wrap.id='rh-command'; wrap.className='rh-command';
    const driverDay=dayDriver || 'A definir';
    const onboardAllowed=cat!=='f2';
    const onboardHtml=onboardAllowed ? `<div class="rh-cmd-box"><div class="rh-cmd-head"><b>ONBOARD CONTROL</b><small>CLIQUE NO PILOTO</small></div><div class="rh-cmd-body"><div class="rh-onboard-list">${(drivers.length?drivers:['Piloto da etapa']).map((d,i)=>`<button class="rh-onboard-btn" data-driver="${esc(d)}"><strong>${esc(d)}</strong><span>${esc(onboardLabel(d))} · ABRIR ↗</span></button>`).join('')}</div></div></div>` : '';
    wrap.innerHTML=`<div class="rh-command-grid"><div class="rh-cmd-box"><div class="rh-cmd-head"><b>RACE COMMAND</b><small>${s==='live'?'● AO VIVO':s==='finished'?'✓ ENCERRADA':'◷ PRÓXIMA'}</small></div><div class="rh-cmd-body"><div class="rh-transmission"><span class="rh-live-dot ${s==='live'?'':'off'}"></span><div><b>${esc(t?.name || 'Transmissão não configurada')}</b><span>${s==='live'?'A corrida está acontecendo agora.':s==='upcoming'?'A transmissão será ativada quando a sessão começar.':'Transmissão oficial / replay disponível conforme o fornecedor.'}</span>${t?.url?`<a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">${s==='live'?'ASSISTIR AGORA ↗':'ABRIR TRANSMISSÃO ↗'}</a>`:''}</div></div></div></div><div class="rh-cmd-box"><div class="rh-cmd-head"><b>PILOTO DO DIA</b><small>AUTOMÁTICO</small></div><div class="rh-cmd-body"><div class="rh-driver-day"><div><strong>${esc(driverDay)}</strong><small>${custom.driverOfDay?'DESTAQUE DEFINIDO NO PAINEL':'AUTOMÁTICO PELO RESULTADO'}</small></div><div class="driver-number">01</div></div></div></div></div>${winner && s==='finished' ? `<div class="rh-winner"><div class="rh-winner-inner"><span class="tag">🏆 VENCEDOR DA ETAPA</span><h3>${esc(winner)}</h3><p>${esc(winnerTeam || 'Resultado final')} · O RushHub destacou o vencedor automaticamente.</p></div></div>` : ''}${onboardHtml}<div class="rh-hud-line" style="margin-top:12px"><span class="rh-chip">STATUS <strong>${s.toUpperCase()}</strong></span><span class="rh-chip">CATEGORIA <strong>${esc(cat.toUpperCase())}</strong></span><span class="rh-chip">HORA <strong id="rh-clock">${fmtTime(new Date())}</strong></span><a class="rh-chip rh-admin-link" href="../admin-transmissoes.html">⚙ PAINEL DE TRANSMISSÕES</a></div>`;
    main.appendChild(wrap);

    const clock=document.getElementById('rh-clock'); setInterval(()=>{if(clock)clock.textContent=fmtTime(new Date())},1000);
    wrap.querySelectorAll('.rh-onboard-btn').forEach(btn=>btn.addEventListener('click',()=>openOnboard(btn.dataset.driver)));
    if(winner && s==='finished' && cat==='f1') launchConfetti();
  }
  function openOnboard(driver){
    const item=(window.RUSHHUB_ONBOARDS?.[cat]||[]).find(x=>x.driver===driver);
    const target=onboardUrl(driver);
    const exact=!!item?.url;
    const team=getDriverTeam(driver);
    const channel=teamChannel(team);
    const modal=document.createElement('div'); modal.className='rh-modal open'; modal.innerHTML=`<div class="rh-modal-card"><div class="rh-modal-head"><strong>ONBOARD · ${esc(driver)}</strong><button aria-label="Fechar">×</button></div><div class="rh-modal-body">${exact?`<iframe src="https://www.youtube.com/embed/${encodeURIComponent(target.split('v=')[1]?.split('&')[0]||'')}" title="Onboard ${esc(driver)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`:`<div style="height:100%;display:grid;place-items:center;text-align:center;padding:30px;background:radial-gradient(circle,#191919,#070707)"><div><div style="font-size:40px">🎥</div><h3 style="margin:10px 0">Onboard oficial · ${esc(team||'Equipe')}</h3><p style="color:#777;font-size:11px;max-width:460px">A busca foi direcionada para o canal da própria equipe${team?' '+esc(team):''}. Quando a equipe publicar a onboard, ela aparecerá ali.</p><a href="${esc(target)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#fff;color:#000;padding:11px 14px;text-decoration:none;border-radius:4px;font-size:9px;font-weight:900">ABRIR CANAL DA EQUIPE ↗</a></div></div>`}</div><div class="rh-modal-note">Fonte: ${esc(channel||'canal oficial da equipe')}. Somente fontes oficiais/autorizadas.</div></div>`;
    document.body.appendChild(modal); const close=()=>modal.remove(); modal.querySelector('button').onclick=close; modal.onclick=e=>{if(e.target===modal)close()};
  }
  function launchConfetti(){
    if(sessionStorage.getItem('RH_WIN_CONFETTI_'+slug)) return; sessionStorage.setItem('RH_WIN_CONFETTI_'+slug,'1');
    const c=document.createElement('div'); c.className='rh-confetti'; for(let i=0;i<70;i++){const x=document.createElement('i');x.style.left=Math.random()*100+'%';x.style.animationDelay=(Math.random()*.8)+'s';x.style.transform=`rotate(${Math.random()*360}deg)`;c.appendChild(x)} document.body.appendChild(c);setTimeout(()=>c.remove(),2500);
  }
  render();
})();
