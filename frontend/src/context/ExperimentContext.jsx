import React, { createContext, useContext, useState, useEffect } from 'react';

const ExperimentContext = createContext();

export const useExperiments = () => {
    const context = useContext(ExperimentContext);
    if (!context) {
        throw new Error('useExperiments must be used within ExperimentProvider');
    }
    return context;
};

export const ExperimentProvider = ({ children }) => {
    const [experiments, setExperiments] = useState(() => {
        const saved = localStorage.getItem('experiments');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load experiments:', e);
                return [];
            }
        }
        return [];
    });

    const [activeExperiment, setActiveExperiment] = useState(null);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('experiments', JSON.stringify(experiments));
    }, [experiments]);

    // Add new experiment
    const addExperiment = (experiment) => {
        const newExperiment = {
            ...experiment,
            id: experiment.id || `exp-${Date.now()}`,
            createdAt: experiment.createdAt || new Date().toISOString(),
            status: experiment.status || 'running',
            progress: calculateProgress(experiment.todoItems || []),
        };
        setExperiments(prev => [newExperiment, ...prev]);
        return newExperiment;
    };

    // Update experiment
    const updateExperiment = (id, updates) => {
        setExperiments(prev => prev.map(exp => {
            if (exp.id === id) {
                const updated = { ...exp, ...updates };
                if (updates.todoItems) {
                    updated.progress = calculateProgress(updates.todoItems);
                }
                return updated;
            }
            return exp;
        }));
    };

    // Delete experiment
    const deleteExperiment = (id) => {
        setExperiments(prev => prev.filter(exp => exp.id !== id));
        if (activeExperiment?.id === id) {
            setActiveExperiment(null);
        }
    };

    // Change experiment status
    const setExperimentStatus = (id, status) => {
        updateExperiment(id, { status });
    };

    // Get experiment by ID
    const getExperiment = (id) => {
        return experiments.find(exp => exp.id === id);
    };

    // Calculate progress from todo items
    const calculateProgress = (items) => {
        if (!items || items.length === 0) return 0;
        const completed = items.filter(item => item.completed).length;
        return Math.round((completed / items.length) * 100);
    };

    return (
        <ExperimentContext.Provider value={{
            experiments,
            activeExperiment,
            setActiveExperiment,
            addExperiment,
            updateExperiment,
            deleteExperiment,
            setExperimentStatus,
            getExperiment,
        }}>
            {children}
        </ExperimentContext.Provider>
    );
};
