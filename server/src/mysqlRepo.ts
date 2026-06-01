import mysql from "mysql2/promise";
import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { seed } from "./db.js";
import type { Repo } from "./repo.js";
import { TINTS } from "./repo.js";
import type { Entrega, Motorista, Rota } from "./types.js";

const cfg = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "cheetahlog",
};

function mapRota(r: RowDataPacket): Rota {
  return { id: r.id, codigo: r.codigo, nome: r.nome, regiao: r.regiao, ativa: !!r.ativa };
}
function mapMotorista(r: RowDataPacket): Motorista {
  return { id: r.id, nome: r.nome, telefone: r.telefone, status: r.status, tint: r.tint };
}
function mapEntrega(r: RowDataPacket): Entrega {
  return {
    id: r.id,
    code: r.code,
    destino: r.destino,
    motoristaId: r.motoristaId,
    rotaId: r.rotaId,
    data: r.data,
    horario: r.horario,
    peso: r.peso,
    status: r.status,
    createdAt: r.createdAt,
  };
}

async function ensureSchema(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS rotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(32) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    regiao VARCHAR(255) NOT NULL,
    ativa TINYINT(1) NOT NULL DEFAULT 1
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS motoristas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(64) NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'disponivel',
    tint VARCHAR(64) NOT NULL DEFAULT ''
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    motoristaId INT NULL,
    rotaId INT NULL,
    data DATE NOT NULL,
    horario VARCHAR(8) NOT NULL,
    peso VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'agendado',
    createdAt DATETIME NOT NULL
  )`);
}

/** Popula o banco com os dados de exemplo na primeira execução. */
async function seedIfEmpty(pool: Pool) {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM rotas");
  if (rows[0]!.n > 0) return;

  const data = seed();
  for (const r of data.rotas) {
    await pool.execute("INSERT INTO rotas (id, codigo, nome, regiao, ativa) VALUES (?,?,?,?,?)", [
      r.id, r.codigo, r.nome, r.regiao, r.ativa ? 1 : 0,
    ]);
  }
  for (const m of data.motoristas) {
    await pool.execute("INSERT INTO motoristas (id, nome, telefone, status, tint) VALUES (?,?,?,?,?)", [
      m.id, m.nome, m.telefone, m.status, m.tint,
    ]);
  }
  for (const e of data.entregas) {
    await pool.execute(
      "INSERT INTO entregas (id, code, destino, motoristaId, rotaId, data, horario, peso, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [e.id, e.code, e.destino, e.motoristaId, e.rotaId, e.data, e.horario, e.peso, e.status, new Date()],
    );
  }
}

/** Próximo número de "code" (#NNNN) para entregas. */
async function nextCode(pool: Pool): Promise<string> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(code, 2) AS UNSIGNED)), 1042) AS maxc FROM entregas",
  );
  return "#" + (Number(rows[0]!.maxc) + 1);
}

/**
 * Tenta conectar ao MySQL, garante o schema/seed e devolve o Repo.
 * Lança erro se o banco não estiver acessível (para acionar o fallback).
 */
export async function initMysqlRepo(): Promise<Repo> {
  // Cria o database se ainda não existir.
  const bootstrap = await mysql.createConnection({
    host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password,
  });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\``);
  await bootstrap.end();

  const pool = mysql.createPool({ ...cfg, dateStrings: true, waitForConnections: true, connectionLimit: 5 });
  await ensureSchema(pool);
  await seedIfEmpty(pool);

  const repo: Repo = {
    kind: "mysql",

    // ---------- Rotas ----------
    async listRotas() {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM rotas ORDER BY id");
      return rows.map(mapRota);
    },
    async createRota(input) {
      const [r] = await pool.execute<ResultSetHeader>(
        "INSERT INTO rotas (codigo, nome, regiao, ativa) VALUES (?,?,?,?)",
        [input.codigo, input.nome, input.regiao, input.ativa ? 1 : 0],
      );
      return { id: r.insertId, ...input };
    },
    async updateRota(id, fields) {
      const sets: string[] = [];
      const vals: any[] = [];
      if (fields.codigo !== undefined) { sets.push("codigo=?"); vals.push(fields.codigo); }
      if (fields.nome !== undefined) { sets.push("nome=?"); vals.push(fields.nome); }
      if (fields.regiao !== undefined) { sets.push("regiao=?"); vals.push(fields.regiao); }
      if (fields.ativa !== undefined) { sets.push("ativa=?"); vals.push(fields.ativa ? 1 : 0); }
      if (sets.length) await pool.execute(`UPDATE rotas SET ${sets.join(", ")} WHERE id=?`, [...vals, id]);
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM rotas WHERE id=?", [id]);
      return rows[0] ? mapRota(rows[0]) : null;
    },
    async deleteRota(id) {
      const [r] = await pool.execute<ResultSetHeader>("DELETE FROM rotas WHERE id=?", [id]);
      return r.affectedRows > 0;
    },

    // ---------- Motoristas ----------
    async listMotoristas() {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM motoristas ORDER BY id");
      return rows.map(mapMotorista);
    },
    async createMotorista(input) {
      const [r] = await pool.execute<ResultSetHeader>(
        "INSERT INTO motoristas (nome, telefone, status, tint) VALUES (?,?,?,?)",
        [input.nome, input.telefone, input.status, ""],
      );
      const tint = TINTS[(r.insertId - 1) % TINTS.length]!;
      await pool.execute("UPDATE motoristas SET tint=? WHERE id=?", [tint, r.insertId]);
      return { id: r.insertId, ...input, tint };
    },
    async updateMotorista(id, fields) {
      const sets: string[] = [];
      const vals: any[] = [];
      if (fields.nome !== undefined) { sets.push("nome=?"); vals.push(fields.nome); }
      if (fields.telefone !== undefined) { sets.push("telefone=?"); vals.push(fields.telefone); }
      if (fields.status !== undefined) { sets.push("status=?"); vals.push(fields.status); }
      if (sets.length) await pool.execute(`UPDATE motoristas SET ${sets.join(", ")} WHERE id=?`, [...vals, id]);
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM motoristas WHERE id=?", [id]);
      return rows[0] ? mapMotorista(rows[0]) : null;
    },
    async deleteMotorista(id) {
      const [r] = await pool.execute<ResultSetHeader>("DELETE FROM motoristas WHERE id=?", [id]);
      return r.affectedRows > 0;
    },

    // ---------- Entregas ----------
    async listEntregas() {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM entregas ORDER BY id");
      return rows.map(mapEntrega);
    },
    async createEntrega(input) {
      const code = await nextCode(pool);
      const createdAt = new Date();
      const [r] = await pool.execute<ResultSetHeader>(
        "INSERT INTO entregas (code, destino, motoristaId, rotaId, data, horario, peso, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)",
        [code, input.destino, input.motoristaId, input.rotaId, input.data, input.horario, input.peso, input.status, createdAt],
      );
      return { id: r.insertId, code, ...input, createdAt: createdAt.toISOString() };
    },
    async updateEntrega(id, fields) {
      const sets: string[] = [];
      const vals: any[] = [];
      if (fields.destino !== undefined) { sets.push("destino=?"); vals.push(fields.destino); }
      if (fields.motoristaId !== undefined) { sets.push("motoristaId=?"); vals.push(fields.motoristaId); }
      if (fields.rotaId !== undefined) { sets.push("rotaId=?"); vals.push(fields.rotaId); }
      if (fields.data !== undefined) { sets.push("data=?"); vals.push(fields.data); }
      if (fields.horario !== undefined) { sets.push("horario=?"); vals.push(fields.horario); }
      if (fields.peso !== undefined) { sets.push("peso=?"); vals.push(fields.peso); }
      if (fields.status !== undefined) { sets.push("status=?"); vals.push(fields.status); }
      if (sets.length) await pool.execute(`UPDATE entregas SET ${sets.join(", ")} WHERE id=?`, [...vals, id]);
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM entregas WHERE id=?", [id]);
      return rows[0] ? mapEntrega(rows[0]) : null;
    },
    async deleteEntrega(id) {
      const [r] = await pool.execute<ResultSetHeader>("DELETE FROM entregas WHERE id=?", [id]);
      return r.affectedRows > 0;
    },
  };

  // Valida a conexão de fato (lança se o MySQL não responder).
  await pool.query("SELECT 1");
  return repo;
}
