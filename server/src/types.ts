export type StatusKey = "concluido" | "emrota" | "agendado" | "ocorrencia";

export type Rota = {
  id: number;
  codigo: string;
  nome: string;
  regiao: string;
  ativa: boolean;
};

export type MotoristaStatus = "disponivel" | "em_rota" | "em_entrega" | "folga";

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
  data: string;     // YYYY-MM-DD
  horario: string;  // HH:mm
  peso: string;
  status: StatusKey;
  createdAt: string;
};

export type DB = {
  rotas: Rota[];
  motoristas: Motorista[];
  entregas: Entrega[];
  seq: { entrega: number; motorista: number; rota: number; code: number };
};
