# Sonessia Frontend

Aplicação web da Sonessia para explorar e reproduzir ambientes sonoros, criar composições pessoais e administrar o catálogo. Este diretório é um repositório Git independente do backend `sonessia-api`.

## Stack e estrutura

- React e JavaScript.
- Vite para desenvolvimento e build.
- React Router para rotas SPA (`BrowserRouter`).
- Tailwind CSS 4 para estilos e ESLint para lint.
- `src/pages`, `components`, `layouts`, `routes`, `contexts`, `services`, `hooks`, `utils`, `styles` e `tests` contêm as áreas correspondentes da interface.

O frontend chama a API diretamente pelo cliente central `src/services/api.js`. Não há proxy/BFF neste repositório.

## Desenvolvimento local

Requer Node.js compatível com as dependências instaladas e npm.

```bash
npm ci
npm run dev
```

A API usa `VITE_API_URL`. Configure essa variável no ambiente local para a URL de desenvolvimento da API. O cliente usa `http://localhost:3000` como fallback local; esse fallback não deve ser usado no build de produção.

## Verificações

```bash
npm test
npm run lint
npm run build
npm run preview
```

O build Vite gera os arquivos estáticos em `dist/`. O repositório usa JavaScript e não possui script de typecheck.

## Publicação planejada

A hospedagem planejada é Vercel Free/Hobby, com `npm run build`, saída `dist` e `VITE_API_URL` configurada para a URL HTTPS da API. `vercel.json` encaminha rotas da SPA para `index.html`, permitindo que o React Router resolva links profundos. O backend planejado é Render e o banco PostgreSQL planejado é Neon. A existência e a configuração desses serviços externos não são confirmadas por este repositório.

O frontend chama diretamente o domínio `onrender.com`; CORS, origem, cookies e sessão também dependem da configuração do backend. O refresh cookie usa `SameSite=None; Secure` em produção, mas navegadores que bloqueiam cookies de terceiros podem impedir renovação cross-site ([referência de cookies da MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)). Validar login, renovação, logout e rotas profundas em navegadores reais antes de abrir a aplicação ao público.

Vercel Hobby é destinado a uso pessoal/não comercial ([plano Hobby](https://vercel.com/docs/plans/hobby)); confirme elegibilidade para o uso acadêmico/público pretendido. Render Free tem cold starts, limitações de recursos e não é recomendado pelo Render para workloads de produção ([limites do plano gratuito](https://render.com/docs/free)). O plano e a arquitetura compartilhados são mantidos em `TASKS.md` e `ARCHITECTURE.md` no repositório Git do backend (`sonessia-api`).

## Documentação

- [`DESIGN.md`](./DESIGN.md): sistema visual e padrões de interface.
- [`AGENTS.md`](./AGENTS.md): instruções de trabalho específicas deste repositório.
