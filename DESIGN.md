# Design System — Plataforma Sonessia

Este documento registra formalmente o **Design System oficial da plataforma Sonessia**, consolidado a partir da implementação da Homepage e estendido com rigor visual a todas as telas de autenticação e fluxos da aplicação.

---

## 1. Identidade Visual

### 1.1 Conceito da Marca

A **Sonessia** é uma plataforma focada em imersão sonora, personalização de ambientes acústicos (ruídos coloridos, sons naturais, texturas instrumentais) e suporte ao foco, relaxamento e bem-estar.
Sua identidade visual combina **minimalismo sofisticado**, **clareza espacial** e **harmonia cromática**, transmitindo sensações de serenidade, tecnologia e fluidez sonora.

### 1.2 Características Gerais

- **Composição limpa e arejada:** generosidade de espaços negativos para evitar fadiga visual e proporcionar calma.
- **Micro-interações suaves:** feedback imediato com transições confortáveis (`transition-all duration-200`).
- **Dualidade de tema:** suporte nativo e coeso aos modos **Light (Claro)** e **Dark (Escuro)** através de variáveis CSS customizadas e utilitários Tailwind CSS v4.
- **Gráficos vetoriais de ondas sonoras:** barras verticais proporcionais com cantos arredondados (pills) que remetem diretamente a equalizadores e osciloscópios acústicos.

---

## 2. Paleta de Cores e Tokens

O sistema cromático do Sonessia utiliza tokens semânticos mapeados diretamente em `:root` (Light Mode) e `.dark` (Dark Mode) em `src/index.css`.

### 2.1 Modo Claro (Light Mode — Padrão)

| Token CSS                                | Valor HEX | Utilidade e Aplicação                                             |
| ---------------------------------------- | --------- | ----------------------------------------------------------------- |
| `--bg` (`bg-bg`)                         | `#F7F7FC` | Fundo principal da página, cabeçalho e viewport                   |
| `--bg-2` (`bg-bg-2`)                     | `#F0F0F8` | Fundo secundário, áreas agrupadas, inputs desabilitados           |
| `--surface` (`bg-surface`)               | `#FFFFFF` | Superfície de cards, modais, formulários e painéis de dados       |
| `--surface-hover`                        | `#F4F3FB` | Estado de hover em itens de superfície e botões discretos         |
| `--surface-active`                       | `#EBEAF6` | Estado de clique/pressão em cards e botões secundários            |
| `--surface-selected`                     | `#EFEAF9` | Estado selecionado de abas, filtros e chips de categorias         |
| `--border-subtle` (`border-line-subtle`) | `#E6E5F0` | Linhas divisórias sutis, bordas inferiores de header e rodapés    |
| `--border` (`border-line`)               | `#D6D4E6` | Bordas normais de inputs, cards, caixas e seletores               |
| `--border-strong` (`border-line-strong`) | `#8F8BA6` | Bordas em foco, separadores contrastantes                         |
| `--text-1` (`text-fg`)                   | `#181625` | Texto primário, títulos principais (H1, H2), labels ativos        |
| `--text-2` (`text-fg-2`)                 | `#625F72` | Texto secundário, subtítulos, corpo de formulários                |
| `--text-3` (`text-fg-3`)                 | `#75728A` | Texto terciário, legendas, instruções de apoio, labels auxiliares |
| `--text-disabled` (`text-fg-disabled`)   | `#AEABBF` | Placeholders, textos desabilitados, hints discretos               |
| `--icon-1` (`text-icon`)                 | `#2E2B40` | Ícones primários com alto contraste                               |
| `--icon-2` (`text-icon-2`)               | `#6B6880` | Ícones de controle de tema e navegação                            |
| `--icon-muted`                           | `#9A97AE` | Ícones informativos, controles de visibilidade de senha           |
| `--accent` (`text-accent`, `bg-accent`)  | `#7656A8` | Roxo principal da marca Sonessia                                  |
| `--accent-hover`                         | `#684A98` | Hover de botões e links de destaque                               |
| `--accent-active`                        | `#5A3F86` | Estado ativo/pressionado da cor da marca                          |
| `--accent-soft`                          | `#EFEAF9` | Fundo suave de chips, badges e realces                            |
| `--accent-subtle`                        | `#F5F2FC` | Destaque ultra-suave de itens ativos                              |
| `--accent-border`                        | `#C2B2E0` | Borda de badges e chips selecionados                              |
| `--focus` (`ring-focus`, `border-focus`) | `#6474C8` | Anel de foco acessível e borda de campos em foco                  |
| `--indigo`                               | `#6474C8` | Tom secundário do gradiente da marca                              |
| `--violet`                               | `#8A5FC7` | Tom intermediário do gradiente de áudio                           |
| `--blue`                                 | `#536DCB` | Tom azul do espectro acústico e badges                            |
| `--pink`                                 | `#C875A8` | Tom magenta suave do espectro acústico                            |
| `--cyan`                                 | `#61A8C7` | Ruído azul e elementos acústicos aquáticos                        |

