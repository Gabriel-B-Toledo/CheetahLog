import { useEffect, useState } from "react";
import { api } from "../api";
import type { Entrega, Motorista, Resumo } from "../types";
import { MOTORISTA_STATUS_LABEL } from "../data";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";

export default function Dashboard({ onSeeAll }: { onSeeAll: () => void }) {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [recentes, setRecentes] = useState<Entrega[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);

  useEffect(() => {
    (async () => {
      const [r, e, m] = await Promise.all([
        api.resumo(),
        api.listEntregas(),
        api.listMotoristas(),
      ]);
      setResumo(r);
      setRecentes(e.slice(0, 4));
      setMotoristas(m);
    })();
  }, []);

  if (!resumo) {
    return <div className="cl-content"><div className="cl-card" style={{ padding: 24 }}>Carregando...</div></div>;
  }

  const max = Math.max(1, ...resumo.chart.map((c) => c.v));

  return (
    <div className="cl-content">
      <div className="cl-stats-row">
        {resumo.stats.map((s) => (
          <div key={s.label} className="cl-stat-card">
            <div className="cl-stat-head">
              <span className="cl-stat-label">{s.label}</span>
              <span className="cl-stat-icon" style={{ background: s.tint }} />
            </div>
            <span className="cl-stat-value">{s.value}</span>
            <span className="cl-stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="cl-dash-grid">
        <section className="cl-card cl-recent">
          <div className="cl-card-head">
            <h2 className="cl-card-title">Entregas Recentes</h2>
            <button className="cl-link" onClick={onSeeAll}>Ver todas →</button>
          </div>
          <table className="cl-table">
            <thead>
              <tr><th>Destino</th><th>Motorista</th><th>Horário</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentes.map((e) => (
                <tr key={e.id}>
                  <td className="cl-strong">{e.destino}</td>
                  <td>{motoristas.find((m) => m.id === e.motoristaId)?.nome ?? "A definir"}</td>
                  <td>{e.horario}</td>
                  <td><Badge status={e.status} /></td>
                </tr>
              ))}
              {recentes.length === 0 && (
                <tr><td colSpan={4} className="cl-empty">Nenhuma entrega.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="cl-card cl-drivers">
          <div className="cl-card-head">
            <h2 className="cl-card-title">Motoristas</h2>
          </div>
          <ul className="cl-driver-list">
            {motoristas.slice(0, 5).map((m) => (
              <li key={m.id} className="cl-driver">
                <Avatar name={m.nome} tint={m.tint} size={34} />
                <div className="cl-driver-text">
                  <span className="cl-driver-name">{m.nome}</span>
                  <span className="cl-driver-sub">{MOTORISTA_STATUS_LABEL[m.status]}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="cl-card cl-chart-card">
        <h2 className="cl-card-title">Entregas por Dia</h2>
        <div className="cl-chart">
          {resumo.chart.map((c, i) => {
            const peak = c.v === max && max > 0;
            return (
              <div key={i} className="cl-bar-col">
                <span className="cl-bar-val">{c.v > 0 ? c.v : ""}</span>
                <div className="cl-bar" style={{
                  height: max ? `${(c.v / max) * 100}%` : 0,
                  background: peak ? "rgb(186,117,17)" : "rgb(250,238,217)",
                }} />
                <span className="cl-bar-day">{c.dia}</span>
              </div>
            );
          })}
          {resumo.chart.length === 0 && (
            <div className="cl-empty" style={{ gridColumn: "1 / -1" }}>Sem dados.</div>
          )}
        </div>
      </section>
    </div>
  );
}
