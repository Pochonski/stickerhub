# Imágenes para generar — Cartas de Estadios y Sedes

StickerHub incluye 8 cartas especiales (4 estadios + 4 sedes) que necesitan imágenes personalizadas.
Las imágenes deben ser estilo **sticker/cromo deportivo**, formato 1:1 (cuadrado), mínimo 400x400px.

---

## Estadios (4 cartas)

| ID | Nombre | Descripción de la imagen | Guardar como |
|----|--------|--------------------------|--------------|
| `lus1` | Estadio Lusail | Vista exterior del estadio icónico de Catar, diseño bowl dorado, iluminado de noche | `estadio-lusail.jpg` |
| `azt1` | Estadio Azteca | El coloso mexicano, vista desde dentro mostrando las gradas monumentales con banderas | `estadio-azteca.jpg` |
| `mac1` | Estadio Maracaná | Vista aérea o exterior del templo brasileño con el Cristo Redentor al fondo | `estadio-maracana.jpg` |
| `wem1` | Estadio Wembley | El arco icónico de Wembley iluminado, vista exterior de noche | `estadio-wembley.jpg` |

## Sedes (4 cartas)

| ID | Nombre | Descripción de la imagen | Guardar como |
|----|--------|--------------------------|--------------|
| `doh1` | Doha, Catar | Skyline moderno de Doha con rascacielos futuristas y la bahía | `sede-doha.jpg` |
| `cdm1` | Ciudad de México | El Ángel de la Independencia o el Zócalo con la bandera monumental | `sede-cdmx.jpg` |
| `nyn1` | Nueva York / NJ | Skyline de Manhattan con el MetLife Stadium visible o la Estatua de la Libertad | `sede-nynj.jpg` |
| `rio1` | Río de Janeiro | El Pan de Azúcar o Cristo Redentor con las playas y montañas | `sede-rio.jpg` |

---

## Dónde van

Copiar las 8 imágenes a:
```
public/
  estadio-lusail.jpg
  estadio-azteca.jpg
  estadio-maracana.jpg
  estadio-wembley.jpg
  sede-doha.jpg
  sede-cdmx.jpg
  sede-nynj.jpg
  sede-rio.jpg
```

## Cómo usarlas

Las imágenes se vinculan automáticamente si existen. Cada carta de estadio/sede busca su imagen en `public/` y la muestra en la vista de detalle (`/card/[id]`). Si no existe la imagen, se muestra el nombre en texto grande sobre el degradado de color del equipo.

---

## Estilo visual

- Formato cuadrado (1:1), mínimo 400x400px
- Estilo fotográfico, no ilustración
- Colores vibrantes, buen contraste
- Sin texto ni marcas de agua
- Enfoque en el sujeto principal (estadio o skyline)
- JPEG calidad 85%
