(() => {
 const slug=document.body.dataset.race, race=window.RUSH_RACES?.[slug], v=window.RUSH_V6; if(!race||!v)return;
 const section=[...document.querySelectorAll('.video-section')][0]; if(!section)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const url=v.replay[race.category]||'#', label=v.labels[race.category]||'REPLAY OFICIAL';
 const h=section.querySelector('h2'); if(h)h.textContent='Replay';
 const small=section.querySelector('.card-head small'); if(small)small.textContent='CORRIDA COMPLETA / ARQUIVO OFICIAL';
 const old=section.querySelector('.video-mini,.official-card');
 const a=document.createElement('a'); a.className='v6-replay-card'; a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
 a.innerHTML=`<span class="v6-replay-play">▶</span><div><b>${esc(label)}</b><small>${esc(race.name)} · fonte oficial/autorizada</small></div><strong>ABRIR ↗</strong>`;
 if(old)old.replaceWith(a); else section.appendChild(a);
})();
