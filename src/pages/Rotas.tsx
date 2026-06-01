import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import type { Rota } from "../types";

export default function Rotas() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [regiao, setRegiao] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setRotas(await api.listRotas());
  }
  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createRota({ codigo, nome, regiao, ativa });
      setCodigo(""); setNome(""); setRegiao(""); setAtiva(true);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    }
  }

  async function toggle(r: Rota) {
    await api.updateRota(r.id, { ativa: !r.ativa });
    load();
  }

  async function remover(r: Rota) {
    if (!confirm(`Remover rota ${r.codigo}?`)) return;
    try {
      await api.deleteRota(r.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="cl-content">
      <div className="cl-card cl-toolbar">
        <span className="cl-card-title">Rotas cadastradas ({rotas.length})</span>
        <button className="cl-btn-primary" style={{ marginLeft: "auto" }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancelar" : "+ Nova Rota"}
        </button>
      </div>

      {showForm && (
        <form className="cl-card cl-inline-form" onSubmit={submit}>
          {error && <div className="cl-login-error">{error}</div>}
          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Código</label>
              <input className="cl-input" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="R-12" required />
            </div>
            <div>
              <label className="cl-field-label">Nome</label>
              <input className="cl-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Zona Leste" required />
            </div>
          </div>
          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Região</label>
              <input className="cl-input" value={regiao} onChange={(e) => setRegiao(e.target.value)} placeholder="São Paulo – Leste" required />
            </div>
            <div>
              <label className="cl-field-label">Status</label>
              <select className="cl-input" value={ativa ? "1" : "0"} onChange={(e) => setAtiva(e.target.value === "1")}>
                <option value="1">Ativa</option>
                <option value="0">Inativa</option>
              </select>
            </div>
          </div>
          <div className="cl-modal-foot">
            <button type="submit" className="cl-btn-primary">Criar rota</button>
          </div>
        </form>
      )}

      <div className="cl-card cl-table-card">
        <table className="cl-table cl-table-full">
          <thead>
            <tr><th>Código</th><th>Nome</th><th>Região</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rotas.map((r) => (
              <tr key={r.id}>
                <td><span className="cl-rota">{r.codigo}</span></td>
                <td className="cl-strong">{r.nome}</td>
                <td>{r.regiao}</td>
                <td>
                  <span className="cl-badge" style={{
                    background: r.ativa ? "rgb(225,245,238)" : "rgb(246,245,243)",
                    color: r.ativa ? "rgb(15,110,86)" : "rgb(95,94,90)",
                  }}>{r.ativa ? "Ativa" : "Inativa"}</span>
                </td>
                <td className="cl-row-actions">
                  <button className="cl-row-btn" onClick={() => toggle(r)}>{r.ativa ? "Desativar" : "Ativar"}</button>
                  <button className="cl-row-btn cl-row-btn-danger" onClick={() => remover(r)}>Excluir</button>
                </td>
              </tr>
            ))}
            {rotas.length === 0 && (
              <tr><td colSpan={5} className="cl-empty">Nenhuma rota cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
