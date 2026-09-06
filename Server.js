const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));


// ==========================================
// CONFIGURAÇÕES
// ==========================================

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;


// ==========================================
// FONTES
// ==========================================

const sources = {
    f1: "https://www.espn.com.br/f1/calendario",

    wec: "https://motorsport.uol.com.br/wec/schedule/2026/",

    stock: "https://motorsport.uol.com.br/stockcar-br/schedule/2026/"
};


// ==========================================
// CACHE
// ==========================================

let cache = {
    data: null,
    updatedAt: null
};


// ==========================================
// UTILIDADE
// ==========================================

function cleanText(text) {

    return text
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================
// F1
// ==========================================

async function getF1() {

    try {

        const response = await axios.get(sources.f1, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(response.data);

        const races = [];

        $("table tbody tr").each((index, element) => {

            const columns = $(element)
                .find("td")
                .map((i, el) => cleanText($(el).text()))
                .get();

            if (columns.length >= 2) {

                races.push({

                    category: "F1",

                    name: columns[1] || "Grande Prêmio",

                    date: columns[0] || "",

                    source: "ESPN",

                    transmission: "Globo"

                });

            }

        });

        return races;

    } catch (error) {

        console.error("Erro F1:", error.message);

        return [];

    }

}


// ==========================================
// WEC
// ==========================================

async function getWEC() {

    try {

        const response = await axios.get(sources.wec, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(response.data);

        const races = [];

        $("table tbody tr").each((index, element) => {

            const columns = $(element)
                .find("td")
                .map((i, el) => cleanText($(el).text()))
                .get();

            if (columns.length >= 2) {

                races.push({

                    category: "WEC",

                    name: columns[1] || "Etapa WEC",

                    date: columns[0] || "",

                    source: "Motorsport.com",

                    transmission: "YouTube",

                    preferredChannel: "Grande Prêmio"

                });

            }

        });

        return races;

    } catch (error) {

        console.error("Erro WEC:", error.message);

        return [];

    }

}


// ==========================================
// STOCK CAR
// ==========================================

async function getStockCar() {

    try {

        const response = await axios.get(sources.stock, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(response.data);

        const races = [];

        $("table tbody tr").each((index, element) => {

            const columns = $(element)
                .find("td")
                .map((i, el) => cleanText($(el).text()))
                .get();

            if (columns.length >= 2) {

                races.push({

                    category: "STOCK CAR",

                    name: columns[1] || "Etapa Stock Car",

                    date: columns[0] || "",

                    source: "Motorsport.com",

                    transmission: "YouTube",

                    preferredChannel: "Stock Car"

                });

            }

        });

        return races;

    } catch (error) {

        console.error("Erro Stock Car:", error.message);

        return [];

    }

}


// ==========================================
// YOUTUBE
// ==========================================

async function searchYouTube(query) {

    if (!YOUTUBE_API_KEY) {

        return null;

    }

    try {

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {

                    part: "snippet",

                    q: query,

                    type: "video",

                    maxResults: 5,

                    key: YOUTUBE_API_KEY

                }
            }
        );


        const videos = response.data.items || [];


        if (!videos.length) {

            return null;

        }


        return {

            title: videos[0].snippet.title,

            channel: videos[0].snippet.channelTitle,

            url:
                `https://www.youtube.com/watch?v=${videos[0].id.videoId}`

        };

    } catch (error) {

        console.error(
            "Erro YouTube:",
            error.response?.data || error.message
        );

        return null;

    }

}


// ==========================================
// ENCONTRAR TRANSMISSÃO
// ==========================================

async function findTransmission(race) {

    if (race.category === "F1") {

        return {

            platform: "Globo",

            url: null,

            searchAvailable: false

        };

    }


    if (race.category === "WEC") {

        const result = await searchYouTube(
            `${race.name} WEC 2026 Grande Prêmio`
        );

        if (result) {

            return {

                platform: "YouTube",

                channel: result.channel,

                url: result.url,

                title: result.title

            };

        }

    }


    if (race.category === "STOCK CAR") {

        const result = await searchYouTube(
            `${race.name} Stock Car Brasil 2026`
        );

        if (result) {

            return {

                platform: "YouTube",

                channel: result.channel,

                url: result.url,

                title: result.title

            };

        }

    }


    return {

        platform: "YouTube",

        url: null,

        searchAvailable: false

    };

}


// ==========================================
// API PRINCIPAL
// ==========================================

app.get("/api/races", async (req, res) => {

    try {

        const [f1, wec, stock] = await Promise.all([

            getF1(),

            getWEC(),

            getStockCar()

        ]);


        let races = [

            ...f1,

            ...wec,

            ...stock

        ];


        // Procura transmissões
        // somente para os primeiros eventos
        // para não gastar API desnecessariamente.

        for (let i = 0; i < Math.min(races.length, 10); i++) {

            races[i].transmissionData =
                await findTransmission(races[i]);

        }


        cache = {

            data: races,

            updatedAt: new Date().toISOString()

        };


        res.json({

            success: true,

            updatedAt: cache.updatedAt,

            races

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            error: "Não foi possível atualizar o calendário."

        });

    }

});


// ==========================================
// STATUS
// ==========================================

app.get("/api/status", (req, res) => {

    res.json({

        online: true,

        lastUpdate: cache.updatedAt

    });

});


// ==========================================
// SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `RaceHub rodando na porta ${PORT}`
    );

});