### 2.2 Modo Escuro (Dark Mode — `.dark`)

| Token CSS                  | Valor HEX | Utilidade e Aplicação                            |
| -------------------------- | --------- | ------------------------------------------------ |
| `--bg` (`bg-bg`)           | `#0F1020` | Fundo principal imersivo noturno                 |
| `--bg-2` (`bg-bg-2`)       | `#14152A` | Fundo secundário e áreas de agrupamento noturnas |
| `--surface` (`bg-surface`) | `#191A32` | Superfície elevada de cards e formulários        |
| `--surface-hover`          | `#20213D` | Hover noturno em cards e botões                  |
| `--surface-active`         | `#26284A` | Estado pressionado em superfícies noturnas       |
| `--surface-selected`       | `#252447` | Superfície selecionada noturna                   |
| `--border-subtle`          | `#23243F` | Linhas divisórias sutis no modo escuro           |
| `--border`                 | `#303151` | Bordas de inputs e caixas no modo escuro         |
| `--border-strong`          | `#5C5D85` | Bordas de alto contraste noturnas                |
| `--text-1` (`text-fg`)     | `#F4F1FA` | Texto primário claro para alta legibilidade      |
| `--text-2` (`text-fg-2`)   | `#B8B5CB` | Texto secundário claro                           |
| `--text-3` (`text-fg-3`)   | `#8F8CA8` | Texto de apoio e legendas noturnas               |
| `--text-disabled`          | `#55566F` | Textos desativados e placeholders no modo escuro |
| `--accent`                 | `#9A72D8` | Roxo de destaque iluminado para fundo escuro     |
| `--accent-hover`           | `#AB85E3` | Hover do roxo de destaque no modo escuro         |
| `--accent-soft`            | `#252447` | Badges e superfícies roxas noturnas              |
| `--focus`                  | `#7185E2` | Indicador de foco de alta visibilidade noturna   |

### 2.3 Cores Semânticas de Estado

| Estado                  | Token / Classes                                        | Modo Claro            | Modo Escuro           | Aplicação                                                  |
| ----------------------- | ------------------------------------------------------ | --------------------- | --------------------- | ---------------------------------------------------------- |
| **Erro / Perigo**       | `border-rose-200 bg-rose-50/80 text-rose-800`          | `#E11D48` / `#FFF1F2` | `#FDA4AF` / `#4C0519` | Alertas de validação, campos inválidos, falhas de API      |
| **Sucesso**             | `border-emerald-200 bg-emerald-50/80 text-emerald-800` | `#059669` / `#ECFDF5` | `#6EE7B7` / `#022C22` | Confirmação de e-mail, senha redefinida, links enviados    |
| **Alerta / Informação** | `border-indigo-200 bg-indigo-50/70 text-indigo-800`    | `#4F46E5` / `#EEF2FF` | `#A5B4FC` / `#1E1B4B` | Informativos de reenvio de código e dicas de preenchimento |

### 2.4 Gradientes da Marca

- **Degradê Principal (Botões e Destaques):**  
  `linear-gradient(100deg, #7656A8 0%, #6474C8 100%)`  
  _Hover:_ `linear-gradient(100deg, #684A98 0%, #5667B8 100%)`
- **Degradê de Áudio / Ondas Sonoras:**  
  `linear-gradient(90deg, #536DCB 0%, #8A5FC7 55%, #C875A8 100%)`
- **Degradê da Linha Ativa de Navegação:**  
  `linear-gradient(90deg, #7656A8 0%, #6474C8 100%)` com cantos arredondados na borda inferior do cabeçalho.
- **Degradê Vetorial do Logotipo Sonessia:**  
  `linear-gradient(0deg, #5E67CE 0%, #7656A8 50%, #9B51B6 100%)`

