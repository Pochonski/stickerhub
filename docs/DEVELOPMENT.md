# Guía de Desarrollo - StickerHub

Documentación técnica para desarrolladores que trabajen en el proyecto.

> **Nota:** El README.md de la raíz está orientado al producto (usuario final).
> Este documento contiene la información técnica (setup, arquitectura, CI/CD).

---

## 📋 Requisitos previos

- **Node.js** 20.x (usar `nvm` y el archivo `.nvmrc`)
- **npm** 10.x (incluido con Node 20)
- **Git** 2.30+
- Cuenta en [Supabase](https://supabase.com) (plan gratuito)
- Cuenta en [Vercel](https://vercel.com) (plan Hobby gratuito)
- Cuenta en [GitHub](https://github.com)

---

## 🚀 Setup local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Pochonski/stickerhub.git
cd stickerhub
```

### 2. Instalar Node.js correcto
```bash
nvm install    # Lee la versión desde .nvmrc
nvm use
```

### 3. Instalar dependencias
```bash
npm ci    # Usa package-lock.json (instalación determinista)
```

### 4. Configurar variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con las credenciales de tu proyecto Supabase
```

### 5. Levantar el servidor de desarrollo
```bash
npm run dev
# → http://localhost:3000
```

---

## 🧰 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (http://localhost:3000) |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia el servidor de producción (requiere `build` previo) |
| `npm run lint` | Ejecuta ESLint sobre todo el código |

---

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas bien definidas:

```
src/
├── app/                  # Next.js App Router (rutas, páginas, API)
│   ├── (routes)/         # Páginas: /album, /trading, /profile, etc.
│   └── api/              # API Routes (controladores HTTP)
│
├── core/                 # Capa de dominio (reglas de negocio puras)
│   ├── domain/
│   │   ├── models/       # Entidades: Player, Team, CardItem, TradeOffer
│   │   ├── rules/        # Lógica: pack-generator, coin-calculator
│   │   └── value-objects/# Tipos primitivos: PackBundle, SpecialStars
│   └── application/
│       └── ports/        # Interfaces de repositorios (contratos)
│
├── infrastructure/       # Implementaciones concretas (Supabase, etc.)
│   ├── supabase/         # Clientes Supabase (admin, server, client)
│   └── repositories/     # Implementaciones de los ports del core
│       └── supabase/     # Repositorios Supabase
│
├── presentation/         # Componentes UI y estado de cliente
│   ├── components/       # React components por dominio
│   │   ├── album/        # AlbumSpread, FlipbookViewer, TeamCard
│   │   ├── pack/         # BoosterPack, FlipCard, PackSummary
│   │   ├── trading/      # TradeCelebration
│   │   ├── auth/         # AuthProvider
│   │   ├── layout/       # AppHeader, AppShell, MobileNav
│   │   └── ui/           # Componentes reutilizables (Modal, Pill)
│   ├── contexts/         # React Context (GameContext)
│   └── hooks/            # Custom hooks (useToast, useLocalStorage)
│
├── data/                 # Datasets estáticos (cards, players, teams)
├── hooks/                # Hooks legacy
├── lib/                  # Utilidades compartidas (pack-generator)
└── types/                # Type definitions (react-pageflip.d.ts)
```

### Flujo de dependencias

```
presentation → application ← infrastructure
                  ↓
                domain
```

- **domain** no depende de nada externo (reglas puras)
- **application** define interfaces (ports) que **infrastructure** implementa
- **presentation** orquesta todo vía inyección de dependencias

---

## 🔄 CI/CD

### Pipeline

El pipeline está definido en `.github/workflows/ci.yml` y se ejecuta en cada push/PR a `main` o `dev`:

1. **Lint** — `npm ci` + `npm run lint` (ESLint + Next.js config)
2. **Build** — `npm run build` (verifica que compila sin errores de TypeScript)
3. **Vercel Deploy** — Automático al hacer push a `main` (manejado por la integración Vercel-GitHub)

### Configuración de secrets en GitHub

Ir a **Settings → Secrets and variables → Actions** y agregar:

| Secret | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública |

> Nota: `SUPABASE_SERVICE_ROLE_KEY` **no** debe estar en GitHub Secrets (solo en Vercel).

### Configuración de variables en Vercel

Ir a **Vercel Project → Settings → Environment Variables** y agregar:

| Variable | Entornos |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |

---

## 🗄️ Base de datos (Supabase)

### Migraciones

Las migraciones SQL están en `supabase/migrations/`:

```
supabase/
├── migrations/
│   ├── 000_full.sql              # Schema inicial completo
│   ├── 003_coins.sql             # Sistema de monedas
│   ├── 004_trade_fixes.sql       # Fixes de trades
│   ├── 005_security_fixes.sql    # Fixes de RLS
│   ├── 006_cleanup_stadiums.sql  # Limpieza
│   ├── 006_unpublish_rpc.sql     # RPC para despublicar listings
│   └── 007_publish_listing_rpc.sql # RPC para publicar listings
```

### Aplicar migraciones localmente
```bash
# Con Supabase CLI (si está instalado):
supabase db push

# O manualmente desde Supabase Studio → SQL Editor → pegar archivo
```

---

## 🌿 Branching y commits

Ver [`docs/BRANCHING.md`](./BRANCHING.md) para la estrategia completa.

Resumen rápido:
- `main` → producción
- `dev` → integración
- `feature/SH-XX-desc` → nuevas funcionalidades
- Commits con formato `feat:`, `fix:`, `chore:`, etc.
- Smart commits con Jira: `SH-XX #done feat: ...`

---

## 🚢 Deploy

### Deploy automático
Cada push a `main` dispara un deploy automático en Vercel:
- **Producción:** https://stickerhub.vercel.app

### Deploy manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login y deploy
vercel login
vercel --prod
```

---

## 📦 Estructura del repositorio

```
stickerhub/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
├── docs/                       # Documentación
│   ├── 02_Stakeholders.docx
│   ├── 03_CICD_Investigacion.docx
│   ├── 04_Analisis_Entorno.docx
│   ├── 05_Plan_Alcance.docx
│   ├── 06_Planes_Gestion_v4.docx
│   ├── 07_Sprints.docx
│   ├── 1-StickerHub_ProjectCharter.docx
│   ├── BRANCHING.md
│   ├── DEVELOPMENT.md          # ← Este archivo
│   ├── Jira_Import_StickerHub.csv
│   └── Jira_Import_StickerHub.json
├── public/                     # Assets estáticos
├── src/                        # Código fuente (Clean Architecture)
├── supabase/
│   └── migrations/             # SQL migrations
├── .env.example                # Template de variables de entorno
├── .editorconfig               # Configuración de editores
├── .gitignore
├── .nvmrc                      # Versión de Node.js
├── eslint.config.mjs           # ESLint flat config
├── next.config.ts              # Next.js config
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md                   # Documentación de producto
├── tsconfig.json
└── vercel.json                 # Configuración de Vercel
```