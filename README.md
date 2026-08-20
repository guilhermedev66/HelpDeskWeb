# Help Desk — Front-end

Front-end do sistema de gestão de chamados Help Desk: portfólio de um desenvolvedor .NET
mostrando também competência de front-end. Consome a [Help Desk API](../HelpDeskAPI)
(ASP.NET Core) real — nada aqui é mockado em produção; os mocks (MSW) existem só nos testes.

Design em Figma: [Help Desk — Design System & Screens](https://www.figma.com/design/qDZMrrRcWOWinTcITyu6mL/Help-Desk-%E2%80%94-Design-System-%26-Screens).

## Objetivo

Cobrir o fluxo completo de um Help Desk com três perfis (`User`, `Agent`, `Admin`):
autenticação e cadastro, listagem/busca/filtros/paginação de chamados, criação, detalhes
com SLA/comentários/histórico, atribuição e mudança de status/prioridade por Agent/Admin, e
administração de categorias por Admin — respeitando exatamente o contrato real da API (sem
inventar campos, endpoints ou regras que o back-end não oferece).

## Stack

React 19, TypeScript, Vite, React Router 7 (data router), TanStack Query, React Hook Form +
Zod, CSS Modules com tokens traduzidos do Figma, Vitest + Testing Library + MSW.

Sem biblioteca de componentes: `Button`, `Input`, `NavItem`, `Toast`, `Pagination`,
`EmptyState`, `Skeleton` são autorais, traduzidos diretamente do Figma para manter a
identidade visual definida lá em vez de parecer uma instalação padrão de UI kit. Sem Redux,
sem Next.js, sem WebSocket — estado remoto é TanStack Query, estado local é `useState`,
Context só para sessão (`AuthContext`) e feedback global (`ToastProvider`).

## Rodando localmente

### 1. Back-end

```powershell
cd ..\HelpDeskAPI
Copy-Item .env.example .env   # se ainda não existir
docker compose up --build -d
```

A API sobe em `http://localhost:8080`. A chave JWT (`Jwt__Key`) não vem do `.env` do
back-end — configure via `dotnet user-secrets` ou uma variável de ambiente `JWT_KEY` só para
a sessão do terminal (nunca versionada). Veja o README do back-end para detalhes.

### 2. Front-end

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abre em `http://localhost:5173`.

## Variáveis de ambiente

| Variável                | Uso                                            | Exemplo                 |
| ----------------------- | ---------------------------------------------- | ----------------------- |
| `VITE_API_BASE_URL`     | Base usada pelo `httpClient` em runtime        | `/api`                  |
| `VITE_DEV_PROXY_TARGET` | Só em dev: para onde o Vite encaminha `/api/*` | `http://localhost:8080` |

Nunca commite `.env` — só `.env.example` (valores fictícios) vai para o Git.

### Por que proxy em vez de CORS

O back-end atual (`C:\dev\HelpDeskAPI`) não tem `AddCors`/`UseCors` configurado — é uma
divergência de contrato real, documentada e não corrigida aqui porque alterar o back-end
está fora do escopo deste projeto. Como front e back rodam em origens diferentes em dev, uma
chamada direta do navegador para `http://localhost:8080` seria bloqueada no preflight. Em
vez de mexer no back-end, o Vite faz proxy de `/api` para a API (`vite.config.ts`), então o
navegador só enxerga uma origem. **Para produção** (front e back publicados em
domínios/subdomínios diferentes), a API vai precisar de CORS configurado — mudança de
back-end fora do escopo deste projeto, registrada aqui para quando chegar a hora.

## Autenticação e estratégia do JWT

- Fluxo: `POST /api/auth/login` e `POST /api/auth/register` retornam `accessToken` +
  `user` — ambos autenticam a sessão do mesmo jeito (`AuthContext.applySession`).
  `GET /api/auth/me` restaura a sessão a partir do token salvo, no boot da aplicação.
- Armazenamento: `localStorage` (`src/lib/tokenStorage.ts`), ponto único de leitura/escrita.
- **Risco residual de XSS**: o back-end não expõe cookie `HttpOnly` (não há endpoint de
  refresh nem infraestrutura de cookie), então o front-end sozinho não elimina o risco de um
  script malicioso injetado ler o token — isso vale tanto para `localStorage` quanto para um
  cookie não-`HttpOnly` acessível via JS. A mitigação real (cookie `HttpOnly` + `SameSite`)
  depende do back-end e está fora do escopo deste projeto.
- Sem refresh token: ao expirar (`Jwt:ExpirationMinutes = 30` no back-end):
  - **401** → sessão limpa, `unauthenticated`, redirect para `/login?redirect=<destino>`
    (destino sanitizado por `safeRedirectPath` — só aceita caminho interno, rejeita
    `//`, `/\`, URL absoluta).
  - **Erro de rede ou 5xx** → sessão preservada (`error`), sem loading infinito e sem tratar
    o usuário como autenticado antes de validar `/me`; tela oferece "Tentar novamente".
- Qualquer chamada autenticada que receba 401 (não só as de auth) dispara o mesmo fluxo via
  um pub-sub mínimo (`src/lib/authEvents.ts`), evitando import circular entre `lib/` e
  `features/auth/`.
- O token nunca é escrito em `console`, DOM ou mensagem de erro.

## Arquitetura

```
src/
  app/          router (data router), ProtectedRoute, RequireRole, queryClient, App
  components/   Button, ButtonLink, Input, NavItem, Toast, Pagination, EmptyState, Skeleton
  features/
    auth/       Login, Register, AuthContext, api, schema
    tickets/    listagem, criação, detalhes, comentários, histórico, ações de workflow
    categories/ administração de categorias (Admin)
  layouts/      AuthenticatedLayout (sidebar desktop / rail tablet / bottom nav mobile)
  lib/          httpClient, tokenStorage, authEvents, safeRedirect, useDebouncedValue
  styles/       tokens.css (1:1 com variáveis do Figma), global.css
  test/         setup do Vitest, servidor MSW (fixtures + handlers), helper renderApp
  types/        DTOs espelhando os contratos reais do back-end
```

Não existe pasta `routes/` separada: a árvore de rotas cabe inteira em `app/routes.tsx` sem
precisar de mais um nível de indireção.

## Rotas

| Rota                 | Acesso              | Descrição                                                                       |
| -------------------- | ------------------- | ------------------------------------------------------------------------------- |
| `/login`             | público             | também redireciona aqui em 401                                                  |
| `/register`          | público             | cadastro real (`POST /api/auth/register`)                                       |
| `/tickets`           | autenticado         | listagem — escopo depende do perfil                                             |
| `/tickets/new`       | autenticado         | criação de chamado                                                              |
| `/tickets/:ticketId` | autenticado         | detalhes, comentários, histórico, ações                                         |
| `/admin/categories`  | autenticado + Admin | `RequireRole` bloqueia visualmente; a API já bloqueia com 403 de qualquer forma |

## Permissões por perfil

A interface esconde ações sem permissão, mas isso **não substitui** a autorização real do
back-end — toda mutação trata `403`/`404`/`409` retornados pela API.

| Ação                    | User           | Agent                           | Admin                           |
| ----------------------- | -------------- | ------------------------------- | ------------------------------- |
| Ver chamados            | só os próprios | todos                           | todos                           |
| Criar chamado           | sim            | sim                             | sim                             |
| Comentar                | só no próprio  | só se atribuído a ele           | sempre (exceto chamado fechado) |
| Assumir chamado         | não            | se sem agente ou já é ele mesmo | sempre                          |
| Mudar status/prioridade | não            | só se atribuído a ele           | sempre                          |
| Administrar categorias  | não            | não                             | sim                             |

## Tratamento de erros

Centralizado em `src/lib/httpClient.ts` — nenhum componente faz `fetch` direto.

| Status                           | Tratamento                                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 400 (`ValidationProblemDetails`) | erros de campo mapeados via `fieldErrors`, quando as chaves batem com o formulário (ex.: criação de chamado); senão, mensagem geral |
| 401                              | sessão limpa, redirect para login (ver seção de autenticação)                                                                       |
| 403                              | mensagem da API exibida inline                                                                                                      |
| 404                              | tela "não encontrado" com link de volta (chamado)                                                                                   |
| 409 (conflito de versão)         | aviso "foi alterado por outra pessoa" com botão **Recarregar** — nunca repete a mutação sozinho                                     |
| 5xx / erro de rede               | toast (`NetworkError`) ou banner de erro com **Tentar novamente**, conforme o contexto                                              |

### Concorrência otimista (409)

Toda mutação de chamado (`assignment`, `status`, `priority`) envia a `version` atual. Se o
back-end responder 409, o front não tenta de novo automaticamente: mostra o aviso e só
recarrega os dados quando o usuário pede.

## Responsividade

Mobile-first, breakpoints: `<768px` (bottom nav, cards), `768–1023px` (rail de ícones,
tabela reduzida sem colunas secundárias), `>=1024px` (sidebar completa, tabela completa).

Validado:

- no Figma, nas quatro larguras (320, 375, 768, 1440), antes da implementação;
- no navegador real, em ~925px (cai na faixa de tablet) — fluxo completo contra o back-end
  real: login, criação de chamado, comentário, histórico, SLA, listagem com tabela reduzida,
  foco visível, sem erros de console;
- por revisão de CSS dirigida (todo `flex-wrap`/`min-width: 0`/coluna oculta por
  breakpoint), que pegou e corrigiu um overflow real em `CategoryRow` num viewport de 320px
  (commit `fix: prevent category row overflow on narrow viewports`).

**Limitação registrada**: o ambiente de automação de navegador desta sessão manteve o
viewport fixo em 925×934 independentemente do `resize_window` solicitado — 375px, 1440px e
320px não puderam ser confirmados ao vivo, só via Figma + revisão de CSS. Confirmar em
DevTools → responsive mode é o primeiro passo recomendado antes de qualquer ajuste visual
futuro.

## Limitações reais de contrato (não são bugs do front)

- **Sem nome de agente/solicitante na listagem/detalhes**: a API não expõe um diretório de
  usuários (só `GET /api/auth/me`, para o próprio usuário). `AssignedAgentId` e
  `CreatedByUserId` são GUIDs sem endpoint para resolver nome — o front mostra a relação com
  o usuário atual ("Você" / "Outro usuário" / "Não atribuído") em vez de inventar um nome
  (`src/features/tickets/presentation.ts`).
- **Categoria de chamado desativada**: `GET /api/categories` só retorna categorias ativas.
  Um chamado ligado a uma categoria desativada mostra "—" em vez de um nome adivinhado.
- **Sem CORS no back-end**: contornado via proxy do Vite em dev (ver acima); produção exige
  configurar CORS no back-end.
- **Agent/Admin não são autoprovisionáveis**: `POST /api/auth/register` sempre atribui a
  role `User` — não há endpoint para se autopromover. Os fluxos de Agent/Admin foram
  validados com MSW (`WorkflowActions.test.tsx`, `CategoriesAdminPage.test.tsx`), não contra
  a API real nesta sessão.

## Testes

87 testes em 15 arquivos, `npm run test`. `src/test/server.ts` mocka a fronteira HTTP com
MSW (fixtures determinísticas + handlers com estado mutável resetado a cada teste) — os
testes não mockam componentes internos nem detalhes de implementação. Cobrem, entre outros:

- login, cadastro, validação de formulário, credenciais inválidas, e-mail duplicado;
- restauração de sessão, falha temporária (rede/5xx) preservando o token, retry manual, 401
  limpando a sessão, logout, proteção de rota com redirect sanitizado;
- listagem: filtros (status/prioridade/categoria/busca com debounce), paginação, limpar
  filtros, estado vazio, erro com retry, skeleton de loading;
- criação de chamado: validação, categorias ativas, 400 (regra de negócio) e 400
  (`ValidationProblemDetails`), erro de rede, sucesso com navegação, envio duplo bloqueado;
- detalhes: SLA, histórico traduzido, comentários (visíveis/permitidos por regra real, sem
  inserção otimista), chamado fechado, 404, erro genérico com retry;
- ações de Agent/Admin: assumir chamado, mudar status/prioridade, transições visuais
  coerentes com o back-end, confirmação antes de fechar, conflito 409, 403, por perfil
  (User/Agent/Admin);
- categorias: `RequireRole` bloqueando não-Admin, listar ativas/inativas, criar, conflito de
  nome (409), renomear, ativar/desativar com confirmação, vazio, erro com retry;
- navegação por perfil (link Categorias só para Admin, nome do papel real exibido);
- acessibilidade: skip link, foco movido para o conteúdo principal ao trocar de rota.

`npm audit`: 0 vulnerabilidades.

## Acessibilidade

- Landmarks semânticos (`header`, `nav` × 3 rotulados, `main`), sem ARIA redundante sobre
  HTML que já é semântico.
- Skip link ("Pular para o conteúdo principal") e foco movido para `<main>` a cada troca de
  rota — React Router não faz isso sozinho numa SPA.
- Formulários: `label` associado via `htmlFor`/`id`, `aria-invalid` e `aria-describedby` nos
  campos com erro, `role="alert"` em mensagens de erro, foco automático no primeiro campo
  inválido (comportamento padrão do React Hook Form).
- Feedback nunca depende só de cor: badges de status/prioridade/SLA sempre têm texto.
- Foco visível global (`:focus-visible`) e `prefers-reduced-motion` respeitado (spinner,
  skeleton, transições).

## Decisões técnicas — resumo para entrevista

- **CSS Modules sem lib de componentes**: controle total da identidade visual definida no
  Figma, sem parecer instalação padrão de um UI kit.
- **TanStack Query só para estado remoto**: cache, invalidação seletiva por
  mutação (nunca "invalida tudo"), `keepPreviousData` na paginação para não piscar loading a
  cada página.
- **Sem inserção otimista em comentários**: evita duplicar/errar dado se o servidor rejeitar
  (403/404/400) — só reflete depois da API confirmar.
- **`safeRedirectPath` isolado e testado**: único ponto que decide se um `?redirect=` é
  seguro, usado tanto no redirect pós-login quanto no de usuário já autenticado.
- **`presentation.ts` como fronteira explícita**: em vez de fingir que o front-end tem dados
  que a API não oferece (nome de agente/solicitante), a lógica de "o que mostrar quando falta
  informação" fica isolada e documentada num único lugar.

## Scripts

```bash
npm run dev            # servidor de dev (proxy /api -> back-end)
npm run build           # typecheck + build de produção
npm run lint             # oxlint
npm run format            # prettier --write
npm run format:check       # prettier --check
npm run typecheck           # tsc --noEmit
npm run test                  # vitest run
npm run test:watch             # vitest watch
npm run preview                 # serve o build de produção localmente
```

## Deploy na Vercel

O arquivo `vercel.json` redireciona rotas da SPA para `index.html`, preservando o acesso direto a URLs como `/tickets` e `/admin/categories`. Configure `VITE_API_BASE_URL` nos ambientes Production e Preview com a URL pública HTTPS da API seguida de `/api` e faça um novo deploy sempre que esse valor mudar.

> A API de demonstração utiliza infraestrutura gratuita. Após um período sem uso, a primeira requisição pode levar mais tempo enquanto o serviço sai da hibernação.

## Sugestões futuras (fora do MVP)

- Endpoint de diretório de usuários/agentes, para resolver nomes reais em vez de "Outro
  usuário"/"Não atribuído".
- Endpoint para provisionar/promover Agent/Admin (hoje só é possível via acesso direto ao
  banco, fora do escopo deste front-end).
- Recuperação de senha, refresh token, cookies `HttpOnly` — dependem de trabalho no
  back-end, deliberadamente fora de escopo aqui.
