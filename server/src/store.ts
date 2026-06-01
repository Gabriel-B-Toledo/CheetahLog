import { mockRepo } from "./mockRepo.js";
import { initMysqlRepo } from "./mysqlRepo.js";
import type { Repo } from "./repo.js";

/**
 * Seleciona a camada de persistência: tenta MySQL e, se o banco não estiver
 * acessível, cai automaticamente no mock JSON para a aplicação seguir funcionando.
 */
export async function createRepo(): Promise<Repo> {
  try {
    const repo = await initMysqlRepo();
    console.log("[CheetahLog] Persistência: MySQL");
    return repo;
  } catch (err) {
    console.warn(
      "[CheetahLog] MySQL indisponível — usando mock JSON. Motivo:",
      (err as Error).message,
    );
    return mockRepo;
  }
}
