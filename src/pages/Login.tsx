import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { User } from "../types";
import Logo from "../components/Logo";

const STATS = [
  { v: "98%", l: "No Prazo" },
  { v: "2.4k", l: "Entregas/mês" },
  { v: "34", l: "Motoristas" },
];

export default function Login({ onEnter }: { onEnter: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await api.login(email, senha);
      onEnter(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cl-login">
      <div className="cl-login-brand">
        <div className="cl-login-lines" aria-hidden="true" />
        <div className="cl-login-brand-inner">
          <div className="cl-login-brand-top">
            <Logo size={36} radius={9} />
            <div className="cl-brand-text">
              <span className="cl-login-brand-name">CheetahLog</span>
              <span className="cl-login-brand-tag">Gestão de Entregas</span>
            </div>
          </div>
          <div className="cl-login-headline">
            <h2>
              Controle<br />de ponta<br />a ponta.
            </h2>
            <p>
              Gerencie rotas, motoristas e<br />agendamentos em um só lugar.
            </p>
          </div>
          <div className="cl-login-stats">
            {STATS.map((s) => (
              <div key={s.l} className="cl-login-stat">
                <span className="cl-login-stat-v">{s.v}</span>
                <span className="cl-login-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cl-login-form-wrap">
        <form className="cl-login-form" onSubmit={submit}>
          <h3>Bem-vindo de volta</h3>
          <p className="cl-login-form-sub">Faça login para continuar</p>

          {error && <div className="cl-login-error">{error}</div>}

          <label className="cl-field-label">E-mail</label>
          <input
            className="cl-input"
            type="email"
            placeholder="seu@email.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label className="cl-field-label">Senha</label>
          <input
            className="cl-input"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading}
          />

          <a className="cl-forgot" href="#" onClick={(e) => e.preventDefault()}>
            Esqueceu a senha?
          </a>

          <button type="submit" className="cl-btn-primary cl-btn-block" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="cl-login-divider"><span>ou</span></div>
          <p className="cl-login-foot">Primeiro acesso? Fale com o administrador</p>
          <p className="cl-login-hint">
            Admin: <strong>admin@cheetahlog.com</strong> · senha <strong>admin123</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
