import type { Partida } from "./tipos";

type PartidaAPI = Omit<Partida, "times" | "data"> & {
    times: string | null;
    data: string;
};

export async function listarPartidas(): Promise<Partida[]> {
    const resposta = await fetch("/api/partidas");

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as partidas.");
    }

    const bruto = (await resposta.json()) as PartidaAPI[];

    return bruto.map((partida) => ({
        ...partida,
        times: partida.times ? partida.times.split(" | ") : [],
        data: new Date(partida.data)
    }));
}