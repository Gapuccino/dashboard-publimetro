import React, { useState } from 'react';

const METRIC_INFO = {
    fcp: {
        name: 'First Contentful Paint',
        desc: '¿Qué tan rápido aparece el primer contenido visible? Los scripts de publicidad suelen bloquear esta primera carga.',
        good: '< 1.8s',
        ok: '1.8s – 3.0s',
        bad: '> 3.0s',
    },
    lcp: {
        name: 'Largest Contentful Paint',
        desc: '¿Cuánto tarda en cargar el contenido principal? Los ads compiten por ancho de banda y CPU, retrasando el contenido editorial.',
        good: '< 2.5s',
        ok: '2.5s – 4.0s',
        bad: '> 4.0s',
    },
    cls: {
        name: 'Cumulative Layout Shift',
        desc: '¿Se mueven los elementos mientras carga? Los anuncios se inyectan sin espacio reservado, causando saltos. No tenemos control sobre esto.',
        good: '< 0.1',
        ok: '0.1 – 0.25',
        bad: '> 0.25',
    },
    inp: {
        name: 'Interaction to Next Paint',
        desc: '¿Qué tan rápido responde la página al interactuar? Los scripts de ads (GPT, Prebid, trackers) bloquean el hilo principal, haciéndola lenta.',
        good: '< 200ms',
        ok: '200ms – 500ms',
        bad: '> 500ms',
    },
    ttfb: {
        name: 'Time to First Byte',
        desc: '¿Cuánto tarda el servidor en empezar a responder? Mide la velocidad de la infraestructura.',
        good: '< 800ms',
        ok: '800ms – 1800ms',
        bad: '> 1800ms',
    },
    tbt: {
        name: 'Total Blocking Time',
        desc: '¿Cuánto tiempo se "congela" la página? Los scripts publicitarios de terceros son la causa principal de este bloqueo. Fuera de nuestro control.',
        good: '< 200ms',
        ok: '200ms – 600ms',
        bad: '> 600ms',
    },
};

export const MetricTooltip = ({ metricKey, label, children }) => {
    const [show, setShow] = useState(false);
    const info = METRIC_INFO[metricKey];

    if (!info) return <span>{label || children}</span>;

    return (
        <span
            className="relative inline-flex items-center gap-1 cursor-help group"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span className="border-b border-dotted border-gray-500">{label || children}</span>
            <svg className="w-3 h-3 text-gray-500 group-hover:text-[#269757] transition-colors shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>

            {show && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1a1a1a] border border-[#444] rounded-sm shadow-2xl p-3 pointer-events-none"
                    style={{ animation: 'fadeIn 0.15s ease-out' }}
                >
                    <div className="text-[#269757] text-xs font-black uppercase tracking-wider mb-1">{info.name}</div>
                    <p className="text-gray-300 text-xs leading-relaxed mb-2">{info.desc}</p>
                    <div className="flex gap-2 text-[10px] font-bold">
                        <span className="text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-sm">Bueno: {info.good}</span>
                        <span className="text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-sm">~ {info.ok}</span>
                        <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm">Malo: {info.bad}</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#444]"></div>
                </div>
            )}
        </span>
    );
};
