# CheetahLog
Sistema para agendamento de entregas de cargas, permitindo o controle de rotas, horários e motoristas para otimização das entregas.

# Backlog do Produto Priorizado: CheetahLog

## 📦 Sprint 1: Entrega 01 - Planejamento e Design
**Prazos:** Portfólio Acadêmico (09/03) | Protótipo Figma (05/04)
**Foco:** Definição do escopo, documentação e desenho das interfaces do usuário.

| ID | Módulo | Funcionalidade / Artefato | Descrição da Entrega |
| :--- | :--- | :--- | :--- |
| **US00.1** | Planejamento | Backlog do Produto | Lista de requisitos dividida e priorizada por Sprints. |
| **US00.2** | Documentação | Portfólio Acadêmico | Documento contendo os objetivos do sistema, tecnologias escolhidas e estrutura do projeto. |
| **US00.3** | Design | Protótipo de Alta Fidelidade | Telas desenhadas no Figma (Login, Cadastro de Entregas, Painel Administrativo e Tela do Motorista). |

---

## 💻 Sprint 2: Entrega 02 - Front-end JavaScript
**Foco:** Implementar 4 funcionalidades de interface usando HTML, CSS e JavaScript. Os dados devem ser manipulados via DOM e simulados em memória (Arrays/Objetos locais).

| ID | Perfil | Funcionalidade (User Story) | Critérios de Avaliação (Front-end JS) |
| :--- | :--- | :--- | :--- |
| **US01** | Todos | **Tela de Login Simples** | Validação de campos (evitar submissão em branco) e lógica de redirecionamento baseada no perfil. |
| **US02** | Admin | **Cadastro de Veículos e Motoristas** | Capturar dados do formulário, validar regras simples (ex: placa) e renderizar temporariamente em uma lista. |
| **US03** | Admin | **Formulário de Agendamento** | Interatividade ao adicionar uma entrega, aplicando cálculos simples ou validações de limite de peso. |
| **US04** | Admin | **Painel de Acompanhamento** | Sistema de abas ou filtros usando JavaScript para alternar a visualização das entregas (ex: "Pendente" vs "Entregue") sem recarregar a página. |

---

## ⚙️ Sprint 3: Entrega 03 - Integração Front e Back
**Foco:** Implementar 4 funcionalidades completas (Full-Stack), estruturando o código do servidor (ex: usando Node.js e conceitos de POO) e conectando o banco de dados à interface construída na Sprint 2.

| ID | Perfil | Funcionalidade (User Story) | Implementação Full-Stack |
| :--- | :--- | :--- | :--- |
| **US05** | Admin | **Persistência de Cadastros** | **Back:** Rota `POST` para salvar motoristas/veículos. <br>**Front:** Usar `fetch()` para enviar os dados do formulário. |
| **US06** | Admin | **Gravação de Agendamentos** | **Back:** Rota `POST` para registrar a entrega e vinculá-la a um motorista. <br>**Front:** Disparar a criação do pedido. |
| **US07** | Motorista | **Atualização de Status** | **Back:** Rota `PUT`/`PATCH` para alterar o status da entrega. <br>**Front:** Botão na interface que dispara a requisição de atualização. |
| **US08** | Admin | **Listagem Dinâmica (Read)** | **Back:** Rota `GET` que busca as entregas salvas no banco de dados. <br>**Front:** Consumir o JSON recebido ao carregar a página e construir a tabela dinamicamente. |
