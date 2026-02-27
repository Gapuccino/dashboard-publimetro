import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreChart } from './ScoreChart';
import { HistoryChart } from './HistoryChart';
import { MetricTooltip } from './MetricTooltip';

import { getContextualDiagnosis } from '../utils/diagnosis';

/**
 * Componente que expone una tarjeta especializada por sitio.
 * Exhibe el análisis pormenorizado (con opciones a la vista general/home, artículo, historial).
 * Controla sus métricas específicas basadas en Google, Core Web Vitals, Lab Metrics y Google Analytics.
 *
 * @param {Object} props - Propiedades del componente React.
 * @param {Object} props.siteData - Información íntegra proveniente del CSV o del arreglo FALLBACK de respaldo.
 * @param {number} props.index - Valor secuencial índice del sitio en el arreglo total (usado en transiciones).
 * @param {string} [props.deviceMode='mobile'] - Selector ('mobile' o 'desktop') de data visual por defecto.
 * @returns {JSX.Element} Visualización de la Tarjeta Analítica.
 */
export const SiteCard = ({ siteData, index, deviceMode = 'mobile' }) => {
    const { siteName, home, article, lab, history, desktop, labDesktop, articleDesktop, analytics } = siteData;
    const [view, setView] = useState('home'); // 'home' | 'article' | 'history'
    const isDesktop = deviceMode === 'desktop';

    // Display Name Override
    const displayName =
        siteName === 'Metro Colombia' ? 'Publimetro Colombia' :
            siteName === 'Metro PR' ? 'Metro Puerto Rico' :
                siteName;

    // Get current data based on view and device mode
    const homeData = isDesktop ? (desktop || {}) : home;
    const articleData = isDesktop ? (articleDesktop || {}) : article;
    const currentData = view === 'article' ? articleData : homeData;
    const { score, lcp, cls, inp } = currentData;
    const url = view === 'article' ? article.url : home.url; // Always show the real URL
    const fcp = currentData.fcp || '-';
    const ttfb = currentData.ttfb || '-';

    // Lab data (available in home view) - use correct lab for device mode
    const activeLab = isDesktop ? (labDesktop || lab) : lab;
    const labScore = (view === 'home') ? (activeLab?.score || 0) : 0;
    const labTbt = (view === 'home') ? (activeLab?.tbt || 0) : 0;

    // Other device score for comparison
    const otherDeviceScore = view === 'article'
        ? (isDesktop ? article.score : (articleDesktop?.score || 0))
        : (isDesktop ? home.score : (desktop?.score || 0));
    const otherDeviceLabel = isDesktop ? 'Mobile' : 'Desktop';

    // Filter which sites should hide the text title (because logo has the name)
    const isBrandedSite =
        siteName.toLowerCase().includes('el calce') ||
        siteName.toLowerCase().includes('fayerwayer') ||
        siteName.toLowerCase().includes('ferplei') ||
        siteName.toLowerCase().includes('nueva mujer') ||
        siteName.toLowerCase().includes('sagrosso');

    // Get logo based on siteName
    const getLogo = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('el calce')) return '/iconos/elcalce_light-bg.svg';
        if (lowerName.includes('fayerwayer')) return '/iconos/fayerwayer_light-bg.svg';
        if (lowerName.includes('ferplei')) return '/iconos/ferplei_light-bg.svg';
        if (lowerName.includes('nueva mujer')) return '/iconos/nuevamujer_light-bg.svg';
        if (lowerName.includes('sagrosso')) return '/iconos/sagrosso-color-darkbg-centrado.svg';
        if (lowerName.includes('mwn brasil')) return '/iconos/mwnbrasil.png'; // Make sure this icon exists or fallback to the Metro globe
        return '/iconos/Metro.png';
    };

    const siteLogo = getLogo(siteName);

    // Contextual diagnosis
    const diagnosis = getContextualDiagnosis(currentData, view);

    // Article vs Home score diff
    const scoreDiff = home.score - (article?.score || 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-[#1a1a1a] rounded-none border-l-8 border-[#269757] shadow-2xl p-0 w-full md:h-full md:flex-grow flex flex-col"
        >
            {/* View Toggle - separate bar on mobile */}
            <div className="flex md:hidden justify-center bg-[#1a1a1a] border-b border-[#333] py-2 px-4"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className="flex bg-[#2a2a2a] rounded-sm p-1 border border-[#333]">
                    <button
                        onClick={() => setView('home')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${view === 'home'
                            ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => setView('article')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${view === 'article'
                            ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Nota
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${view === 'history'
                            ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center p-4 md:py-6 md:px-10 bg-[#121212] relative overflow-hidden md:h-full">
                {/* View Toggle - desktop only (absolute) */}
                <div className="hidden md:flex absolute top-1 right-1 bg-[#2a2a2a] rounded-sm p-1 border border-[#333] z-10">
                    <button
                        onClick={() => setView('home')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${view === 'home'
                            ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => setView('article')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${view === 'article'
                            ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Nota
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${view === 'history'
                            ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Historial
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'history' ? (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col justify-center"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <img src={siteLogo} alt={siteName} className="h-12 w-auto object-contain" />
                                {!isBrandedSite && (
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{displayName}</h3>
                                )}
                            </div>
                            <p className="text-[#269757] uppercase font-bold text-sm mb-8 tracking-widest">Tendencia de Rendimiento (30 Días)</p>
                            <div className="flex-grow max-h-[400px]">
                                <HistoryChart history={history || []} deviceMode={deviceMode} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="flex flex-col h-full justify-between py-2 md:py-2"
                        >
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-6">
                                <div className="text-center md:text-left flex-grow">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-2 md:mb-2">
                                        <img src={siteLogo} alt={siteName} className="h-12 md:h-24 w-auto object-contain self-center md:self-start" />
                                        {!isBrandedSite && (
                                            <h3 className="text-2xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{displayName}</h3>
                                        )}
                                    </div>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm md:text-xl text-[#269757] hover:underline font-bold block break-all md:truncate md:max-w-xl mb-2">
                                        {url}
                                    </a>
                                    {view === 'article' && article.title && (
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                <span className="text-gray-300 text-sm font-semibold md:truncate md:max-w-md" title={article.title}>{article.title}</span>
                                                {article.views > 0 && (
                                                    <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-1 rounded-sm font-mono">{article.views.toLocaleString('en-US')} views</span>
                                                )}
                                            </div>
                                            {/* Article context: score comparison */}
                                            {scoreDiff !== 0 && (
                                                <div className={`text-xs font-bold px-3 py-1.5 rounded-sm inline-flex items-center gap-1 w-fit ${scoreDiff > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                                    {scoreDiff > 0 ? '-' : '+'}{Math.abs(scoreDiff)} puntos vs Home ({home.score})
                                                </div>
                                            )}
                                            {/* Critical alert for bad article score */}
                                            {article.score < 50 && (
                                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-2 rounded-sm flex items-center gap-2">
                                                    <span className="text-base font-black">!</span>
                                                    La nota más vista tiene rendimiento crítico — afecta a la mayoría de los lectores
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className={`text-xs uppercase font-bold mb-2 ${isDesktop ? 'text-blue-400' : 'text-gray-400'}`}>
                                            {isDesktop ? 'Desktop (CrUX)' : 'Mobile (CrUX)'}
                                        </div>
                                        <ScoreChart score={score} size={100} />
                                    </div>
                                    {(view === 'home' || view === 'article') && (
                                        <>
                                            <div className="flex flex-col items-center opacity-80" title="Google Chrome no cuenta con suficientes datos de visitas reales (CrUX) en los últimos 28 días para evaluar este dispositivo.">
                                                <div className={`text-xs uppercase font-bold mb-2 ${isDesktop ? 'text-gray-500' : 'text-blue-400/70'}`}>{otherDeviceLabel}</div>
                                                <div className={`w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-full flex items-center justify-center border-4 ${otherDeviceScore >= 90 ? 'border-green-500 text-green-500' : otherDeviceScore >= 50 ? 'border-yellow-500 text-yellow-500' : 'border-gray-700 text-gray-500'}`}>
                                                    <span className={`${otherDeviceScore ? 'text-2xl md:text-3xl list-none' : 'text-[10px] md:text-sm text-center px-1'} font-black`}>
                                                        {otherDeviceScore || 'Sin Datos'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center opacity-60" title="La evaluación sintética de PageSpeed Insights falló o no se pudo recolectar al procesar el reporte.">
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-2">Lab (PSI)</div>
                                                <div className={`w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-full flex items-center justify-center border-4 border-dashed ${labScore >= 90 ? 'border-green-500 text-green-500' : labScore >= 50 ? 'border-yellow-500 text-yellow-500' : 'border-gray-700 text-gray-500'}`}>
                                                    <span className={`${labScore ? 'text-2xl md:text-3xl' : 'text-[10px] md:text-sm text-center px-1'} font-black`}>
                                                        {labScore || 'Error PSI'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Metrics Grid with Tooltips */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 my-4 md:my-3">
                                <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-[#269757]" title={fcp === '-' ? "Tráfico insuficiente en Chrome (CrUX) para reportar este dato." : ""}>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                                        <MetricTooltip metricKey="fcp" label="FCP (Real)" />
                                    </div>
                                    <div className={`${fcp === '-' ? 'text-xs text-gray-500 mt-2 line-clamp-2 leading-tight' : 'text-2xl font-mono'} font-bold ${parseFloat(fcp) > 1.8 ? (parseFloat(fcp) > 3.0 ? 'text-red-500' : 'text-yellow-500') : 'text-green-500'}`}>
                                        {fcp === '-' ? 'Sin datos reales suficientes' : fcp}
                                    </div>
                                </div>
                                {/* Field LCP */}
                                <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-[#269757]" title={lcp === '-' ? "Tráfico insuficiente en Chrome (CrUX) para reportar este dato." : ""}>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                                        <MetricTooltip metricKey="lcp" label="LCP (Real)" />
                                    </div>
                                    <div className={`${lcp === '-' ? 'text-xs text-gray-500 mt-2 line-clamp-2 leading-tight' : 'text-2xl font-mono'} font-bold ${parseFloat(lcp) > 2.5 ? 'text-red-500' : 'text-green-500'}`}>
                                        {lcp === '-' ? 'Sin datos reales suficientes' : lcp}
                                    </div>
                                </div>
                                {/* Field CLS */}
                                <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-[#269757]" title={cls === '-' ? "Tráfico insuficiente en Chrome (CrUX) para reportar este dato." : ""}>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                                        <MetricTooltip metricKey="cls" label="CLS (Real)" />
                                    </div>
                                    <div className={`${cls === '-' ? 'text-xs text-gray-500 mt-2 line-clamp-2 leading-tight' : 'text-2xl font-mono'} font-bold ${parseFloat(cls) > 0.1 ? 'text-red-500' : 'text-green-500'}`}>
                                        {cls === '-' ? 'Sin datos reales suficientes' : cls}
                                    </div>
                                </div>
                                {/* Field INP */}
                                <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-[#269757]" title={inp === '-' ? "Tráfico insuficiente en Chrome (CrUX) para reportar este dato." : ""}>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                                        <MetricTooltip metricKey="inp" label="INP (Real)" />
                                    </div>
                                    <div className={`${inp === '-' ? 'text-xs text-gray-500 mt-2 line-clamp-2 leading-tight' : 'text-2xl font-mono'} font-bold ${parseFloat(inp) > 200 ? 'text-red-500' : 'text-green-500'}`}>
                                        {inp === '-' ? 'Sin datos reales suficientes' : inp}
                                    </div>
                                </div>
                                {/* Field TTFB */}
                                <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-[#269757]" title={ttfb === '-' ? "Tráfico insuficiente en Chrome (CrUX) para reportar este dato." : ""}>
                                    <div className="text-xs text-gray-400 uppercase font-bold mb-1">
                                        <MetricTooltip metricKey="ttfb" label="TTFB (Real)" />
                                    </div>
                                    <div className={`${ttfb === '-' ? 'text-xs text-gray-500 mt-2 line-clamp-2 leading-tight' : 'text-2xl font-mono'} font-bold ${parseFloat(ttfb) > 800 ? 'text-red-500' : 'text-green-500'}`}>
                                        {ttfb === '-' ? 'Sin datos reales suficientes' : ttfb}
                                    </div>
                                </div>
                                {/* Lab TBT */}
                                {view === 'home' && (
                                    <div className="bg-[#2a2a2a] p-4 text-center border-t-2 border-gray-600">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">
                                            <MetricTooltip metricKey="tbt" label="TBT (Lab)" />
                                        </div>
                                        <div className="text-2xl font-mono font-bold text-gray-300">{labTbt || '-'}</div>
                                    </div>
                                )}
                            </div>

                            {/* Analytics Grid */}
                            {analytics && (
                                <>
                                    <div className="text-blue-500 text-xs font-bold uppercase tracking-widest mt-2 mb-1">Google Analytics 4 (Global 24h)</div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-2 md:mb-3">
                                        <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-blue-600">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Usuarios Activos</div>
                                            <div className="text-xl font-mono font-bold text-white">{analytics.activeUsers > 0 ? analytics.activeUsers.toLocaleString('en-US') : '-'}</div>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-blue-600">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Vistas</div>
                                            <div className="text-xl font-mono font-bold text-white">{analytics.views > 0 ? analytics.views.toLocaleString('en-US') : '-'}</div>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-blue-600">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Rebote</div>
                                            <div className="text-xl font-mono font-bold text-white">{analytics.bounceRate > 0 ? `${(analytics.bounceRate * 100).toFixed(1)}%` : '-'}</div>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-blue-600">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Duración (s)</div>
                                            <div className="text-xl font-mono font-bold text-white">{analytics.avgSessionDuration > 0 ? analytics.avgSessionDuration.toFixed(0) : '-'}</div>
                                        </div>
                                        <div className="bg-[#1a1a1a] p-4 text-center border-t-2 border-blue-600">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Sesiones</div>
                                            <div className="text-xl font-mono font-bold text-white">{analytics.sessions > 0 ? analytics.sessions.toLocaleString('en-US') : '-'}</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Contextual Diagnosis - animates on device mode change */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`diagnosis-${deviceMode}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`p-4 rounded-sm border ${diagnosis.status === 'excellent' ? 'bg-green-500/5 border-green-500/20' : diagnosis.status === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}
                                >
                                    <p className={`text-sm font-bold mb-2 ${diagnosis.status === 'excellent' ? 'text-green-400' : diagnosis.status === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {diagnosis.summary}
                                    </p>
                                    {diagnosis.issues.length > 0 && (
                                        <div className="space-y-1.5 mt-2">
                                            {diagnosis.issues.map((issue, i) => (
                                                <div key={i} className={`text-xs flex items-start gap-2 ${issue.severity === 'critical' ? 'text-red-300' : 'text-yellow-300/80'}`}>
                                                    <span className="shrink-0">{issue.icon}</span>
                                                    <span>{issue.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
