import React, { useState } from 'react';

const AssetManager = ({ assets, onAddAsset }) => {
    const [activeTab, setActiveTab] = useState('payment'); // payment | creative

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Payment Vault */}
            <div className="border border-white/10 rounded-lg p-6 bg-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif flex items-center gap-2">
                        <span>💳</span> Payment Vault
                    </h3>
                    <button
                        onClick={() => onAddAsset('paymentMethods', { name: 'New Card', type: 'Credit Card', status: 'Active' })}
                        className="text-xs border border-white/20 px-2 py-1 rounded hover:bg-white hover:text-black transition-colors"
                    >
                        + Add Card
                    </button>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {assets.paymentMethods.map(pm => (
                        <div key={pm.id} className="p-3 bg-black border border-white/10 rounded hover:border-white/30 transition-colors group">
                            <div className="flex justify-between items-start">
                                <div className="font-mono text-sm">{pm.name}</div>
                                <div className={`text-[10px] px-1.5 py-0.5 rounded ${pm.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {pm.status}
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs opacity-50">
                                <span>{pm.type}</span>
                                <span>Exp: {pm.expiry}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Creative Library */}
            <div className="border border-white/10 rounded-lg p-6 bg-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif flex items-center gap-2">
                        <span>🎨</span> Creative Library
                    </h3>
                    <button
                        onClick={() => onAddAsset('creatives', { name: 'New Creative', type: 'Image', url: '#' })}
                        className="text-xs border border-white/20 px-2 py-1 rounded hover:bg-white hover:text-black transition-colors"
                    >
                        + Add Creative
                    </button>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {assets.creatives.map(cr => (
                        <div key={cr.id} className="p-3 bg-black border border-white/10 rounded hover:border-white/30 transition-colors flex gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-xl">
                                {cr.type === 'Image' ? '🖼️' : cr.type === 'Video' ? '🎥' : '🎠'}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium">{cr.name}</div>
                                <div className="text-xs opacity-50 mt-1 font-mono">{cr.type} • {cr.id}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssetManager;
