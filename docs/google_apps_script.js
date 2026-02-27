const PSI_API_KEY = "AIzaSyDwDuwv3cR6TZwZKPF3rlw2oaNGsEv3_mo";

const SITES = [
  {
    name: "Publimetro MX",
    url: "https://www.publimetro.com.mx/",
    ga4: "267948860",
  },
  {
    name: "Metro Puerto Rico",
    url: "https://www.metro.pr/",
    ga4: "301150515",
  },
  {
    name: "Metro Ecuador",
    url: "https://www.metroecuador.com.ec/",
    ga4: "268003463",
  },
  {
    name: "MWN",
    url: "https://www.metroworldnews.com/",
    ga4: "283971315",
  },
  {
    name: "Publimetro Colombia",
    url: "https://www.publimetro.co/",
    ga4: "268737997",
  },
  {
    name: "Publimetro Guatemala",
    url: "https://www.publinews.gt/",
    ga4: "422453464",
  },
  {
    name: "Publimetro Chile",
    url: "https://www.publimetro.cl/",
    ga4: "251598898",
  },
  {
    name: "Nueva Mujer",
    url: "https://www.nuevamujer.com/",
    ga4: "268739443",
  },
  {
    name: "Fayerwayer",
    url: "https://www.fayerwayer.com/",
    ga4: "268947931",
  },
  {
    name: "El Calce",
    url: "https://www.elcalce.com/",
    ga4: "301106387",
  },
  {
    name: "Ferplei",
    url: "https://www.ferplei.com/",
    ga4: "288444552",
  },
  {
    name: "Sagrosso",
    url: "https://www.sagrosso.com/",
    ga4: "321109979",
  },
  {
    name: "MWN Brasil",
    url: "https://www.metroworldnews.com.br/",
    ga4: "454335700",
  },
];

// Nombre de la hoja donde se guardarán los datos
const SHEET_NAME = "Data";

// --- CONFIGURACIÓN BASE ---

/**
 * Función de inicialización para configurar la ejecución programada.
 * Instala un activador (trigger) en Google Apps Script para que
 * la extracción se ejecute diariamente a las 4:00 AM de forma automatizada.
 */
function installTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "runDailyReport") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("runDailyReport")
    .timeBased()
    .everyDays(1)
    .atHour(4)
    .create();

  Logger.log(
    "Reporte programado exitosamente. Ejecución diaria a las 4:00 AM.",
  );
}

/**
 * Controlador principal responsable de iterar sobre el arreglo de SITES.
 * Por cada sitio, consume las interfaces de CrUX, PageSpeed Insights (Lab) y GA4
 * para extraer las métricas correspondientes y volcarlas como una nueva fila en Google Sheets.
 */
