import "dotenv/config";
import mysql from "mysql2/promise";

export const banco = mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORTA ?? 3306),
    user: process.env.DB_USUARIO ?? "root",
    password: process.env.DB_SENHA ?? "",
    database: process.env.DB_NOME ?? "campeonato_esportivo"
});