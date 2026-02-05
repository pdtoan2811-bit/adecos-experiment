import React, { useState } from 'react';
// User asked for "Dynamic", so standard CSS transitions work well.

const ChatInterface = ({ onSearch, isSearching, hasSearched }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) onSearch(query);
        setQuery(''); // Clear input after submit
    };

    const suggestions = ['Tối ưu chiến dịch ads', 'Chi phí tháng này', 'ROAS của tôi', 'Chiến dịch có hiệu suất tốt nhất'];


    return (
        <div
            className={`transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col items-center justify-center 
      ${hasSearched
                    ? 'fixed bottom-0 left-0 right-0 py-6 bg-luxury-black/80 backdrop-blur-xl border-t border-white/10 z-50'
                    : 'min-h-[85vh] relative z-10 mx-auto w-full max-w-5xl px-6'
                }`}
        >

            {/* Logo Area - Fades out/up when searching */}
            <div className={`text-center space-y-6 transition-all duration-700 ${hasSearched ? 'hidden opacity-0' : 'mb-16 opacity-100'}`}>
                <h1 className="text-5xl md:text-8xl font-serif text-luxury-white tracking-tighter leading-tight">
                    Adecos
                </h1>
                <p className="text-lg md:text-xl text-luxury-gray font-sans font-light tracking-widest uppercase opacity-60">
                    Trí tuệ nhân tạo cho Affiliate
                </p>
            </div>

            <form onSubmit={handleSubmit} className={`w-full transition-all duration-1000 ${hasSearched ? 'max-w-4xl' : 'max-w-2xl'}`}>
                <div className="relative group space-y-8">

                    {/* Input Container */}
                    <div className={`relative flex items-center bg-transparent transition-colors duration-500 pb-2 
              ${hasSearched
                            ? 'bg-white/5 rounded-full px-6 py-1 border border-white/10'
                            : 'border-b border-white/20 focus-within:border-white/60'
                        }`}
                    >

                        <input
                            type="text"
                            className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-luxury-white placeholder-white/20 font-serif placeholder:italic text-center
                ${hasSearched ? 'text-lg py-3 placeholder:text-base' : 'text-2xl md:text-3xl px-2 py-2 placeholder:font-serif'}
              `}
                            placeholder={hasSearched ? "Hỏi thêm câu hỏi hoặc tìm ngách khác..." : "Bạn đang tìm ngách nào?"}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={isSearching}
                            autoFocus={!hasSearched}
                        />

                        <button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className={`absolute right-2 p-2 text-white/50 hover:text-white transition-all duration-300`}
                        >
                            {isSearching ? (
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Suggestions - Only on Home */}
                    {!hasSearched && !isSearching && (
                        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
                            {suggestions.map((niche) => (
                                <button
                                    key={niche}
                                    type="button"
                                    onClick={() => onSearch(niche)}
                                    className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-luxury-gray text-sm font-sans tracking-wider hover:bg-white hover:text-black hover:border-white transition-all duration-500 ease-out cursor-pointer backdrop-blur-sm"
                                >
                                    {niche}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
