import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { createRepo } from "./store.js";
import type { Repo } from "./repo.js";
import type { MotoristaStatus, StatusKey } from "./types.js";

const ADMIN = { email: "admin@cheetahlog.com", senha: "admin123", nome: "Admin Sistema", role: "Gestor" };

const STATUS_KEYS: StatusKey[] = ["concluido", "emrota", "agendado", "ocorrencia"];
const MOTORISTA_STATUS: MotoristaStatus[] = ["disponivel", "em_rota", "em_entrega", "folga"];

/** Envolve handlers async para encaminhar erros ao Express. */
const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response) => {
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Erro interno do servidor" });
    });
  };

/** Registra o mesmo handler em PUT e PATCH (atualização). */
function update(app: Express, path: string, fn: (req: Request, res: Response) => Promise<unknown>) {
  app.put(path, wrap(fn));
  app.patch(path, wrap(fn));
}

function buildApp(repo: Repo): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true, storage: repo.kind }));

  // ---------- Auth ----------
  app.post("/api/auth/login", (req, res) => {
    const { email, senha } = req.body ?? {};
    if (typeof email !== "string" || typeof senha !== "string") {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }
    if (email.trim().toLowerCase() === ADMIN.email && senha === ADMIN.senha) {
      return res.json({ user: { nome: ADMIN.nome, role: ADMIN.role, email: ADMIN.email } });
    }
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  });

  // ---------- Rotas ----------
  app.get("/api/rotas", wrap(async (_req, res) => {
    res.json(await repo.listRotas());
  }));

  app.post("/api/rotas", wrap(async (req, res) => {
    const { codigo, nome, regiao, ativa } = req.body ?? {};
    if (!codigo || !nome || !regiao) return res.status(400).json({ error: "Campos obrigatórios: codigo, nome, regiao" });
    const rotas = await repo.listRotas();
    if (rotas.some((r) => r.codigo.toLowerCase() === String(codigo).toLowerCase())) {
      return res.status(409).json({ error: "Código de rota já existe." });
    }
    const rota = await repo.createRota({ codigo: String(codigo), nome: String(nome), regiao: String(regiao), ativa: ativa !== false });
    res.status(201).json(rota);
  }));

  update(app, "/api/rotas/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { codigo, nome, regiao, ativa } = req.body ?? {};
    const fields: Record<string, unknown> = {};
    if (codigo !== undefined) fields.codigo = String(codigo);
    if (nome !== undefined) fields.nome = String(nome);
    if (regiao !== undefined) fields.regiao = String(regiao);
    if (ativa !== undefined) fields.ativa = Boolean(ativa);
    const rota = await repo.updateRota(id, fields);
    if (!rota) return res.status(404).json({ error: "Rota não encontrada" });
    res.json(rota);
  });

  app.delete("/api/rotas/:id", wrap(async (req, res) => {
    const id = Number(req.params.id);
    const entregas = await repo.listEntregas();
    if (entregas.some((e) => e.rotaId === id && e.status !== "concluido")) {
      return res.status(409).json({ error: "Rota possui entregas ativas." });
    }
    const ok = await repo.deleteRota(id);
    if (!ok) return res.status(404).json({ error: "Rota não encontrada" });
    res.json({ ok: true });
  }));

  // ---------- Motoristas ----------
  app.get("/api/motoristas", wrap(async (_req, res) => {
    res.json(await repo.listMotoristas());
  }));

  app.post("/api/motoristas", wrap(async (req, res) => {
    const { nome, telefone, status } = req.body ?? {};
    if (!nome) return res.status(400).json({ error: "Campo obrigatório: nome" });
    const m = await repo.createMotorista({
      nome: String(nome),
      telefone: telefone ? String(telefone) : "",
      status: MOTORISTA_STATUS.includes(status) ? status : "disponivel",
    });
    res.status(201).json(m);
  }));

  update(app, "/api/motoristas/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { nome, telefone, status } = req.body ?? {};
    const fields: Record<string, unknown> = {};
    if (nome !== undefined) fields.nome = String(nome);
    if (telefone !== undefined) fields.telefone = String(telefone);
    if (status !== undefined && MOTORISTA_STATUS.includes(status)) fields.status = status;
    const m = await repo.updateMotorista(id, fields);
    if (!m) return res.status(404).json({ error: "Motorista não encontrado" });
    res.json(m);
  });

  app.delete("/api/motoristas/:id", wrap(async (req, res) => {
    const id = Number(req.params.id);
    const entregas = await repo.listEntregas();
    if (entregas.some((e) => e.motoristaId === id && e.status !== "concluido")) {
      return res.status(409).json({ error: "Motorista possui entregas ativas." });
    }
    const ok = await repo.deleteMotorista(id);
    if (!ok) return res.status(404).json({ error: "Motorista não encontrado" });
    res.json({ ok: true });
  }));

  // ---------- Entregas ----------
  app.get("/api/entregas", wrap(async (req, res) => {
    const { status, q, data, agendadasFuturas } = req.query;
    let rows = await repo.listEntregas();

    if (status && status !== "todos") rows = rows.filter((e) => e.status === status);
    if (data) rows = rows.filter((e) => e.data === data);
    if (agendadasFuturas === "1") {
      const today = new Date().toISOString().slice(0, 10);
      rows = rows.filter((e) => e.status === "agendado" && e.data >= today);
    }
    if (q && typeof q === "string") {
      const needle = q.toLowerCase();
      const motoristas = await repo.listMotoristas();
      const rotas = await repo.listRotas();
      rows = rows.filter((e) => {
        const motorista = motoristas.find((m) => m.id === e.motoristaId);
        const rota = rotas.find((r) => r.id === e.rotaId);
        return (
          e.code.toLowerCase().includes(needle) ||
          e.destino.toLowerCase().includes(needle) ||
          (motorista?.nome.toLowerCase().includes(needle) ?? false) ||
          (rota?.codigo.toLowerCase().includes(needle) ?? false)
        );
      });
    }

    rows.sort((a, b) => (b.data + b.horario).localeCompare(a.data + a.horario));
    res.json(rows);
  }));

  app.post("/api/entregas", wrap(async (req, res) => {
    const { destino, motoristaId, rotaId, data, horario, peso, status } = req.body ?? {};
    if (!destino || !data || !horario || !peso) {
      return res.status(400).json({ error: "Campos obrigatórios: destino, data, horario, peso" });
    }
    const motoristas = await repo.listMotoristas();
    const rotas = await repo.listRotas();
    if (motoristaId != null && !motoristas.some((m) => m.id === Number(motoristaId))) {
      return res.status(400).json({ error: "Motorista inválido" });
    }
    if (rotaId != null && !rotas.some((r) => r.id === Number(rotaId))) {
      return res.status(400).json({ error: "Rota inválida" });
    }
    const entrega = await repo.createEntrega({
      destino: String(destino),
      motoristaId: motoristaId != null ? Number(motoristaId) : null,
      rotaId: rotaId != null ? Number(rotaId) : null,
      data: String(data),
      horario: String(horario),
      peso: String(peso),
      status: STATUS_KEYS.includes(status) ? status : "agendado",
    });
    res.status(201).json(entrega);
  }));

  update(app, "/api/entregas/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { destino, motoristaId, rotaId, data, horario, peso, status } = req.body ?? {};
    const fields: Record<string, unknown> = {};
    if (destino !== undefined) fields.destino = String(destino);
    if (motoristaId !== undefined) fields.motoristaId = motoristaId == null ? null : Number(motoristaId);
    if (rotaId !== undefined) fields.rotaId = rotaId == null ? null : Number(rotaId);
    if (data !== undefined) fields.data = String(data);
    if (horario !== undefined) fields.horario = String(horario);
    if (peso !== undefined) fields.peso = String(peso);
    if (status !== undefined && STATUS_KEYS.includes(status)) fields.status = status;
    const e = await repo.updateEntrega(id, fields);
    if (!e) return res.status(404).json({ error: "Entrega não encontrada" });
    res.json(e);
  });

  app.delete("/api/entregas/:id", wrap(async (req, res) => {
    const id = Number(req.params.id);
    const ok = await repo.deleteEntrega(id);
    if (!ok) return res.status(404).json({ error: "Entrega não encontrada" });
    res.json({ ok: true });
  }));

  // ---------- Relatórios ----------
  app.get("/api/relatorios/resumo", wrap(async (_req, res) => {
    const entregas = await repo.listEntregas();
    const rotas = await repo.listRotas();
    const motoristas = await repo.listMotoristas();
    const today = new Date().toISOString().slice(0, 10);

    const entregasHoje = entregas.filter((e) => e.data === today);
    const concluidasHoje = entregasHoje.filter((e) => e.status === "concluido").length;
    const totalHoje = entregasHoje.length;
    const noPrazo = totalHoje > 0 ? Math.round((concluidasHoje / totalHoje) * 100) : 0;
    const ocorrencias = entregas.filter((e) => e.status === "ocorrencia").length;
    const rotasAtivas = rotas.filter((r) => r.ativa).length;
    const regioes = new Set(rotas.filter((r) => r.ativa).map((r) => r.regiao)).size;

    const porData = new Map<string, number>();
    for (const e of entregas) porData.set(e.data, (porData.get(e.data) ?? 0) + 1);
    const ultimas7 = [...porData.keys()].sort().slice(-7);
    const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const chart = ultimas7.map((d) => {
      const dt = new Date(d + "T00:00:00");
      return { dia: DIAS[dt.getDay()] ?? d, v: porData.get(d) ?? 0 };
    });

    const porStatus = STATUS_KEYS.map((k) => ({
      status: k,
      total: entregas.filter((e) => e.status === k).length,
    }));

    const porMotorista = motoristas
      .map((m) => ({ motorista: m.nome, total: entregas.filter((e) => e.motoristaId === m.id).length }))
      .sort((a, b) => b.total - a.total);

    res.json({
      stats: [
        { label: "Entregas Hoje", value: String(totalHoje), sub: `${concluidasHoje} concluídas`, tint: "rgb(250,238,217)" },
        { label: "No Prazo", value: noPrazo + "%", sub: `${concluidasHoje}/${totalHoje} concluídas a tempo`, tint: "rgb(225,245,238)" },
        { label: "Rotas Ativas", value: String(rotasAtivas), sub: `${regioes} regiões cobertas`, tint: "rgb(230,241,251)" },
        { label: "Ocorrências", value: String(ocorrencias), sub: "no histórico", tint: "rgb(252,235,235)" },
      ],
      chart,
      porStatus,
      porMotorista,
    });
  }));

  return app;
}

async function main() {
  const repo = await createRepo();
  const app = buildApp(repo);
  const PORT = Number(process.env.PORT) || 3001;
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`CheetahLog API rodando em http://127.0.0.1:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});
