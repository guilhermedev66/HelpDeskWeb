# Help Desk — Front-end

Front-end do sistema de gestão de chamados Help Desk. Consome a [Help Desk API](../HelpDeskAPI) (ASP.NET Core). Design em Figma: [Help Desk — Design System & Screens](https://www.figma.com/design/qDZMrrRcWOWinTcITyu6mL/Help-Desk-%E2%80%94-Design-System-%26-Screens).

## Stack

React 19, TypeScript, Vite, React Router (data router), TanStack Query, React Hook Form + Zod, CSS Modules com tokens do Figma, Vitest + Testing Library + MSW.

Sem biblioteca de componentes: os componentes (`Button`, `Input`, `NavItem`, `Toast`) são autorais, traduzidos diretamente do Figma para manter a identidade visual definida lá.

## Rodando localmente

### 1. Back-end

```powershell
cd ..\HelpDeskAPI
Copy-Item .env.example .env   # se ainda não existir
docker compose up --build -d
```

A API sobe em `http://localhost:8080`. Veja o README do back-end para detalhes (chave JWT via `dotnet user-secrets`, migrations, etc.).

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

Nunca commite `.env` — apenas `.env.example` (valores fictícios) vai para o Git.

### Por que proxy em vez de CORS

O back-end atual (`C:\dev\HelpDeskAPI`) não tem `AddCors`/`UseCors` configurado. Como front e back rodam em origens diferentes em dev, uma chamada direta do navegador para `http://localhost:8080` seria bloqueada no preflight. Em vez de alterar o back-end, o Vite faz proxy de `/api` para a API (`vite.config.ts`), então o navegador só enxerga uma origem. **Para produção** (front e back publicados em domínios/subdomínios diferentes), a API vai precisar de CORS configurado — isso é uma mudança de back-end fora do escopo deste marco, documentada aqui para quando chegar a hora.

## Autenticação e armazenamento do JWT

- Estratégia: `localStorage` (`src/lib/tokenStorage.ts`), ponto único de leitura/escrita.
- **Risco residual de XSS**: o back-end não expõe cookie `HttpOnly` (não há endpoint de refresh nem infraestrutura de cookie), então o front-end sozinho não elimina o risco de um script malicioso injetado ler o token — isso vale tanto para `localStorage` quanto para um cookie não-`HttpOnly`. A mitigação real (cookie `HttpOnly` + `SameSite`) depende do back-end e está fora do escopo deste marco.
- Sem refresh token: ao expirar (`Jwt:ExpirationMinutes = 30` no back-end) ou receber `401` de qualquer chamada autenticada, a sessão local é limpa e o usuário é redirecionado para `/login`, preservando o destino via `?redirect=`.
- O token nunca é escrito em `console`, DOM ou mensagem de erro.

## Arquitetura

```
src/
  app/          router (data router), ProtectedRoute, queryClient, App
  components/   Button, Input, NavItem, Toast — só o que este marco usa
  features/
    auth/       LoginPage, RegisterPage (stub), AuthContext, api, schema
  layouts/      AuthenticatedLayout (sidebar desktop / rail tablet / bottom nav mobile)
  lib/          httpClient (fetch centralizado + ProblemDetails → mensagem), tokenStorage, authEvents
  styles/       tokens.css (1:1 com variáveis do Figma), global.css
  test/         setup do Vitest, servidor MSW, helper renderApp
  types/        DTOs espelhando os contratos reais do back-end
```

Não existe pasta `routes/` separada: neste marco só há duas rotas públicas e uma protegida, então a árvore de rotas mora em `app/routes.tsx`. Será revisitado quando a listagem de chamados trouxer rotas suficientes para justificar a divisão.

`RegisterPage` é um stub (não há integração com `POST /api/auth/register` ainda) — existe só para o link "Criar conta" do Login (fiel ao Figma) não quebrar a navegação. O cadastro completo é o próximo marco de autenticação.

## Scripts

```bash
npm run dev          # servidor de dev
npm run build         # typecheck + build de produção
npm run lint           # oxlint
npm run format          # prettier --write
npm run format:check     # prettier --check
npm run typecheck         # tsc --noEmit
npm run test                # vitest run
npm run test:watch           # vitest watch
```

## Testes

`src/test/server.ts` mocka a fronteira HTTP (`/api/auth/login`, `/api/auth/me`) com MSW — os testes não mockam componentes internos. Cobrem:

- validação do formulário de login (Zod);
- login bem-sucedido e navegação para a área autenticada;
- credenciais inválidas (401) exibindo a mensagem da API;
- estado de loading do botão durante o submit;
- erro de rede (API indisponível) via toast;
- restauração de sessão via `GET /api/auth/me`;
- limpeza de sessão quando `/me` responde 401;
- logout local;
- proteção de rota (redirect para `/login?redirect=...`);
- encerramento automático de sessão quando qualquer chamada autenticada recebe 401 (`authEvents`).

## Responsividade

Breakpoints: mobile `<768px` (bottom nav, cards), tablet `768–1023px` (rail de ícones), desktop `>=1024px` (sidebar completa). Validado:

- no Figma, nas três larguras (320/375, 768, 1440);
- no navegador real nesta sessão, em ~925px (cai na faixa de tablet) — sidebar rail, foco visível por teclado, sessão restaurada via API real, logout real, sem erros no console.

**Pendência conhecida**: o ambiente de automação de navegador desta sessão manteve o viewport fixo em 925×934 independentemente do `resize_window` solicitado, então os breakpoints de 375 e 1440 não puderam ser confirmados ao vivo neste marco (só via Figma + revisão de CSS). Confirmar em um navegador normal (DevTools → responsive mode) é o primeiro passo recomendado antes de avançar.
