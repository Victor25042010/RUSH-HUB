
/* RushHub — race pages v3. The HTML already contains the stable layout; this script only updates live/future state. */
(() => {
 const slug=document.body.dataset.race; const race=window.RUSH_RACES?.[slug]; if(!race)return;
 const start=new Date(race.start).getTime(), end=start+Number(race.durationHours||1)*3600000;
 const status=document.querySelector('.status-pill'); if(!status)return;
 function tick(){const now=Date.now();let s=race.cancelled?'CANCELADA':now<start?'EM BREVE':now<end?'AO VIVO':'ENCERRADA';status.textContent=s;status.className='status-pill '+s.toLowerCase().replace(' ','-');}
 tick(); setInterval(tick,1000);
})();
