import React, { useState, useMemo } from 'react';

/**
 * CampaignSelectionTable - Interactive table for selecting campaigns to analyze
 * 
 * Features:
 * - Sortable columns (CPC, Cost, ROAS)
 * - Visual status indicators
 * - Action button to trigger deep dive
 */
const CampaignSelectionTable = ({ campaigns, onSelect }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'roas_30d', direction: 'descending' });

    const sortedCampaigns = useMemo(() => {
        let sortableItems = [...campaigns];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [campaigns, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (!sortConfig || sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="w-full bg-black/20 border border-white/10 rounded-xl overflow-hidden mt-4">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Select a Campaign to Analyze</h3>
                <span className="text-xs text-luxury-gray">{campaigns.length} Active Campaigns</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-xs text-luxury-gray uppercase tracking-wider">
                            <th className="px-6 py-4 font-normal">Campaign</th>
                            <th className="px-6 py-4 font-normal text-center">Status</th>
                            <th
                                className="px-6 py-4 font-normal cursor-pointer hover:text-white transition-colors"
                                onClick={() => requestSort('cpc')}
                            >
                                CPC {getSortIndicator('cpc')}
                            </th>
                            <th
                                className="px-6 py-4 font-normal cursor-pointer hover:text-white transition-colors"
                                onClick={() => requestSort('cost_30d')}
                            >
                                Cost (30d) {getSortIndicator('cost_30d')}
                            </th>
                            <th
                                className="px-6 py-4 font-normal cursor-pointer hover:text-white transition-colors text-right"
                                onClick={() => requestSort('roas_30d')}
                            >
                                ROAS {getSortIndicator('roas_30d')}
                            </th>
                            <th className="px-6 py-4 font-normal"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedCampaigns.map((campaign) => (
                            <tr
                                key={campaign.id}
                                className="hover:bg-white/5 transition-colors group cursor-pointer"
                                onClick={() => onSelect(campaign)}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                        {campaign.name}
                                    </div>
                                    <div className="text-xs text-luxury-gray mt-1 flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                            {campaign.affiliate_program}
                                        </span>
                                        <span>ID: {campaign.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`w-2.5 h-2.5 rounded-full mx-auto ${campaign.status === 'running'
                                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                                        : 'bg-yellow-500'
                                        }`} title={campaign.status} />
                                </td>
                                <td className="px-6 py-4 text-sm text-white/80 font-mono">
                                    {formatCurrency(campaign.cpc)}
                                </td>
                                <td className="px-6 py-4 text-sm text-white/80 font-mono">
                                    {formatCurrency(campaign.cost_30d)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`inline-block font-mono font-medium ${campaign.roas_30d >= 4.0 ? 'text-green-400' :
                                        campaign.roas_30d >= 2.5 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {campaign.roas_30d.toFixed(2)}x
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(campaign);
                                        }}
                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg
                                                   transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                    >
                                        Deep Dive →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Summary */}
            <div className="px-6 py-3 border-t border-white/10 bg-white/5 text-xs text-luxury-gray flex justify-between">
                <span>Total Spend: {formatCurrency(sortedCampaigns.reduce((sum, c) => sum + c.cost_30d, 0))}</span>
                <span>Avg ROAS: {(sortedCampaigns.reduce((sum, c) => sum + c.roas_30d, 0) / sortedCampaigns.length).toFixed(2)}x</span>
            </div>
        </div>
    );
};

export default CampaignSelectionTable;
