import type { Entrega, Motorista, MotoristaStatus, Rota, StatusKey } from "./types.js";

/** Tints rotativos usados para colorir avatares de motoristas. */
export const TINTS = [
  "rgb(225,245,238)",
  "rgb(250,238,217)",
  "rgb(230,241,251)",
  "rgb(237,229,247)",
];

export type RotaInput = { codigo: string; nome: string; regiao: string; ativa: boolean };
export type MotoristaInput = { nome: string; telefone: string; status: MotoristaStatus };
export type EntregaInput = {
  destino: string;
  motoristaId: number | null;
  rotaId: number | null;
  data: string;
  horario: string;
  peso: string;
  status: StatusKey;
};

/**
 * Camada de persistência. Implementada por MySQL (mysqlRepo) e, como
 * fallback automático quando o banco não está disponível, pelo mock JSON
 * (mockRepo). As rotas HTTP só falam com esta interface.
 */
export interface Repo {
  readonly kind: "mysql" | "mock";

  listRotas(): Promise<Rota[]>;
  createRota(input: RotaInput): Promise<Rota>;
  updateRota(id: number, fields: Partial<RotaInput>): Promise<Rota | null>;
  deleteRota(id: number): Promise<boolean>;

  listMotoristas(): Promise<Motorista[]>;
  createMotorista(input: MotoristaInput): Promise<Motorista>;
  updateMotorista(id: number, fields: Partial<MotoristaInput>): Promise<Motorista | null>;
  deleteMotorista(id: number): Promise<boolean>;

  listEntregas(): Promise<Entrega[]>;
  createEntrega(input: EntregaInput): Promise<Entrega>;
  updateEntrega(id: number, fields: Partial<EntregaInput>): Promise<Entrega | null>;
  deleteEntrega(id: number): Promise<boolean>;
}
