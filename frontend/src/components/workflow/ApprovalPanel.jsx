import React, { useState } from 'react';

/**
 * ApprovalPanel - Sticky approval bar for workflow decisions
 * 
 * Features:
 * - Workflow summary
 * - Approve & Execute button
 * - Request Revision button
 * - Dismiss option
 */
const ApprovalPanel = ({
    workflowId,
    todoCount,
    completedCount,
    onApprove,
    onRequestRevision,
    onDismiss,
    status = 'draft' // draft, approved, executing, completed
}) => {
    const [isApproving, setIsApproving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleApprove = async () => {
        setIsApproving(true);
        await onApprove();
        setIsApproving(false);
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const statusConfig = {
        draft: {
            color: 'border-yellow-500/30 bg-yellow-500/5',
            badge: 'bg-yellow-500/20 text-yellow-400',
            text: 'Draft',
        },
        approved: {
            color: 'border-green-500/30 bg-green-500/5',
            badge: 'bg-green-500/20 text-green-400',
            text: 'Approved',
        },
        executing: {
            color: 'border-blue-500/30 bg-blue-500/5',
            badge: 'bg-blue-500/20 text-blue-400',
            text: 'Executing',
        },
        completed: {
            color: 'border-green-500/30 bg-green-500/5',
            badge: 'bg-green-500/20 text-green-400',
            text: 'Completed',
        },
    };

    const config = statusConfig[status] || statusConfig.draft;

    if (showSuccess) {
        return (
            <div className="sticky bottom-4 mx-4 p-4 rounded-xl border border-green-500/30 bg-green-500/10 
                           backdrop-blur-xl animate-bounce-subtle">
                <div className="flex items-center justify-center gap-3 text-green-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Workflow approved! Saved to Experiments.</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`sticky bottom-4 mx-4 p-4 rounded-xl border ${config.color} backdrop-blur-xl 
                        shadow-2xl transition-all duration-300`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Status & Summary */}
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider font-bold ${config.badge}`}>
                        {config.text}
                    </span>
                    <div className="text-sm text-white/80">
                        <span className="text-white font-medium">{todoCount}</span> action items
                        {completedCount > 0 && (
                            <span className="text-green-400 ml-2">
                                ({completedCount} completed)
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {status === 'draft' && (
                        <>
                            <button
                                onClick={onDismiss}
                                className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={onRequestRevision}
                                className="px-4 py-2 text-sm border border-white/20 text-white/80 rounded-lg
                                           hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Request Revision
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isApproving}
                                className="px-5 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 
                                           text-white rounded-lg font-medium shadow-lg shadow-green-500/20
                                           hover:shadow-green-500/40 transition-all duration-300
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           flex items-center gap-2"
                            >
                                {isApproving ? (
                                    <>
                                        <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Approve & Execute
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {status === 'approved' && (
                        <a
                            href="/experiments"
                            className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg
                                       hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            View in Experiments
                        </a>
                    )}

                    {status === 'executing' && (
                        <div className="flex items-center gap-2 text-blue-400">
                            <div className="w-4 h-4 border-t-2 border-blue-400 rounded-full animate-spin"></div>
                            <span className="text-sm">Executing workflow...</span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes bounceSlight {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-subtle {
                    animation: bounceSlight 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ApprovalPanel;
