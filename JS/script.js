const races = [
    ["01","Austrália","Melbourne","FINALIZADA"],
    ["02","China","Shanghai","FINALIZADA"],
    ["03","Japão","Suzuka","FINALIZADA"],
    ["04","Miami","Miami","FINALIZADA"],
    ["05","Canadá","Montreal","FINALIZADA"],
    ["06","Mônaco","Monte Carlo","FINALIZADA"],
    ["07","Barcelona-Catalunya","Barcelona","FINALIZADA"],
    ["08","Áustria","Spielberg","FINALIZADA"],
    ["09","Grã-Bretanha","Silverstone","FINALIZADA"],
    ["10","Bélgica","Spa-Francorchamps","FINALIZADA"],
    ["11","Hungria","Budapeste","FINALIZADA"],
    ["12","Países Baixos","Zandvoort","FINALIZADA"],
    ["13","Itália","Monza","FINALIZADA"],
    ["14","Espanha","Madrid","FINALIZADA"],
    ["15","Azerbaijão","Baku","FINALIZADA"],
    ["16","Bahrein","—","EM ANDAMENTO"],
    ["17","Singapura","Marina Bay","PRÓXIMA"],
    ["18","Estados Unidos","Austin","FUTURA"],
    ["19","México","Cidade do México","FUTURA"],
    ["20","São Paulo","Interlagos","FUTURA"],
    ["21","Las Vegas","Las Vegas","FUTURA"],
    ["22","Qatar","Lusail","FUTURA"],
    ["23","Abu Dhabi","Yas Marina","FUTURA"]
];

const calendarGrid = document.getElementById("calendarGrid");
races.forEach(([round, name, circuit, state]) => {
    const card = document.createElement("a");
    card.href = state === "PRÓXIMA" || state === "EM ANDAMENTO" ? "corridas/gp.html" : "#";
    card.className = "race-card";
    const isNext = state === "PRÓXIMA";
    card.innerHTML = `
        <span class="race-round">${round}</span>
        <div><h3>GP ${name.toUpperCase()}</h3><p>${circuit}</p></div>
        <span class="race-state ${isNext ? "next" : ""}">${state}</span>
    `;
    calendarGrid.appendChild(card);
});

const raceDate = new Date("2026-10-11T20:00:00-03:00");

function updateCountdown() {
    const diff = raceDate - new Date();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    document.getElementById("days").textContent = String(d).padStart(2,"0");
    document.getElementById("hours").textContent = String(h).padStart(2,"0");
    document.getElementById("minutes").textContent = String(m).padStart(2,"0");
    document.getElementById("seconds").textContent = String(s).padStart(2,"0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

const loader = document.getElementById("loader");
const bar = document.getElementById("loaderBar");
let progress = 0;
const loading = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 4;
    if (progress >= 100) {
        progress = 100;
        clearInterval(loading);
        setTimeout(() => loader.classList.add("hidden"), 350);
    }
    bar.style.width = progress + "%";
}, 120);

const topbar = document.querySelector(".topbar");
const backTop = document.getElementById("backTop");
window.addEventListener("scroll", () => {
    topbar.classList.toggle("scrolled", window.scrollY > 30);
    backTop.classList.toggle("show", window.scrollY > 500);
});
backTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
