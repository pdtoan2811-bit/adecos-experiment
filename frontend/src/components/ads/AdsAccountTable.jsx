import React, { useState } from 'react';

const ALL_COLUMNS = [
    { key: 'stt', label: 'STT', alwaysVisible: true },
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tên ID' },
    { key: 'budgetRemaining', label: 'Ngân sách còn lại' },
    { key: 'status', label: 'Status tài khoản' },
    { key: 'email', label: 'Email' },
    { key: 'source', label: 'Nguồn' },
    { key: 'sourceAccount', label: 'TK nguồn' },
    { key: 'dateAdded', label: 'Thời gian' },
    { key: 'digitalStaff', label: 'Nhân sự Digital' },
    { key: 'budgetLoaded', label: 'Ngân sách đã nạp' },
    { key: 'budgetLoadedAPI', label: 'Ngân sách đã nạp (API)' },
    { key: 'budgetSpent', label: 'Ngân sách đã tiêu' },
    { key: 'notes', label: 'Ghi chú' },
    { key: 'actions', label: 'Chức năng', alwaysVisible: true },
];

const AdsAccountTable = ({ accounts, selectedIds, onSelectionChange }) => {
    // Default all visible
    const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.map(c => c.key));
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    const toggleColumn = (key) => {
        if (visibleColumns.includes(key)) {
            setVisibleColumns(visibleColumns.filter(k => k !== key));
        } else {
            setVisibleColumns([...visibleColumns, key]);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectionChange(accounts.map(a => a.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'text-green-400 bg-green-400/10';
            case 'disabled': return 'text-red-400 bg-red-400/10';
            case 'warning': return 'text-yellow-400 bg-yellow-400/10';
            case 'pending': return 'text-blue-400 bg-blue-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '-';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const isLowBudget = (remaining, loaded) => {
        if (!loaded || loaded === 0) return false;
        return (remaining / loaded) < 0.1;
    };

    const checkVisible = (key) => visibleColumns.includes(key);

    return (
        <div className="flex flex-col">
            {/* Toolbar for Columns */}
            <div className="flex justify-end mb-2 relative">
                <button
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 border border-white/10 rounded bg-white/5 transition-colors"
                >
                    <span>👁️</span> Tùy chỉnh cột
                </button>

                {showColumnSelector && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#111] border border-white/20 rounded shadow-2xl z-50 p-4">
                        <div className="text-sm font-bold text-white mb-3">Hiển thị cột</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {ALL_COLUMNS.filter(c => !c.alwaysVisible).map(col => (
                                <label key={col.key} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                                    <input
                                        type="checkbox"
                                        checked={visibleColumns.includes(col.key)}
                                        onChange={() => toggleColumn(col.key)}
                                        className="rounded bg-white/10 border-white/20"
                                    />
                                    {col.label}
                                </label>
                            ))}
                        </div>
                        <div className="pt-3 mt-3 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => setShowColumnSelector(false)}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-md border border-white/10">
                <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap relative">
                    <thead className="bg-white/5 text-gray-200 font-mono text-xs uppercase sticky top-0 z-10">
                        <tr>
                            <th className="p-4 w-4 bg-[#111]">
                                <input
                                    type="checkbox"
                                    className="rounded bg-white/10 border-white/20"
                                    checked={accounts.length > 0 && selectedIds.length === accounts.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            {checkVisible('stt') && <th className="p-4 bg-[#111]">STT</th>}
                            {checkVisible('id') && <th className="p-4 bg-[#111]">ID</th>}
                            {checkVisible('name') && <th className="p-4 bg-[#111]">Tên ID</th>}
                            {checkVisible('budgetRemaining') && <th className="p-4 text-right bg-[#111]">Ngân sách còn lại</th>}
                            {checkVisible('status') && <th className="p-4 bg-[#111]">Status tài khoản</th>}
                            {checkVisible('email') && <th className="p-4 bg-[#111]">Email</th>}
                            {checkVisible('source') && <th className="p-4 bg-[#111]">Nguồn</th>}
                            {checkVisible('sourceAccount') && <th className="p-4 bg-[#111]">TK nguồn</th>}
                            {checkVisible('dateAdded') && <th className="p-4 bg-[#111]">Thời gian</th>}
                            {checkVisible('digitalStaff') && <th className="p-4 bg-[#111]">Nhân sự Digital</th>}
                            {checkVisible('budgetLoaded') && <th className="p-4 text-right bg-[#111]">Ngân sách đã nạp</th>}
                            {checkVisible('budgetLoadedAPI') && <th className="p-4 text-right bg-[#111]">Ngân sách đã nạp (API)</th>}
                            {checkVisible('budgetSpent') && <th className="p-4 text-right bg-[#111]">Ngân sách đã tiêu</th>}
                            {checkVisible('notes') && <th className="p-4 bg-[#111]">Ghi chú</th>}
                            {checkVisible('actions') && <th className="p-4 sticky right-0 bg-[#111] shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-20">Chức năng</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {accounts.map((acc, index) => {
                            const lowBudget = isLowBudget(acc.budgetRemaining, acc.budgetLoaded);
                            return (
                                <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="rounded bg-white/10 border-white/20"
                                            checked={selectedIds.includes(acc.id)}
                                            onChange={() => handleSelectOne(acc.id)}
                                        />
                                    </td>
                                    {checkVisible('stt') && <td className="p-4 text-xs font-mono opacity-50">{index + 1}</td>}
                                    {checkVisible('id') && <td className="p-4 font-mono text-xs text-indigo-300">{acc.id}</td>}
                                    {checkVisible('name') && <td className="p-4 font-medium text-white">{acc.name}</td>}
                                    {checkVisible('budgetRemaining') && (
                                        <td className={`p-4 text-right font-mono font-bold ${lowBudget ? 'text-red-500' : 'text-emerald-400'}`}>
                                            {formatCurrency(acc.budgetRemaining)}
                                            {lowBudget && <span className="block text-[9px] font-normal uppercase mt-0.5">Low Budget</span>}
                                        </td>
                                    )}
                                    {checkVisible('status') && (
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border border-white/5 ${getStatusColor(acc.status)}`}>
                                                {acc.status}
                                            </span>
                                        </td>
                                    )}
                                    {checkVisible('email') && <td className="p-4 text-xs">{acc.email || '-'}</td>}
                                    {checkVisible('source') && <td className="p-4">{acc.source}</td>}
                                    {checkVisible('sourceAccount') && <td className="p-4 text-xs">{acc.sourceAccount}</td>}
                                    {checkVisible('dateAdded') && <td className="p-4 font-mono text-xs opacity-70">{acc.dateAdded}</td>}
                                    {checkVisible('digitalStaff') && <td className="p-4">{acc.digitalStaff}</td>}
                                    {checkVisible('budgetLoaded') && <td className="p-4 text-right font-mono text-white">{formatCurrency(acc.budgetLoaded)}</td>}
                                    {checkVisible('budgetLoadedAPI') && <td className="p-4 text-right font-mono text-gray-400">{formatCurrency(acc.budgetLoadedAPI)}</td>}
                                    {checkVisible('budgetSpent') && <td className="p-4 text-right font-mono text-gray-300">{formatCurrency(acc.budgetSpent)}</td>}

                                    {checkVisible('notes') && (
                                        <td className="p-4 text-xs italic opacity-70 max-w-[150px] truncate" title={acc.notes}>
                                            {acc.notes}
                                        </td>
                                    )}
                                    {checkVisible('actions') && (
                                        <td className="p-4 sticky right-0 bg-[#111] shadow-[-10px_0_20px_rgba(0,0,0,0.5)] flex gap-2">
                                            <button className="p-1 hover:text-white text-gray-500 transition-colors" title="Edit">✏️</button>
                                            <button className="p-1 hover:text-red-400 text-gray-500 transition-colors" title="Delete">🗑️</button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {accounts.length === 0 && (
                            <tr>
                                <td colSpan="100%" className="p-8 text-center opacity-50 italic">
                                    Không có dữ liệu. Vui lòng import tài khoản.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdsAccountTable;
