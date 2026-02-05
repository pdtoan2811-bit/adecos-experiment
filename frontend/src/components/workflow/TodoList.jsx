import React, { useState } from 'react';
import TodoItem from './TodoItem';

/**
 * TodoList - Interactive to-do list component for AI workflows
 * 
 * Features:
 * - List of interactive to-do items
 * - Progress indicator
 * - "Revise All" action
 * - Individual item status management
 */
const TodoList = ({
    items = [],
    onUpdateItems,
    onReviseAll,
    title = "Recommended Actions"
}) => {
    const [revisingItemId, setRevisingItemId] = useState(null);

    const completedCount = items.filter(item => item.completed).length;
    const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    const handleToggle = (itemId) => {
        const updated = items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        onUpdateItems(updated);
    };

    const handleRevise = async (itemId) => {
        setRevisingItemId(itemId);

        // Simulate AI revision (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const item = items.find(i => i.id === itemId);
        const revisedText = generateRevision(item.text);

        const updated = items.map(i =>
            i.id === itemId
                ? { ...i, revision: { text: revisedText, timestamp: new Date().toISOString() } }
                : i
        );
        onUpdateItems(updated);
        setRevisingItemId(null);
    };

    const handleUpdateComments = (itemId, comments) => {
        const updated = items.map(item =>
            item.id === itemId ? { ...item, comments } : item
        );
        onUpdateItems(updated);
    };

    const handleEdit = (itemId, newText, clearRevision = false) => {
        const updated = items.map(item =>
            item.id === itemId
                ? { ...item, text: newText, revision: clearRevision ? null : item.revision }
                : item
        );
        onUpdateItems(updated);
    };

    return (
        <div className="w-full">
            {/* Header with Progress */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-serif text-white tracking-wide">{title}</h3>
                    <span className="text-xs text-luxury-gray">
                        {completedCount}/{items.length} completed
                    </span>
                </div>

                <button
                    onClick={onReviseAll}
                    className="px-3 py-1.5 text-xs border border-blue-500/30 text-blue-400 rounded-lg
                               hover:bg-blue-500/10 transition-colors flex items-center gap-1.5"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Ask AI to Revise All
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Items */}
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <TodoItem
                            item={item}
                            onToggle={handleToggle}
                            onRevise={handleRevise}
                            onUpdateComments={handleUpdateComments}
                            onEdit={handleEdit}
                            isRevising={revisingItemId === item.id}
                        />
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-8 text-luxury-gray">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No action items yet</p>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// Mock revision generator
const generateRevision = (originalText) => {
    const improvements = [
        "Consider implementing this in phases to reduce risk",
        "Add measurable KPIs to track success",
        "Include a rollback plan if results are negative",
        "Set specific deadlines for each action step",
    ];

    // Simple mock - in real app, this would call the AI
    const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)];
    return `${originalText} — ${randomImprovement}`;
};

export default TodoList;
