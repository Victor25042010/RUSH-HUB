const racesContainer = document.getElementById("races");
const statusElement = document.getElementById("status");
const refreshButton = document.getElementById("refresh");

const filters = document.querySelectorAll(".filter");

let races = [];
let currentFilter = "TODAS";


async function loadRaces() {

    statusElement.textContent =
        "Atualizando calendário...";

    try {

        const response = await fetch(
            `data/index.json?t=${Date.now()}`
        );

        if (!response.ok) {
            throw new Error("Arquivo de dados não encontrado");
        }

        const data = await response.json();

        races = data.races || [];

        render();

        const updated = data.updatedAt
            ? new Date(data.updatedAt).toLocaleString("pt-BR")
            : "desconhecido";

        statusElement.textContent =
            `Última atualização: ${updated}`;

    } catch (error) {

        console.error(error);

        statusElement.textContent =
            "Não foi possível carregar o calendário.";

        racesContainer.innerHTML = `
            <div class="empty">
                <h3>Calendário sendo preparado</h3>
                <p>
                    O GitHub Actions ainda não gerou
                    os dados. Aguarde a primeira atualização.
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
                race.category.toUpperCase() === currentFilter
        );

    }

    if (!filtered.length) {

        racesContainer.innerHTML = `
            <div class="empty">
                Nenhuma corrida encontrada
                para esta categoria.
            </div>
        `;

        return;
    }


    racesContainer.innerHTML = filtered
        .map(race => createRaceCard(race))
        .join("");
}


function createRaceCard(race) {

    let transmission = "";

    if (race.transmissionUrl) {

        transmission = `
            <a
                class="watch"
                href="${race.transmissionUrl}"
                target="_blank"
                rel="noopener"
            >
                ▶ Assistir transmissão
            </a>
        `;

    } else {

        transmission = `
            <a
                class="watch"
                href="${race.searchUrl}"
                target="_blank"
                rel="noopener"
            >
                🔎 Procurar transmissão
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


            <div class="source">

                Calendário:
                ${escapeHTML(race.source || "Fonte oficial")}

            </div>


            ${transmission}


            ${
                race.calendarUrl
                ? `
                    <a
                        class="calendar-link"
                        href="${race.calendarUrl}"
                        target="_blank"
                        rel="noopener"
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
