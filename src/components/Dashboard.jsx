import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlobalHealth } from './GlobalHealth';
import { SiteCard } from './SiteCard';
import { RankingTable } from './RankingTable';
import { ExportButton } from './ExportButton';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSheetData } from '../services/sheet';

import { FALLBACK_DATA } from '../utils/fallbackData';

/**
 * Componente principal que engloba el renderizado íntegro
 * de las vitrinas, cuadros métricos y resumen general de estado.
 * Controla la carga inicial y visualización global/detalle.
 *
 * @returns {JSX.Element} Visualización completa del Dashboard.
 */
export const Dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('global'); // 'global' or 'detail'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' or 'desktop'

    // Extract last update date
    const lastDate = data.length > 0
        ? data.reduce((latest, site) => {
            if (site.date && site.date > latest) return site.date;
            return latest;
        }, data[0]?.date || '')
        : '';

    const formattedDate = lastDate
        ? new Date(lastDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const sheetData = await fetchSheetData();
            if (sheetData && sheetData.length > 0) {
                setData(sheetData);
            } else {
                console.warn('Using fallback data');
                setData(FALLBACK_DATA);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const goToDetail = (index = 0) => {
        setCurrentIndex(index);
        setViewMode('detail');
    };

    const goToGlobal = () => {
        setViewMode('global');
    };

    const nextSite = () => {
        setCurrentIndex((prev) => (prev + 1) % data.length);
    };

    const prevSite = () => {
        setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
    };

    // Touch swipe handling for mobile
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchEndX = useRef(0);
    const touchEndY = useRef(0);
    const hasMoved = useRef(false);

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchEndX.current = e.touches[0].clientX;
        touchEndY.current = e.touches[0].clientY;
        hasMoved.current = false;
    }, []);

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX;
        touchEndY.current = e.touches[0].clientY;
        hasMoved.current = true;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!hasMoved.current) return; // Was just a tap, not a swipe
        const diffX = touchStartX.current - touchEndX.current;
        const diffY = Math.abs(touchStartY.current - touchEndY.current);
        const MIN_SWIPE = 60;
        // Only trigger if horizontal movement > vertical (not scrolling) and exceeds threshold
        if (Math.abs(diffX) > MIN_SWIPE && Math.abs(diffX) > diffY) {
            if (diffX > 0) {
                setCurrentIndex((prev) => (prev + 1) % data.length);
            } else {
                setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
            }
        }
    }, [data.length]);

    const handleSelectChange = (e) => {
        setCurrentIndex(Number(e.target.value));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#269757] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-[#269757] text-xl font-bold uppercase tracking-widest animate-pulse">Obteniendo Vitals...</div>
                </div>
            </div>
        );
    }

    const BASE = import.meta.env.BASE_URL || '';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#269757] selection:text-white flex flex-col md:h-screen md:overflow-hidden">
            {/* Header */}
            <div className="bg-[#121212] border-b border-[#333] py-2 px-3 md:py-4 md:px-6 shadow-md z-30 flex flex-wrap justify-between items-center gap-2 shrink-0">
                <div className="flex items-center gap-4">
                    <img
                        src={`${BASE}/publimetro-positivo_womargin.svg`}
                        alt="Publimetro Logo"
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                    <div className="h-6 md:h-8 w-px bg-[#333] mx-1 md:mx-2"></div>
                    <div>
                        <h1 className="text-sm md:text-xl font-bold text-gray-400 tracking-tighter uppercase">
                            <span className="hidden md:inline">Core </span>Web Vitals
                        </h1>
                        {/* Last update date */}
                        {formattedDate && (
                            <div className="text-[10px] text-gray-600 font-mono mt-0.5 flex items-center gap-1">
                                <span className="hidden md:inline">Datos del {formattedDate} · Actualización diaria 4:00 AM</span>
                                <span className="md:hidden">{formattedDate} ·
                                    Actualización diaria 4:00 AM</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-end">
                    {/* Device Mode Toggle */}
                    <div className="flex bg-[#2a2a2a] rounded-sm p-1 border border-[#333]">
                        <button
                            onClick={() => setDeviceMode('mobile')}
                            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${deviceMode === 'mobile'
                                ? 'bg-[#269757] text-white' : 'text-gray-400 hover:text-white'}`}
                            title="Datos de dispositivos móviles"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden md:inline">Mobile</span>
                        </button>
                        <button
                            onClick={() => setDeviceMode('desktop')}
                            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${deviceMode === 'desktop'
                                ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            title="Datos de escritorio"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden md:inline">Desktop</span>
                        </button>
                    </div>

                    {/* Export Button - hidden on mobile */}
                    <span className="hidden md:inline-flex">
                        <ExportButton data={data} lastDate={lastDate} />
                    </span>

                    {viewMode === 'detail' && (
                        <>
                            <div className="relative">
                                <select
                                    value={currentIndex}
                                    onChange={handleSelectChange}
                                    className="bg-[#1a1a1a] text-white border border-[#333] rounded-sm pl-2 pr-6 md:pl-4 md:pr-10 py-1.5 md:py-2 text-[10px] md:text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#269757] appearance-none cursor-pointer hover:bg-[#222] transition-colors max-w-[120px] md:max-w-none"
                                >
                                    {data.map((site, index) => (
                                        <option key={index} value={index}>
                                            {site.siteName}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-1 md:px-2 pointer-events-none">
                                    <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                onClick={goToGlobal}
                                className="flex items-center gap-1 md:gap-2 text-gray-400 hover:text-[#269757] text-[10px] md:text-sm font-bold uppercase transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                                </svg>
                                <span className="hidden md:inline">Volver a Panorama Global</span>
                                <span className="md:hidden">Regresar</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex items-start md:items-center justify-center relative bg-[#0a0a0a] md:overflow-hidden min-h-0">
                <AnimatePresence mode="wait">
                    {viewMode === 'global' ? (
                        <motion.div
                            key="global"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-5xl flex flex-col items-center p-4 md:overflow-y-auto md:max-h-[calc(100vh-5rem)]"
                        >
                            <GlobalHealth sites={data} deviceMode={deviceMode} />

                            {/* Ranking Table */}
                            <RankingTable sites={data} onSelectSite={(idx) => goToDetail(idx)} deviceMode={deviceMode} />

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => goToDetail(0)}
                                className="mt-8 mb-8 bg-[#269757] hover:bg-[#1e7e48] text-white text-xl font-black uppercase tracking-wide px-10 py-4 rounded-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none transition-all"
                            >
                                Ver Salud de los Sitios
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full md:h-full flex items-stretch justify-center relative"
                        >
                            {/* Left hover zone - desktop only */}
                            <div
                                onClick={prevSite}
                                className="hidden md:flex absolute left-0 top-0 bottom-0 w-16 z-20 items-center justify-center cursor-pointer group/left"
                            >
                                <div className="opacity-0 group-hover/left:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#333] text-[#269757]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Carousel Content - swipeable on mobile */}
                            <div
                                className="w-full md:h-full md:overflow-y-auto"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="w-full min-h-full md:flex md:flex-col"
                                >
                                    <SiteCard siteData={data[currentIndex]} index={currentIndex} deviceMode={deviceMode} />

                                    {/* Pagination Indicator */}
                                    <div className="border-l-8 border-[#269757] bg-[#1a1a1a]">
                                        <div className="flex justify-center gap-2 py-4">
                                            {data.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1 transition-all duration-300 shadow-lg ${idx === currentIndex ? 'w-12 bg-[#269757]' : 'w-4 bg-[#666]'}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-center text-gray-500 text-xs font-mono pb-4">
                                            SITIO {currentIndex + 1} / {data.length}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right hover zone - desktop only */}
                            <div
                                onClick={nextSite}
                                className="hidden md:flex absolute right-0 top-0 bottom-0 w-16 z-20 items-center justify-center cursor-pointer group/right"
                            >
                                <div className="opacity-0 group-hover/right:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#333] text-[#269757]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
};
