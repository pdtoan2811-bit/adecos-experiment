import React from 'react';

/**
 * ExperimentCard - Card displaying experiment summary
 * 
 * Features:
 * - Status badge
 * - Progress indicator
 * - Key metrics preview
 * - Quick actions
 */
const ExperimentCard = ({ experiment, onClick, onStatusChange, onDelete }) => {
    const {
        id,
        title,
        createdAt,
        status,
        result = 'pending',
        todoItems = [],
        progress = 0,
        metrics = {},
        targetAccuracy,
        timeProgress
    } = experiment;

    const statusConfig = {
        running: {
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
            icon: '▶',
            text: 'Đang chạy'
        },
        paused: {
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            icon: '❚❚',
            text: 'Tạm dừng'
        },
        completed: {
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            icon: '✓',
            text: 'Hoàn thành'
        }
    };

    const config = statusConfig[status] || statusConfig.running;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return hours === 0 ? 'Vừa tạo' : `${hours} giờ trước`;
        }
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)} ngày trước`;
        }
        return date.toLocaleDateString('vi-VN');
    };

    // Calculate time progress
    let timePercent = 0;
    let timeLabel = '';
    if (timeProgress) {
        const start = new Date(timeProgress.startDate).getTime();
        const end = new Date(timeProgress.endDate).getTime();
        const now = Date.now();
        const total = end - start;
        const elapsed = now - start;
        timePercent = Math.min(100, Math.max(0, (elapsed / total) * 100));

        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        timeLabel = daysLeft > 0 ? `${daysLeft} days left` : 'Finished';
    }

    const completedCount = todoItems.filter(item => item.completed).length;

    return (
        <div
            className="group border border-white/10 rounded-xl bg-black/20 p-5 hover:border-white/20 
                       transition-all duration-300 cursor-pointer hover:bg-black/40 flex flex-col h-full"
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-lg font-serif text-white truncate mb-1" title={title}>
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-luxury-gray">
                        <span>{formatDate(createdAt)}</span>
                        {result !== 'pending' && (
                            <span className={`px-1.5 py-0.5 rounded ${result === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {result === 'success' ? 'Success' : 'Failed'}
                            </span>
                        )}
                    </div>
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${config.color}`}>
                    <span className="text-[10px]">{config.icon}</span>
                    <span className="whitespace-nowrap">{config.text}</span>
                </span>
            </div>

            {/* Target & Time Progress Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Time Progress */}
                {timeProgress && (
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between text-[10px] text-luxury-gray mb-1">
                            <span>Time Left</span>
                            <span className="text-white">{timeLabel}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${timePercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Target Accuracy */}
                {targetAccuracy ? (
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between text-[10px] text-luxury-gray mb-1">
                            <span>Target ({targetAccuracy.unit})</span>
                            <span className={targetAccuracy.status === 'over' ? 'text-green-400' : 'text-red-400'}>
                                {targetAccuracy.current}
                            </span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${targetAccuracy.status === 'over' ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: '100%' }} // Simplified visualization
                            />
                        </div>
                    </div>
                ) : (
                    // Fallback to Task process if no target defined
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between text-[10px] text-luxury-gray mb-1">
                            <span>Tasks</span>
                            <span className="text-white">{completedCount}/{todoItems.length}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Metrics Preview */}
            {Object.keys(metrics).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4 mt-auto">
                    {metrics.roas && (
                        <div className="text-center p-2 rounded bg-white/5">
                            <div className="text-md font-serif text-white">{metrics.roas.toFixed(1)}x</div>
                            <div className="text-[9px] text-luxury-gray uppercase">ROAS</div>
                        </div>
                    )}
                    {metrics.cpc && (
                        <div className="text-center p-2 rounded bg-white/5">
                            <div className="text-md font-serif text-white">{(metrics.cpc / 1000).toFixed(1)}k</div>
                            <div className="text-[9px] text-luxury-gray uppercase">CPC</div>
                        </div>
                    )}
                    {metrics.conversions && (
                        <div className="text-center p-2 rounded bg-white/5">
                            <div className="text-md font-serif text-white">{metrics.conversions}</div>
                            <div className="text-[9px] text-luxury-gray uppercase">Conv.</div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions Footer */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Placeholder for Extend
                    }}
                    className="px-2 py-1 text-xs text-luxury-gray hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                    Extend
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Placeholder for Scale
                    }}
                    className="px-2 py-1 text-xs text-luxury-gray hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                    Scale
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this experiment?')) onDelete(id);
                    }}
                    className="ml-auto px-2 py-1 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                    Archive
                </button>
            </div>
        </div>
    );
};

export default ExperimentCard;
