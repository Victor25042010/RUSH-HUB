
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const loadJSON=async p=>{const r=await fetch(p);if(!r.ok)throw Error(p);return r.json()};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function header(){const h=$('.header');if(h) addEventListener('scroll',()=>h.classList.toggle('scrolled',scrollY>20));}
function renderCalendar(data,limit=null){
 const box=$('#calendarList'); if(!box)return;
 const races=limit?data.races.slice(0,limit):data.races;
 box.innerHTML=races.map(r=>`<a class="race" href="../corridas/index.html?round=${r.round}">
 <div class="rnum">${esc(r.round)}</div><div><h3>${esc(r.country)}</h3><div class="city">${esc(r.city)} · ${esc(r.circuit)}</div></div>
 <div class="date"><strong>${esc(r.date)}</strong><div class="status ${r.status==='PRÓXIMA'?'next':r.status==='FINALIZADA'?'done':''}">${esc(r.status)}</div></div></a>`).join('');
}
function renderTables(data){
 const d=$('#driversTable'),t=$('#teamsTable'); if(d)d.innerHTML=data.drivers.map((x,i)=>`<div class="row"><span class="pos">${x[0]}</span><span class="driver">${esc(x[1])}<small class="team">${esc(x[3])}</small></span><b class="points">${esc(x[4])}</b></div>`).join('');
 if(t)t.innerHTML=data.teams.map(x=>`<div class="row"><span class="pos">${x[0]}</span><span class="driver">${esc(x[1])}</span><b class="points">${esc(x[2])}</b></div>`).join('');
}
async function boot(){
 header();
 const loader=$('.loader'); setTimeout(()=>loader?.classList.add('hide'),700);
 try{
  const cal=await loadJSON(location.pathname.includes('/calendario/')?'../data/calendar.json':'data/calendar.json');
  renderCalendar(cal,$('#calendarList')?.dataset.limit?+$('#calendarList').dataset.limit:null);
  const st=await loadJSON(location.pathname.includes('/campeonatos/')?'../data/standings.json':'data/standings.json'); renderTables(st);
  const next=cal.races.find(r=>r.status==='PRÓXIMA');
  if(next){$('#nextCountry')&&( $('#nextCountry').textContent=next.country);$('#nextCity')&&( $('#nextCity').textContent=next.city);$('#nextDate')&&( $('#nextDate').textContent=next.date);$('#nextRound')&&( $('#nextRound').textContent=next.round);}
 }catch(e){console.error(e); $$('.dynamic-error').forEach(x=>x.textContent='Não foi possível carregar os dados agora.');}
}
boot();
