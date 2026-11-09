import { partidas } from "./dados";

console.log(partidas);

const lista = document.getElementById("lista-partidas");

for (const partida of partidas) {

    const card = document.createElement("article");
    card.className = "card-partida";
    if (partida.status === "finalizada") {
    card.classList.add("finalizada");}

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