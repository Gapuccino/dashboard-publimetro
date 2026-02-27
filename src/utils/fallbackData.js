/**
 * Datos de respaldo utilizados en caso de que la conexión
 * con el servicio de Google Sheets falle o devuelva vacío.
 *
 * Cada objeto representa un sitio y contiene las métricas vitales
 * separadas por entorno (Móvil vs Escritorio) y tipo de página
 * (Home vs Artículo), además de datos analíticos de GA4.
 *
 * @type {Array<Object>}
 */
export const FALLBACK_DATA = [
  {
    siteName: "Publimetro MX",
    home: {
      url: "https://www.publimetro.com.mx/",
      score: 85,
      lcp: "2.1s",
      cls: "0.05",
      inp: "150ms",
    },
    article: {
      url: "https://www.publimetro.com.mx/noticias/2023/10/24/nota-mas-vista",
      score: 72,
      lcp: "3.5s",
      cls: "0.15",
      inp: "220ms",
    },
    analytics: {
      activeUsers: 14500,
      views: 1250000,
      bounceRate: 0.45,
      avgSessionDuration: 120,
      sessions: 850000,
    },
  },
  {
    siteName: "Metro PR",
    home: {
      url: "https://www.metro.pr/",
      score: 45,
      lcp: "5.2s",
      cls: "0.25",
      inp: "300ms",
    },
    article: {
      url: "https://www.metro.pr/noticias/2023/10/24/nota-destacada",
      score: 60,
      lcp: "4.8s",
      cls: "0.20",
      inp: "280ms",
    },
    analytics: {
      activeUsers: 8500,
      views: 750000,
      bounceRate: 0.55,
      avgSessionDuration: 95,
      sessions: 550000,
    },
  },
  {
    siteName: "Publimetro Colombia",
    home: {
      url: "https://www.publimetro.co/",
      score: 72,
      lcp: "3.0s",
      cls: "0.10",
      inp: "210ms",
    },
    article: {
      url: "https://www.publimetro.co/noticias/2023/10/24/articulo-top",
      score: 68,
      lcp: "3.2s",
      cls: "0.12",
      inp: "230ms",
    },
    analytics: {
      activeUsers: 12000,
      views: 950000,
      bounceRate: 0.48,
      avgSessionDuration: 110,
      sessions: 720000,
    },
  },
  {
    siteName: "Publimetro Chile",
    home: {
      url: "https://www.publimetro.cl/",
      score: 92,
      lcp: "1.8s",
      cls: "0.01",
      inp: "120ms",
    },
    article: {
      url: "https://www.publimetro.cl/noticias/2023/10/24/breaking-news",
      score: 88,
      lcp: "2.0s",
      cls: "0.02",
      inp: "140ms",
    },
  },
  {
    siteName: "Publimetro Brasil",
    home: {
      url: "https://www.metrojournaal.br/",
      score: 60,
      lcp: "4.0s",
      cls: "0.15",
      inp: "250ms",
    },
    article: {
      url: "https://www.metrojournaal.br/noticias/2023/10/24/manchete",
      score: 55,
      lcp: "4.2s",
      cls: "0.18",
      inp: "270ms",
    },
  },
  {
    siteName: "Metro World News",
    home: {
      url: "https://www.metroworldnews.com/",
      score: 78,
      lcp: "2.5s",
      cls: "0.08",
      inp: "180ms",
    },
    article: {
      url: "https://www.metroworldnews.com/noticias/2023/10/24/world-news",
      score: 75,
      lcp: "2.8s",
      cls: "0.10",
      inp: "200ms",
    },
  },
  {
    siteName: "Nueva Mujer",
    home: {
      url: "https://www.nuevamujer.com/",
      score: 88,
      lcp: "2.0s",
      cls: "0.03",
      inp: "140ms",
    },
    article: {
      url: "https://www.nuevamujer.com/lifestyle/2023/10/24/tendencias",
      score: 85,
      lcp: "2.3s",
      cls: "0.05",
      inp: "160ms",
    },
  },
  {
    siteName: "FayerWayer",
    home: {
      url: "https://www.fayerwayer.com/",
      score: 55,
      lcp: "4.5s",
      cls: "0.20",
      inp: "280ms",
    },
    article: {
      url: "https://www.fayerwayer.com/tech/2023/10/24/review",
      score: 50,
      lcp: "5.0s",
      cls: "0.22",
      inp: "300ms",
    },
  },
  {
    siteName: "IGN Latam",
    home: {
      url: "https://latam.ign.com/",
      score: 65,
      lcp: "3.8s",
      cls: "0.12",
      inp: "240ms",
    },
    article: {
      url: "https://latam.ign.com/games/2023/10/24/review-game",
      score: 62,
      lcp: "4.0s",
      cls: "0.14",
      inp: "260ms",
    },
  },
  {
    siteName: "Reviewbox",
    home: {
      url: "https://www.reviewbox.com.mx/",
      score: 95,
      lcp: "1.5s",
      cls: "0.00",
      inp: "100ms",
    },
    article: {
      url: "https://www.reviewbox.com.mx/productos/2023/10/24/best-products",
      score: 93,
      lcp: "1.6s",
      cls: "0.01",
      inp: "110ms",
    },
  },
  {
    siteName: "Autos RPM",
    home: {
      url: "https://www.autosrpm.com/",
      score: 40,
      lcp: "6.0s",
      cls: "0.30",
      inp: "350ms",
    },
    article: {
      url: "https://www.autosrpm.com/test-drive/2023/10/24/new-car",
      score: 38,
      lcp: "6.2s",
      cls: "0.32",
      inp: "370ms",
    },
  },
  {
    siteName: "Publimetro Peru",
    home: {
      url: "https://www.publimetro.pe/",
      score: 70,
      lcp: "3.2s",
      cls: "0.09",
      inp: "220ms",
    },
    article: {
      url: "https://www.publimetro.pe/noticias/2023/10/24/local-news",
      score: 68,
      lcp: "3.4s",
      cls: "0.11",
      inp: "240ms",
    },
  },
  {
    siteName: "El Calce",
    home: {
      url: "https://www.elcalce.com/",
      score: 50,
      lcp: "4.8s",
      cls: "0.18",
      inp: "290ms",
    },
    article: {
      url: "https://www.elcalce.com/contexto/2023/10/24/opinion",
      score: 48,
      lcp: "5.0s",
      cls: "0.20",
      inp: "310ms",
    },
  },
];
