import React, { useState } from 'react';

export const ExportButton = ({ data, lastDate }) => {
    const [copied, setCopied] = useState(false);

    const generateReport = () => {
        if (!data || data.length === 0) return '';

        const avgScore = Math.round(data.reduce((acc, s) => acc + s.home.score, 0) / data.length);

        // Categorize sites
        const healthy = data.filter(s => s.home.score >= 90).sort((a, b) => b.home.score - a.home.score);
        const regular = data.filter(s => s.home.score >= 50 && s.home.score < 90).sort((a, b) => b.home.score - a.home.score);
        const critical = data.filter(s => s.home.score < 50).sort((a, b) => a.home.score - b.home.score);

        // Calculate trend if history exists
        let trendText = '';
        const sitesWithHistory = data.filter(s => s.history && s.history.length >= 2);
        if (sitesWithHistory.length > 0) {
            const prevScores = sitesWithHistory.map(s => s.history[s.history.length - 2]?.score || 0);
            const currScores = sitesWithHistory.map(s => s.home.score);
            const prevAvg = Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length);
            const currAvg = Math.round(currScores.reduce((a, b) => a + b, 0) / currScores.length);
            const diff = currAvg - prevAvg;
            if (diff > 0) trendText = ` (+${diff} vs anterior)`;
            else if (diff < 0) trendText = ` (${diff} vs anterior)`;
            else trendText = ' (= sin cambios vs anterior)';
        }

        // Format date
        const formattedDate = lastDate
            ? new Date(lastDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'hoy';

        let report = `Reporte Core Web Vitals — ${formattedDate}\n`;
        report += `Score promedio Mobile: ${avgScore}/100${trendText}\n`;

        // Desktop average
        const withDesktop = data.filter(s => s.desktop && s.desktop.score > 0);
        if (withDesktop.length > 0) {
            const avgDesktop = Math.round(withDesktop.reduce((a, s) => a + s.desktop.score, 0) / withDesktop.length);
            report += `Score promedio Desktop: ${avgDesktop}/100\n`;
        }

        report += `Sitios analizados: ${data.length}\n\n`;

        if (healthy.length > 0) {
            report += `Saludables (90+): ${healthy.map(s => `${s.siteName} (${s.home.score})`).join(', ')}\n`;
        }
        if (regular.length > 0) {
            report += `Regulares (50-89): ${regular.map(s => `${s.siteName} (${s.home.score})`).join(', ')}\n`;
        }
        if (critical.length > 0) {
            report += `Criticos (<50): ${critical.map(s => `${s.siteName} (${s.home.score})`).join(', ')}\n`;
        }

        // Top 3 critical actions
        const worst = [...data].sort((a, b) => a.home.score - b.home.score).slice(0, 3);
        report += `\nPrioridades:\n`;
        worst.forEach((s, i) => {
            const issues = [];
            if (parseFloat(s.home.lcp) > 2.5) issues.push(`LCP ${s.home.lcp}`);
            if (parseFloat(s.home.cls) > 0.1) issues.push(`CLS ${s.home.cls}`);
            if (parseFloat(s.home.inp) > 200) issues.push(`INP ${s.home.inp}`);
            report += `${i + 1}. ${s.siteName} (Mobile: ${s.home.score}${s.desktop && s.desktop.score > 0 ? ` / Desktop: ${s.desktop.score}` : ''}) → ${issues.length > 0 ? issues.join(', ') : 'Score general bajo'}\n`;
        });

        report += `\nNota: Gran parte de las puntuaciones bajas se debe a scripts de publicidad (Google Ad Manager, Prebid, trackers) sobre los cuales el equipo editorial y de tecnología no tiene control.\n`;

        return report;
    };

    const handleCopy = async () => {
        const report = generateReport();
        try {
            await navigator.clipboard.writeText(report);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = report;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-sm border transition-all duration-300 ${copied
                ? 'bg-[#269757] border-[#269757] text-white'
                : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white hover:border-[#269757]'
                }`}
            title="Copiar resumen al portapapeles"
        >
            {copied ? (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden md:inline">¡Copiado!</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span className="hidden md:inline">Copiar Resumen</span>
                </>
            )}
        </button>
    );
};
