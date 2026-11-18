const CHAVE_TOKEN = "campeonato_token";

export function salvarToken(token: string): void {
    sessionStorage.setItem(CHAVE_TOKEN, token);
}

export function obterToken(): string | null {
    return sessionStorage.getItem(CHAVE_TOKEN);
}

export function sair(): void {
    sessionStorage.removeItem(CHAVE_TOKEN);
}