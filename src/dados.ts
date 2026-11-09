import type { Partida } from "./tipos";

export const partidas: Partida[] = [
    {
        id: 1,
        status: "agendada",
        modalidade: "futebol",
        times: ["Santos", "Vasco"],
        data: new Date("2026-11-15T16:00:00")
    },

    {
        id: 2,
        status: "finalizada",
        modalidade: "futsal",
        times: ["Cruzeiro", "Atletico-MG"],
        data: new Date("2026-11-07T17:00:00")
    },

    {
        id: 3,
        status: "agendada",
        modalidade: "volei",
        times: ["Barueri", "Flamengo"],
        data: new Date("2026-12-02T14:00:00")
    },

    {
        id: 4,
        status: "em andamento",
        modalidade: "basquete",
        times: ["Chicago Bulls", "Boston Celtics"],
        data: new Date("2026-11-17T21:00:00")
    },

    {
        id: 5,
        status: "em andamento",
        modalidade: "futebol",
        times: ["Internacional", "Gremio"],
        data: new Date("2026-11-17T20:00:00")
    },

    {
        id: 6,
        status: "agendada",
        modalidade: "basquete",
        times: ["Lakers", "Warriors"],
        data: new Date("2026-12-10T22:00:00")
    }
]