---

## 3. Tipografia e Hierarquia

A família tipográfica oficial da plataforma é **Geist**, com suporte a **Geist Mono** para códigos e dados tabulares.

### 3.1 Famílias Tipográficas

- **Sans-serif Principal:** `"Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monoespaçada:** `"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### 3.2 Escala e Hierarquia Textual

| Elemento                 | Classes Tailwind                          | Tamanho     | Peso           | Letter-Spacing    | Line-Height     |
| ------------------------ | ----------------------------------------- | ----------- | -------------- | ----------------- | --------------- |
| **Display / Hero H1**    | `text-[52px] md:text-[72px]`              | 52px / 72px | 300 (Light)    | `-0.05em`         | `1` (none)      |
| **Título de Página H1**  | `text-2xl sm:text-3xl`                    | 24px / 30px | 700 (Bold)     | `-0.03em`         | `1.2` (tight)   |
| **Título de Seção H2**   | `text-xl sm:text-2xl`                     | 20px / 24px | 600 (Semibold) | `-0.02em`         | `1.3`           |
| **Subtítulo / Lead**     | `text-sm sm:text-base`                    | 14px / 16px | 400 (Normal)   | `0`               | `1.6` (relaxed) |
| **Label de Formulário**  | `text-sm font-medium`                     | 14px        | 500 (Medium)   | `0`               | `1.2`           |
| **Corpo / Input Text**   | `text-base`                               | 16px        | 400 (Normal)   | `0`               | `1.5`           |
| **Código Numérico**      | `font-mono text-2xl tracking-[0.4em]`     | 24px        | 400 (Normal)   | `0.4em` a `0.6em` | `1`             |
| **Legenda / Ajuda**      | `text-xs`                                 | 12px        | 400 ou 500     | `0`               | `1.4`           |
| **Overline / Categoria** | `text-[11px] uppercase tracking-[0.14em]` | 11px        | 500 (Medium)   | `0.14em`          | `1`             |

---

## 4. Espaçamentos, Dimensões e Layout

A Sonessia adota uma grade base modular de **4px** (padrão Tailwind CSS):

### 4.1 Escala de Espaçamento Comum

- `gap-1.5` (6px) / `gap-2` (8px): ícones com texto
- `gap-3` (12px): alertas de erro e itens de cabeçalho
- `gap-4` (16px) / `gap-5` (20px): espaçamento entre campos de formulário
- `gap-8` (32px): navegação entre abas de menu
- `py-3 px-4` (12px / 16px): padding interno de campos de texto e inputs
- `px-6 py-10 sm:px-10 sm:py-12`: padding de contêineres de autenticação

### 4.2 Larguras e Contêineres

- **Largura Máxima do Cabeçalho / App:** `max-w-[1440px]` ou `max-w-7xl`
- **Largura Máxima de Conteúdo Central da Home:** `max-w-[1120px]`
- **Largura Máxima do Formulário de Auth (Split-screen):** `max-w-[420px]`
- **Largura Máxima do Card Central (Recuperar / Redefinir Senha):** `max-w-[440px]`

### 4.3 Alturas Padronizadas

- **Cabeçalho Desktop:** `h-[72px]` (ou `h-16` / 64px mínimo)
- **Campos de Entrada (Inputs):** `h-11` (44px) a `h-12` (48px)
- **Botões Principais:** `h-9` (36px, cabeçalho/chips) e `h-11` (44px, formulários)
- **Botões de Alternância de Tema:** `size-9` (36px) ou `size-10` (40px)

---

## 5. Bordas, Arredondamentos e Superfícies

### 5.1 Border Radius (Raio de Arredondamento)

- `rounded-md` (6px): botões pequenos, controles discretos
- `rounded-lg` (8px): botões do cabeçalho, chips, tags
- `rounded-xl` (12px): campos de entrada (inputs), caixas de alerta, botões de ação principal
- `rounded-2xl` (16px): cards de formulário e cards de som
- `rounded-full` (9999px): avatares, pílulas de navegação, equalizadores sonoros

### 5.2 Sombras e Profundidade

