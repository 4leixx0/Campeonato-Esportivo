export type StatusPartida = "agendada" | "em andamento" | "finalizada";

export type Modalidade = "futebol" | "basquete" | "volei" | "futsal";

export interface Partida {
    readonly id: number;
    status: StatusPartida;
    modalidade: Modalidade;
    times: string[];
    data: Date;
}

export type NovaPartida = Omit<Partida, "id" | "status">;