import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DESKTOP_COLOR = '#06b6d4'; // Cyan
const MOBILE_COLOR = '#f97316';  // Orange

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="bg-[#111827] border border-white/15 rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)] min-w-[160px]">
            <p className="text-gray-100 text-[13px] font-bold mb-2 border-b border-white/10 pb-1.5">
                {label}
            </p>
            {payload.map((entry, index) => {
                const isDesktopEntry = entry.dataKey === 'desktop';
                const color = isDesktopEntry ? DESKTOP_COLOR : MOBILE_COLOR;
                const scoreColor = entry.value >= 90 ? 'text-green-500' : entry.value >= 50 ? 'text-yellow-500' : 'text-red-500';
                return (
                    <div key={index} className={`flex items-center justify-between ${index > 0 ? 'mt-1.5' : ''}`}>
                        <span className="text-xs font-semibold" style={{ color: color }}>
                            {entry.name}
                        </span>
                        <span className={`text-sm font-extrabold ml-4 ${scoreColor}`}>
                            {entry.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const CustomLegend = ({ payload }) => {
    return (
        <div className="flex justify-center gap-6 pt-2">
            {payload.map((entry, index) => {
                return (
                    <div key={index} className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[11px] font-bold text-gray-300 tracking-[0.03em]">
                            {entry.value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Componente que muestra una gráfica de barras con el histórico de rendimiento.
 * Utiliza los últimos 30 días de la bitácora proporcionada en las props.
 * Destaca el rendimiento móvil contra la puntuación de escritorio.
 *
 * @param {Object} props - Propiedades del componente React.
 * @param {Array<Object>} props.history - Arreglo con la información histórica por fecha.
 * @param {string} [props.deviceMode='mobile'] - Interfaz enfocada ('mobile' o 'desktop').
 * @returns {JSX.Element} Visualización de gráfico de barras.
 */
export const HistoryChart = ({ history, deviceMode = 'mobile' }) => {
    // Take last 30 entries — always show both devices
    const chartData = history.slice(-30).map(entry => ({
        date: new Date(entry.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        desktop: entry.desktopScore || 0,
        mobile: entry.score || 0,
    }));

    if (chartData.length === 0) {
        return <div className="text-gray-500 text-center py-8">Sin datos históricos suficientes.</div>;
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="20%">
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 4 }}
                    />
                    <Legend content={<CustomLegend />} />
                    {/* Desktop bar — always cyan */}
                    <Bar
                        dataKey="desktop"
                        name="Desktop"
                        fill={DESKTOP_COLOR}
                        radius={[4, 4, 0, 0]}
                        opacity={deviceMode === 'desktop' ? 1 : 0.5}
                    />
                    {/* Mobile bar — always orange */}
                    <Bar
                        dataKey="mobile"
                        name="Mobile (CrUX)"
                        fill={MOBILE_COLOR}
                        radius={[4, 4, 0, 0]}
                        opacity={deviceMode === 'mobile' ? 1 : 0.5}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
