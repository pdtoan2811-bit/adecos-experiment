import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ResultsTable from './ResultsTable';
import ChartMessage from './agent/ChartMessage';
import CompositeMessage from './agent/CompositeMessage';
import CompactWorkflowMessage from './agent/CompactWorkflowMessage';
import CampaignSelectionTable from './agent/CampaignSelectionTable';

const ChatMessage = ({ message, onSearch }) => {
    const { role, type, content, context } = message;
    const isUser = role === 'user';

    // Handle campaign selection for general queries
    if (type === 'campaign_selection') {
        return (
            <div className="w-full my-4 fade-in-up">
                <CampaignSelectionTable
                    campaigns={content.campaigns}
                    onSelect={(campaign) => {
                        // Trigger deep dive for the selected campaign
                        if (onSearch) {
                            onSearch(`Deep dive analysis for ${campaign.name}`);
                        }
                    }}
                />
            </div>
        );
    }

    // Handle workflow messages with compact SMART layout
    if (type === 'workflow') {
        return (
            <div className="w-full my-4 fade-in-up">
                <CompactWorkflowMessage content={content} context={context} />
            </div>
        );
    }

    if (type === 'loading') {
        return (
            <div className="flex w-full justify-start my-4 px-4 md:px-0 fade-in-up">
                <div className="bg-white/5 border border-white/10 text-luxury-white/60 px-6 py-4 rounded-3xl rounded-tl-sm backdrop-blur-md text-sm font-light italic tracking-wider animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                    Adecos đang phân tích...
                </div>
            </div>
        );
    }

    // NEW: Handle composite messages (narrative + chart/table)
    if (type === 'composite') {
        return (
            <div className="w-full my-6 fade-in-up">
                <CompositeMessage content={content} context={context} />
            </div>
        );
    }

    // NEW: Handle chart messages
    if (type === 'chart') {
        return (
            <div className="w-full my-6 fade-in-up">
                <ChartMessage content={content} />
            </div>
        );
    }

    if (type === 'table') {
        // Safety check: ensure content is an array
        let tableData = content;

        // If content is a string, try to parse it as JSON
        if (typeof content === 'string') {
            try {
                tableData = JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse table content:', e);
                // If it's still the full JSON response string, try to extract the array
                if (content.includes('"type": "table"')) {
                    try {
                        const fullParsed = JSON.parse(content);
                        tableData = fullParsed.content || [];
                    } catch (e2) {
                        console.error('Failed to parse full response:', e2);
                        tableData = [];
                    }
                } else {
                    tableData = [];
                }
            }
        }

        // Ensure it's an array
        if (!Array.isArray(tableData)) {
            tableData = [];
        }

        return (
            <div className="w-full my-6 fade-in-up">
                {/* Table Widget is always full width and transparent/elegant */}
                <ResultsTable data={tableData} />
            </div>
        );
    }

    // User messages in chat bubble
    if (isUser) {
        return (
            <div className="flex w-full justify-end my-4 px-4 md:px-0">
                <div className="max-w-[85%] md:max-w-2xl px-6 py-4 rounded-3xl text-lg font-light leading-relaxed tracking-wide shadow-lg bg-white text-black rounded-tr-sm">
                    {content}
                </div>
            </div>
        );
    }

    // AI text explanations - full width, elegant layout
    return (
        <div className="w-full my-8 px-4 md:px-0 fade-in-up">
            <div className="max-w-4xl mx-auto">
                {/* Article-style layout for explanations - Text Only, No Bubble */}
                <div className="py-4 md:py-6">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node, ...props }) => (
                                <p className="mb-6 text-luxury-white/90 text-lg leading-relaxed font-light tracking-wide" {...props} />
                            ),
                            h1: ({ node, ...props }) => (
                                <h1 className="text-3xl font-serif mb-6 text-luxury-white tracking-tight" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 className="text-2xl font-serif mb-4 mt-8 text-luxury-white tracking-tight" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 className="text-xl font-serif mb-3 mt-6 text-luxury-white/95 tracking-wide" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul className="list-none space-y-3 mb-6 ml-0" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol className="list-none space-y-3 mb-6 ml-0 counter-reset-list" {...props} />
                            ),
                            li: ({ node, children, ...props }) => (
                                <li className="text-luxury-white/85 text-base leading-relaxed pl-8 relative before:content-['▸'] before:absolute before:left-0 before:text-white/40 before:font-light" {...props}>
                                    {children}
                                </li>
                            ),
                            strong: ({ node, ...props }) => (
                                <strong className="text-luxury-white font-medium" {...props} />
                            ),
                            em: ({ node, ...props }) => (
                                <em className="text-luxury-white/80 italic" {...props} />
                            ),
                            code: ({ node, inline, ...props }) =>
                                inline
                                    ? <code className="bg-white/10 text-white/90 px-2 py-1 rounded font-mono text-sm" {...props} />
                                    : <code className="block bg-black/40 border border-white/10 text-white/90 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 leading-relaxed" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-2 border-white/20 pl-6 my-6 text-luxury-white/70 italic" {...props} />
                            ),
                        }}
                    >
                        {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;

