# StickerHub — El Album Virtual del Mundial 2026

Coleccioná, intercambiá y completá tu album Panini digital con las 48 selecciones del Mundial. Abrí sobres, descubrí jugadores y armá tu colección.

---

## El Album

Imaginate un album de figuritas que vive en tu bolsillo. StickerHub es un **flipbook interactivo** — pasás las páginas como si tuvieras el album físico en las manos, con el sonido del papel y los anillos de encuadernación. Cada selección tiene su doble página con la bandera, los colores del equipo, y los espacios para pegar cada sticker.

Cuando completás un sticker nuevo, se pega con brillo foil — ese momento de "¡me salió!" que todos conocemos. Y cuando llenás un equipo entero, el album te celebra con fuegos artificiales y monedas de recompensa.

**48 selecciones · 871 jugadores · Datos reales del Mundial 2026**

---

## Abrir Sobres

Cada sobre es una pequeña ceremonia. Lo ves flotar, lo rasgás con el dedo, y las cartas empiezan a salir en cascada. Una por una, las vas volteando para descubrir quiénes te tocaron.

El sobre trae **6 jugadores** de cualquier selección del mundo. Podés comprar sobres sueltos o en paquetes. También podés comprar sobres de un equipo específico — ideal cuando te faltan pocos para completar una selección.

Si te sale repetida, no pasa nada: te sirve para intercambiar por la que te falta.

---

## El Mercado de Intercambios

Acá es donde el album se vuelve social. Publicás tus repetidas en el marketplace y otros coleccionistas pueden pedírtelas. Vos también podés buscar lo que te falta y ofrecer algo a cambio.

Cuando recibís una solicitud, te llega una notificación. La aceptás, y el intercambio se hace solo: las cartas cambian de dueño, las reputaciones suben, y el listing se desactiva. Todo automático, sin pasos extra.

El marketplace tiene filtros por tipo de carta, por selección, por valor de jugador. Podés buscar cracks de 90+ o rellenar huecos de equipos chicos.

---

## Los Jugadores

Cada sticker es una ventana al jugador. Tocás cualquier carta coleccionada y ves su **ficha completa**:

- Foto real
- Dorsal, posición, selección
- Estatura, peso, perfil
- Los seis stats de FIFA: Ritmo, Tiro, Pase, Regate, Defensa, Físico
- Logros destacados (campeón de Champions, goleador del torneo, mundialista)

Los cracks tienen una **estrella dorada ★** que los distingue en el album. Messi, Cristiano, Mbappé, Vinicius, Haaland — los 24 jugadores más valiosos del torneo brillan más que el resto.

---

## Tu Perfil

Cada coleccionista tiene su espacio. Tu perfil muestra:

- Cuántas cartas tenés y cuántas te faltan
- Cuántos sobres abriste
- Tu **reputación** como intercambiador (sube cada vez que completás un intercambio)
- Las insignias que vas desbloqueando al alcanzar hitos

Es tu carta de presentación en el marketplace — una reputación alta te hace más confiable para intercambiar.

---

## Monedas y Tienda

Cada carta tiene un valor en monedas según su rareza. Las cartas de cracks valen más, y las estrellas doradas ★ valen todavía más. Cuando descartás repetidas, ganás monedas.

En la tienda usás esas monedas para comprar más sobres. También podés comprar sobres temáticos de un equipo específico si querés apuntar a completar una selección en particular. Y al completar un equipo entero, el album te premia con 2,000 monedas.

---

## La Colección

Administrar tu colección es parte del juego. En tu sección de cartas podés ver todo lo que tenés, filtrar por equipo, posición, valor, y decidir qué hacer con cada repetida: ¿la descartás por monedas o la publicás para intercambiar?

También hay una vista de album general donde ves, de un vistazo, cómo vas con cada selección. Barras de progreso por equipo, cuántas te faltan, y el botón directo para ir a completar.

---

## Empezá a Jugar

Entrás con tu correo electrónico y recibís un enlace mágico — sin contraseñas, sin registros largos. Tu colección se guarda en la nube y la ves desde cualquier dispositivo. Al empezar, el album te regala 5 sobres de bienvenida para que arranques tu colección.

---

**StickerHub** · El album del Mundial en tu bolsillo.

---

