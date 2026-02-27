import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

/**
 * Componente que renderiza el panel de "Salud Global".
 * Muestra el gráfico circular (PieChart) con el promedio consolidado
 * e indicadores KPI de todos los sitios analizados agrupados por niveles
 * de gravedad (Crítico, Regular, Saludable).
 *
 * @param {Object} props - Propiedades del componente React.
 * @param {import('../utils/types').SiteData[]} props.sites - Lista de objetos con data por sitio.
 * @param {string} [props.deviceMode='mobile'] - Filtro actual de dispositivo a mostrar ('mobile' o 'desktop').
 * @returns {JSX.Element} Vista del Panel de Salud Global.
 */
export const GlobalHealth = ({ sites, deviceMode = 'mobile' }) => {
    const isDesktop = deviceMode === 'desktop';

    const getScore = (site) => {
        if (isDesktop) return site.desktop?.score || 0;
        return site.home?.score || 0;
    };

    // Filter sites to only those that have valid scores for current device
    const validSites = isDesktop
        ? sites.filter(s => s.desktop && s.desktop.score > 0)
        : sites.filter(s => s.home && s.home.score > 0);

    // Calculate average score using ONLY valid sites
    const averageScore = validSites.length > 0
        ? Math.round(validSites.reduce((acc, site) => acc + getScore(site), 0) / validSites.length)
        : 0;

    // Categorize valid sites
    const critical = validSites.filter(s => getScore(s) < 50);
    const regular = validSites.filter(s => getScore(s) >= 50 && getScore(s) < 90);
    const healthy = validSites.filter(s => getScore(s) >= 90);

    // Other device average for comparison
    const otherDeviceLabel = isDesktop ? 'Mobile' : 'Desktop';
    const validOtherSites = isDesktop
        ? sites.filter(s => s.home && s.home.score > 0)
        : sites.filter(s => s.desktop && s.desktop.score > 0);

    const avgOther = validOtherSites.length > 0
        ? Math.round(validOtherSites.reduce((acc, site) => acc + (isDesktop ? site.home.score : site.desktop.score), 0) / validOtherSites.length)
        : null;

    // Calculate trend from history
    let trendDiff = null;
    const historyKey = isDesktop ? 'desktopScore' : 'score';
    const sitesWithHistory = validSites.filter(s => s.history && s.history.length >= 2 && s.history[s.history.length - 2][historyKey] > 0);

    if (sitesWithHistory.length > 0) {
        const prevScores = sitesWithHistory.map(s => s.history[s.history.length - 2][historyKey]);
        const currScores = sitesWithHistory.map(s => getScore(s));
        const prevAvg = Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length);
        const currAvg = Math.round(currScores.reduce((a, b) => a + b, 0) / currScores.length);
        trendDiff = currAvg - prevAvg;
    }

    // Top 3 worst valid sites for action
    const worstSites = [...validSites].sort((a, b) => getScore(a) - getScore(b)).slice(0, 3);

    let color = '#ef4444'; // red
    if (averageScore >= 90) color = '#269757'; // green
    else if (averageScore >= 50) color = '#eab308'; // yellowGreen

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#121212] rounded-none p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-[#333] max-w-5xl w-full"
        >
            <h2 className="text-xl md:text-3xl font-black text-white mb-4 md:mb-8 text-center uppercase tracking-widest border-b border-[#333] pb-4">
                Salud Global <span className="text-[#269757]">METRO</span>
                {isDesktop && <span className="text-blue-400 text-lg ml-2">(Desktop)</span>}
            </h2>

            <div className="flex flex-col items-center justify-center gap-6 md:gap-16">
                {/* Large Chart */}
                <div className="relative w-48 h-48 md:w-72 md:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[{ name: 'Score', value: averageScore }, { name: 'Rest', value: 100 - averageScore }]}
                                cx="50%"
                                cy="50%"
                                innerRadius="75%"
                                outerRadius="100%"
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="score" fill={color} />
                                <Cell key="rest" fill="#2a2a2a" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl md:text-7xl font-black text-white">{averageScore}</span>
                        <span className="text-gray-500 text-sm mt-2 uppercase font-bold tracking-widest">Promedio</span>
                        {/* Trend indicator */}
                        {trendDiff !== null && trendDiff !== 0 && (
                            <span className={`text-xs font-bold mt-1 flex items-center gap-1 ${trendDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {trendDiff > 0 ? '+' : '-'}{Math.abs(trendDiff)} vs anterior
                            </span>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3 md:gap-6 w-full">
                    <div className="bg-[#1a1a1a] p-3 md:p-6 text-center border-l-4 border-gray-600">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Sitios Evaluados</div>
                        <div className="text-2xl md:text-3xl font-black text-white">{validSites.length} <span className="text-sm font-normal text-gray-500">/ {sites.length}</span></div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 md:p-6 text-center border-l-4 border-red-500">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Críticos (&lt;50)</div>
                        <div className="text-2xl md:text-3xl font-black text-red-500">
                            {critical.length}
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 md:p-6 text-center border-l-4 border-yellow-500">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Regulares (50-89)</div>
                        <div className="text-2xl md:text-3xl font-black text-yellow-500">
                            {regular.length}
                        </div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 md:p-6 text-center border-l-4 border-green-500">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Saludables (90+)</div>
                        <div className="text-2xl md:text-3xl font-black text-green-500">
                            {healthy.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-[#333]">
                {/* Semáforo phrase */}
                <p className="text-gray-300 text-sm text-center mb-6">
                    <span className="text-green-500 font-bold">{healthy.length} saludable{healthy.length !== 1 ? 's' : ''}</span>
                    {' · '}
                    <span className="text-yellow-500 font-bold">{regular.length} regular{regular.length !== 1 ? 'es' : ''}</span>
                    {' · '}
                    <span className="text-red-500 font-bold">{critical.length} crítico{critical.length !== 1 ? 's' : ''}</span>
                    {trendDiff !== null && trendDiff !== 0 && (
                        <span className={`ml-3 text-xs font-bold ${trendDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({trendDiff > 0 ? `+${trendDiff} pts` : `-${Math.abs(trendDiff)} pts`} vs medición anterior)
                        </span>
                    )}
                </p>

                {/* Mobile vs Desktop comparison */}
                {avgOther !== null && (
                    <div className="flex justify-center gap-6 mb-6">
                        <div className={`bg-[#1a1a1a] border rounded-sm px-5 py-3 text-center ${isDesktop ? 'border-blue-500/20' : 'border-[#333]'}`}>
                            <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDesktop ? 'text-blue-400' : 'text-gray-500'}`}>{isDesktop ? 'Desktop' : 'Mobile'}</div>
                            <div className={`text-2xl font-black ${averageScore >= 90 ? 'text-green-500' : averageScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{averageScore}</div>
                        </div>
                        <div className="flex items-center text-gray-600 text-xs font-bold">vs</div>
                        <div className={`bg-[#1a1a1a] border rounded-sm px-5 py-3 text-center ${isDesktop ? 'border-[#333]' : 'border-blue-500/20'}`}>
                            <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDesktop ? 'text-gray-500' : 'text-blue-400'}`}>{otherDeviceLabel}</div>
                            <div className={`text-2xl font-black ${avgOther >= 90 ? 'text-green-500' : avgOther >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{avgOther}</div>
                        </div>
                    </div>
                )}

                {/* Top 3 actions */}
                {worstSites.length > 0 && (
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                            Prioridades de Acción
                        </div>
                        <div className="space-y-2">
                            {worstSites.map((site, i) => {
                                const issues = [];
                                const currentData = isDesktop ? site.desktop : site.home;
                                if (parseFloat(currentData.lcp) > 2.5) issues.push(`LCP: ${currentData.lcp}`);
                                if (parseFloat(currentData.cls) > 0.1) issues.push(`CLS: ${currentData.cls}`);
                                if (parseFloat(currentData.inp) > 200) issues.push(`INP: ${currentData.inp}`);
                                const siteScore = getScore(site);
                                const issueText = issues.length > 0 ? issues.join(' · ') : 'Score general bajo';

                                return (
                                    <div key={site.siteName} className="flex items-center gap-3 text-sm">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${siteScore < 50 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-white font-bold min-w-[140px]">{site.siteName}</span>
                                        <span className={`font-mono font-bold text-xs ${siteScore < 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {siteScore}
                                        </span>
                                        <span className="text-gray-500 text-xs hidden md:inline">→ {issueText}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Ads impact disclaimer */}
                <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-sm p-4">
                    <div className="text-xs text-yellow-400/90 font-bold uppercase tracking-wider mb-1">
                        Nota sobre publicidad
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Gran parte de las puntuaciones bajas se debe a los <span className="text-yellow-400 font-semibold">scripts de publicidad</span> (Google Ad Manager, Prebid, trackers y vendors de terceros) que se cargan en todos nuestros sitios. Estos scripts afectan directamente el CLS, INP, TBT, FCP y LCP. <span className="text-gray-300 font-semibold">El equipo editorial y de tecnología no tiene control sobre estos scripts</span>, ya que son gestionados por el área comercial y los proveedores de ads externos.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
