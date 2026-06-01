import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import type { Entrega, Motorista, Rota, StatusKey } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (e: Entrega) => void;
  motoristas: Motorista[];
  rotas: Rota[];
  initial?: Entrega | null;
  modo?: "entrega" | "agendamento";
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EntregaModal({ open, onClose, onSaved, motoristas, rotas, initial, modo = "entrega" }: Props) {
  const [destino, setDestino] = useState("");
  const [motoristaId, setMotoristaId] = useState<string>("");
  const [rotaId, setRotaId] = useState<string>("");
  const [data, setData] = useState(todayISO());
  const [horario, setHorario] = useState("08:00");
  const [peso, setPeso] = useState("");
  const [status, setStatus] = useState<StatusKey>(modo === "agendamento" ? "agendado" : "agendado");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (initial) {
      setDestino(initial.destino);
      setMotoristaId(initial.motoristaId?.toString() ?? "");
      setRotaId(initial.rotaId?.toString() ?? "");
      setData(initial.data);
      setHorario(initial.horario);
      setPeso(initial.peso);
      setStatus(initial.status);
    } else {
      setDestino("");
      setMotoristaId("");
      setRotaId(rotas[0]?.id.toString() ?? "");
      setData(todayISO());
      setHorario("08:00");
      setPeso("");
      setStatus(modo === "agendamento" ? "agendado" : "agendado");
    }
  }, [open, initial, modo, rotas]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Partial<Entrega> = {
        destino,
        motoristaId: motoristaId ? Number(motoristaId) : null,
        rotaId: rotaId ? Number(rotaId) : null,
        data,
        horario,
        peso,
        status,
      };
      const saved = initial
        ? await api.updateEntrega(initial.id, payload)
        : await api.createEntrega(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const title = initial
    ? "Editar entrega"
    : modo === "agendamento"
    ? "Novo agendamento"
    : "Nova entrega";

  return (
    <div className="cl-modal-backdrop" onMouseDown={onClose}>
      <div className="cl-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cl-modal-head">
          <h3>{title}</h3>
          <button className="cl-modal-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        <form onSubmit={submit} className="cl-modal-body">
          {error && <div className="cl-login-error">{error}</div>}

          <label className="cl-field-label">Destino</label>
          <input
            className="cl-input"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder="Ex.: Vila Mariana – São Paulo, SP"
            required
          />

          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Data</label>
              <input className="cl-input" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div>
              <label className="cl-field-label">Horário</label>
              <input className="cl-input" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} required />
            </div>
          </div>

          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Motorista</label>
              <select className="cl-input" value={motoristaId} onChange={(e) => setMotoristaId(e.target.value)}>
                <option value="">A definir</option>
                {motoristas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="cl-field-label">Rota</label>
              <select className="cl-input" value={rotaId} onChange={(e) => setRotaId(e.target.value)}>
                <option value="">Sem rota</option>
                {rotas.map((r) => (
                  <option key={r.id} value={r.id}>{r.codigo} — {r.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cl-form-row">
            <div>
              <label className="cl-field-label">Peso</label>
              <input className="cl-input" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ex.: 380 kg" required />
            </div>
            <div>
              <label className="cl-field-label">Status</label>
              <select className="cl-input" value={status} onChange={(e) => setStatus(e.target.value as StatusKey)}>
                <option value="agendado">Agendado</option>
                <option value="emrota">Em rota</option>
                <option value="concluido">Concluído</option>
                <option value="ocorrencia">Ocorrência</option>
              </select>
            </div>
          </div>

          <div className="cl-modal-foot">
            <button type="button" className="cl-btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="cl-btn-primary" disabled={saving}>
              {saving ? "Salvando..." : initial ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
