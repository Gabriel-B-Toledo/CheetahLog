import type { Entrega, Motorista, Resumo, Rota, User } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, senha: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    }),

  listEntregas: (params: { status?: string; q?: string; data?: string; agendadasFuturas?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.q) qs.set("q", params.q);
    if (params.data) qs.set("data", params.data);
    if (params.agendadasFuturas) qs.set("agendadasFuturas", "1");
    const s = qs.toString();
    return request<Entrega[]>(`/api/entregas${s ? "?" + s : ""}`);
  },
  createEntrega: (body: Partial<Entrega>) =>
    request<Entrega>("/api/entregas", { method: "POST", body: JSON.stringify(body) }),
  updateEntrega: (id: number, body: Partial<Entrega>) =>
    request<Entrega>(`/api/entregas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteEntrega: (id: number) =>
    request<{ ok: true }>(`/api/entregas/${id}`, { method: "DELETE" }),

  listMotoristas: () => request<Motorista[]>("/api/motoristas"),
  createMotorista: (body: Partial<Motorista>) =>
    request<Motorista>("/api/motoristas", { method: "POST", body: JSON.stringify(body) }),
  updateMotorista: (id: number, body: Partial<Motorista>) =>
    request<Motorista>(`/api/motoristas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteMotorista: (id: number) =>
    request<{ ok: true }>(`/api/motoristas/${id}`, { method: "DELETE" }),

  listRotas: () => request<Rota[]>("/api/rotas"),
  createRota: (body: Partial<Rota>) =>
    request<Rota>("/api/rotas", { method: "POST", body: JSON.stringify(body) }),
  updateRota: (id: number, body: Partial<Rota>) =>
    request<Rota>(`/api/rotas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteRota: (id: number) =>
    request<{ ok: true }>(`/api/rotas/${id}`, { method: "DELETE" }),

  resumo: () => request<Resumo>("/api/relatorios/resumo"),
};
