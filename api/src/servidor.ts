import "dotenv/config";
import express from "express";
import type { RowDataPacket } from "mysql2";
import { banco } from "./banco";
import type { ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { autenticar } from "./autenticacao";
import type { RequisicaoAutenticada } from "./autenticacao";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("API do Campeonato Esportivo funcionando!");
});

app.get("/api/partidas", autenticar, async (req: RequisicaoAutenticada, res) => {
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
    WHERE p.usuario_id = ?
    GROUP BY p.id, p.modalidade, p.status, p.data
    ORDER BY p.id`,
    [req.usuarioId!]
);

        res.json(linhas);
    } catch (erro) {
        console.error("Erro ao buscar partidas:", erro);
        res.status(500).json({ erro: "Erro ao consultar o banco de dados." });
    }
});

app.get("/api/partidas/:id", autenticar, async (req: RequisicaoAutenticada, res) => {
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
            WHERE p.id = ? AND p.usuario_id = ?
            GROUP BY p.id, p.modalidade, p.status, p.data
        `, [id, req.usuarioId!]);

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

app.post("/api/partidas", autenticar, async (req: RequisicaoAutenticada, res) => {
    const { modalidade, times, data } = req.body;

   const modalidadesValidas = ["futebol", "futsal", "basquete", "volei"];

if (!modalidadesValidas.includes(modalidade)) {
    res.status(400).json({ erro: "Modalidade inválida." });
    return;
}

if (
    !Array.isArray(times) ||
    times.length !== 2 ||
    !times.every((time) => typeof time === "string" && time.trim().length >= 3)
) {
    res.status(400).json({ erro: "Informe dois times com pelo menos 3 caracteres." });
    return;
}

if (times[0].trim().toLowerCase() === times[1].trim().toLowerCase()) {
    res.status(400).json({ erro: "Os times devem ser diferentes." });
    return;
}

if (typeof data !== "string" || !data.trim() || Number.isNaN(new Date(data).getTime())) {
    res.status(400).json({ erro: "Data inválida." });
    return;
}

const conexao = await banco.getConnection();

try {
    await conexao.beginTransaction();

    const [resultado] = await conexao.execute<ResultSetHeader>(
    `INSERT INTO partidas (usuario_id, modalidade, status, data)
     VALUES (?, ?, 'agendada', ?)`,
    [req.usuarioId!, modalidade, new Date(data)]
);

    const partidaId = resultado.insertId;

    for (const nome of times) {
    const [resultadoTime] = await conexao.execute<ResultSetHeader>(
        `INSERT INTO times (nome, modalidade)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [nome.trim(), modalidade]
    );

    const timeId = resultadoTime.insertId;

    await conexao.execute(
        `INSERT INTO partida_time (partida_id, time_id)
         VALUES (?, ?)`,
        [partidaId, timeId]
    );
}

    await conexao.commit();

    res.status(201).json({
    id: partidaId,
    modalidade,
    status: "agendada",
    data,
    times: times.map((time: string) => time.trim())
});

} catch (erro) {
    await conexao.rollback();

    console.error("Erro ao cadastrar partida:", erro);

    res.status(500).json({
        erro: "Erro ao cadastrar partida."
    });

} finally {
    conexao.release();
}

});

app.post("/api/usuarios", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (
        typeof nome !== "string" ||
        nome.trim().length < 3 ||
        typeof email !== "string" ||
        !email.includes("@") ||
        typeof senha !== "string" ||
        senha.length < 8
    ) {
        res.status(400).json({
            erro: "Informe nome, e-mail e senha de pelo menos 8 caracteres."
        });
        return;
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        const [resultado] = await banco.execute<ResultSetHeader>(
            `INSERT INTO usuarios (nome, email, senha_hash)
             VALUES (?, ?, ?)`,
            [nome.trim(), email.trim().toLowerCase(), senhaHash]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome: nome.trim(),
            email: email.trim().toLowerCase()
        });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);

        res.status(500).json({
            erro: "Não foi possível cadastrar o usuário."
        });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, senha } = req.body;

    if (typeof email !== "string" || typeof senha !== "string") {
        res.status(400).json({ erro: "Informe e-mail e senha." });
        return;
    }

    try {
        const [usuarios] = await banco.execute<RowDataPacket[]>(
            "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        const usuario = usuarios[0];

        if (
            !usuario ||
            !usuario.senha_hash ||
            !(await bcrypt.compare(senha, usuario.senha_hash))
        ) {
            res.status(401).json({ erro: "E-mail ou senha inválidos." });
            return;
        }

        const segredo = process.env.JWT_SEGREDO;

        if (!segredo) {
            throw new Error("JWT_SEGREDO não configurado.");
        }

        const token = jwt.sign(
            { id: usuario.id },
            segredo,
            { expiresIn: "2h" }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ erro: "Erro ao realizar login." });
    }
});

app.patch("/api/partidas/:id/status", autenticar, async (req: RequisicaoAutenticada, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erro: "ID inválido." });
        return;
    }

    if (!["agendada", "em andamento", "finalizada"].includes(status)) {
        res.status(400).json({ erro: "Status inválido." });
        return;
    }

    try {
        const [resultado] = await banco.execute<ResultSetHeader>(
            `UPDATE partidas
             SET status = ?
             WHERE id = ? AND usuario_id = ?`,
            [status, id, req.usuarioId!]
        );

        if (resultado.affectedRows === 0) {
            res.status(404).json({ erro: "Partida não encontrada." });
            return;
        }

        res.json({ id, status });
    } catch (erro) {
        console.error("Erro ao alterar status:", erro);
        res.status(500).json({ erro: "Erro ao atualizar partida." });
    }
});

app.delete("/api/partidas/:id", autenticar, async (req: RequisicaoAutenticada, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erro: "ID inválido." });
        return;
    }

    try {
        const [resultado] = await banco.execute<ResultSetHeader>(
            `DELETE FROM partidas
             WHERE id = ? AND usuario_id = ?`,
            [id, req.usuarioId!]
        );

        if (resultado.affectedRows === 0) {
            res.status(404).json({ erro: "Partida não encontrada." });
            return;
        }

        res.status(204).send();
    } catch (erro) {
        console.error("Erro ao excluir partida:", erro);
        res.status(500).json({ erro: "Erro ao excluir partida." });
    }
});

app.listen(3000, () => {
    console.log("API rodando em http://localhost:3000");
});