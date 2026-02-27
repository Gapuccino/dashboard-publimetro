# Dashboard Core Web Vitals — Publimetro

Dashboard interno para monitorear la salud de rendimiento (Core Web Vitals) de todos los sitios del grupo Metro/Publimetro.

## ¿Qué es?

Una herramienta visual que muestra qué tan rápidos y responsivos son nuestros sitios web para los usuarios reales. Monitorea **13 sitios** diariamente y presenta los datos de forma comprensible, con diagnósticos automáticos y recomendaciones de acción.

## ¿Cómo funciona?

```
Google Apps Script (diario 4 AM)
    ↓ Obtiene métricas de CrUX, PageSpeed y GA4
Google Sheets (almacenamiento)
    ↓ CSV público
Dashboard Astro/React (visualización)
```

1. **Google Apps Script** (`docs/google_apps_script.js`) se ejecuta diariamente a las 4 AM
2. Consulta 3 APIs de Google por cada sitio: CrUX (usuarios reales), PageSpeed Insights (laboratorio), y GA4 (nota más vista)
3. Guarda los resultados en una **Google Sheet**
4. El dashboard lee la Sheet como CSV público y presenta los datos

## Stack Tecnológico

| Tecnología             | Uso                                    |
| ---------------------- | -------------------------------------- |
| **Astro**              | Framework SSG principal                |
| **React**              | Componentes interactivos (client:load) |
| **Tailwind CSS**       | Estilos                                |
| **Recharts**           | Gráficas (pie charts, bar charts)      |
| **Framer Motion**      | Animaciones                            |
| **Google Apps Script** | Recolección automática de datos        |

## Métricas Monitoreadas

| Sigla    | Nombre                    | Qué mide                                     |
| -------- | ------------------------- | -------------------------------------------- |
| **FCP**  | First Contentful Paint    | Tiempo hasta el primer contenido visible     |
| **LCP**  | Largest Contentful Paint  | Tiempo hasta que carga el elemento principal |
| **CLS**  | Cumulative Layout Shift   | Estabilidad visual (brincos al cargar)       |
| **INP**  | Interaction to Next Paint | Rapidez de respuesta a interacciones         |
| **TTFB** | Time to First Byte        | Velocidad de respuesta del servidor          |
| **TBT**  | Total Blocking Time       | Tiempo de congelamiento durante carga (Lab)  |

## Ejecutar Localmente

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# → Abre http://localhost:4321

# Build de producción
npm run build
npm run preview
```

## Configuración

### Variables de entorno (`.env`)

```
PUBLIC_PSI_API_KEY=tu_api_key_de_pagespeed
```

Obtén tu API Key gratuita en [Google Developers](https://developers.google.com/speed/docs/insights/v5/get-started).

### Agregar un nuevo sitio

1. En `docs/google_apps_script.js`, agrega el sitio al array `SITES`:
   ```js
   { name: "Nuevo Sitio", url: "https://www.nuevositio.com/", ga4: "ID_PROPERTY" }
   ```
2. Ejecuta `installTrigger()` una vez en Apps Script
3. El sitio aparecerá automáticamente en el dashboard al día siguiente

### Agregar logo de un nuevo sitio

1. Coloca el SVG/PNG en `public/iconos/`
2. En `src/components/SiteCard.jsx`, agrega la condición en la función `getLogo()`
3. Si el logo incluye el nombre del sitio, agrégalo también en `isBrandedSite`

## Estructura del Proyecto

```
├── docs/                    # Google Apps Script (recolección de datos)
├── public/iconos/           # Logos de los sitios
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx    # Componente principal con navegación
│   │   ├── GlobalHealth.jsx # Panel de Salud Global con resumen ejecutivo
│   │   ├── SiteCard.jsx     # Tarjeta detalle por sitio con diagnóstico
│   │   ├── RankingTable.jsx # Tabla ranking de todos los sitios
│   │   ├── MetricTooltip.jsx# Tooltips con explicaciones de métricas
│   │   ├── ExportButton.jsx # Botón para copiar resumen al clipboard
│   │   ├── ScoreChart.jsx   # Gráfica circular de score
│   │   ├── HistoryChart.jsx # Gráfica de historial (30 días)
│   │   └── MetricCard.jsx   # Tarjeta individual de métrica
│   ├── layouts/Layout.astro
│   ├── pages/index.astro
│   ├── services/sheet.js    # Fetch y parseo del CSV de Google Sheets
│   └── styles/global.css
└── package.json
```
