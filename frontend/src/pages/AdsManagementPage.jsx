import React, { useState } from 'react';
import { useAds } from '../context/AdsContext';
import AdsAccountTable from '../components/ads/AdsAccountTable';
import AddAccountModal from '../components/ads/AddAccountModal';
import AssetManager from '../components/ads/AssetManager';

const AdsManagementPage = () => {
    const {
        accounts,
        importAccounts,
        addAccount,
        checkAccountHealth,
        assets,
        addAsset,
        proxies
    } = useAds();

    const [activeTab, setActiveTab] = useState('accounts'); // accounts | assets | proxies
    const [subTab, setSubTab] = useState('all'); // all | google | meta | tiktok
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccountIds, setSelectedAccountIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter accounts by platform and search
    const filteredAccounts = accounts.filter(acc => {
        const matchPlatform = subTab === 'all' || acc.platform === subTab;
        const query = searchQuery.toLowerCase();
        const matchSearch = acc.name.toLowerCase().includes(query) ||
            (acc.id && acc.id.toLowerCase().includes(query)) ||
            (acc.digitalStaff && acc.digitalStaff.toLowerCase().includes(query)) ||
            (acc.notes && acc.notes.toLowerCase().includes(query));
        return matchPlatform && matchSearch;
    });

    // Calculate Overview Metrics for CURRENT PLATFORM
    const metrics = filteredAccounts.reduce((acc, curr) => ({
        totalBudget: acc.totalBudget + (curr.budgetLoaded || 0),
        totalSpent: acc.totalSpent + (curr.budgetSpent || 0),
        remaining: acc.remaining + (curr.budgetRemaining || 0)
    }), { totalBudget: 0, totalSpent: 0, remaining: 0 });

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const handleCheckStatus = () => {
        if (selectedAccountIds.length > 0) {
            checkAccountHealth(selectedAccountIds);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-serif tracking-tight">Quản lý tài khoản</h1>
                    <p className="text-luxury-gray text-sm mt-1">Theo dõi, kiểm tra và quản lý tài sản quảng cáo</p>
                </div>

                <div className="flex gap-4">
                    {activeTab === 'accounts' && (
                        <>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 transition-colors"
                            >
                                + Thêm tài khoản
                            </button>
                            <button
                                onClick={handleCheckStatus}
                                disabled={selectedAccountIds.length === 0}
                                className="px-4 py-2 border border-white/20 text-sm font-medium rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                ↻ Kiếm tra Status
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Overview Cards (Only for Accounts Tab) */}
            {activeTab === 'accounts' && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-lg">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tổng ngân sách đã nạp</div>
                        <div className="text-2xl font-mono text-white">{formatCurrency(metrics.totalBudget)}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-lg">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tổng chi tiêu</div>
                        <div className="text-2xl font-mono text-gray-300">{formatCurrency(metrics.totalSpent)}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-lg">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Số dư còn lại</div>
                        <div className="text-2xl font-mono text-emerald-400">{formatCurrency(metrics.remaining)}</div>
                    </div>
                </div>
            )}

            {/* Main Tabs */}
            <div className="flex gap-8 border-b border-white/10 mb-6">
                {[
                    { id: 'accounts', label: 'Tài khoản Ads' },
                    { id: 'assets', label: 'Tài sản (Thẻ/Creative)' },
                    { id: 'proxies', label: 'Proxy System' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            pb-3 text-sm font-medium uppercase tracking-widest transition-colors relative
                            ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                        `}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white" />
                        )}
                    </button>
                ))}
            </div>

            {/* Sub Tabs (Platform) for Accounts */}
            {activeTab === 'accounts' && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setSubTab('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${subTab === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setSubTab('google')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${subTab === 'google' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                    >
                        Google Ads
                    </button>
                    <button
                        onClick={() => setSubTab('meta')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${subTab === 'meta' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                    >
                        Meta Ads
                    </button>
                    <button
                        onClick={() => setSubTab('tiktok')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${subTab === 'tiktok' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                    >
                        TikTok Ads
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex flex-col flex-1">
                {activeTab === 'accounts' && (
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm tài khoản / ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-white/30 outline-none"
                            />
                        </div>
                        <div className="">
                            <AdsAccountTable
                                accounts={filteredAccounts}
                                selectedIds={selectedAccountIds}
                                onSelectionChange={setSelectedAccountIds}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'assets' && (
                    <AssetManager assets={assets} onAddAsset={addAsset} />
                )}

                {activeTab === 'proxies' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
                        <div className="border border-white/10 rounded p-6 bg-white/5">
                            <h3 className="text-lg font-serif mb-4">Danh sách Proxy</h3>
                            <div className="space-y-3">
                                {proxies.map(proxy => (
                                    <div key={proxy.id} className="p-3 bg-black border border-white/10 rounded flex justify-between items-center">
                                        <div>
                                            <div className="font-mono text-sm">{proxy.ip}</div>
                                            <div className="text-xs opacity-50">{proxy.location} • {proxy.provider}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded ${proxy.status === 'Live' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                            {proxy.status}
                                        </div>
                                    </div>
                                ))}
                                {proxies.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-4">Chưa có proxy nào.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AddAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addAccount}
                onImport={importAccounts}
            />

            {/* Spacer for bottom scrolling */}
            <div className="h-40 shrink-0"></div>
        </div>
    );
};

export default AdsManagementPage;
