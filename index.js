const racesContainer = document.getElementById("races");
const statusElement = document.getElementById("status");
const refreshButton = document.getElementById("refresh");

const filters = document.querySelectorAll(".filter");

let races = [];
let currentFilter = "TODAS";


async function loadRaces() {

    statusElement.textContent = "Carregando calendário...";

    try {

        const paths = [
            "./data/index.json",
            "data/index.json"
        ];

        let response = null;

        for (const path of paths) {

            try {

                const test = await fetch(
                    `${path}?t=${Date.now()}`,
                    {
                        cache: "no-store"
                    }
                );

                if (test.ok) {
                    response = test;
                    break;
                }

            } catch (e) {
                console.log("Tentativa falhou:", path);
            }
        }

        if (!response) {
            throw new Error("Não foi possível encontrar data/index.json");
        }

        const data = await response.json();

        races = Array.isArray(data.races)
            ? data.races
            : [];

        // Remove entradas inválidas
        races = races.filter(race =>
            race &&
            race.name &&
            race.name !== "Data" &&
            race.name !== "Evento"
        );

        render();

        if (data.updatedAt) {

            const date = new Date(data.updatedAt);

            statusElement.textContent =
                `Atualizado em ${date.toLocaleString("pt-BR")}`;

        } else {

            statusElement.textContent =
                `${races.length} eventos encontrados`;

        }

    } catch (error) {

        console.error("RaceHub:", error);

        statusElement.textContent =
            "Erro ao carregar o calendário.";

        racesContainer.innerHTML = `
            <div class="empty">

                <h3>Não foi possível carregar</h3>

                <p>
                    O calendário ainda não está disponível.
                </p>

            </div>
        `;
    }
}


function render() {

    let filtered = races;

    if (currentFilter !== "TODAS") {

        filtered = races.filter(
            race =>
                String(race.category || "").toUpperCase()
                === currentFilter
        );
    }


    if (!filtered.length) {

        racesContainer.innerHTML = `
            <div class="empty">
                Nenhuma corrida encontrada.
            </div>
        `;

        return;
    }


    racesContainer.innerHTML = filtered
        .map(createRaceCard)
        .join("");
}


function createRaceCard(race) {

    let transmission = "";

    if (race.transmissionUrl) {

        transmission = `
            <a
                class="watch"
                href="${escapeHTML(race.transmissionUrl)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ▶ Assistir transmissão
            </a>
        `;

    } else if (race.searchUrl) {

        transmission = `
            <a
                class="watch"
                href="${escapeHTML(race.searchUrl)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ▶ Procurar transmissão
            </a>
        `;
    }


    return `
        <article class="race">

            <div class="race-top">

                <span class="category">
                    ${escapeHTML(race.category)}
                </span>

                <span class="state">
                    ${escapeHTML(race.status || "PRÓXIMO")}
                </span>

            </div>

            <h3>
                ${escapeHTML(race.name)}
            </h3>

            <p class="date">
                📅 ${escapeHTML(race.date || "Data não informada")}
            </p>

            ${
                race.source
                ? `
                    <div class="source">
                        Calendário: ${escapeHTML(race.source)}
                    </div>
                `
                : ""
            }

            ${transmission}

            ${
                race.calendarUrl
                ? `
                    <a
                        class="calendar-link"
                        href="${escapeHTML(race.calendarUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver calendário da fonte →
                    </a>
                `
                : ""
            }

        </article>
    `;
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


filters.forEach(button => {

    button.addEventListener("click", () => {

        filters.forEach(
            b => b.classList.remove("active")
        );

        button.classList.add("active");

        currentFilter =
            button.dataset.filter;

        render();
    });

});


refreshButton.addEventListener(
    "click",
    loadRaces
);


loadRaces();
