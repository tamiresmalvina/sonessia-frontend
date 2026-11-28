# Instruções para agentes — Sonessia Frontend

## Escopo e estrutura

Este é o repositório Git do frontend; o backend `sonessia-api` é independente. Não presuma que alterações de um repositório estão publicadas no outro.

Stack confirmada: React, JavaScript, Vite, React Router, Tailwind CSS 4 e ESLint. Código em `src/`: `pages`, `components`, `layouts`, `routes`, `contexts`, `services`, `hooks`, `utils`, `styles` e testes em `src/tests`. `vite.config.js` configura React e Tailwind. `BrowserRouter` gerencia as rotas.

## Processo

- Antes de editar, verifique `git status`, diff e os arquivos relevantes. Preserve alterações locais preexistentes, inclusive arquivos não rastreados.
- Para tarefas significativas, apresente um plano curto com escopo, arquivos, validação e riscos e depois prossiga se a solicitação já autorizar a implementação.
- Faça mudanças completas e dentro do pedido. Não refatore áreas não relacionadas nem altere contratos da API sem necessidade.
- Ao terminar, informe arquivos modificados, resumo, verificações executadas, resultados, falhas e pendências.

## Segurança e integração

- A API é chamada diretamente por `src/services/api.js`; `VITE_API_URL` deve apontar para o backend. O fallback `localhost` é apenas para desenvolvimento e não serve para deploy.
- Chamadas usam `credentials: "include"` e access token Bearer. Refresh token fica em cookie HttpOnly do backend. Não acesse o cookie pelo JavaScript.
- Access token atual é guardado em `localStorage` com “lembrar-me” e `sessionStorage` sem essa opção; é legível por JavaScript. Não registre tokens ou dados pessoais em logs, testes ou documentação.
- O cliente centraliza refresh após `401`, compartilha a renovação concorrente na aba e usa Web Locks para coordenar abas quando disponível. Tenta cada requisição no máximo uma vez e limpa a sessão/encaminha ao login após falha. Preserve essa proteção e sua cobertura de testes; sem Web Locks, a coordenação é limitada à aba.
- Bodies reproduzíveis como JSON, Blob e FormData podem ser reenviados; não introduza retry de streams não reproduzíveis ou operações que possam duplicar efeitos sem avaliar idempotência.
- CORS, validação de `Origin`, autorização e regras de negócio pertencem também ao backend. Não relaxe a segurança da API para contornar erros no navegador.
- `SameSite=None; Secure` em produção não garante cookies cross-site quando o navegador bloqueia cookies de terceiros. Documente e teste essa limitação; não prometa suporte universal.
- Uploads são enviados diretamente à API/Cloudinary; não suponha que passem por Vercel Functions.
- Segredos nunca devem estar em variáveis `VITE_*`: valores Vite são incorporados ao bundle público. Não leia nem copie valores de `.env` para respostas.

## Comandos reais

- `npm test` — testes usando Node.js test runner (`node --test src/tests/*.test.mjs`).
- `npm run lint` — ESLint.
- `npm run build` — `vite build`; saída padrão `dist/`.
- `npm run dev` — servidor local Vite; `npm run preview` — preview local do build.

Não há TypeScript nem script de typecheck neste frontend. Não instale/atualize dependências fora do escopo autorizado.

## Deploy e operações externas

- Não faça deploy, commit ou push sem autorização explícita para essa ação.
- Não configure Vercel, backend hospedado ou banco remoto por iniciativa própria.
- Não execute migrations, operações destrutivas ou alterações em serviços externos.
- O projeto usa `BrowserRouter` e `vercel.json` envia rotas da SPA para `index.html` na Vercel. Preserve essa regra e valide links diretos/refresh em preview antes da publicação.
- Vercel Free/Hobby e Render Free têm limitações de finalidade, disponibilidade e tráfego. Registre limites sem declarar o app pronto para produção antes de testes publicados.

## Documentação

- `README.md` descreve o frontend, configuração local e integração por variável de ambiente.
- `DESIGN.md` documenta o sistema visual; mantenha-o alinhado à interface, sem duplicar instruções de deploy.
- Atualize documentação junto com mudanças de comportamento. Não inclua credenciais, tokens, URLs com parâmetros sensíveis ou dados pessoais.