## CI/CD y DevOps — Pipeline de Integración y Despliegue Continuo

> **Entregable #8** del Proyecto Final de Administración de Proyectos G51 (ITCR, I Sem 2026).
> Demostración práctica de los conceptos de CI/CD aplicados al proyecto.
> **Ver video:** (link al video una vez grabado)

Este proyecto implementa un pipeline completo de **Integración Continua (CI)** y **Despliegue Continuo (CD)** utilizando herramientas dentro del plan gratuito, aplicando los principios DevOps (modelo CAMS: Cultura, Automatización, Medición, Compartir) en un equipo de 2 personas.

### Stack del pipeline

| Componente | Herramienta | Costo | Función |
|---|---|---|---|
| Repositorio + CI | **GitHub** + **GitHub Actions** | Gratis | Versionado + ejecución automática de tests y build |
| Hosting + Deploy | **Vercel** | Gratis (Hobby) | Despliegue automático en cada push a `main` |
| Base de datos + Auth | **Supabase** | Gratis (500 MB / 50k MAU) | PostgreSQL + Auth con magic link |

### ¿Qué se automatiza?

Cada vez que se hace **push a `main` o `dev`**, o se abre un **Pull Request**, se ejecuta automáticamente:

1. **Lint** — `npm ci` + `npm run lint` (ESLint con configuración Next.js)
2. **Build** — `npm run build` (Next.js 16 con Turbopack, verificación de TypeScript)
3. **Deploy** — Vercel detecta el push y despliega a producción automáticamente

**Tiempo total del pipeline:** ~1m 24s
**Tiempo de commit a producción:** < 5 minutos

### Estrategia de branching

```
feature/SH-XX-desc  ──┐
                      │
bugfix/SH-XX-desc   ──┼──►  dev  ──────────►  main  ──────────►  v1.0.0 (tag)
                      │       │                  ▲
                      │       └── PR + review ───┘
                      │
                      └── (cada merge dispara CI automático)
```

- **`main`** — Producción, siempre desplegable, protegida
- **`dev`** — Integración del equipo, base para features
- **`feature/SH-XX-desc`** — Una rama por historia de usuario, mergeada vía PR a `dev`
- **Tag `v1.0.0`** — Release oficial del MVP

### Convención de commits

Cada commit sigue el formato **Conventional Commits + Smart Commits de Jira**:

```bash
# Formato
<tipo>: <descripción>
[SH-XX] #done <tipo>: <descripción>

# Ejemplos reales del proyecto
feat: add flipbook viewer component
SH-01 #done chore: configure CI/CD pipeline with GitHub Actions
SH-01 #done fix(eslint): disable react-hooks/refs to allow CI pass
```

Los Smart Commits con `[SH-XX] #done` mueven automáticamente las tarjetas en Jira al hacer merge, sin necesidad de actualizaciones manuales.

### Badges de estado

![CI Status](https://github.com/Pochonski/stickerhub/actions/workflows/ci.yml/badge.svg)
![Vercel](https://vercel.com/button)

### Evidencia del pipeline funcionando

- **Pipeline CI/CD en vivo:** https://github.com/Pochonski/stickerhub/actions
- **Producción:** https://stickerhub.vercel.app
- **Tag v1.0.0:** https://github.com/Pochonski/stickerhub/releases/tag/v1.0.0

### Lecciones aprendidas (documentadas)

1. **Configurar CI/CD en el Sprint 1** rindió desde el Sprint 2 — eliminó deploys manuales
2. **`npm ci` en lugar de `npm install`** garantiza instalaciones deterministas (sin "funciona en mi máquina")
3. **Endpoints con `supabaseAdmin`** requieren `Authorization: Bearer <token>` explícito, no cookies — bug crítico documentado en Sprint 4
4. **Smart Commits** redujeron el trabajo administrativo de actualizar Jira manualmente
5. **Cultura DevOps con equipo pequeño** genera confianza y base para escalar

### Documentación técnica adicional

- [`docs/BRANCHING.md`](./docs/BRANCHING.md) — Estrategia de branching completa
- [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) — Guía de desarrollo (setup + arquitectura)
- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — Definición del pipeline

---

**StickerHub** · El album del Mundial en tu bolsillo · CI/CD con GitHub Actions + Vercel
