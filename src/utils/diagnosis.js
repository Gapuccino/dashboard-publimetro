/**
 * Motor de diagnóstico contextual basado en métricas web.
 * Evalúa las métricas principales (LCP, CLS, INP, FCP, TTFB)
 * y devuelve un resumen del estado general con problemas específicos
 * identificados y sugerencias u observaciones asociadas.
 *
 * @param {Object} data - Objeto con las métricas del sitio actual en vista.
 * @param {number|string} data.score - Puntuación global del rendimiento.
 * @param {string} data.lcp - Tiempo del Largest Contentful Paint (ej: "2.5s").
 * @param {string} data.cls - Valor del Cumulative Layout Shift (ej: "0.1").
 * @param {string} data.inp - Valor de Interaction to Next Paint (ej: "150ms").
 * @param {string} [data.fcp] - Tiempo del First Contentful Paint.
 * @param {string} [data.ttfb] - Time to First Byte.
 * @param {string} view - La vista actual ('home', 'article', o 'history').
 *
 * @returns {Object} Objeto de diagnóstico detallado.
 * @returns {string} return.status - Estado general: 'excellent', 'warning' o 'critical'.
 * @returns {string} return.summary - Mensaje de resumen de la salud del sitio.
 * @returns {Array<Object>} return.issues - Lista de problemas encontrados.
 */
export function getContextualDiagnosis(data, view) {
  const issues = [];
  const { score, lcp, cls, inp } = data;
  const fcp = data.fcp || "-";
  const ttfb = data.ttfb || "-";

  const lcpVal = parseFloat(lcp);
  const clsVal = parseFloat(cls);
  const inpVal = parseFloat(inp);
  const fcpVal = parseFloat(fcp);
  const ttfbVal = parseFloat(ttfb);

  if (!isNaN(ttfbVal) && ttfbVal > 800) {
    issues.push({
      icon: "SRV",
      text: `El servidor tarda ${ttfb} en responder. Verificar caché del CDN y configuración del servidor. Los scripts de publicidad pueden agravar este problema.`,
      severity: ttfbVal > 1800 ? "critical" : "warning",
    });
  }

  if (!isNaN(fcpVal) && fcpVal > 1.8) {
    issues.push({
      icon: "CSS",
      text: `El primer contenido tarda ${fcp} en aparecer. Los scripts de anuncios y rastreadores de terceros bloquean el renderizado inicial. Limitado control técnico sobre esto.`,
      severity: fcpVal > 3.0 ? "critical" : "warning",
    });
  }

  if (!isNaN(lcpVal) && lcpVal > 2.5) {
    issues.push({
      icon: "IMG",
      text: `El contenido principal tarda ${lcp} en cargar. Los bloques publicitarios compiten por recursos de red y CPU, retrasando el despliegue del editorial.`,
      severity: lcpVal > 4.0 ? "critical" : "warning",
    });
  }

  if (!isNaN(clsVal) && clsVal > 0.1) {
    issues.push({
      icon: "LAY",
      text: `La estructura de la vista se altera repentinamente (CLS: ${cls}). Los módulos dinámicos se inyectan sin reservar espacio previo, desplazando el contenido.`,
      severity: clsVal > 0.25 ? "critical" : "warning",
    });
  }

  if (!isNaN(inpVal) && inpVal > 200) {
    issues.push({
      icon: "JS",
      text: `La fluidez de interacción es lenta (${inp}). La carga concurrente de scripts comerciales bloquea el hilo de ejecución principal del navegador.`,
      severity: inpVal > 500 ? "critical" : "warning",
    });
  }

  if (issues.length === 0) {
    return {
      status: "excellent",
      summary:
        "Experiencia de usuario óptima. Todas las métricas operan en los rangos recomendados.",
      issues: [],
    };
  }

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  let summary = "";

  if (criticalCount > 0) {
    summary = `${criticalCount} métrica${criticalCount > 1 ? "s" : ""} en estado crítico. Requiere atención y monitoreo.`;
  } else {
    summary = `${issues.length} área${issues.length > 1 ? "s" : ""} que presentan margen de evaluación y mejora.`;
  }

  return {
    status: criticalCount > 0 ? "critical" : "warning",
    summary,
    issues,
  };
}
