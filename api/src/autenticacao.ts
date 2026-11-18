import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequisicaoAutenticada extends Request {
    usuarioId?: number;
}

export function autenticar(
    req: RequisicaoAutenticada,
    res: Response,
    next: NextFunction
): void {
    const autorizacao = req.headers.authorization;

    if (!autorizacao?.startsWith("Bearer ")) {
        res.status(401).json({ erro: "Token não informado." });
        return;
    }

    const token = autorizacao.slice(7);
    const segredo = process.env.JWT_SEGREDO;

    if (!segredo) {
        res.status(500).json({ erro: "Autenticação não configurada." });
        return;
    }

    try {
        const dados = jwt.verify(token, segredo);

        if (
            typeof dados === "string" ||
            typeof dados.id !== "number" ||
            !Number.isInteger(dados.id) ||
            dados.id <= 0
        ) {
            res.status(401).json({ erro: "Token inválido." });
            return;
        }

        req.usuarioId = dados.id;
        next();
    } catch {
        res.status(401).json({ erro: "Token inválido ou expirado." });
    }
}