- `shadow-sm`: `0 1px 2px 0 rgba(24, 22, 37, 0.05)`
- `shadow`: `0 1px 3px 0 rgba(24, 22, 37, 0.1), 0 1px 2px -1px rgba(24, 22, 37, 0.1)`
- `hover:shadow`: elevação tátil durante o estado hover em cards e botões
- `--lift`: sombra com brilho interno para botões sonoros (`0 1px 0 rgba(255, 255, 255, 0.9) inset...`)

---

## 6. Padrões de Componentes Visuais

### 6.1 Botão Primário (Ação Principal)

Utilizado para confirmações essenciais, como _Criar conta_, _Entrar_, _Confirmar e-mail_ e _Redefinir senha_:

```html
<button
  type="submit"
  class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
>
  Texto do Botão
</button>
```

### 6.2 Campos de Formulário (Inputs)

Padronização de inputs de texto, e-mail, senha e data:

```html
<input
  type="email"
  class="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg placeholder:text-fg-disabled transition-all focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
  placeholder="seuemail@exemplo.com"
/>
```

#### Campo com Estado de Erro / Inválido:

```html
<input
  class="w-full rounded-xl border border-rose-400 bg-rose-50/20 text-fg focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
  aria-invalid="true"
/>
```

### 6.3 Mensagens de Feedback (Alertas)

- **Erro:**
  ```html
  <div
    role="alert"
    class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
  >
    <!-- Ícone de alerta em SVG -->
    <span class="font-medium leading-relaxed">Mensagem de erro</span>
  </div>
  ```
- **Sucesso:**
  ```html
  <div
    role="status"
    class="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
  >
    <!-- Ícone de check em SVG -->
    <span class="font-medium leading-relaxed"
      >Operação realizada com sucesso!</span
    >
  </div>
  ```

### 6.4 Links de Navegação

- **Link com destaque:** `text-accent font-medium hover:text-accent-hover hover:underline transition-colors`
- **Link secundário/neutro:** `text-fg-3 hover:text-fg transition-colors`

---

## 7. Responsividade e Adaptações

### 7.1 Breakpoints do Projeto

- `sm`: `640px` (smartphones grandes / tablets verticais)
- `md`: `768px` (tablets horizontais / notebooks compactos)
- `lg`: `1024px` (desktops padrão)
- `xl`: `1280px` (telas amplas)

### 7.2 Estratégia de Layout para Autenticação

- **Desktop e Notebooks (`md:` em diante):**  
  Layout dividido em duas colunas (_split-screen_ 50% / 50%).
  - Lado esquerdo: formulário de alta concentração com fundo `bg-surface` e borda divisória sutil `border-line-subtle`.
  - Lado direito: painel visual sonoro imersivo com ondas dinâmicas, luz ambiente suave e tipografia inspiradora.
- **Dispositivos Móveis e Tablets Verticais (`< md`):**  
  O painel visual sonoro é omitido (`hidden md:flex`) para focar 100% da atenção do usuário no preenchimento rápido e sem rolagem horizontal indesejada. O formulário ocupa toda a largura disponível de forma centralizada e ergonomicamente amigável ao toque.

---

## 8. Animações e Transições

- **Transição de Cor e Fundo:** `transition-colors duration-200` ou `transition-all duration-200`.
- **Animações Contínuas:**
  - `animate-pulse`: barras sonoras do equalizador no painel visual.
  - `animate-spin`: indicador circular de carregamento nos botões durante a submissão de formulários.
- **Micro-interações de clique:** `active:scale-[0.99]` para conferir peso tátil e responsividade sensorial ao toque.

---

## 9. Convenções de Código e Boas Práticas

1. **Evitar Valores HEX Hardcoded:** utilize sempre as classes semânticas mapeadas pelo Tailwind (`bg-bg`, `bg-surface`, `text-fg`, `text-fg-2`, `text-accent`, `border-line`, etc.) para garantir compatibilidade imediata com o tema Dark.
2. **Preservar Acessibilidade:**
   - Todo campo deve ter `htmlFor` correspondente ao `id` do elemento.
   - Indicadores visuais de foco com `focus-visible:ring-2 focus-visible:ring-focus` em todos os elementos clicáveis.
   - Campos inválidos devem receber `aria-invalid="true"` e `aria-describedby` apontando para a mensagem de erro.
   - Botões de ícones devem conter `aria-label` descritivo.
3. **Consistência Tipográfica:** manter sempre títulos principais com tracking sutil negativo (`tracking-[-0.03em]`) e corpo de texto com entrelinha relaxada (`leading-relaxed`).
