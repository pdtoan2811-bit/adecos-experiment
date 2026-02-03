import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAccounts, mockProxies, mockAssets } from '../data/mockAdsManager';

const AdsContext = createContext();

export const useAds = () => useContext(AdsContext);

export const AdsProvider = ({ children }) => {
    // Initialize state from localStorage or mock data
    const [accounts, setAccounts] = useState(() => {
        const saved = localStorage.getItem('adecos_ads_accounts_v2');
        return saved ? JSON.parse(saved) : mockAccounts;
    });

    const [proxies, setProxies] = useState(() => {
        const saved = localStorage.getItem('adecos_ads_proxies_v2');
        return saved ? JSON.parse(saved) : mockProxies;
    });

    const [assets, setAssets] = useState(() => {
        const saved = localStorage.getItem('adecos_ads_assets_v2');
        return saved ? JSON.parse(saved) : mockAssets;
    });

    // Persistence effects
    useEffect(() => {
        localStorage.setItem('adecos_ads_accounts_v2', JSON.stringify(accounts));
    }, [accounts]);

    useEffect(() => {
        localStorage.setItem('adecos_ads_proxies_v2', JSON.stringify(proxies));
    }, [proxies]);

    useEffect(() => {
        localStorage.setItem('adecos_ads_assets_v2', JSON.stringify(assets));
    }, [assets]);

    // Actions
    const addAccount = (newAccount) => {
        setAccounts(prev => [...prev, { ...newAccount, id: newAccount.id || `ACC-${Date.now()}` }]);
    };

    const importAccounts = (newAccountsList) => {
        // Simple mock ID generation and merge
        const processed = newAccountsList.map((acc, idx) => ({
            ...acc,
            id: acc.id || `ACC-${Date.now()}-${idx}`,
            status: acc.status || 'Pending',
            budgetSpent: 0,
            budgetRemaining: acc.budgetLoaded || 0
        }));
        setAccounts(prev => [...prev, ...processed]);
    };

    const updateAccount = (id, updates) => {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
    };

    const deleteAccount = (id) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const checkAccountHealth = (ids) => {
        // Simulation of checking health
        setAccounts(prev => prev.map(acc => {
            if (ids.includes(acc.id)) {
                // Randomly flip status for demo
                const statuses = ['Active', 'Active', 'Active', 'Warning', 'Disabled'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                return { ...acc, status: randomStatus };
            }
            return acc;
        }));
    };

    const addProxy = (proxy) => {
        setProxies(prev => [...prev, { ...proxy, id: `PRX-${Date.now()}` }]);
    };

    const addAsset = (type, asset) => {
        setAssets(prev => ({
            ...prev,
            [type]: [...prev[type], { ...asset, id: `${type === 'paymentMethods' ? 'CC' : 'CR'}-${Date.now()}` }]
        }));
    };

    return (
        <AdsContext.Provider value={{
            accounts,
            proxies,
            assets,
            addAccount,
            importAccounts,
            updateAccount,
            deleteAccount,
            checkAccountHealth,
            addProxy,
            addAsset
        }}>
            {children}
        </AdsContext.Provider>
    );
};
