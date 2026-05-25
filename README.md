# StickerHub — Mundial FIFA 2026

Coleccioná stickers digitales de las 48 selecciones del Mundial. Abrí sobres, completá tu colección estilo Panini e intercambiá con amigos.

---

## 🎮 Cómo jugar

### 1. Registro

Ingresá con tu email y recibí un **link mágico** — sin contraseñas. Cada usuario tiene su propia colección, progreso y estadísticas guardadas en la nube.

### 2. Abrir sobres

Cada sobre contiene **6 stickers** aleatorios (4 jugadores + 1 estadio + 1 sede). La apertura tiene una animación al estilo **Pokémon TCG Pocket**: el sobre flota, lo rasgás, las cartas salen en cascada y las volteás una por una para descubrir qué te tocó.

Si una carta ya la tenías, se marca como **repetida** y queda disponible para intercambiar.

### 3. La colección

El álbum es un **flipbook interactivo** con efecto 3D de pasar páginas, simulando un álbum Panini físico. Cada selección ocupa una página con:

- **Header** con bandera, nombre y barra de progreso sobre el degradado del equipo
- **Grid de 20 stickers** con fotos reales de los jugadores (dataset FIFA 26)
- Los cracks tienen badge de estrella ★
- Los stickers coleccionados tienen brillo foil y textura de papel

**48 selecciones · 871 jugadores · Datos reales de FIFA 26**

### 4. Stickers individuales

Al tocar cualquier sticker coleccionado, ves la **ficha completa** del jugador:

- Foto real desde SOFIFA
- Dorsal, posición, equipo
- Datos físicos (estatura, peso, perfil)
- Biografía generada desde el dataset
- **Stats FIFA**: Ritmo, Tiro, Pase, Regate, Defensa, Físico
- Logros destacados

### 5. Intercambios

Publicá tus stickers repetidas en el **marketplace** y otros usuarios pueden solicitarlas. El sistema maneja:

- Publicaciones con búsqueda y filtros
- Solicitud de intercambio (elegís qué ofrecer a cambio)
- Aceptar / rechazar / cancelar
- Transferencia atómica de stickers entre colecciones
- Notificaciones en tiempo real

### 6. Perfil

Tu perfil muestra:

- **Avatar y nombre** (de tu cuenta)
- **Progreso total** de la colección
- **Reputación** de intercambios
- **Insignias** desbloqueables (Primer sticker, 10 stickers, 50 stickers, Colección al 25%/50%, 10 intercambios, etc.)
- **Historial** de intercambios completados

---

## 🖼️ Capturas

*(Agregar screenshots del flipbook, pack opener, perfil y trading)*

---

## 🛠️ Tecnologías

| Capa | Stack |
|------|-------|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 |
| **Backend** | Supabase (Auth, PostgreSQL, Row Level Security, Realtime) |
| **Animaciones** | react-pageflip (álbum 3D) · CSS custom (pack opener, stickers foil) |
| **Datos** | FIFA 26 dataset (18,405 jugadores, top 20 por selección) |
| **Deploy** | Vercel · Supabase |

---

## 📦 Setup local

```bash
git clone https://github.com/pochonski/stickerhub.git
cd stickerhub
npm install
cp .env.local.example .env.local
```

Completá `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

Ejecutá las migraciones SQL en Supabase (`supabase/migrations/000_full.sql`) y luego:

```bash
npm run dev
```

---

## 🚀 Deploy

### Vercel

```bash
vercel --prod
```

Variables de entorno requeridas en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase

Configurar en Authentication → URL Configuration:
- Site URL: `https://tu-dominio.vercel.app`
- Redirect URLs: `https://tu-dominio.vercel.app/**`

Habilitar Email provider (magic link).

---

## 🏗️ Arquitectura

### Rutas

```
/                   Landing page
/album              Vista general de la colección
/album/flipbook     Flipbook 3D con las 48 selecciones
/album/[team]       Detalle de una selección
/card/[id]          Ficha individual de sticker
/pack-opener        Abrir sobres
/trading            Marketplace de intercambios
/my-cards           Gestión de stickers (colección + repetidas)
/profile            Perfil de usuario
/login              Inicio de sesión (magic link)
```

### API Routes

```
GET  /api/collections        Colección del usuario
POST /api/collections        Agregar sticker
GET  /api/packs              Sobres disponibles
POST /api/packs              Abrir sobre (devuelve 6 cartas)
GET  /api/listings           Marketplace
POST /api/listings           Publicar repetida
GET  /api/trades             Historial de intercambios
POST /api/trades             Solicitar intercambio
PUT  /api/trades/[id]/accept  Aceptar (transfiere stickers)
PUT  /api/trades/[id]/reject  Rechazar
PUT  /api/trades/[id]/cancel  Cancelar
GET  /api/profile            Perfil con estadísticas
GET  /api/notifications      Notificaciones del usuario
```

### Base de datos

```
profiles ────< user_collections ────> cards ────> teams
  │
  ├──< user_packs
  ├──< trade_listings
  ├──< trade_offers (from/to)
  ├──< badges
  └──< notifications
```

Todas las tablas con **Row Level Security** — cada usuario solo accede a sus datos.

### Componentes principales

```
components/
├── album/
│   ├── AlbumSpread      Doble página con textura de papel
│   ├── BindingEdge      Anillos de encuadernación
│   ├── FlipbookViewer   Flipbook 3D (react-pageflip)
│   ├── StickerSlot      Sticker individual estilo Panini
│   ├── PositionSilhouette  SVG de silueta por posición
│   └── TeamCard         Tarjeta de selección
├── auth/
│   ├── AuthProvider     Contexto de autenticación (magic link)
│   └── AuthGuard        Protección de rutas
├── layout/
│   ├── AppShell         Contenedor principal
│   ├── AppHeader        Header con avatar y navegación
│   └── AppNav           Navegación principal
├── pack/
│   ├── BoosterPack      Sobre animado con rasgado 3D
│   ├── FlipCard         Carta con giro 3D
│   └── PackSummary      Resumen de sobre abierto
└── ui/
    ├── Modal, Tabs, Pill, ProgressBar, EmptyState, Toast
```

---

## 📂 Estructura de archivos

```
src/
├── app/               # Rutas (App Router)
├── components/        # Componentes React
├── context/           # GameContext (estado híbrido Supabase/localStorage)
├── data/              # 48 equipos, 871 jugadores, cartas
├── hooks/             # useUser, useCollection, useSupabasePacks
├── lib/               # Cliente Supabase
└── types/             # Declaraciones TypeScript
supabase/
└── migrations/        # Schema SQL + seed (2071 líneas)
```

---

## 🔐 Auth flow

```
Usuario ingresa email → Supabase envía magic link → 
Usuario hace clic → Token en URL hash → 
getSupabase().auth.getSession() → sesión establecida →
useUser() retorna el usuario → GameContext usa Supabase
```

---

## 🔄 Trade flow

```
1. Usuario A publica sticker repetido en /trading
2. Usuario B ve la publicación y solicita intercambio
3. Usuario A recibe notificación
4. Usuario A acepta:
   - Sticker A → colección de B
   - Sticker B → colección de A
   - Se actualizan reputaciones
   - Se desactiva la publicación
5. Ambos ven el intercambio en su historial
```
