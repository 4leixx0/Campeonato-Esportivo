import type { Partida, NovaPartida } from "./tipos";
import { obterToken } from "./auth";

type PartidaAPI = Omit<Partida, "times" | "data"> & {
    times: string | null;
    data: string;
};

export async function listarPartidas(): Promise<Partida[]> {
    const token = obterToken();

    const resposta = await fetch("/api/partidas", {
        headers: {
            Authorization: `Bearer ${token ?? ""}`
        }
    });

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
export interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export interface RespostaLogin {
    token: string;
    usuario: Usuario;
}

export async function fazerLogin(
    email: string,
    senha: string
): Promise<RespostaLogin> {
    const resposta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    if (!resposta.ok) {
        throw new Error("E-mail ou senha inválidos.");
    }

    return resposta.json();
}

export async function cadastrarUsuario(
    nome: string,
    email: string,
    senha: string
): Promise<Usuario> {
    const resposta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
    });

    if (!resposta.ok) {
        throw new Error("Não foi possível cadastrar o usuário.");
    }

    return resposta.json();
}

export async function criarPartida(
    dados: NovaPartida
): Promise<Partida> {
    const token = obterToken();

    const resposta = await fetch("/api/partidas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`
        },
        body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
        throw new Error("Não foi possível cadastrar a partida.");
    }

    const partida = await resposta.json();

    return {
        ...partida,
        data: new Date(partida.data)
    };
}

export async function alterarStatus(
    id: number,
    status: Partida["status"]
): Promise<void> {
    const resposta = await fetch(`/api/partidas/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${obterToken() ?? ""}`
        },
        body: JSON.stringify({ status })
    });

    if (!resposta.ok) {
        throw new Error("Não foi possível alterar o status.");
    }
}

export async function excluirPartida(id: number): Promise<void> {
    const resposta = await fetch(`/api/partidas/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${obterToken() ?? ""}`
        }
    });

    if (!resposta.ok) {
        throw new Error("Não foi possível excluir a partida.");
    }
}