let allRaces = [];


// ======================================
// CARREGAR CORRIDAS
// ======================================

async function loadRaces() {

    const container =
        document.getElementById("races");


    container.innerHTML =
        `<div class="loading">
            Atualizando calendário...
        </div>`;


    try {

        const response =
            await fetch("/api/races");


        const data =
            await response.json();


        if (!data.success) {

            throw new Error();

        }


        allRaces = data.races;


        renderRaces(allRaces);


    } catch (error) {

        container.innerHTML = `

            <div class="loading">

                Não foi possível atualizar
                o calendário.

            </div>

        `;

    }

}


// ======================================
// MOSTRAR CORRIDAS
// ======================================

function renderRaces(races) {

    const container =
        document.getElementById("races");


    if (!races.length) {

        container.innerHTML =
            `<div class="loading">
                Nenhuma corrida encontrada.
            </div>`;

        return;

    }


    container.innerHTML = "";


    races.forEach(race => {

        const transmission =
            race.transmissionData;


        let button = "";


        if (
            transmission &&
            transmission.url
        ) {

            button = `

                <a
                    class="watch"
                    href="${transmission.url}"
                    target="_blank"
                >

                    ▶ Assistir transmissão

                </a>

            `;

        }

        else if (
            race.category === "F1"
        ) {

            button = `

                <a
                    class="watch"
                    href="https://globoplay.globo.com/"
                    target="_blank"
                >

                    ▶ Assistir na Globo

                </a>

            `;

        }

        else {

            button = `

                <a
                    class="watch disabled"
                    href="#"
                >

                    Transmissão ainda não encontrada

                </a>

            `;

        }


        const card = document.createElement("article");

        card.className =
            "race";


        card.dataset.category =
            race.category;


        card.innerHTML = `

            <div class="race-top">

                <span class="category">

                    ${race.category}

                </span>

                <span class="next">

                    PRÓXIMO EVENTO

                </span>

            </div>


            <h3>

                ${race.name}

            </h3>


            <p class="date">

                📅 ${race.date}

            </p>


            <div class="transmission">

                <p>

                    📺 TRANSMISSÃO:
                    ${
                        transmission?.channel ||
                        race.transmission
                    }

                </p>

                ${button}

            </div>

        `;


        container.appendChild(card);

    });

}


// ======================================
// FILTRO
// ======================================

function filter(category) {

    if (category === "ALL") {

        renderRaces(allRaces);

        return;

    }


    const filtered =
        allRaces.filter(
            race =>
                race.category === category
        );


    renderRaces(filtered);

}


// ======================================
// INICIAR
// ======================================

loadRaces();


// ======================================
// ATUALIZAÇÃO AUTOMÁTICA
// ======================================

// Atualiza a cada 30 minutos.

setInterval(
    loadRaces,
    30 * 60 * 1000
);
