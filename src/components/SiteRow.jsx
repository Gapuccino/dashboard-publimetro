import React from 'react';

const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
};

export const SiteRow = ({ site, onClick }) => {
    const { siteName, home } = site;
    const { score, lcp, cls, inp } = home;

    return (
        <div
            onClick={onClick}
            className="grid grid-cols-5 gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all hover:scale-[1.01]"
        >
            <div className="text-white font-bold truncate">{siteName}</div>
            <div className={`text-center font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="text-center text-gray-300 font-mono">{lcp}</div>
            <div className="text-center text-gray-300 font-mono">{cls}</div>
            <div className="text-center text-gray-300 font-mono">{inp}</div>
        </div>
    );
};
