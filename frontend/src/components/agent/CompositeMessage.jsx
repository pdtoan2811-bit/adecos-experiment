import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChartMessage from './ChartMessage';
import ResultsTable from '../ResultsTable';

/**
 * CompositeMessage - Renders composite AI Agent responses
 * 
 * Supports multiple sections in sequence:
 * - narrative: Markdown text with empathetic introductions
 * - chart: Dynamic chart visualization
 * - table: Tabular data display
 * - insight: Styled insight cards
 */
const CompositeMessage = ({ content, context }) => {
    const { sections = [] } = content;

    // Markdown components for narrative sections
    const markdownComponents = {
        p: ({ node, ...props }) => (
            <p className="mb-4 text-luxury-white/90 text-lg leading-relaxed font-light tracking-wide" {...props} />
        ),
        strong: ({ node, ...props }) => (
            <strong className="text-luxury-white font-medium" {...props} />
        ),
        em: ({ node, ...props }) => (
            <em className="text-luxury-white/80 italic" {...props} />
        ),
        ul: ({ node, ...props }) => (
            <ul className="list-none space-y-2 mb-4 ml-0" {...props} />
        ),
        li: ({ node, children, ...props }) => (
            <li className="text-luxury-white/85 text-base leading-relaxed pl-6 relative before:content-['▸'] before:absolute before:left-0 before:text-white/40 before:font-light" {...props}>
                {children}
            </li>
        ),
    };

    // Render individual section based on type
    const renderSection = (section, index) => {
        switch (section.type) {
            case 'narrative':
                return (
                    <div key={index} className="w-full my-4 px-4 md:px-0 fade-in-up">
                        <div className="max-w-4xl mx-auto py-4">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {typeof section.content === 'string'
                                    ? section.content
                                    : JSON.stringify(section.content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                );

            case 'chart':
                return (
                    <ChartMessage key={index} content={section.content} />
                );

            case 'table':
                return (
                    <div key={index} className="w-full my-6 fade-in-up">
                        <ResultsTable data={section.content} />
                    </div>
                );

            case 'insight':
                return (
                    <div key={index} className="w-full my-4 px-4 md:px-6 fade-in-up">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(section.content?.metrics || {}).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="border border-white/10 p-4 rounded-sm hover:border-white/20 transition-colors"
                                >
                                    <div className="text-xs text-luxury-gray uppercase tracking-wider mb-1">
                                        {formatMetricName(key)}
                                    </div>
                                    <div className="text-2xl font-serif text-white">
                                        {formatMetricValue(key, value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Helper to format metric names
    const formatMetricName = (key) => {
        const names = {
            cpc: 'CPC Trung bình',
            roas: 'ROAS',
            ctr: 'CTR',
            cpa: 'CPA',
            roi: 'ROI',
            totalClicks: 'Tổng Clicks',
            totalCost: 'Tổng Chi phí',
            totalRevenue: 'Tổng Doanh thu',
            totalConversions: 'Chuyển đổi'
        };
        return names[key] || key;
    };

    // Helper to format metric values
    const formatMetricValue = (key, value) => {
        if (typeof value !== 'number') return value;

        if (['cpc', 'cpa', 'totalCost', 'totalRevenue'].includes(key)) {
            return `${value.toLocaleString()} ₫`;
        }
        if (['ctr', 'roi'].includes(key)) {
            return `${value.toFixed(2)}%`;
        }
        if (key === 'roas') {
            return value.toFixed(2);
        }
        return value.toLocaleString();
    };

    return (
        <div className="w-full fade-in-up">
            {/* Render all sections in order */}
            {sections.map((section, index) => renderSection(section, index))}

            {/* Follow-up suggestions */}
            {context?.followupSuggestions && context.followupSuggestions.length > 0 && (
                <div className="w-full my-6 px-4 md:px-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {context.followupSuggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                className="px-4 py-2 text-sm border border-white/10 bg-white/5 text-luxury-gray 
                                           rounded-full hover:bg-white hover:text-black hover:border-white 
                                           transition-all duration-300 cursor-pointer"
                                onClick={() => {
                                    // Trigger search with suggestion
                                    // This will be connected to the parent component
                                    const event = new CustomEvent('agentSuggestionClick', {
                                        detail: suggestion
                                    });
                                    window.dispatchEvent(event);
                                }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompositeMessage;
