# Loan Simulator

A multi-step loan simulation tool built with SvelteKit, styled with Capitec brand guidelines.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [SvelteKit 3](https://kit.svelte.dev) with Svelte 5 (Runes mode) |
| Language | TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Component library | [shadcn-svelte](https://shadcn-svelte.com) (Vega style) + [bits-ui](https://bits-ui.com) |
| Icons | [Lucide Svelte](https://lucide.dev) |
| Package manager | pnpm |
| Server adapter | `@sveltejs/adapter-node` |

---

## Colours

Defined in `src/routes/layout.css` as Tailwind CSS 4 `@theme` tokens.

### Brand Blues (Capitec)
| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#1d63c4` | Primary actions, links |
| `brand-700` | `#003da5` | Capitec official navy |
| `brand-100` | `#cfdff4` | Light backgrounds |

Full scale: `brand-50` → `brand-950`

### Semantic Palette (light mode)
| Token | Hex | Usage |
|---|---|---|
| `--background` | `#FCF0DA` | Page background |
| `--card` | `#FFFCF0` | Card surfaces |
| `--primary` | `#AEAC78` | Primary UI colour |
| `--secondary` | `#F2C46A` | Secondary/highlight |
| `--accent` | `#4C4541` | Accent elements |

### Status Colours
| Scale | Primary token | Hex |
|---|---|---|
| Success | `success-500` | `#00a651` |
| Danger | `danger-500` | `#ef4444` |
| Warning | `warning-500` | `#f59e0b` |

---

## Typography

**Font:** [Open Sans Variable](https://fonts.google.com/specimen/Open+Sans)  
**Source:** `@fontsource-variable/open-sans` (self-hosted, no CDN request)  
**CSS variable:** `--font-sans: 'Open Sans Variable', sans-serif`

Applied globally via:
```css
html {
  @apply font-sans;
}
```

---

## Local Development

```sh
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Type-check
pnpm check
```

---

## Running with Docker

### Prerequisites
- Docker installed and running
- Lockfile up to date — run `pnpm install` locally if you've just changed `package.json`

### 1 — Build the image

```sh
docker build -t loan-simulator .
```

This uses a two-stage build:
- **builder** — installs all dependencies and compiles the app with `pnpm build`
- **runner** — a lean `node:22-alpine` image that ships only the compiled `build/` output

### 2 — Run the container

```sh
docker run -p 3000:3000 loan-simulator
```

The app will be available at **http://localhost:3000**.

### Optional: custom port or environment variables

```sh
docker run \
  -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  loan-simulator
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `HOST` | `0.0.0.0` | Host binding (keep as-is for Docker) |
| `NODE_ENV` | `production` | Node environment |

---

## Project Structure

```
src/
├── lib/
│   ├── assets/          # Static assets (SVG favicon, etc.)
│   └── components/      # Svelte components
│       ├── ui/          # shadcn-svelte primitives
│       ├── PersonalInfoStep.svelte
│       ├── FinancialInfoStep.svelte
│       ├── LoanDetailsStep.svelte
│       ├── ResultsPanel.svelte
│       └── StepIndicator.svelte
└── routes/
    ├── layout.css       # Global styles, theme tokens, font import
    ├── +layout.svelte
    ├── +page.svelte
    └── api/loans/       # SvelteKit API routes
```
