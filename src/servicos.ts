import type { Partida, NovaPartida } from "./tipos";

function gerarId(lista: Partida[]): number {
    let maior = 0;

    for (const partida of lista) {
        if (partida.id > maior) {
            maior = partida.id;
        }
    }

    return maior + 1;
}

export function adicionarPartida(
    lista: Partida[],
    dados: NovaPartida
): Partida {
    const [time1, time2] = dados.times;

if (!time1?.trim() || !time2?.trim()) {
    throw new Error("Informe os dois times.");
}

if (time1.trim().toLowerCase() === time2.trim().toLowerCase()) {
    throw new Error("Os times devem ser diferentes.");
}

if (time1.trim().length < 3 || time2.trim().length < 3) {
    throw new Error("Os nomes dos times devem ter pelo menos 3 caracteres.");
}

if (Number.isNaN(dados.data.getTime())) {
    throw new Error("Informe uma data válida.");
}

const novaPartida: Partida = {
    ...dados,
    id: gerarId(lista),
    status: "agendada"
};
lista.push(novaPartida);
return novaPartida;

}