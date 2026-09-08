const video = document.getElementById("backgroundVideo");
const categoryName = document.getElementById("categoryName");
const progress = document.getElementById("indicatorProgress");

const clips = [
    {
        video: "assets/videos/f1.mp4",
        name: "FORMULA 1"
    },
    {
        video: "assets/videos/wec.mp4",
        name: "WEC"
    },
    {
        video: "assets/videos/stockcar.mp4",
        name: "STOCK CAR"
    },
    {
        video: "assets/videos/endurance.mp4",
        name: "ENDURANCE"
    }
];

let currentClip = 0;


/* --------------------------------
   CARREGA O PRIMEIRO VÍDEO
-------------------------------- */

function loadClip(index) {

    const clip = clips[index];

    video.style.opacity = "0";

    setTimeout(() => {

        video.src = clip.video;
        categoryName.textContent = clip.name;

        video.load();

        video.play().catch(() => {
            console.log("Autoplay bloqueado pelo navegador.");
        });

        video.style.opacity = "1";

    }, 500);
}


/* --------------------------------
   PRÓXIMO VÍDEO
-------------------------------- */

function nextClip() {

    currentClip++;

    if (currentClip >= clips.length) {
        currentClip = 0;
    }

    loadClip(currentClip);
}


/* --------------------------------
   QUANDO O VÍDEO TERMINAR
-------------------------------- */

video.addEventListener("ended", nextClip);


/* --------------------------------
   BARRA DE PROGRESSO
-------------------------------- */

function updateProgress() {

    if (video.duration && !isNaN(video.duration)) {

        const percentage =
            (video.currentTime / video.duration) * 100;

        progress.style.width = `${percentage}%`;
    }

    requestAnimationFrame(updateProgress);
}


/* --------------------------------
   INICIALIZAÇÃO
-------------------------------- */

loadClip(0);
updateProgress();
