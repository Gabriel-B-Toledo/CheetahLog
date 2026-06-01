import { useEffect, useState } from "react";
import { api } from "../api";
import { STATUS, formatData } from "../data";
import type { Entrega, Motorista, Rota, StatusKey } from "../types";
import Badge from "../components/Badge";
import EntregaModal from "../components/EntregaModal";

type FilterKey = "todos" | StatusKey;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todos",      label: "Todos" },
  { key: "concluido",  label: "Concluído" },
  { key: "emrota",     label: "Em rota" },
  { key: "agendado",   label: "Agendado" },
  { key: "ocorrencia", label: "Ocorrência" },
];

type Props = {
  openModalSignal: number;
  onModalHandled: () => void;
};

export default function Entregas({ openModalSignal, onModalHandled }: Props) {
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Entrega[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Entrega | null }>({ open: false, editing: null });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [e, m, r] = await Promise.all([
        api.listEntregas({ status: filter === "todos" ? undefined : filter, q: query || undefined }),
        api.listMotoristas(),
        api.listRotas(),
      ]);
      setRows(e);
      setMotoristas(m);
      setRotas(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [query]);

  useEffect(() => {
    if (openModalSignal > 0) {
      setModal({ open: true, editing: null });
      onModalHandled();
    }
  }, [openModalSignal, onModalHandled]);

  async function remover(e: Entrega) {
    if (!confirm(`Remover entrega ${e.code}?`)) return;
    await api.deleteEntrega(e.id);
    load();
  }

  function motoristaNome(id: number | null) {
    if (id == null) return "A definir";
    return motoristas.find((m) => m.id === id)?.nome ?? "—";
  }
  function rotaCod(id: number | null) {
    if (id == null) return "—";
    return rotas.find((r) => r.id === id)?.codigo ?? "—";
  }

  return (
    <div className="cl-content">
      <div className="cl-card cl-toolbar">
        <div className="cl-search">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgb(153,152,148)"
               strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            placeholder="Buscar entrega..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cl-chips">
          {FILTERS.map((f) => {
            const on = f.key === filter;
            const s = f.key !== "todos" ? STATUS[f.key] : null;
            const style = on
              ? { background: "rgb(186,117,17)", color: "#fff", borderColor: "transparent" }
              : s ? { background: s.bg, color: s.fg } : {};
            return (
              <button
                key={f.key}
                className={"cl-chip" + (on ? " on" : "")}
                style={style}
                onClick={() => setFilter(f.key)}
              >{f.label}</button>
            );
          })}
        </div>
        <button className="cl-btn-primary" style={{ marginLeft: "auto" }}
                onClick={() => setModal({ open: true, editing: null })}>
          + Nova Entrega
        </button>
      </div>

      <div className="cl-card cl-table-card">
        <table className="cl-table cl-table-full">
          <thead>
            <tr>
              <th>Código</th><th>Destino</th><th>Motorista</th><th>Rota</th>
              <th>Data</th><th>Horário</th><th>Peso</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="cl-code">{e.code}</td>
                <td className="cl-strong">{e.destino}</td>
                <td>{motoristaNome(e.motoristaId)}</td>
                <td><span className="cl-rota">{rotaCod(e.rotaId)}</span></td>
                <td>{formatData(e.data)}</td>
                <td>{e.horario}</td>
                <td>{e.peso}</td>
                <td><Badge status={e.status} /></td>
                <td className="cl-row-actions">
                  <button className="cl-row-btn" onClick={() => setModal({ open: true, editing: e })}>Editar</button>
                  <button className="cl-row-btn cl-row-btn-danger" onClick={() => remover(e)}>Excluir</button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={9} className="cl-empty">Nenhuma entrega encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="cl-card cl-pagination">
        <span className="cl-page-info">Mostrando {rows.length} entrega(s)</span>
      </div>

      <EntregaModal
        open={modal.open}
        initial={modal.editing}
        motoristas={motoristas}
        rotas={rotas}
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={() => load()}
      />
    </div>
  );
}
