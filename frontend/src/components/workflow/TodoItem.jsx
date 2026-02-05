import React, { useState } from 'react';
import CommentThread from './CommentThread';

/**
 * TodoItem - Individual to-do item with comments and revisions
 * 
 * Features:
 * - Checkbox for completion
 * - Priority indicator
 * - Comment trigger button
 * - Revise action
 * - Inline editing
 */
const TodoItem = ({
    item,
    onToggle,
    onRevise,
    onUpdateComments,
    onEdit,
    isRevising = false
}) => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const [showRevision, setShowRevision] = useState(false);

    const priorityColors = {
        high: 'border-red-500/50 bg-red-500/10',
        medium: 'border-yellow-500/50 bg-yellow-500/10',
        low: 'border-green-500/50 bg-green-500/10',
    };

    const priorityBadges = {
        high: { text: 'High', color: 'text-red-400 bg-red-500/20' },
        medium: { text: 'Med', color: 'text-yellow-400 bg-yellow-500/20' },
        low: { text: 'Low', color: 'text-green-400 bg-green-500/20' },
    };

    const handleSaveEdit = () => {
        if (editText.trim() && editText !== item.text) {
            onEdit(item.id, editText.trim());
        }
        setIsEditing(false);
    };

    const handleAddComment = (comment) => {
        const updatedComments = [...(item.comments || []), comment];
        onUpdateComments(item.id, updatedComments);

        // Simulate AI response after user comment
        setTimeout(() => {
            const aiResponse = {
                id: Date.now(),
                author: 'ai',
                content: generateAIResponse(comment.content, item.text),
                timestamp: new Date().toISOString(),
            };
            onUpdateComments(item.id, [...updatedComments, aiResponse]);
        }, 1500);
    };

    const handleResolve = () => {
        setIsCommentOpen(false);
    };

    return (
        <div className={`relative group transition-all duration-300 ${item.completed ? 'opacity-60' : ''}`}>
            <div
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300
                           ${item.completed
                        ? 'bg-white/5 border-white/5'
                        : `${priorityColors[item.priority] || 'border-white/10 bg-black/20'}`}
                           hover:border-white/20`}
            >
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(item.id)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-300
                               flex items-center justify-center
                               ${item.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-white/30 hover:border-white/60'}`}
                >
                    {item.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            autoFocus
                            className="w-full bg-transparent border-b border-white/30 text-white text-base
                                       focus:outline-none focus:border-white/60 pb-1"
                        />
                    ) : (
                        <div
                            className={`text-base leading-relaxed transition-all duration-300 cursor-pointer
                                       ${item.completed ? 'line-through text-white/50' : 'text-white/90'}`}
                            onDoubleClick={() => !item.completed && setIsEditing(true)}
                        >
                            {item.text}
                        </div>
                    )}

                    {/* Revision comparison */}
                    {item.revision && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <button
                                onClick={() => setShowRevision(!showRevision)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {showRevision ? 'Hide revision' : 'Show AI revision'}
                            </button>
                            {showRevision && (
                                <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="text-xs text-blue-400 mb-1">AI Suggested Revision:</div>
                                    <div className="text-sm text-white/90">{item.revision.text}</div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => onEdit(item.id, item.revision.text)}
                                            className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => onEdit(item.id, item.text, true)}
                                            className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded hover:bg-white/20 transition-colors"
                                        >
                                            Keep Original
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-2">
                        {item.priority && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold
                                            ${priorityBadges[item.priority]?.color}`}>
                                {priorityBadges[item.priority]?.text}
                            </span>
                        )}
                        {(item.comments?.length || 0) > 0 && (
                            <span className="text-xs text-white/40 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {item.comments.length}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsCommentOpen(true)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Add comment"
                    >
                        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onRevise(item.id)}
                        disabled={isRevising || item.completed}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                        title="Ask AI to revise"
                    >
                        {isRevising ? (
                            <div className="w-4 h-4 border-t-2 border-blue-400 rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Comment Thread */}
            <CommentThread
                isOpen={isCommentOpen}
                onClose={() => setIsCommentOpen(false)}
                comments={item.comments || []}
                onAddComment={handleAddComment}
                onResolve={handleResolve}
                itemTitle={item.text}
            />
        </div>
    );
};

// Mock AI response generator
const generateAIResponse = (userComment, itemText) => {
    const responses = [
        `Great point! For "${itemText.slice(0, 30)}...", I'd suggest we also consider A/B testing to validate this approach.`,
        `I understand your concern. We could break this down into smaller steps to reduce risk.`,
        `Good suggestion! This aligns well with the overall optimization strategy.`,
        `That's a valid consideration. Let me know if you'd like me to revise this item based on your feedback.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
};

export default TodoItem;
