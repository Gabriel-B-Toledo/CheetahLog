import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { MOTORISTA_STATUS_LABEL } from "../data";
import type { Motorista, MotoristaStatus } from "../types";
import Avatar from "../components/Avatar";

const STATUS_OPTIONS: MotoristaStatus[] = ["disponivel", "em_rota", "em_entrega", "folga"];

const STATUS_BADGE: Record<MotoristaStatus, { bg: string; fg: string }> = {
  disponivel: { bg: "rgb(225,245,238)", fg: "rgb(15,110,86)" },
  em_rota:    { bg: "rgb(250,238,217)", fg: "rgb(133,79,11)" },
  em_entrega: { bg: "rgb(230,241,251)", fg: "rgb(12,68,124)" },
  folga:      { bg: "rgb(246,245,243)", fg: "rgb(95,94,90)" },
};

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState<MotoristaStatus>("disponivel");
  const [error, setError] = useState("");

  async function load() {
    setMotoristas(await api.listMotoristas());
  }
  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createMotorista({ nome, telefone, status });
      setNome(""); setTelefone(""); setStatus("disponivel");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  async function mudarStatus(m: Motorista, novo: MotoristaStatus) {
    await api.updateMotorista(m.id, { status: novo });
    load();
  }

  async function remover(m: Motorista) {
    if (!confirm(`Remover motorista ${m.nome}?`)) return;
    try {
      await api.deleteMotorista(m.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="cl-content">
      <div className="cl-card cl-toolbar">
        <span className="cl-card-title">Equipe ({motoristas.length})</span>
        <button className="cl-btn-primary" style={{ marginLeft: "auto" }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancelar" : "+ Novo Motorista"}
        </button>
      </div>

      {showForm && (
        <form className="cl-card cl-inline-form" onSubmit={submit}>
          {error && <div className="cl-login-error">{error}</div>}
          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Nome</label>
              <input className="cl-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Maria Silva" required />
            </div>
            <div>
              <label className="cl-field-label">Telefone</label>
              <input className="cl-input" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99100-0000" />
            </div>
          </div>
          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Status</label>
              <select className="cl-input" value={status} onChange={(e) => setStatus(e.target.value as MotoristaStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{MOTORISTA_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div />
          </div>
          <div className="cl-modal-foot">
            <button type="submit" className="cl-btn-primary">Criar motorista</button>
          </div>
        </form>
      )}

      <div className="cl-card cl-table-card">
        <table className="cl-table cl-table-full">
          <thead>
            <tr><th>Motorista</th><th>Telefone</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {motoristas.map((m) => {
              const b = STATUS_BADGE[m.status];
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={m.nome} tint={m.tint} size={32} />
                      <span className="cl-strong">{m.nome}</span>
                    </div>
                  </td>
                  <td>{m.telefone || "—"}</td>
                  <td>
                    <span className="cl-badge" style={{ background: b.bg, color: b.fg }}>
                      {MOTORISTA_STATUS_LABEL[m.status]}
                    </span>
                  </td>
                  <td className="cl-row-actions">
                    <select
                      className="cl-input"
                      style={{ width: "auto", display: "inline-block", padding: "4px 8px", fontSize: 12 }}
                      value={m.status}
                      onChange={(e) => mudarStatus(m, e.target.value as MotoristaStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{MOTORISTA_STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <button className="cl-row-btn cl-row-btn-danger" onClick={() => remover(m)}>Excluir</button>
                  </td>
                </tr>
              );
            })}
            {motoristas.length === 0 && (
              <tr><td colSpan={4} className="cl-empty">Nenhum motorista cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
