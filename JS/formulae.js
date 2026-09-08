const raceStatus="finished"; // upcoming | live | finished
const raceType="laps";           // laps | time
const currentLap=58,totalLaps=58;
const endTime="2026-09-08T16:30:00-03:00";
const finishedTime="1:24:00.893";
const pad=n=>String(n).padStart(2,"0");
document.addEventListener("DOMContentLoaded",()=>{
 const status=document.getElementById("status"),mode=document.getElementById("mode"),counter=document.getElementById("counter"),bar=document.getElementById("bar");
 if(!status)return;
 if(raceStatus==="live"){
   status.innerHTML='<span class="dot"></span>AO VIVO';
   if(raceType==="laps"){mode.textContent="VOLTA";counter.textContent=`${currentLap} / ${totalLaps}`;bar.style.width=Math.min(100,currentLap/totalLaps*100)+"%";}
   else{mode.textContent="TEMPO RESTANTE";const tick=()=>{let s=Math.max(0,Math.floor((new Date(endTime)-Date.now())/1000));counter.textContent=`${pad(Math.floor(s/3600))}:${pad(Math.floor(s%3600/60))}:${pad(s%60)}`};tick();setInterval(tick,1000);}
 }else if(raceStatus==="upcoming"){status.textContent="PRÓXIMA";mode.textContent="INÍCIO";counter.textContent="AGUARDANDO";}
 else{status.textContent="ENCERRADA";mode.textContent="TEMPO TOTAL";counter.textContent=finishedTime;bar.style.width="100%";}
});