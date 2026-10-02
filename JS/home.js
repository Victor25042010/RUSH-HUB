import { loadCalendar } from "./api.js";

const grid = document.querySelector("#calendarGrid");
const state = document.querySelector("#dataState");
const season = Number(new URLSearchParams(location.search).get("year") || 2026);

function statusOf(race) {
  if (race.status === "CANCELLED") return ["CANCELADA",""];
  if (!race.date) return ["AGENDADA",""];
  const t = new Date(race.date).getTime(), now = Date.now();
  if (t > now && t - now < 7 * 864e5) return ["PRÓXIMA","next"];
  if (t <= now) return ["FINALIZADA","done"];
  return ["AGENDADA",""];
}
function card(race) {
  const [label, cls] = statusOf(race);
  const d = race.date ? new Date(race.date).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}) : "—";
  return `<a class="race-card" href="corridas/index.html?round=${encodeURIComponent(race.round)}&year=${season}">
    <span class="race-round">ROUND ${String(race.round).padStart(2,"0")}</span><span class="status ${cls}">${label}</span>
    <h3>${escapeHtml(race.name)}</h3><p>${escapeHtml(race.circuit)} · ${d}</p>
  </a>`;
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

(async()=>{
  document.querySelector("#seasonLabel").textContent=season;
  try{
    const data=await loadCalendar(season);
    grid.innerHTML=data.races.map(card).join("");
    state.textContent=`Dados atualizados ${data.updatedAt ? new Date(data.updatedAt).toLocaleString("pt-BR") : "recentemente"}`;
    document.querySelector("#updatedAt").textContent=`Atualização: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString("pt-BR") : "—"}`;
  }catch(e){
    grid.innerHTML=`<div class="panel">Não foi possível atualizar os dados agora. O calendário local continuará disponível quando houver uma cópia confiável.</div>`;
    state.textContent="Fonte indisponível";
  }
  document.querySelector("#driversPreview").innerHTML='<div class="row"><small>—</small><span>Dados disponíveis após atualização do campeonato</span><strong>—</strong></div>';
  document.querySelector("#teamsPreview").innerHTML='<div class="row"><small>—</small><span>Dados disponíveis após atualização do campeonato</span><strong>—</strong></div>';
})();

window.addEventListener("scroll",()=>document.querySelector("#topBtn").style.display=scrollY>500?"block":"none");
document.querySelector("#topBtn").onclick=()=>scrollTo({top:0,behavior:"smooth"});
let p=0; const bar=document.querySelector("#loaderBar"); const timer=setInterval(()=>{p=Math.min(100,p+8);bar.style.width=p+"%";if(p===100){clearInterval(timer);setTimeout(()=>document.querySelector("#loader").classList.add("hide"),180)}},45);