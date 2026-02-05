import React from 'react';

/**
 * ExperimentListItem - Table row style experiment item
 */
const ExperimentListItem = ({ experiment, onClick, onStatusChange, onDelete }) => {
    const {
        id,
        title,
        createdAt,
        status,
        result = 'pending',
        metrics = {},
        targetAccuracy,
        timeProgress
    } = experiment;

    const statusConfig = {
        running: { color: 'text-green-400 bg-green-500/10', icon: '▶', text: 'Đang chạy' },
        paused: { color: 'text-yellow-400 bg-yellow-500/10', icon: '❚❚', text: 'Tạm dừng' },
        completed: { color: 'text-blue-400 bg-blue-500/10', icon: '✓', text: 'Hoàn thành' }
    };

    const config = statusConfig[status] || statusConfig.running;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Calculate time progress %
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

    // Target Accuracy color
    const getTargetColor = (status) => {
        if (status === 'over') return 'text-green-400';
        if (status === 'under') return 'text-red-400';
        return 'text-white';
    };

    return (
        <div
            className="group grid grid-cols-12 gap-4 items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
            onClick={onClick}
        >
            {/* Title & Date */}
            <div className="col-span-4 min-w-0">
                <div className="font-medium text-white truncate">{title}</div>
                <div className="text-xs text-luxury-gray">{formatDate(createdAt)}</div>
            </div>

            {/* Status */}
            <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${config.color}`}>
                    <span className="text-[10px]">{config.icon}</span>
                    {config.text}
                </span>
            </div>

            {/* Target Accuracy */}
            <div className="col-span-2">
                {targetAccuracy ? (
                    <div className="text-xs">
                        <div className="flex justify-between mb-1">
                            <span className="text-luxury-gray">Target</span>
                            <span className={getTargetColor(targetAccuracy.status)}>
                                {targetAccuracy.status === 'over' ? '▲' : '▼'} {targetAccuracy.current}
                            </span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${targetAccuracy.status === 'over' ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: '100%' }} // Simplified for now, just showing status color
                            />
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-luxury-gray">-</span>
                )}
            </div>

            {/* Time Progress */}
            <div className="col-span-2">
                {timeProgress ? (
                    <div className="text-xs">
                        <div className="flex justify-between mb-1">
                            <span className="text-luxury-gray">Time</span>
                            <span className="text-white">{timeLabel}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${timePercent}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <span className="text-xs text-luxury-gray">-</span>
                )}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Extend logic placeholder
                        console.log('Extend', id);
                    }}
                    className="p-1.5 text-luxury-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Extend"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Scale logic placeholder
                        console.log('Scale', id);
                    }}
                    className="p-1.5 text-luxury-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Scale"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this experiment?')) onDelete(id);
                    }}
                    className="p-1.5 text-luxury-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Archive"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ExperimentListItem;
