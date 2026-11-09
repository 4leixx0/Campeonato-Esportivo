export function elemento(id: string): HTMLElement {
    const encontrado = document.getElementById(id);

    if (!encontrado) {
        throw new Error(`Elemento não encontrado: ${id}`);
    }

    return encontrado;
}