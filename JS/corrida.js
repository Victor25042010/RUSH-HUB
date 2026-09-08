/*
    RUSHHUB — PAINEL DE CORRIDA
    Tudo aqui é MANUAL. Não usa JSON nem banco de dados.

    Para uma corrida por VOLTAS:
        raceType = "laps"
        currentLap = 48
        totalLaps = 57

    Para uma corrida por TEMPO:
        raceType = "time"
        endTime = "2026-09-08T16:30:00-03:00"

    Para corrida encerrada:
        raceStatus = "finished"
        finishedTime = "1:58:22.909"
*/

const raceStatus = "finished"; // "upcoming", "live", "finished"
const raceType = "laps";        // "laps" ou "time"

const currentLap = 58;
const totalLaps = 58;

const endTime = "2026-09-08T16:30:00-03:00";
const finishedTime = "1:24:00.893";

function pad(value) {
    return String(value).padStart(2, "0");
}

function updateRaceHud() {
    const status = document.getElementById("raceStatus");
    const mode = document.getElementById("raceMode");
    const counter = document.getElementById("raceCounter");
    const progress = document.getElementById("progressBar");

    if (!status || !mode || !counter) return;

    if (raceStatus === "live") {
        status.innerHTML = '<span class="live-dot"></span> AO VIVO';

        if (raceType === "laps") {
            mode.textContent = "VOLTA";
            counter.textContent = `${currentLap} / ${totalLaps}`;
            if (progress) progress.style.width = `${Math.min((currentLap / totalLaps) * 100, 100)}%`;
        } else {
            mode.textContent = "TEMPO RESTANTE";

            function tick() {
                const remaining = Math.max(0, new Date(endTime).getTime() - Date.now());
                const totalSeconds = Math.floor(remaining / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                counter.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

                if (progress) {
                    const total = Math.max(1, new Date(endTime).getTime() - (Date.now() - 3600000));
                    progress.style.width = `${Math.max(0, Math.min(100, (1 - remaining / total) * 100))}%`;
                }
            }

            tick();
            setInterval(tick, 1000);
        }
    }

    if (raceStatus === "upcoming") {
        status.textContent = "PRÓXIMA";
        mode.textContent = "INÍCIO";
        counter.textContent = "AGUARDANDO";
        if (progress) progress.style.width = "0%";
    }

    if (raceStatus === "finished") {
        status.textContent = "ENCERRADA";
        mode.textContent = "TEMPO TOTAL";
        counter.textContent = finishedTime;
        if (progress) progress.style.width = "100%";
    }
}

document.addEventListener("DOMContentLoaded", updateRaceHud);
