import React, { useState, useEffect } from 'react';
import ExperimentCard from '../components/experiments/ExperimentCard';
import ExperimentListItem from '../components/experiments/ExperimentListItem';
import ExperimentDetail from '../components/experiments/ExperimentDetail';
import { getMockExperiments } from '../data/mockWorkflowData';

/**
 * ExperimentsPage - Main experiments management page
 * 
 * Features:
 * - List of active/completed experiments
 * - Filter by status
 * - Search functionality
 * - Create new experiment
 */
const ExperimentsPage = () => {
    const [experiments, setExperiments] = useState([]);
    const [selectedExperiment, setSelectedExperiment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Load experiments from localStorage
    useEffect(() => {
        const loadExperiments = () => {
            const saved = localStorage.getItem('experiments');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Check if data is outdated (missing new fields)
                    const isOutdated = parsed.some(exp => !exp.targetAccuracy);

                    if (isOutdated) {
                        console.log('Experiments data outdated, resetting to new structure for revamp...');
                        const defaults = getMockExperiments();
                        setExperiments(defaults);
                        localStorage.setItem('experiments', JSON.stringify(defaults));
                    } else {
                        setExperiments(parsed);
                    }
                } catch (e) {
                    console.error('Failed to load experiments:', e);
                    setExperiments(getMockExperiments());
                }
            } else {
                // Load mock data for demo
                setExperiments(getMockExperiments());
            }
        };

        loadExperiments();

        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', loadExperiments);
        // Custom event for same-tab experiment updates (fired from WorkflowMessage)
        window.addEventListener('experimentAdded', loadExperiments);

        return () => {
            window.removeEventListener('storage', loadExperiments);
            window.removeEventListener('experimentAdded', loadExperiments);
        };
    }, []);

    // Save to localStorage when experiments change
    useEffect(() => {
        if (experiments.length > 0) {
            localStorage.setItem('experiments', JSON.stringify(experiments));
        }
    }, [experiments]);

    // Filter experiments
    const filteredExperiments = experiments.filter(exp => {
        const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
        const matchesSearch = !searchQuery ||
            exp.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleStatusChange = (id, newStatus) => {
        setExperiments(prev => prev.map(exp =>
            exp.id === id ? { ...exp, status: newStatus } : exp
        ));
    };

    const handleDelete = (id) => {
        setExperiments(prev => prev.filter(exp => exp.id !== id));
    };

    const handleUpdate = (id, updates) => {
        setExperiments(prev => prev.map(exp => {
            if (exp.id === id) {
                const updated = { ...exp, ...updates };
                if (updates.todoItems) {
                    const completed = updates.todoItems.filter(t => t.completed).length;
                    updated.progress = Math.round((completed / updates.todoItems.length) * 100);
                }
                return updated;
            }
            return exp;
        }));

        // Update selected experiment if it's the one being modified
        if (selectedExperiment?.id === id) {
            setSelectedExperiment(prev => ({ ...prev, ...updates }));
        }
    };

    const statusCounts = {
        all: experiments.length,
        running: experiments.filter(e => e.status === 'running').length,
        paused: experiments.filter(e => e.status === 'paused').length,
        completed: experiments.filter(e => e.status === 'completed').length,
    };

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-serif tracking-tight">Experiments</h1>
                        <p className="text-xs text-luxury-gray uppercase tracking-widest mt-1">
                            Manage your AI-generated workflows and track progress
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search experiments..."
                            className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white
                                       placeholder-white/30 focus:outline-none focus:border-white/30"
                        />
                        <svg className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1 ml-4 border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-luxury-gray hover:text-white'}`}
                            title="Grid View"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-luxury-gray hover:text-white'}`}
                            title="List View"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-4">
                    {['all', 'running', 'paused', 'completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2
                                       ${filterStatus === status
                                    ? 'bg-white/10 text-white'
                                    : 'text-luxury-gray hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="capitalize">
                                {status === 'all' ? 'All' :
                                    status === 'running' ? 'Đang chạy' :
                                        status === 'paused' ? 'Tạm dừng' : 'Hoàn thành'}
                            </span>
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${filterStatus === status ? 'bg-white/20' : 'bg-white/5'
                                }`}>
                                {statusCounts[status]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {filteredExperiments.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-serif text-white mb-2">No experiments yet</h3>
                        <p className="text-sm text-luxury-gray max-w-md mx-auto">
                            Experiments are created when you approve AI-generated workflows from the chat.
                            Go to the AI Agent to get started!
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 
                                       rounded-lg transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Open AI Agent
                        </a>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredExperiments.map((experiment, idx) => (
                                    <div
                                        key={experiment.id}
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <ExperimentCard
                                            experiment={experiment}
                                            onClick={() => setSelectedExperiment(experiment)}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {/* List Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-luxury-gray uppercase tracking-wider font-semibold">
                                    <div className="col-span-4">Experiment</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-2">Target Accuracy</div>
                                    <div className="col-span-2">Time Progress</div>
                                    <div className="col-span-2 text-right">Actions</div>
                                </div>
                                {filteredExperiments.map((experiment, idx) => (
                                    <div
                                        key={experiment.id}
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <ExperimentListItem
                                            experiment={experiment}
                                            onClick={() => setSelectedExperiment(experiment)}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="h-20" /> {/* Bottom spacing */}
            </div>

            {/* Experiment Detail Modal */}
            {
                selectedExperiment && (
                    <ExperimentDetail
                        experiment={experiments.find(e => e.id === selectedExperiment.id) || selectedExperiment}
                        onUpdate={handleUpdate}
                        onClose={() => setSelectedExperiment(null)}
                    />
                )
            }

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
        </div >
    );
};

export default ExperimentsPage;
