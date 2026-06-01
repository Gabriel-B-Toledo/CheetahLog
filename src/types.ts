export type StatusKey = "concluido" | "emrota" | "agendado" | "ocorrencia";

export type StatusInfo = { label: string; bg: string; fg: string };

export type MotoristaStatus = "disponivel" | "em_rota" | "em_entrega" | "folga";

export type Rota = {
  id: number;
  codigo: string;
  nome: string;
  regiao: string;
  ativa: boolean;
};

export type Motorista = {
  id: number;
  nome: string;
  telefone: string;
  status: MotoristaStatus;
  tint: string;
};

export type Entrega = {
  id: number;
  code: string;
  destino: string;
  motoristaId: number | null;
  rotaId: number | null;
  data: string;
  horario: string;
  peso: string;
  status: StatusKey;
  createdAt: string;
};

export type Stat = { label: string; value: string; sub: string; tint: string };
export type ChartPoint = { dia: string; v: number };

export type Resumo = {
  stats: Stat[];
  chart: ChartPoint[];
  porStatus: { status: StatusKey; total: number }[];
  porMotorista: { motorista: string; total: number }[];
};

export type User = { nome: string; role: string; email?: string };

export type NavKey =
  | "Dashboard"
  | "Entregas"
  | "Rotas"
  | "Motoristas"
  | "Agendamentos"
  | "Relatórios";
