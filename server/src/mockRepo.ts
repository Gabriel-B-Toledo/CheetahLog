import { getDB, nextCode, save } from "./db.js";
import type { Repo } from "./repo.js";
import { TINTS } from "./repo.js";

/** Implementação de fallback: dados em memória persistidos em data.json. */
export const mockRepo: Repo = {
  kind: "mock",

  // ---------- Rotas ----------
  async listRotas() {
    return getDB().rotas;
  },
  async createRota(input) {
    const db = getDB();
    db.seq.rota += 1;
    const rota = { id: db.seq.rota, ...input };
    db.rotas.push(rota);
    save();
    return rota;
  },
  async updateRota(id, fields) {
    const db = getDB();
    const rota = db.rotas.find((r) => r.id === id);
    if (!rota) return null;
    Object.assign(rota, fields);
    save();
    return rota;
  },
  async deleteRota(id) {
    const db = getDB();
    const idx = db.rotas.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    db.rotas.splice(idx, 1);
    save();
    return true;
  },

  // ---------- Motoristas ----------
  async listMotoristas() {
    return getDB().motoristas;
  },
  async createMotorista(input) {
    const db = getDB();
    db.seq.motorista += 1;
    const tint = TINTS[(db.seq.motorista - 1) % TINTS.length]!;
    const m = { id: db.seq.motorista, ...input, tint };
    db.motoristas.push(m);
    save();
    return m;
  },
  async updateMotorista(id, fields) {
    const db = getDB();
    const m = db.motoristas.find((x) => x.id === id);
    if (!m) return null;
    Object.assign(m, fields);
    save();
    return m;
  },
  async deleteMotorista(id) {
    const db = getDB();
    const idx = db.motoristas.findIndex((x) => x.id === id);
    if (idx === -1) return false;
    db.motoristas.splice(idx, 1);
    save();
    return true;
  },

  // ---------- Entregas ----------
  async listEntregas() {
    return getDB().entregas;
  },
  async createEntrega(input) {
    const db = getDB();
    db.seq.entrega += 1;
    const entrega = {
      id: db.seq.entrega,
      code: nextCode(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    db.entregas.push(entrega);
    save();
    return entrega;
  },
  async updateEntrega(id, fields) {
    const db = getDB();
    const e = db.entregas.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, fields);
    save();
    return e;
  },
  async deleteEntrega(id) {
    const db = getDB();
    const idx = db.entregas.findIndex((x) => x.id === id);
    if (idx === -1) return false;
    db.entregas.splice(idx, 1);
    save();
    return true;
  },
};
