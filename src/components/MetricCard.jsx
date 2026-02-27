
import React from 'react';

const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
};

const getMetricColor = (metric, value) => {
    // Logic for LCP, CLS, INP thresholds
    // Simplified for now, can be made robust
    // LCP: <2.5s Green, <4.0s Yellow, Else Red
    // CLS: <0.1 Green, <0.25 Yellow, Else Red
    // INP: <200ms Green, <500ms Yellow, Else Red

    const val = parseFloat(value);
    if (isNaN(val)) return 'text-gray-400';

    if (metric === 'lcp') {
        if (val <= 2.5) return 'text-green-500';
        if (val <= 4.0) return 'text-yellow-500';
        return 'text-red-500';
    }
    if (metric === 'cls') {
        if (val <= 0.1) return 'text-green-500';
        if (val <= 0.25) return 'text-yellow-500';
        return 'text-red-500';
    }
    if (metric === 'inp') {
        if (val <= 200) return 'text-green-500';
        if (val <= 500) return 'text-yellow-500';
        return 'text-red-500';
    }
    return 'text-gray-400';
};

export const MetricCard = ({ label, value, metricType, isScore = false }) => {
    const colorClass = isScore
        ? getScoreColor(value)
        : getMetricColor(metricType, value);

    return (
        <div className="flex flex-col items-center p-2 bg-gray-800 rounded-lg min-w-[80px]">
            <span className="text-xs text-gray-400 uppercase">{label}</span>
            <span className={`text-xl font-bold ${colorClass}`}>
                {value || '-'}
            </span>
        </div>
    );
};
