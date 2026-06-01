import type { MotoristaStatus, NavKey, StatusInfo, StatusKey } from "./types";

export const STATUS: Record<StatusKey, StatusInfo> = {
  concluido:  { label: "Concluído",  bg: "rgb(225,245,238)", fg: "rgb(15,110,86)" },
  emrota:     { label: "Em rota",    bg: "rgb(250,238,217)", fg: "rgb(133,79,11)" },
  agendado:   { label: "Agendado",   bg: "rgb(246,245,243)", fg: "rgb(95,94,90)" },
  ocorrencia: { label: "Ocorrência", bg: "rgb(252,235,235)", fg: "rgb(163,46,46)" },
};

export const MOTORISTA_STATUS_LABEL: Record<MotoristaStatus, string> = {
  disponivel:  "Disponível",
  em_rota:     "Em trânsito",
  em_entrega:  "Em entrega",
  folga:       "Folga",
};

export const AVATAR_FG: Record<string, string> = {
  "rgb(225,245,238)": "rgb(15,110,86)",
  "rgb(250,238,217)": "rgb(133,79,11)",
  "rgb(230,241,251)": "rgb(12,68,124)",
  "rgb(237,229,247)": "rgb(128,51,148)",
};

export const NAV: NavKey[] = [
  "Dashboard", "Entregas", "Rotas", "Motoristas", "Agendamentos", "Relatórios",
];

export function initials(name: string): string {
  if (!name || name === "A definir") return "—";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

export function formatData(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