function runDailyReport() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log(
      `ERROR: Hoja "${SHEET_NAME}" no encontrada. Creación requerida.`,
    );
    return;
  }

  const today = new Date();
  const dateStr = Utilities.formatDate(
    today,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );

  SITES.forEach((site) => {
    Logger.log(`Procesando evaluación para: ${site.name}`);

    // Extracción iterativa de datos por proveedor y dispositivo
    const fieldData = fetchCrUXData(site.url, "PHONE");

    // 1b. Obtener Datos de Campo DESKTOP (CrUX)
    Utilities.sleep(500);
    const desktopData = fetchCrUXData(site.url, "DESKTOP");

    // 2. Obtener Datos de Laboratorio MOBILE (PageSpeed Insights)
    const labData = fetchPageSpeedLabData(site.url, "MOBILE");

    // 2b. Obtener Datos de Laboratorio DESKTOP (PageSpeed Insights)
    Utilities.sleep(1000);
    const labDesktopData = fetchPageSpeedLabData(site.url, "DESKTOP");

    // 3. Obtener la nota más vista desde GA4
    const topArticle = fetchTopArticleFromGA4(site.ga4, site.url);

    // 4. Obtener vitals de la nota más vista (si existe)
    let storyFieldData = {
      score: "",
      lcp: "-",
      cls: "-",
      inp: "-",
      fcp: "-",
      ttfb: "-",
    };
    let storyDesktopData = {
      score: "",
      lcp: "-",
      cls: "-",
      inp: "-",
    };
    if (topArticle.url && topArticle.url !== "") {
      storyFieldData = fetchCrUXData(topArticle.url, "PHONE");
      Utilities.sleep(500);
      storyDesktopData = fetchCrUXData(topArticle.url, "DESKTOP");
      Utilities.sleep(500);
    }

    // 4.5 Obtener métricas globales del sitio desde GA4
    const globalAnalytics = fetchGlobalAnalyticsFromGA4(site.ga4);

    // 5. Preparar la fila
    const row = [
      dateStr, // A: Date
      site.name, // B: Site Name
      site.url, // C: Home URL
      fieldData.score, // D: Home Score (Field - Mobile)
      fieldData.lcp, // E: Home LCP (Field - Mobile)
      fieldData.cls, // F: Home CLS (Field - Mobile)
      fieldData.inp, // G: Home INP (Field - Mobile)
      topArticle.url, // H: Top Story URL
      storyFieldData.score, // I: Story Score
      storyFieldData.lcp, // J: Story LCP
      storyFieldData.cls, // K: Story CLS
      storyFieldData.inp, // L: Story INP
      "Automated", // M: Method Used
      labData.score, // N: Lab Home Score
      labData.lcp, // O: Lab Home LCP
      labData.cls, // P: Lab Home CLS
      labData.tbt, // Q: Lab Home TBT
      fieldData.fcp, // R: Home FCP (Field - Mobile)
      fieldData.ttfb, // S: Home TTFB (Field - Mobile)
      labData.fcp, // T: Lab FCP
      labData.speedIndex, // U: Lab Speed Index
      labData.ttfb, // V: Lab TTFB
      topArticle.title, // W: Top Story Title
      topArticle.views, // X: Top Story Views
      desktopData.score, // Y: Desktop Score
      desktopData.lcp, // Z: Desktop LCP
      desktopData.cls, // AA: Desktop CLS
      desktopData.inp, // AB: Desktop INP
      desktopData.fcp, // AC: Desktop FCP
      desktopData.ttfb, // AD: Desktop TTFB
      labDesktopData.score, // AE: Lab Desktop Score
      labDesktopData.lcp, // AF: Lab Desktop LCP
      labDesktopData.cls, // AG: Lab Desktop CLS
      labDesktopData.tbt, // AH: Lab Desktop TBT
      labDesktopData.fcp, // AI: Lab Desktop FCP
      labDesktopData.speedIndex, // AJ: Lab Desktop Speed Index
      labDesktopData.ttfb, // AK: Lab Desktop TTFB
      storyDesktopData.score, // AL: Story Desktop Score
      storyDesktopData.lcp, // AM: Story Desktop LCP
      storyDesktopData.cls, // AN: Story Desktop CLS
      storyDesktopData.inp, // AO: Story Desktop INP
      globalAnalytics.activeUsers, // AP: Active Users
      globalAnalytics.views, // AQ: Total Views
      globalAnalytics.bounceRate, // AR: Bounce Rate
      globalAnalytics.avgSessionDuration, // AS: Avg Session Duration
      globalAnalytics.sessions, // AT: Sessions
    ];

    // 6. Escribir en la hoja
    try {
      sheet.appendRow(row);
      Logger.log(`[OK] Guardado: ${site.name}`);
    } catch (e) {
      Logger.log(`[ERROR] Error guardando ${site.name}: ${e.message}`);
    }

    // Pausa para no saturar APIs
    Utilities.sleep(1000);
  });
}

/**
 * Consulta la API de PageSpeed Insights para recoger métricas de rendimiento sintético (Lab).
 *
 * @param {string} url - URL del sitio a analizar.
 * @param {string} [strategy="MOBILE"] - Estrategia de análisis ('MOBILE' o 'DESKTOP').
 * @returns {Object} Objeto con métricas (score, lcp, cls, tbt, fcp, speedIndex, ttfb).
 */
