
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const ScoreChart = ({ score, size = 100 }) => {
    const data = [
        { name: 'Score', value: score },
        { name: 'Rest', value: 100 - score },
    ];

    let color = '#ef4444'; // Red
    if (score >= 50) color = '#eab308'; // Yellow
    if (score >= 90) color = '#22c55e'; // Green

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="80%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell key="score" fill={color} />
                        <Cell key="rest" fill="#374151" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{score}</span>
            </div>
        </div>
    );
};
