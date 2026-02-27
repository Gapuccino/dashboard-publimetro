import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PSI_API_KEY = import.meta.env.PUBLIC_PSI_API_KEY || '';

/**
 * Componente modal de diagnóstico que consulta la API PageSpeed Insights en tiempo real.
 * Permite ejecutar un análisis sobre una URL específica y presenta los resultados (auditorías)
 * junto con la puntuación PSI obtenida desde la prueba sintética de Google.
 *
 * @param {Object} props - Propiedades del componente React.
 * @param {string} props.url - URL que se enviará a la API PSI para su evaluación.
 * @param {string} [props.siteName=''] - Nombre legible/display del sitio consultado.
 * @param {function} props.onClose - Callback para cerrar el modal.
 * @returns {JSX.Element} Ventana modal con resultados de diagnóstico PSI.
 */
export const DiagnosisModal = ({ url, siteName = '', onClose }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const runDiagnosis = async () => {
        setLoading(true);
        setError(null);

        try {
            const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeedtest?url=${encodeURIComponent(url)}&strategy=mobile${PSI_API_KEY ? `&key=${PSI_API_KEY}` : ''}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error('Error al consultar PSI');
            const data = await response.json();

            const categories = data.lighthouseResult?.categories?.performance;
            const audits = data.lighthouseResult?.audits || {};

            const score = Math.round((categories?.score || 0) * 100);

            const failedAudits = Object.values(audits)
                .filter(a => a.score !== null && a.score < 0.9 && a.details)
                .sort((a, b) => (a.score || 0) - (b.score || 0))
                .slice(0, 10)
                .map(a => ({
                    title: a.title,
                    displayValue: a.displayValue || '',
                    score: Math.round((a.score || 0) * 100),
                    description: a.description?.split('[')[0]?.trim() || '',
                }));

            setResult({ score, audits: failedAudits });
        } catch (err) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#121212] border border-[#333] rounded-sm p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">
                                Diagnóstico PSI
                            </h3>
                            <p className="text-gray-500 text-xs font-mono mt-1 truncate max-w-md">{url}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {!result && !loading && (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-6">
                                Ejecutar un análisis de PageSpeed Insights para obtener auditorías específicas y
                                recomendaciones de mejora.
                            </p>
                            <button
                                onClick={runDiagnosis}
                                className="bg-[#269757] hover:bg-[#1e7e48] text-white font-bold uppercase tracking-wider px-8 py-3 rounded-sm transition-all"
                            >
                                Ejecutar Diagnóstico
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center py-12">
                            <div className="w-12 h-12 border-4 border-[#269757] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 text-sm">Analizando {siteName || url}...</p>
                            <p className="text-gray-600 text-xs mt-2">Esto puede tomar 15-30 segundos</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 text-center">
                            <p className="text-red-400 font-bold">{error}</p>
                            <button
                                onClick={runDiagnosis}
                                className="mt-4 text-gray-400 hover:text-white text-sm underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {result && (
                        <div>
                            {/* PSI Score */}
                            <div className="text-center mb-8">
                                <div className={`text-6xl font-black ${result.score >= 90 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {result.score}
                                </div>
                                <div className="text-gray-500 text-xs uppercase font-bold mt-2">PSI Score (Lab)</div>
                            </div>

                            {/* Failed Audits */}
                            {result.audits.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-[#333] pb-2">
                                        Oportunidades de Mejora
                                    </h4>
                                    <div className="space-y-3">
                                        {result.audits.map((audit, i) => (
                                            <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-sm p-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-grow">
                                                        <span className="text-white text-sm font-bold">{audit.title}</span>
                                                        {audit.displayValue && (
                                                            <span className="text-gray-500 text-xs ml-2">({audit.displayValue})</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs font-bold ml-3 ${audit.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {audit.score}
                                                    </span>
                                                </div>
                                                {audit.description && (
                                                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{audit.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Re-run button */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={runDiagnosis}
                                    className="text-gray-500 hover:text-white text-sm font-bold uppercase transition-colors"
                                >
                                    Volver a ejecutar
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
