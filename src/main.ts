import { elemento } from "./dom";
import { listarPartidas } from "./api";
import type { Partida } from "./tipos";
import type { Modalidade, NovaPartida } from "./tipos";
import { adicionarPartida } from "./servicos";

let partidas: Partida[] = [];

console.log(partidas);

const lista = elemento("lista-partidas");

function desenhar(): void {
    lista?.replaceChildren();

for (const partida of partidas) {

    const card = document.createElement("article");
    card.className = "card-partida";
    if (partida.status === "finalizada") {
    card.classList.add("finalizada");}

    if (partida.status === "em andamento") {
    card.classList.add("em-andamento"); }

    const modalidadeTexto = document.createElement("h2");
    modalidadeTexto.textContent = partida.modalidade;
    card.appendChild(modalidadeTexto);

    const dataTexto = document.createElement("p");
    dataTexto.textContent = "Data: " + partida.data.toLocaleString("pt-BR");
    card.appendChild(dataTexto);
    

    const timesTexto = document.createElement("p");
    timesTexto.textContent = partida.times.join(" x ");
    card.appendChild(timesTexto);

    const statusTexto = document.createElement("p");
    statusTexto.textContent = partida.status;
    card.appendChild(statusTexto);

    lista?.appendChild(card);
}


const totalElemento = document.getElementById("total-partidas");

if (totalElemento) {
    totalElemento.textContent = String(partidas.length);
}

let pendentes = 0;

for (const partida of partidas) {
    if (partida.status !== "finalizada") {
        pendentes++;
    }
}

const pendentesElemento = document.getElementById("partidas-pendentes");

if (pendentesElemento) {
    pendentesElemento.textContent = String(pendentes);
}
}

const formulario = document.getElementById("formulario");

formulario?.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const time1 = document.getElementById("time1") as HTMLInputElement;
    const time2 = document.getElementById("time2") as HTMLInputElement;
    const data = document.getElementById("data") as HTMLInputElement;
    const modalidade = document.getElementById("modalidade") as HTMLSelectElement;

    console.log(time1.value);
    console.log(time2.value);
    console.log(data.value);
    console.log(modalidade.value);

    const dados: NovaPartida = {
    modalidade: modalidade.value as Modalidade,
    times: [time1.value.trim(), time2.value.trim()],
    data: new Date(data.value)
};
try {
    adicionarPartida(partidas, dados);
    desenhar();

    elemento("erro").textContent = "";
} catch (erro) {
    if (erro instanceof Error) {
        elemento("erro").textContent = erro.message;
    }
}
});
async function iniciar(): Promise<void> {
    try {
        partidas = await listarPartidas();
        desenhar();
    } catch (erro) {
        console.error("Erro ao carregar partidas:", erro);
        elemento("erro").textContent = "Não foi possível carregar as partidas.";
    }
}

iniciar();