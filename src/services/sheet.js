/**
 * Servicio encargado de la extracción y análisis de la data cruda desde Google Sheets.
 * El documento está expuesto de forma pública en modo de solo lectura y en formato CSV.
 */
export const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxqB-lGEh3kPGA88fV84RVpc-395BgCjYzW01R4FpmoVZxXrb3oihVIszydTWimo8XSWgqVBLtCwyi/pub?output=csv";

/**
 * Recupera asíncronamente los datos del documento de Google Sheets y promueve su parseo sintáctico.
 *
 * @returns {Promise<Array<Object>>} Colección depurada y formateada con los registros consolidados por sitio.
 */
export async function fetchSheetData() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error("Error obteniendo datos desde Google Sheets:", error);
    return [];
  }
}

function parseCSV(text) {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 1) return []; // No data

  let headers;
  let dataLines = lines;

  // Detect if first line is a header or data
  // Headers usually start with "Date" or "Site Name", Data starts with "2026-..."
  const firstLine = lines[0];
  if (firstLine.startsWith("Date") || firstLine.startsWith("Site")) {
    headers = parseCSVLine(firstLine);
    dataLines = lines.slice(1);
  } else {
    // Default headers based on GAS script order
    headers = [
      "Date",
      "Site Name",
      "Home URL",
      "Home Score",
      "Home LCP",
      "Home CLS",
      "Home INP",
      "Top Story URL",
      "Story Score",
      "Story LCP",
      "Story CLS",
      "Story INP",
      "Method Used",
      "Lab Score",
      "Lab LCP",
      "Lab CLS",
      "Lab TBT",
      "Home FCP",
      "Home TTFB",
      "Lab FCP",
      "Lab Speed Index",
      "Lab TTFB",
      "Story Title",
      "Story Views",
      "Desktop Score",
      "Desktop LCP",
      "Desktop CLS",
      "Desktop INP",
      "Desktop FCP",
      "Desktop TTFB",
      "Lab Desktop Score",
      "Lab Desktop LCP",
      "Lab Desktop CLS",
      "Lab Desktop TBT",
      "Lab Desktop FCP",
      "Lab Desktop Speed Index",
      "Lab Desktop TTFB",
      "Story Desktop Score",
      "Story Desktop LCP",
      "Story Desktop CLS",
      "Story Desktop INP",
      "Active Users",
      "Total Views",
      "Bounce Rate",
      "Avg Session Duration",
      "Sessions",
    ];
  }

  const sites = dataLines
    .map((line) => {
      const values = parseCSVLine(line);
      const row = {};

      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim();
      });

      // Normalize legacy site names to avoid duplicates
      const NAME_MAP = {
        "Metro PR": "Metro Puerto Rico",
        "Metro Colombia": "Publimetro Colombia",
      };
      const rawName = row["Site Name"];
      const siteName = NAME_MAP[rawName] || rawName;

      // Transform to Dashboard format
      return {
        siteName,
        home: {
          url: row["Home URL"],
          score: parseScore(row["Home Score"]),
          lcp: row["Home LCP"],
          cls: row["Home CLS"],
          inp: row["Home INP"],
          fcp: row["Home FCP"] || "-",
          ttfb: row["Home TTFB"] || "-",
        },
        article: {
          url: row["Top Story URL"],
          title: row["Story Title"] || "",
          views: parseInt(row["Story Views"], 10) || 0,
          score: parseScore(row["Story Score"]),
          lcp: row["Story LCP"],
          cls: row["Story CLS"],
          inp: row["Story INP"],
        },
        lab: {
          score: parseScore(row["Lab Score"]),
          lcp: row["Lab LCP"],
          cls: row["Lab CLS"],
          tbt: row["Lab TBT"],
          fcp: row["Lab FCP"] || "-",
          speedIndex: row["Lab Speed Index"] || "-",
          ttfb: row["Lab TTFB"] || "-",
        },
        desktop: {
          score: parseScore(row["Desktop Score"]),
          lcp: row["Desktop LCP"] || "-",
          cls: row["Desktop CLS"] || "-",
          inp: row["Desktop INP"] || "-",
          fcp: row["Desktop FCP"] || "-",
          ttfb: row["Desktop TTFB"] || "-",
        },
        labDesktop: {
          score: parseScore(row["Lab Desktop Score"]),
          lcp: row["Lab Desktop LCP"] || "-",
          cls: row["Lab Desktop CLS"] || "-",
          tbt: row["Lab Desktop TBT"] || "-",
          fcp: row["Lab Desktop FCP"] || "-",
          speedIndex: row["Lab Desktop Speed Index"] || "-",
          ttfb: row["Lab Desktop TTFB"] || "-",
        },
        date: row["Date"],
        articleDesktop: {
          score: parseScore(row["Story Desktop Score"]),
          lcp: row["Story Desktop LCP"] || "-",
          cls: row["Story Desktop CLS"] || "-",
          inp: row["Story Desktop INP"] || "-",
        },
        analytics: {
          activeUsers: parseInt(row["Active Users"], 10) || 0,
          views: parseInt(row["Total Views"], 10) || 0,
          bounceRate: parseFloat(row["Bounce Rate"]) || 0,
          avgSessionDuration: parseFloat(row["Avg Session Duration"]) || 0,
          sessions: parseInt(row["Sessions"], 10) || 0,
        },
      };
    })
    .filter((site) => site.siteName);

  // Group by Site Name to build History and identifying Latest
  const sitesMap = new Map();

  sites.forEach((site) => {
    if (!sitesMap.has(site.siteName)) {
      sitesMap.set(site.siteName, {
        ...site, // Start with this as base
        history: [], // Init history
      });
    }

    const entry = sitesMap.get(site.siteName);

    // Add to history
    entry.history.push({
      date: site.date,
      score: site.home.score,
      desktopScore: site.desktop?.score || 0,
      labScore: site.lab?.score || 0,
      lcp: site.home.lcp,
      labLcp: site.lab?.lcp,
    });

    // Update "current" if this row is newer (assuming sorted or relying on date)
    // For simplicity, we assume the Sheet is appended to, so the last one is likely latest.
    // But let's simplify: we overwrite the "main" props with the latest found so far
    // effectively keeping the last one processed as the "current" state.
    Object.assign(entry, site);
    // Ensure history is preserved (Object.assign would overwrite it with site's undefined history)
    entry.history = sitesMap.get(site.siteName).history;
  });

  return Array.from(sitesMap.values());
}

// Simple CSV line parser that handles quotes
function parseCSVLine(text) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseScore(value) {
  if (!value || value === "N/A" || value === "Error") return 0;
  return parseInt(value, 10) || 0;
}
