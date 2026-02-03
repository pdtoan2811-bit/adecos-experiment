import React, { useState, useRef } from 'react';

const AddAccountModal = ({ isOpen, onClose, onAdd, onImport }) => {
    const [mode, setMode] = useState('single'); // single | import
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        platform: 'google',
        source: 'Via',
        budgetLoaded: '',
        digitalStaff: 'Thomas',
        notes: ''
    });

    // Import State
    const [importFile, setImportFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    // --- Single Account Logic ---
    const handleSingleSubmit = (e) => {
        e.preventDefault();
        const newAccount = {
            ...formData,
            id: formData.id || `ACC-${Date.now()}`,
            budgetLoaded: Number(formData.budgetLoaded) || 0,
            budgetSpent: 0,
            budgetRemaining: Number(formData.budgetLoaded) || 0,
            dateAdded: new Date().toISOString().split('T')[0],
            status: 'Active'
        };
        onAdd(newAccount);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            id: '',
            platform: 'google',
            source: 'Via',
            budgetLoaded: '',
            digitalStaff: 'Thomas',
            notes: ''
        });
        setImportFile(null);
        setPreview([]);
        setError(null);
    };

    // --- Import Logic ---
    const handleDownloadTemplate = () => {
        const headers = ["Name", "ID", "Platform", "Source", "Budget", "Staff", "Notes"];
        const rows = [
            ["Exness Search Campaign", "EX-001", "google", "Via", "50000000", "Thomas", "TK chính"],
            ["Binance Video", "BN-002", "tiktok", "Agency", "100000000", "Sarah", "Video hot"]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_ads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImportFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            parseCSV(text);
        };
        reader.onerror = () => setError("Lỗi khi đọc file");
        reader.readAsText(file);
    };

    const parseCSV = (text) => {
        try {
            const lines = text.trim().split('\n');
            // Assuming first line is header, skip it if it contains "Name"
            const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

            const parsed = [];
            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Simple comma splitting, handling basic quotes is complex in regex but for simple CSV:
                const columns = line.split(',').map(c => c.trim());
                if (columns.length < 3) continue; // Basic validation

                // Mapping: Name, ID, Platform, Source, Budget, Staff, Notes
                parsed.push({
                    name: columns[0] || 'No Name',
                    id: columns[1] || `IMP-${Date.now()}-${i}`,
                    platform: (columns[2] || 'google').toLowerCase(),
                    source: columns[3] || 'Via',
                    budgetLoaded: parseInt(columns[4] || '0'),
                    digitalStaff: columns[5] || 'Admin',
                    notes: columns[6] || '',
                    status: 'Pending',
                    budgetSpent: 0,
                    budgetRemaining: parseInt(columns[4] || '0'),
                    dateAdded: new Date().toISOString().split('T')[0]
                });
            }

            if (parsed.length === 0) {
                setError("Không tìm thấy dữ liệu hợp lệ trong file.");
            } else {
                setPreview(parsed);
            }
        } catch (err) {
            setError("Lỗi format CSV. Hãy dùng file mẫu.");
        }
    };

    const handleImportConfirm = () => {
        onImport(preview);
        onClose();
        resetForm();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[600px] bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif text-white">Thêm tài khoản mới</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setMode('single')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'single' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Thêm thủ công
                    </button>
                    <button
                        onClick={() => setMode('import')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'import' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Import file (Excel/CSV)
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {mode === 'single' ? (
                        <form onSubmit={handleSingleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Tên tài khoản <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white"
                                        placeholder="Ví dụ: MDW_Exness_01"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">ID Tài khoản (Tùy chọn)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white"
                                        placeholder="Tự động tạo nếu để trống"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Nền tảng</label>
                                    <select
                                        className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white"
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                    >
                                        <option value="google">Google Ads</option>
                                        <option value="meta">Meta Ads</option>
                                        <option value="tiktok">TikTok Ads</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Nguồn tài khoản</label>
                                    <select
                                        className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white"
                                        value={formData.source}
                                        onChange={e => setFormData({ ...formData, source: e.target.value })}
                                    >
                                        <option value="Via">Via</option>
                                        <option value="Clone">Clone</option>
                                        <option value="BM50">BM50</option>
                                        <option value="BM2500">BM2500</option>
                                        <option value="Agency">Agency</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Ngân sách đã nạp (VND)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white"
                                        placeholder="50000000"
                                        value={formData.budgetLoaded}
                                        onChange={e => setFormData({ ...formData, budgetLoaded: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Nhân sự phụ trách</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white"
                                        placeholder="Tên nhân viên"
                                        value={formData.digitalStaff}
                                        onChange={e => setFormData({ ...formData, digitalStaff: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Ghi chú</label>
                                <textarea
                                    className="w-full bg-black border border-white/20 rounded p-2 text-sm focus:border-white text-white h-20"
                                    placeholder="Ghi chú thêm về tài khoản..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm hover:text-white transition-colors text-gray-400">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200">
                                    Thêm tài khoản
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded p-4 text-center">
                                <p className="text-sm text-gray-300 mb-2">Bạn chưa có file mẫu?</p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="text-blue-400 text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
                                >
                                    <span>📥</span> Tải file mẫu (CSV)
                                </button>
                            </div>

                            <div
                                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="text-4xl mb-3 opacity-50">📂</div>
                                <p className="text-white font-medium mb-1">
                                    {importFile ? importFile.name : "Click để tải lên file CSV"}
                                </p>
                                <p className="text-xs text-gray-500">Hỗ trợ định dạng .csv</p>
                            </div>

                            {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">{error}</p>}

                            {preview.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-green-400 mb-2 font-medium">✨ Đã đọc được {preview.length} tài khoản:</p>
                                    <div className="max-h-40 overflow-y-auto border border-white/10 rounded bg-black/50 overflow-hidden">
                                        <table className="w-full text-left text-xs text-gray-400">
                                            <thead className="bg-white/10 text-white font-medium">
                                                <tr>
                                                    <th className="p-2">Tên</th>
                                                    <th className="p-2">ID</th>
                                                    <th className="p-2 text-right">Ngân sách</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {preview.map((p, i) => (
                                                    <tr key={i}>
                                                        <td className="p-2 truncate max-w-[150px]">{p.name}</td>
                                                        <td className="p-2 font-mono">{p.id}</td>
                                                        <td className="p-2 text-right font-mono">{p.budgetLoaded.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
                                <button onClick={onClose} className="px-4 py-2 text-sm hover:text-white transition-colors text-gray-400">Hủy</button>
                                <button
                                    onClick={handleImportConfirm}
                                    disabled={preview.length === 0}
                                    className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Import {preview.length > 0 ? preview.length : ''} Tài khoản
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
