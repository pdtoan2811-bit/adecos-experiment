import React, { useState } from 'react';

const AddAccountModal = ({ isOpen, onClose, onAdd, onImport }) => {
    const [email, setEmail] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null); // null | [] of accounts
    const [step, setStep] = useState('input'); // input | syncing | result

    if (!isOpen) return null;

    const resetState = () => {
        setEmail('');
        setIsSyncing(false);
        setSyncResult(null);
        setStep('input');
    };

    const handleClose = () => {
        onClose();
        setTimeout(resetState, 300); // Reset after animation if any, or just plain reset
    };

    const handleSync = (e) => {
        e.preventDefault();
        if (!email) return;

        setStep('syncing');
        setIsSyncing(true);

        // Simulate API Call
        setTimeout(() => {
            const mockAccounts = [
                {
                    name: `TK Chạy Quảng Cáo - ${email.split('@')[0]}`,
                    id: `ACC-${Date.now()}-1`,
                    platform: 'google',
                    source: 'Via',
                    budgetLoaded: 50000000,
                    budgetSpent: 12000000,
                    budgetRemaining: 38000000,
                    digitalStaff: email.split('@')[0],
                    notes: 'Tài khoản synced từ email',
                    status: 'Active',
                    dateAdded: new Date().toISOString().split('T')[0]
                },
                {
                    name: `TK Tiktok - ${email.split('@')[0]}`,
                    id: `ACC-${Date.now()}-2`,
                    platform: 'tiktok',
                    source: 'Agency',
                    budgetLoaded: 100000000,
                    budgetSpent: 0,
                    budgetRemaining: 100000000,
                    digitalStaff: email.split('@')[0],
                    notes: 'Tài khoản synced từ email',
                    status: 'Active',
                    dateAdded: new Date().toISOString().split('T')[0]
                },
                {
                    name: `Meta Ads - BM50`,
                    id: `ACC-${Date.now()}-3`,
                    platform: 'meta',
                    source: 'BM50',
                    budgetLoaded: 20000000,
                    budgetSpent: 5000000,
                    budgetRemaining: 15000000,
                    digitalStaff: email.split('@')[0],
                    notes: 'Tài khoản synced từ email',
                    status: 'Pending',
                    dateAdded: new Date().toISOString().split('T')[0]
                }
            ];

            setSyncResult(mockAccounts);
            setIsSyncing(false);
            setStep('result');
        }, 2000);
    };

    const handleConfirmImport = () => {
        if (syncResult && syncResult.length > 0) {
            onImport(syncResult); // Use onImport to add multiple
        }
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[500px] bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">Đồng bộ tài khoản Ads</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="p-8">
                    {step === 'input' && (
                        <form onSubmit={handleSync} className="flex flex-col gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    🔗
                                </div>
                                <p className="text-gray-300 text-sm">
                                    Nhập email quản trị viên để đồng bộ tất cả tài khoản quảng cáo liên kết.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Email Quản Trị</label>
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-white outline-none transition-colors placeholder:text-gray-600"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors uppercase tracking-wide text-sm"
                            >
                                Bắt đầu đồng bộ
                            </button>
                        </form>
                    )}

                    {step === 'syncing' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-medium">Đang tìm kiếm tài khoản...</p>
                            <p className="text-gray-500 text-xs mt-2">Vui lòng đợi trong giây lát</p>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="flex flex-col h-full">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                                    ✓
                                </div>
                                <h4 className="text-white font-medium">Đã tìm thấy {syncResult.length} tài khoản</h4>
                                <p className="text-gray-500 text-xs mt-1">Email: {email}</p>
                            </div>

                            <div className="bg-white/5 rounded border border-white/10 overflow-hidden mb-6 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {syncResult.map((acc, idx) => (
                                    <div key={idx} className="p-3 border-b border-white/5 last:border-0 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${acc.platform === 'google' ? 'bg-blue-400' : acc.platform === 'tiktok' ? 'bg-black border border-white/20' : 'bg-blue-600'}`}></div>
                                            <div>
                                                <div className="text-sm text-white font-medium">{acc.name}</div>
                                                <div className="text-xs text-gray-500">{acc.id}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-emerald-400 font-mono">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(acc.budgetRemaining)}
                                            </div>
                                            <div className="text-[10px] text-gray-500">Số dư</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={resetState}
                                    className="flex-1 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Thử lại
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    className="flex-[2] py-2 bg-white text-black text-sm font-bold rounded hover:bg-gray-200 transition-colors uppercase"
                                >
                                    Xác nhận thêm
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAccountModal;
