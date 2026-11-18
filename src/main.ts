import { elemento } from "./dom";
import { listarPartidas } from "./api";
import type { Partida } from "./tipos";
import type { Modalidade, NovaPartida } from "./tipos";
import { adicionarPartida } from "./servicos";
import { fazerLogin, cadastrarUsuario, criarPartida,alterarStatus,excluirPartida } from "./api";
import { salvarToken, obterToken, sair } from "./auth";

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

    const botaoStatus = document.createElement("button");

botaoStatus.textContent =
    partida.status === "finalizada" ? "Reabrir" : "Finalizar";

botaoStatus.addEventListener("click", async () => {
    const novoStatus =
        partida.status === "finalizada" ? "agendada" : "finalizada";

    try {
        await alterarStatus(partida.id, novoStatus);
        partidas = await listarPartidas();
        desenhar();
    } catch (erro) {
        alert(erro instanceof Error ? erro.message : "Erro ao alterar status.");
    }
});

card.appendChild(botaoStatus);

const botaoExcluir = document.createElement("button");
botaoExcluir.textContent = "Excluir";

botaoExcluir.addEventListener("click", async () => {
    if (!confirm("Deseja realmente excluir esta partida?")) {
        return;
    }

    try {
        await excluirPartida(partida.id);
        partidas = await listarPartidas();
        desenhar();
    } catch (erro) {
        alert(erro instanceof Error ? erro.message : "Erro ao excluir.");
    }
});

card.appendChild(botaoExcluir);

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

formulario?.addEventListener("submit", async (evento) => {
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
    await criarPartida(dados);
partidas = await listarPartidas();
desenhar();

    elemento("erro").textContent = "";
} catch (erro) {
    if (erro instanceof Error) {
        elemento("erro").textContent = erro.message;
    }
}
});

function atualizarTela(logado: boolean): void {
    const areaAuth = elemento("area-autenticacao");
    const areaUsuario = elemento("area-usuario");

    areaAuth.hidden = logado;
    areaUsuario.hidden = !logado;

    const formularioPartida = elemento("formulario");
    formularioPartida.hidden = !logado;

    if (!logado) {
        partidas = [];
        desenhar();
    }
}

elemento("form-login").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = (elemento("login-email") as HTMLInputElement).value;
    const senha = (elemento("login-senha") as HTMLInputElement).value;

    try {
        const resposta = await fazerLogin(email, senha);

        salvarToken(resposta.token);

        elemento("nome-usuario").textContent = resposta.usuario.nome;
        elemento("erro-auth").textContent = "";

        partidas = await listarPartidas();
        atualizarTela(true);
        desenhar();

    } catch (erro) {
        elemento("erro-auth").textContent =
            erro instanceof Error ? erro.message : "Erro ao entrar.";
    }
});

elemento("botao-sair").addEventListener("click", () => {
    sair();
    elemento("nome-usuario").textContent = "";
    atualizarTela(false);
});

elemento("form-cadastro").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = (elemento("cadastro-nome") as HTMLInputElement).value;
    const email = (elemento("cadastro-email") as HTMLInputElement).value;
    const senha = (elemento("cadastro-senha") as HTMLInputElement).value;

    try {
        await cadastrarUsuario(nome, email, senha);

        elemento("erro-auth").textContent =
            "Conta criada com sucesso! Agora faça login.";

        (elemento("form-cadastro") as HTMLFormElement).reset();

    } catch (erro) {
        elemento("erro-auth").textContent =
            erro instanceof Error ? erro.message : "Erro ao cadastrar.";
    }
});

async function iniciar(): Promise<void> {
    atualizarTela(false);

    if (!obterToken()) {
        return;
    }

    try {
        partidas = await listarPartidas();
        desenhar();
        atualizarTela(true);
    } catch {
        sair();
        atualizarTela(false);
    }
}

iniciar();