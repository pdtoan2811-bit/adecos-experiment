import React, { useState } from 'react';

const AccountImportModal = ({ isOpen, onClose, onImport }) => {
    const [inputText, setInputText] = useState('');
    const [preview, setPreview] = useState([]);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleParse = () => {
        try {
            // Simple parsing: Try JSON first, then CSV
            let parsed = [];
            if (inputText.trim().startsWith('[')) {
                parsed = JSON.parse(inputText);
            } else {
                // CSV mock parse: Name,Source,Budget
                const lines = inputText.trim().split('\n');
                parsed = lines.map((line, idx) => {
                    const [name, source, budget] = line.split(',');
                    if (!name) return null;
                    return {
                        name: name.trim(),
                        source: source?.trim() || 'Unknown',
                        budgetLoaded: parseInt(budget?.trim() || '0'),
                        status: 'Pending',
                        dateAdded: new Date().toISOString().split('T')[0]
                    };
                }).filter(Boolean);
            }
            setPreview(parsed);
            setError(null);
        } catch (err) {
            setError("Failed to parse. Ensure JSON or CSV format (Name,Source,Budget).");
        }
    };

    const handleConfirm = () => {
        onImport(preview);
        setInputText('');
        setPreview([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[600px] bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-serif">Import Accounts</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="p-6 space-y-4">
                    <textarea
                        className="w-full h-40 bg-black border border-white/20 rounded p-3 text-sm font-mono text-gray-300 focus:border-white/50 outline-none"
                        placeholder="Paste JSON or CSV (Name, Source, Budget)..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        onClick={handleParse}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                    >
                        Preview Parse
                    </button>

                    {preview.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-green-400 mb-2">Ready to import {preview.length} accounts:</p>
                            <div className="max-h-40 overflow-y-auto border border-white/10 rounded bg-black/50 p-2 text-xs font-mono">
                                {preview.map((p, i) => (
                                    <div key={i} className="flex justify-between border-b border-white/5 py-1">
                                        <span>{p.name}</span>
                                        <span className="opacity-50">{p.budgetLoaded}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button onClick={onClose} className="px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        disabled={preview.length === 0}
                        className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Import Accounts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountImportModal;
