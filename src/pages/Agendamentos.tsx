import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { formatData } from "../data";
import type { Entrega, Motorista, Rota } from "../types";
import EntregaModal from "../components/EntregaModal";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function Agendamentos() {
  const [rows, setRows] = useState<Entrega[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Entrega | null }>({ open: false, editing: null });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [e, m, r] = await Promise.all([
        api.listEntregas({ agendadasFuturas: true }),
        api.listMotoristas(),
        api.listRotas(),
      ]);
      // ordena por data/horário crescente (próximos primeiro)
      e.sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
      setRows(e);
      setMotoristas(m);
      setRotas(r);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // agrupa por data
  const grupos = useMemo(() => {
    const map = new Map<string, Entrega[]>();
    for (const e of rows) {
      const arr = map.get(e.data) ?? [];
      arr.push(e);
      map.set(e.data, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  function motoristaNome(id: number | null) {
    if (id == null) return "A definir";
    return motoristas.find((m) => m.id === id)?.nome ?? "—";
  }
  function rotaCod(id: number | null) {
    if (id == null) return "—";
    return rotas.find((r) => r.id === id)?.codigo ?? "—";
  }

  function rotuloData(iso: string) {
    const dt = new Date(iso + "T00:00:00");
    const hoje = todayISO();
    const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    let prefixo = WEEKDAYS[dt.getDay()] ?? "";
    if (iso === hoje) prefixo = "Hoje";
    else if (iso === amanha) prefixo = "Amanhã";
    return `${prefixo} — ${formatData(iso)}`;
  }

  async function despachar(e: Entrega) {
    await api.updateEntrega(e.id, { status: "emrota" });
    load();
  }

  async function cancelar(e: Entrega) {
    if (!confirm(`Cancelar agendamento ${e.code}?`)) return;
    await api.deleteEntrega(e.id);
    load();
  }

  return (
    <div className="cl-content">
      <div className="cl-card cl-toolbar">
        <span className="cl-card-title">
          Próximos agendamentos ({rows.length})
        </span>
        <button className="cl-btn-primary" style={{ marginLeft: "auto" }}
                onClick={() => setModal({ open: true, editing: null })}>
          + Novo Agendamento
        </button>
      </div>

      {!loading && grupos.length === 0 && (
        <div className="cl-card" style={{ padding: 48, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Nenhuma entrega agendada. Use <strong style={{ color: "var(--ink)" }}>+ Novo Agendamento</strong> para planejar uma janela de coleta/entrega.
        </div>
      )}

      {grupos.map(([data, itens]) => (
        <div key={data} className="cl-card cl-table-card" style={{ marginBottom: 16 }}>
          <div className="cl-card-head" style={{ padding: "14px 18px 0" }}>
            <h2 className="cl-card-title">{rotuloData(data)}</h2>
            <span className="cl-page-info">{itens.length} entrega(s)</span>
          </div>
          <table className="cl-table cl-table-full">
            <thead>
              <tr>
                <th>Horário</th><th>Código</th><th>Destino</th>
                <th>Motorista</th><th>Rota</th><th>Peso</th><th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((e) => (
                <tr key={e.id}>
                  <td className="cl-strong">{e.horario}</td>
                  <td className="cl-code">{e.code}</td>
                  <td>{e.destino}</td>
                  <td>{motoristaNome(e.motoristaId)}</td>
                  <td><span className="cl-rota">{rotaCod(e.rotaId)}</span></td>
                  <td>{e.peso}</td>
                  <td className="cl-row-actions">
                    <button className="cl-row-btn" onClick={() => despachar(e)}>Despachar</button>
                    <button className="cl-row-btn" onClick={() => setModal({ open: true, editing: e })}>Editar</button>
                    <button className="cl-row-btn cl-row-btn-danger" onClick={() => cancelar(e)}>Cancelar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <EntregaModal
        open={modal.open}
        initial={modal.editing}
        motoristas={motoristas}
        rotas={rotas}
        modo="agendamento"
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={() => load()}
      />
    </div>
  );
}
