import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DB } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.resolve(__dirname, "..", "data.json");

export function seed(): DB {
  return {
    rotas: [
      { id: 1, codigo: "R-02", nome: "Centro / ABC", regiao: "Grande SP – Sul",     ativa: true },
      { id: 2, codigo: "R-03", nome: "São Bernardo",  regiao: "Grande SP – Sul",     ativa: true },
      { id: 3, codigo: "R-04", nome: "Zona Sul",      regiao: "São Paulo – Sul",     ativa: true },
      { id: 4, codigo: "R-06", nome: "Zona Norte",    regiao: "São Paulo – Norte",   ativa: true },
      { id: 5, codigo: "R-07", nome: "Guarulhos",     regiao: "Grande SP – Leste",   ativa: true },
      { id: 6, codigo: "R-09", nome: "Osasco",        regiao: "Grande SP – Oeste",   ativa: true },
      { id: 7, codigo: "R-11", nome: "ABC Paulista",  regiao: "Grande SP – Sul",     ativa: false },
    ],
    motoristas: [
      { id: 1, nome: "Ricardo Lima",    telefone: "(11) 99100-0001", status: "em_entrega", tint: "rgb(225,245,238)" },
      { id: 2, nome: "Marcos Ferreira", telefone: "(11) 99100-0002", status: "em_rota",    tint: "rgb(250,238,217)" },
      { id: 3, nome: "Carla Santos",    telefone: "(11) 99100-0003", status: "em_entrega", tint: "rgb(230,241,251)" },
      { id: 4, nome: "João Oliveira",   telefone: "(11) 99100-0004", status: "disponivel", tint: "rgb(237,229,247)" },
      { id: 5, nome: "Paulo Mendes",    telefone: "(11) 99100-0005", status: "em_rota",    tint: "rgb(225,245,238)" },
      { id: 6, nome: "Ana Reis",        telefone: "(11) 99100-0006", status: "disponivel", tint: "rgb(250,238,217)" },
    ],
    entregas: [
      { id: 1, code: "#1042", destino: "Vila Mariana – São Paulo, SP", motoristaId: 1,    rotaId: 3, data: "2026-04-05", horario: "08:00", peso: "380 kg", status: "concluido",  createdAt: new Date().toISOString() },
      { id: 2, code: "#1041", destino: "Santo André, SP",              motoristaId: 2,    rotaId: 1, data: "2026-04-05", horario: "09:30", peso: "210 kg", status: "concluido",  createdAt: new Date().toISOString() },
      { id: 3, code: "#1040", destino: "Guarulhos, SP",                motoristaId: 3,    rotaId: 5, data: "2026-04-05", horario: "11:00", peso: "540 kg", status: "emrota",     createdAt: new Date().toISOString() },
      { id: 4, code: "#1039", destino: "Osasco, SP",                   motoristaId: 4,    rotaId: 6, data: "2026-04-06", horario: "14:00", peso: "290 kg", status: "agendado",   createdAt: new Date().toISOString() },
      { id: 5, code: "#1038", destino: "ABC Paulista, SP",             motoristaId: null, rotaId: 7, data: "2026-04-07", horario: "16:30", peso: "420 kg", status: "agendado",   createdAt: new Date().toISOString() },
      { id: 6, code: "#1037", destino: "São Bernardo do Campo, SP",    motoristaId: 5,    rotaId: 2, data: "2026-04-05", horario: "07:00", peso: "180 kg", status: "ocorrencia", createdAt: new Date().toISOString() },
      { id: 7, code: "#1036", destino: "Santana – São Paulo, SP",      motoristaId: 6,    rotaId: 4, data: "2026-04-05", horario: "13:00", peso: "310 kg", status: "concluido",  createdAt: new Date().toISOString() },
    ],
    seq: { entrega: 7, motorista: 6, rota: 7, code: 1042 },
  };
}

let data: DB;

if (fs.existsSync(DB_FILE)) {
  data = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
} else {
  data = seed();
  save();
}

export function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function getDB(): DB {
  return data;
}

export function nextCode(): string {
  data.seq.code += 1;
  return "#" + data.seq.code;
}
