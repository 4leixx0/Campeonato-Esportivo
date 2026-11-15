import "dotenv/config";
import express from "express";
import type { RowDataPacket } from "mysql2";
import { banco } from "./banco";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API do Campeonato Esportivo funcionando!");
});

app.get("/api/partidas", async (_req, res) => {
    try {
        const [linhas] = await banco.execute<RowDataPacket[]>(`
            SELECT
                p.id,
                p.modalidade,
                p.status,
                p.data,
                GROUP_CONCAT(t.nome ORDER BY pt.time_id SEPARATOR ' | ') AS times
            FROM partidas p
            LEFT JOIN partida_time pt ON pt.partida_id = p.id
            LEFT JOIN times t ON t.id = pt.time_id
            GROUP BY p.id, p.modalidade, p.status, p.data
            ORDER BY p.id
        `);

        res.json(linhas);
    } catch (erro) {
        console.error("Erro ao buscar partidas:", erro);
        res.status(500).json({ erro: "Erro ao consultar o banco de dados." });
    }
});

app.get("/api/partidas/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erro: "ID inválido." });
        return;
    }

    try {
        const [linhas] = await banco.execute<RowDataPacket[]>(`
            SELECT
                p.id,
                p.modalidade,
                p.status,
                p.data,
                GROUP_CONCAT(t.nome ORDER BY pt.time_id SEPARATOR ' | ') AS times
            FROM partidas p
            LEFT JOIN partida_time pt ON pt.partida_id = p.id
            LEFT JOIN times t ON t.id = pt.time_id
            WHERE p.id = ?
            GROUP BY p.id, p.modalidade, p.status, p.data
        `, [id]);

        if (linhas.length === 0) {
            res.status(404).json({ erro: "Partida não encontrada." });
            return;
        }

        res.json(linhas[0]);
    } catch (erro) {
        console.error("Erro ao buscar partida:", erro);
        res.status(500).json({ erro: "Erro ao consultar o banco." });
    }
});

app.listen(3000, () => {
    console.log("API rodando em http://localhost:3000");
});