# Estrategia de Branching - StickerHub

Este documento define la estrategia de branching del repositorio **StickerHub**, alineada con la metodología SCRUM y las prácticas CI/CD descritas en `03_CICD_Investigacion.docx`.

---

## 🌿 Ramas principales

| Rama | Propósito | Rama base | Merge hacia |
|---|---|---|---|
| `main` | Producción - siempre en estado desplegable | — | — |
| `dev` | Integración del equipo | `main` | `main` (vía PR) |

## 🌱 Ramas de trabajo (corta duración)

| Rama | Propósito | Rama base | Merge hacia | Convención |
|---|---|---|---|---|
| `feature/<id>-<slug>` | Nueva funcionalidad / historia de usuario | `dev` | `dev` | `feature/SH-05-album-flipbook` |
| `bugfix/<id>-<slug>` | Corrección de bug no urgente | `dev` | `dev` | `bugfix/SH-17-fix-trade-401` |
| `hotfix/<id>-<slug>` | Fix urgente en producción | `main` | `main` + `dev` | `hotfix/SH-99-fix-deploy` |
| `release/<version>` | Preparación de release (versionado, fixes menores) | `dev` | `main` + `dev` | `release/v1.1.0` |

---

## 🔄 Flujo de trabajo

```
feature/SH-XX-desc  ──┐
                      │
feature/SH-YY-desc  ──┼──►  dev  ──────────►  main  ──────────►  v1.0.0 (tag)
                      │       │                  ▲
bugfix/SH-ZZ-desc   ──┘       │                  │
                              └── PR + review ───┘
```

### Paso a paso

1. **Crear feature branch desde `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/SH-05-album-flipbook
   ```

2. **Desarrollar + commits convencionales + smart commits Jira:**
   ```bash
   git commit -m "feat: add flipbook viewer component"
   git commit -m "SH-05 #done feat: implement 48 team flipbook navigation"
   ```

3. **Push + Pull Request hacia `dev`:**
   ```bash
   git push origin feature/SH-05-album-flipbook
   # Abrir PR en GitHub: feature/SH-05-album-flipbook → dev
   ```

4. **CI valida el PR** (`.github/workflows/ci.yml` corre lint + build).

5. **Code review + aprobación** → merge a `dev`.

6. **Al cerrar sprint / preparar release:**
   - PR de `dev` → `main`
   - CI valida
   - Merge → Vercel deploy automático
   - Crear tag: `git tag -a v1.0.0 -m "Release MVP" && git push origin v1.0.0`

---

## 📝 Convención de commits (Conventional Commits + Smart Commits Jira)

### Formato
```
<tipo>(<scope>): <descripción>      [Jira-ID]

# Con smart commit de Jira:
[Jira-ID] #done <tipo>: <descripción>
```

### Tipos permitidos
- `feat:` — Nueva funcionalidad
- `fix:` — Corrección de bug
- `docs:` — Cambios solo en documentación
- `style:` — Formato (sin cambio lógico)
- `refactor:` — Cambio de código sin nueva feature ni fix
- `test:` — Agregar o corregir tests
- `chore:` — Build, CI, configs, deps
- `ci:` — Cambios en CI/CD

### Ejemplos reales del proyecto

```bash
feat: add magic link authentication form
SH-02 #done feat: implement magic link sign-up

fix: rls policy blocks own user queries
SH-12 #done fix: rls policy on user_collections

ci: add github actions workflow
SH-01 #done chore: configure GitHub Actions + Vercel integration
```

---

## 🚫 Reglas de protección de `main` (recomendado configurar en GitHub)

- ✅ Require pull request reviews before merging (≥ 1 aprobación)
- ✅ Require status checks to pass before merging (CI debe estar verde)
- ✅ Require linear history (squash merge)
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

---

## 🏷️ Versionado (SemVer)

Formato: `vMAJOR.MINOR.PATCH` (ej. `v1.0.0`, `v1.1.0`, `v1.0.1`)

- **MAJOR**: cambios incompatibles con releases anteriores
- **MINOR**: nueva funcionalidad retrocompatible
- **PATCH**: fixes retrocompatibles

Para MVP académico se usa `v1.0.0` como tag único de cierre.