function fetchPageSpeedLabData(url, strategy) {
  strategy = strategy || "MOBILE";
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      const keyParam =
        PSI_API_KEY && PSI_API_KEY !== "TU_API_KEY_AQUI"
          ? `&key=${PSI_API_KEY}`
          : "";
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&strategy=${strategy}${keyParam}`;

      const response = UrlFetchApp.fetch(apiUrl, { muteHttpExceptions: true });

      if (response.getResponseCode() !== 200) {
        if (attempts === maxRetries) {
          Logger.log(
            `[ERROR] Error PSI Lab (Intento ${attempts}/${maxRetries}): ${response.getContentText().substring(0, 100)}...`,
          );
          return {
            score: "Error",
            lcp: 0,
            cls: 0,
            tbt: 0,
            fcp: "-",
            speedIndex: "-",
            ttfb: "-",
          };
        }
        Logger.log(
          `[WARN] Reintentando PSI Lab (${attempts}/${maxRetries})...`,
        );
        Utilities.sleep(2000);
        continue;
      }

      const json = JSON.parse(response.getContentText());
      const lighthouse = json.lighthouseResult;

      if (!lighthouse)
        return {
          score: 0,
          lcp: 0,
          cls: 0,
          tbt: 0,
          fcp: "-",
          speedIndex: "-",
          ttfb: "-",
        };

      return {
        score: Math.round(lighthouse.categories.performance.score * 100),
        lcp: lighthouse.audits["largest-contentful-paint"].displayValue,
        cls: lighthouse.audits["cumulative-layout-shift"].displayValue,
        tbt: lighthouse.audits["total-blocking-time"].displayValue,
        fcp: lighthouse.audits["first-contentful-paint"]?.displayValue || "-",
        speedIndex: lighthouse.audits["speed-index"]?.displayValue || "-",
        ttfb: lighthouse.audits["server-response-time"]?.displayValue || "-",
      };
    } catch (e) {
      Logger.log(`[ERROR] Error crítico PSI Lab para ${url}: ${e.message}`);
      return {
        score: "Error",
        lcp: 0,
        cls: 0,
        tbt: 0,
        fcp: "-",
        speedIndex: "-",
        ttfb: "-",
      };
    }
  }
}

/**
 * Consulta la API de Chrome UX Report (CrUX) para obtener métricas
 * reales experimentadas por los usuarios (Field Data).
 *
 * @param {string} url - URL del sitio a analizar.
 * @param {string} [formFactor="PHONE"] - Tipo de dispositivo evaluado ('PHONE' o 'DESKTOP').
 * @returns {Object} Objeto con evaluación simulada (score) e indicadores (lcp, cls, inp, fcp, ttfb).
 */
function fetchCrUXData(url, formFactor) {
  formFactor = formFactor || "PHONE";
  try {
    const apiUrl = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${PSI_API_KEY}`;
    const payload = {
      origin: url,
      formFactor: formFactor,
      metrics: [
        "largest_contentful_paint",
        "cumulative_layout_shift",
        "interaction_to_next_paint",
        "first_contentful_paint",
        "experimental_time_to_first_byte",
      ],
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(apiUrl, options);

    if (response.getResponseCode() !== 200) {
      return {
        score: "No Data",
        lcp: "-",
        cls: "-",
        inp: "-",
        fcp: "-",
        ttfb: "-",
      };
    }

    const json = JSON.parse(response.getContentText());
    if (!json.record || !json.record.metrics)
      return { score: "No Data", lcp: "-", cls: "-", inp: "-" };

    const m = json.record.metrics;

    // Calcular "Score" simulado basado en P75
    // Esto es aproximado, solo para tener un número 0-100 consistente
    let score = 100;

    // LCP Penalty
    const lcp = m.largest_contentful_paint.percentiles.p75 / 1000;
    if (lcp > 2.5) score -= 20;
    if (lcp > 4.0) score -= 30;

    // CLS Penalty
    const cls = m.cumulative_layout_shift.percentiles.p75;
    if (cls > 0.1) score -= 20;
    if (cls > 0.25) score -= 30;

    // INP Penalty
    const inp = m.interaction_to_next_paint
      ? m.interaction_to_next_paint.percentiles.p75
      : 0;
    if (inp > 200) score -= 20;
    if (inp > 500) score -= 30;

    // FCP
    const fcp = m.first_contentful_paint
      ? m.first_contentful_paint.percentiles.p75 / 1000
      : null;
    if (fcp && fcp > 1.8) score -= 10;
    if (fcp && fcp > 3.0) score -= 15;

    // TTFB
    const ttfb = m.experimental_time_to_first_byte
      ? m.experimental_time_to_first_byte.percentiles.p75
      : null;
    if (ttfb && ttfb > 800) score -= 10;
    if (ttfb && ttfb > 1800) score -= 15;

    return {
      score: Math.max(0, score),
      lcp: lcp.toFixed(2) + "s",
      cls: cls,
      inp: inp + "ms",
      fcp: fcp ? fcp.toFixed(2) + "s" : "-",
      ttfb: ttfb ? ttfb + "ms" : "-",
    };
  } catch (e) {
    Logger.log(`Error CrUX para ${url}: ${e.message}`);
    return {
      score: "Error",
      lcp: "-",
      cls: "-",
      inp: "-",
      fcp: "-",
      ttfb: "-",
    };
  }
}

