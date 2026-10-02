import { loadOpenF1Championship } from "./api.js";
const tbody=document.querySelector("#standings");
const teamsPage=location.pathname.includes("equipes");
(async()=>{
 try{
  const data=await loadOpenF1Championship("latest");
  const rows=teamsPage?data.teams.map(x=>({pos:x.position_current,name:x.team_name,points:x.points_current,wins:"—"})):data.drivers.map(x=>({pos:x.position_current,name:`Piloto #${x.driver_number}`,team:"—",points:x.points_current,wins:"—"}));
  rows.sort((a,b)=>(a.pos??999)-(b.pos??999));
  tbody.innerHTML=rows.map(r=>`<tr><td>${r.pos??"—"}</td><td>${r.name}</td>${teamsPage?"":`<td>${r.team}</td>`}<td>${r.points??"—"}</td><td>${r.wins??"—"}</td></tr>`).join("");
 }catch(e){tbody.innerHTML='<tr><td colspan="5">Classificação indisponível nesta fonte no momento.</td></tr>'}
})();
const top=document.querySelector("#topBtn");addEventListener("scroll",()=>top.style.display=scrollY>500?"block":"none");top.onclick=()=>scrollTo({top:0,behavior:"smooth"});