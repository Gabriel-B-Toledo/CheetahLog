import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Entregas from "./pages/Entregas";
import Rotas from "./pages/Rotas";
import Motoristas from "./pages/Motoristas";
import Agendamentos from "./pages/Agendamentos";
import Relatorios from "./pages/Relatorios";
import type { NavKey, User } from "./types";

const META: Record<NavKey, { title: string; sub: string }> = {
  Dashboard:    { title: "Dashboard",    sub: "Visão geral de hoje — Sáb, 05 Abr 2026" },
  Entregas:     { title: "Entregas",     sub: "Gerencie todas as entregas do sistema" },
  Rotas:        { title: "Rotas",        sub: "Planejamento e cobertura de rotas" },
  Motoristas:   { title: "Motoristas",   sub: "Equipe e disponibilidade" },
  Agendamentos: { title: "Agendamentos", sub: "Janelas de coleta e entrega" },
  Relatórios:   { title: "Relatórios",   sub: "Desempenho e indicadores" },
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<NavKey>("Dashboard");
  const [entregaSignal, setEntregaSignal] = useState(0);

  if (!user) {
    return (
      <Login
        onEnter={(u) => {
          setUser(u);
          setActive("Dashboard");
        }}
      />
    );
  }

  const meta = META[active];

  function onNew() {
    setActive("Entregas");
    setEntregaSignal((n) => n + 1);
  }

  return (
    <div className="cl-app">
      <Sidebar
        active={active}
        onNav={setActive}
        user={user}
        onLogout={() => setUser(null)}
      />
      <div className="cl-main">
        <Topbar title={meta.title} subtitle={meta.sub} onNew={onNew} />
        {active === "Dashboard" && <Dashboard onSeeAll={() => setActive("Entregas")} />}
        {active === "Entregas" && (
          <Entregas
            openModalSignal={entregaSignal}
            onModalHandled={() => setEntregaSignal(0)}
          />
        )}
        {active === "Rotas" && <Rotas />}
        {active === "Motoristas" && <Motoristas />}
        {active === "Agendamentos" && <Agendamentos />}
        {active === "Relatórios" && <Relatorios />}
      </div>
    </div>
  );
}