// --- GOOGLE ANALYTICS: NOTA MÁS VISTA ---

function fetchTopArticleFromGA4(propertyId, siteUrl) {
  try {
    // Requiere servicio avanzado "AnalyticsData" habilitado en Apps Script
    // Menú: Extensiones → Apps Script → Servicios → Google Analytics Data API

    const request = {
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      dateRanges: [
        {
          startDate: "yesterday",
          endDate: "yesterday",
        },
      ],
      orderBys: [
        {
          metric: { metricName: "screenPageViews" },
          desc: true,
        },
      ],
      limit: 20, // Traemos 20 para poder filtrar
    };

    const response = AnalyticsData.Properties.runReport(
      request,
      `properties/${propertyId}`,
    );

    if (!response || !response.rows || response.rows.length === 0) {
      Logger.log(`[WARN] No hay datos de GA4 para property ${propertyId}`);
      return { url: "", title: "", views: 0 };
    }

    // Parsear la URL base del sitio para construir URLs completas
    const siteOrigin = siteUrl.replace(/\/$/, ""); // quitar trailing slash

    // Filtrar: excluir home, errores, y páginas no-notas
    for (let i = 0; i < response.rows.length; i++) {
      const row = response.rows[i];
      const pagePath = row.dimensionValues[0].value;
      const pageTitle = row.dimensionValues[1].value;
      const views = parseInt(row.metricValues[0].value, 10);

      // Excluir home
      if (pagePath === "/" || pagePath === "") continue;

      // Excluir páginas de error
      const lowerTitle = pageTitle.toLowerCase();
      const lowerPath = pagePath.toLowerCase();
      if (
        lowerTitle.includes("404") ||
        lowerTitle.includes("error") ||
        lowerTitle.includes("not found") ||
        lowerTitle.includes("página no encontrada") ||
        lowerPath.includes("/404") ||
        lowerPath.includes("/error") ||
        lowerPath.includes("/500")
      ) {
        continue;
      }

      // Excluir secciones/categorías (paths cortos sin sub-niveles suelen ser secciones)
      // Las notas típicamente tienen paths más largos como /seccion/año/mes/dia/slug
      const pathSegments = pagePath.split("/").filter((s) => s !== "");
      if (pathSegments.length < 2) continue; // probablemente una sección, no una nota

      // ¡Esta es una nota válida!
      const fullUrl = siteOrigin + pagePath;
      Logger.log(
        `Nota más vista de ${siteOrigin}: ${pageTitle} (${views} views)`,
      );
      return {
        url: fullUrl,
        title: pageTitle,
        views: views,
      };
    }

    Logger.log(`[WARN] No se encontró nota válida para ${siteOrigin}`);
    return { url: "", title: "", views: 0 };
  } catch (e) {
    Logger.log(`[ERROR] Error GA4 para property ${propertyId}: ${e.message}`);
    return { url: "", title: "", views: 0 };
  }
}

function fetchGlobalAnalyticsFromGA4(propertyId) {
  try {
    const request = {
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "sessions" },
      ],
      dateRanges: [
        {
          startDate: "yesterday",
          endDate: "yesterday",
        },
      ],
    };

    const response = AnalyticsData.Properties.runReport(
      request,
      `properties/${propertyId}`,
    );

    if (!response || !response.rows || response.rows.length === 0) {
      Logger.log(
        `[WARN] No hay datos globales de GA4 para property ${propertyId}`,
      );
      return {
        activeUsers: 0,
        views: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        sessions: 0,
      };
    }

    const row = response.rows[0];
    const activeUsers = parseInt(row.metricValues[0].value, 10);
    const views = parseInt(row.metricValues[1].value, 10);
    const bounceRate = parseFloat(row.metricValues[2].value);
    const avgSessionDuration = parseFloat(row.metricValues[3].value);
    const sessions = parseInt(row.metricValues[4].value, 10);

    return {
      activeUsers: activeUsers || 0,
      views: views || 0,
      bounceRate: bounceRate || 0,
      avgSessionDuration: avgSessionDuration || 0,
      sessions: sessions || 0,
    };
  } catch (e) {
    Logger.log(
      `[ERROR] Error global GA4 para property ${propertyId}: ${e.message}`,
    );
    return {
      activeUsers: 0,
      views: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      sessions: 0,
    };
  }
}
