import { loadRace, loadCalendar } from "./api.js";
const params=new URLSearchParams(location.search), year=Number(params.get("year")||2026), round=params.get("round")||1;
const hero=document.querySelector("#raceHero");
function e(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function slug(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}
(async()=>{
 try{
  const r=await loadRace(round,year);
  if(!r) throw new Error("Corrida não encontrada");
  const date=r.date?new Date(r.date).toLocaleString("pt-BR",{dateStyle:"full",timeStyle:"short"}):"Data não disponível";
  const status=r.status==="CANCELLED"?"CANCELADA":(r.date&&new Date(r.date)<new Date()?"FINALIZADA":"AGENDADA");
  hero.innerHTML=`<span class="race-kicker">ROUND ${String(r.round).padStart(2,"0")} · ${year}</span><h1>${e(r.name)}</h1><div class="race-info"><span>${e(r.circuit)}</span><span>${date}</span><span>${status}</span></div>`;
  const map=document.querySelector("#circuitMap"); map.src=`../assets/circuits/${slug(r.circuitId||r.circuit)}/layout.svg`; map.onerror=()=>map.src="../assets/circuits/_placeholder/layout.svg";
  document.querySelector("#circuitMeta").innerHTML=`<div class="circuit-meta"><strong>${e(r.circuit)}</strong><br>Mapa associado automaticamente ao circuito.<br>Traçado detalhado será mantido na pasta de assets e versionado separadamente.</div>`;
  document.querySelector("#raceTable").innerHTML='<tr><td colspan="9">Resultado detalhado ainda não está disponível no arquivo local desta etapa. Nenhum dado foi inventado.</td></tr>';
 }catch(err){hero.innerHTML=`<span class="race-kicker">RUSH HUB</span><h1>Dados indisponíveis</h1><p class="muted">Não foi possível carregar esta corrida agora.</p>`}
})();
window.addEventListener("scroll",()=>document.querySelector("#topBtn").style.display=scrollY>500?"block":"none");
document.querySelector("#topBtn").onclick=()=>scrollTo({top:0,behavior:"smooth"});