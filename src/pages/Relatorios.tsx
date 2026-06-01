import { useEffect, useState } from "react";
import { api } from "../api";
import { STATUS } from "../data";
import type { Resumo } from "../types";

export default function Relatorios() {
  const [resumo, setResumo] = useState<Resumo | null>(null);

  useEffect(() => {
    (async () => setResumo(await api.resumo()))();
  }, []);

  if (!resumo) {
    return <div className="cl-content"><div className="cl-card" style={{ padding: 24 }}>Carregando...</div></div>;
  }

  const totalStatus = Math.max(1, resumo.porStatus.reduce((acc, s) => acc + s.total, 0));
  const maxMotorista = Math.max(1, ...resumo.porMotorista.map((m) => m.total));

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
            <h2 className="cl-card-title">Entregas por Status</h2>
          </div>
          <table className="cl-table">
            <thead>
              <tr><th>Status</th><th>Total</th><th>Participação</th></tr>
            </thead>
            <tbody>
              {resumo.porStatus.map((s) => {
                const info = STATUS[s.status];
                const pct = Math.round((s.total / totalStatus) * 100);
                return (
                  <tr key={s.status}>
                    <td>
                      <span className="cl-badge" style={{ background: info.bg, color: info.fg }}>{info.label}</span>
                    </td>
                    <td className="cl-strong">{s.total}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgb(246,245,243)", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: info.fg }} />
                        </div>
                        <span className="cl-stat-sub" style={{ minWidth: 34, textAlign: "right" }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="cl-card cl-drivers">
          <div className="cl-card-head">
            <h2 className="cl-card-title">Entregas por Motorista</h2>
          </div>
          <table className="cl-table">
            <thead>
              <tr><th>Motorista</th><th>Total</th></tr>
            </thead>
            <tbody>
              {resumo.porMotorista.map((m) => (
                <tr key={m.motorista}>
                  <td className="cl-strong">{m.motorista}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgb(246,245,243)", overflow: "hidden" }}>
                        <div style={{ width: `${(m.total / maxMotorista) * 100}%`, height: "100%", background: "rgb(186,117,17)" }} />
                      </div>
                      <span className="cl-stat-sub" style={{ minWidth: 18, textAlign: "right" }}>{m.total}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {resumo.porMotorista.length === 0 && (
                <tr><td colSpan={2} className="cl-empty">Sem dados.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <section className="cl-card cl-chart-card">
        <h2 className="cl-card-title">Entregas por Dia</h2>
        <div className="cl-chart">
          {resumo.chart.map((c, i) => {
            const max = Math.max(1, ...resumo.chart.map((x) => x.v));
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
