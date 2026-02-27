import React from 'react';
import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL || '';

const getLogo = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('el calce')) return `${BASE}/iconos/elcalce_light-bg.svg`;
    if (lowerName.includes('fayerwayer')) return `${BASE}/iconos/fayerwayer_light-bg.svg`;
    if (lowerName.includes('ferplei')) return `${BASE}/iconos/ferplei_light-bg.svg`;
    if (lowerName.includes('nueva mujer')) return `${BASE}/iconos/nuevamujer_light-bg.svg`;
    if (lowerName.includes('sagrosso')) return `${BASE}/iconos/sagrosso-color-darkbg-centrado.svg`;
    if (lowerName.includes('mwn brasil')) return `${BASE}/iconos/mwnbrasil.png`;
    return `${BASE}/iconos/Metro.png`;
};

const getScoreColor = (score) => {
    if (!score || score <= 0) return 'text-gray-500';
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
};

const getScoreBg = (score) => {
    if (!score || score <= 0) return 'bg-[#1a1a1a] border-[#333]';
    if (score >= 90) return 'bg-green-500/10 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
};

const getMetricColor = (val, regularThreshold, criticalThreshold) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'text-gray-500';
    if (num > criticalThreshold) return 'text-red-500';
    if (num > regularThreshold) return 'text-yellow-500';
    return 'text-green-500';
};

const getMedal = (position) => {
    return `${position + 1}`;
};

export const RankingTable = ({ sites, onSelectSite, deviceMode = 'mobile' }) => {
    const isDesktop = deviceMode === 'desktop';
    const getScore = (site) => {
        if (isDesktop) return site.desktop?.score || 0;
        return site.home?.score || 0;
    };
    // Sort by active device score descending (best first)
    const sorted = [...sites].sort((a, b) => getScore(b) - getScore(a));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#121212] rounded-none p-6 md:p-8 shadow-2xl border border-[#333] max-w-5xl w-full"
        >
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-[#333] pb-4 flex items-center gap-3">
                Ranking de Sitios
            </h2>

            {/* Header row */}
            <div className="hidden md:grid grid-cols-[40px_1fr_80px_80px_80px_80px_80px] gap-3 px-4 pb-3 text-xs text-gray-500 uppercase font-bold tracking-wider border-b border-[#222]">
                <div>#</div>
                <div>Sitio</div>
                <div className={`text-center ${!isDesktop ? 'text-gray-300' : ''}`}>Mobile</div>
                <div className={`text-center ${isDesktop ? 'text-blue-400' : 'text-blue-400/70'}`}>Desktop</div>
                <div className="text-center">LCP</div>
                <div className="text-center">CLS</div>
                <div className="text-center">INP</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#1a1a1a]">
                {sorted.map((site, idx) => {
                    const currentData = isDesktop ? site.desktop : site.home;
                    const _lcp = currentData?.lcp;
                    const _cls = currentData?.cls;
                    const _inp = currentData?.inp;

                    return (
                        <motion.div
                            key={site.siteName}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => onSelectSite && onSelectSite(sites.indexOf(site))}
                            className="grid grid-cols-[40px_1fr_80px] md:grid-cols-[40px_1fr_80px_80px_80px_80px_80px] gap-3 px-4 py-3 items-center hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                        >
                            {/* Position */}
                            <div className="text-lg font-black text-gray-500 group-hover:text-white transition-colors">
                                {getMedal(idx)}
                            </div>

                            {/* Site Name + Logo */}
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={getLogo(site.siteName)}
                                    alt={site.siteName}
                                    className="w-6 h-6 object-contain shrink-0"
                                />
                                <span className="text-white font-bold text-sm truncate group-hover:text-[#269757] transition-colors">
                                    {site.siteName}
                                </span>
                            </div>

                            {/* Score (Mobile) */}
                            <div className="text-center">
                                <span className={`inline-block px-3 py-1 rounded-sm text-sm font-black border ${getScoreBg(site.home?.score)} ${getScoreColor(site.home?.score)}`}>
                                    {site.home?.score > 0 ? site.home.score : '-'}
                                </span>
                            </div>

                            {/* Desktop Score */}
                            <div className="hidden md:block text-center" title={!(site.desktop?.score > 0) ? "Sin datos de tráfico real suficientes en CrUX para evaluar el rendimiento en escritorio." : ""}>
                                <span className={`inline-block px-3 py-1 rounded-sm text-sm font-black border ${getScoreBg(site.desktop?.score)} ${getScoreColor(site.desktop?.score)}`}>
                                    {site.desktop?.score > 0 ? site.desktop.score : '-'}
                                </span>
                            </div>

                            {/* LCP - hidden on mobile */}
                            <div className={`hidden md:block text-center text-sm font-mono font-bold ${getMetricColor(_lcp, 2.5, 4.0)}`} title={!_lcp || _lcp === '-' ? "Tráfico insuficiente en Chrome (CrUX)." : ""}>
                                {_lcp || '-'}
                            </div>

                            {/* CLS - hidden on mobile */}
                            <div className={`hidden md:block text-center text-sm font-mono font-bold ${getMetricColor(_cls, 0.1, 0.25)}`} title={!_cls || _cls === '-' ? "Tráfico insuficiente en Chrome (CrUX)." : ""}>
                                {_cls || '-'}
                            </div>

                            {/* INP - hidden on mobile */}
                            <div className={`hidden md:block text-center text-sm font-mono font-bold ${getMetricColor(_inp, 200, 500)}`} title={!_inp || _inp === '-' ? "Tráfico insuficiente en Chrome (CrUX)." : ""}>
                                {_inp || '-'}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#222] text-xs text-gray-600 text-center">
                Haz clic en un sitio para ver su detalle completo
            </div>
        </motion.div>
    );
};
