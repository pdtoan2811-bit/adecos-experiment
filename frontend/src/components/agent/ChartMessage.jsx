import React from 'react';
import {
    LineChart, Line,
    AreaChart, Area,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/**
 * ChartMessage - Dynamic chart rendering component for AI Agent responses
 * 
 * Supports: line, area, bar charts with luxury aesthetic styling
 */
const ChartMessage = ({ content }) => {
    const { chartType = 'area', title, data, config = {} } = content;

    // Default chart configuration
    const {
        xAxis = 'date',
        series = [
            { dataKey: 'cost', name: 'Chi phí', color: '#ef4444' },
            { dataKey: 'revenue', name: 'Doanh thu', color: '#22c55e' }
        ],
        height = 300
    } = config;

    // Custom tooltip matching app aesthetic
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-white/20 backdrop-blur-md p-4 rounded-sm">
                    <p className="text-white text-sm font-mono mb-2">{label}</p>
                    <div className="space-y-1 text-xs">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex justify-between gap-4">
                                <span className="text-luxury-gray">{entry.name}:</span>
                                <span
                                    className="font-mono"
                                    style={{ color: entry.color }}
                                >
                                    {typeof entry.value === 'number'
                                        ? entry.value.toLocaleString()
                                        : entry.value}
                                    {entry.name.includes('Chi phí') || entry.name.includes('Doanh thu') ? ' ₫' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Render appropriate chart type
    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        };

        const axisStyle = {
            stroke: "rgba(255,255,255,0.2)",
            style: { fontSize: '11px', fill: 'rgba(255,255,255,0.5)' }
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey={xAxis} {...axisStyle} />
                        <YAxis {...axisStyle} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                                color: 'rgba(255,255,255,0.6)'
                            }}
                        />
                        {series.map((s, idx) => (
                            <Line
                                key={idx}
                                type="monotone"
                                dataKey={s.dataKey}
                                name={s.name}
                                stroke={s.color}
                                strokeWidth={2}
                                dot={{ fill: s.color, r: 3 }}
                            />
                        ))}
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey={xAxis} {...axisStyle} />
                        <YAxis {...axisStyle} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                                color: 'rgba(255,255,255,0.6)'
                            }}
                        />
                        {series.map((s, idx) => (
                            <Bar
                                key={idx}
                                dataKey={s.dataKey}
                                name={s.name}
                                fill={s.color}
                                opacity={0.8}
                            />
                        ))}
                    </BarChart>
                );

            case 'area':
            default:
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            {series.map((s, idx) => (
                                <linearGradient key={idx} id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey={xAxis} {...axisStyle} />
                        <YAxis {...axisStyle} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                                color: 'rgba(255,255,255,0.6)'
                            }}
                        />
                        {series.map((s, idx) => (
                            <Area
                                key={idx}
                                type="monotone"
                                dataKey={s.dataKey}
                                name={s.name}
                                stroke={s.color}
                                fillOpacity={1}
                                fill={`url(#gradient-${s.dataKey})`}
                            />
                        ))}
                    </AreaChart>
                );
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="w-full my-6 px-4 md:px-6">
                <div className="border border-white/10 p-6 rounded-sm text-center text-luxury-gray">
                    Không có dữ liệu để hiển thị
                </div>
            </div>
        );
    }

    return (
        <div className="w-full my-6 px-4 md:px-6 fade-in-up">
            <div className="border border-white/10 p-6 rounded-sm bg-black/20">
                {title && (
                    <h3 className="text-sm font-serif text-white mb-4 uppercase tracking-wider">
                        {title}
                    </h3>
                )}
                <ResponsiveContainer width="100%" height={height}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartMessage;
