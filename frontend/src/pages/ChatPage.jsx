import React, { useRef, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import ChatInterface from '../components/ChatInterface';
import ChatMessage from '../components/ChatMessage';

function ChatPage() {
    const { messages, setMessages, getHistory } = useChatContext();
    const [isSearching, setIsSearching] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Update hasSearched based on messages
        setHasSearched(messages.length > 0);
    }, [messages]);

    // Listen for follow-up suggestion clicks
    useEffect(() => {
        const handleSuggestionClick = (event) => {
            handleSearch(event.detail);
        };

        window.addEventListener('agentSuggestionClick', handleSuggestionClick);
        return () => {
            window.removeEventListener('agentSuggestionClick', handleSuggestionClick);
        };
    }, []);

    const handleSearch = async (query) => {
        if (!query) return;

        console.log('[ChatPage] Starting AI Agent query:', query);
        setIsSearching(true);
        setHasSearched(true);

        // Get conversation history from sessionStorage (not displayed)
        const history = getHistory();
        console.log('[ChatPage] History length:', history.length);

        // Add user message to history
        const newMessages = [...history, { role: 'user', type: 'text', content: query }];

        // Add user message to UI
        setMessages(prev => [...prev, { role: 'user', type: 'text', content: query }]);

        try {
            console.log('[ChatPage] Sending request to AI Agent API...');
            // Use new agent endpoint
            const response = await fetch('http://localhost:8000/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                console.error('[ChatPage] Response not OK:', response.status);
                throw new Error('Network response was not ok');
            }

            console.log('[ChatPage] Got response, reading stream...');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // Initialize AI Message in UI
            setMessages(prev => [...prev, { role: 'assistant', type: 'loading', content: '' }]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
            }

            console.log('[ChatPage] Stream complete, buffer length:', buffer.length);
            console.log('[ChatPage] Buffer preview:', buffer.substring(0, 200));

            // Parse complete JSON after stream ends
            try {
                const parsed = JSON.parse(buffer);
                console.log('[ChatPage] Parsed successfully, type:', parsed.type);

                if (parsed.type && parsed.content !== undefined) {
                    const aiMessage = {
                        role: 'assistant',
                        type: parsed.type,
                        content: parsed.content,
                        context: parsed.context || null
                    };

                    console.log('[ChatPage] Updating messages with:', aiMessage.type);

                    // Update UI
                    setMessages(prev => {
                        const newArr = [...prev];
                        newArr[newArr.length - 1] = aiMessage;
                        console.log('[ChatPage] Updated! New array length:', newArr.length);
                        return newArr;
                    });
                } else {
                    console.error('[ChatPage] Invalid format - missing type or content');
                    throw new Error('Invalid response format');
                }
            } catch (e) {
                console.error('[ChatPage] Parse error:', e);
                console.error('[ChatPage] Full buffer:', buffer);
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = {
                        role: 'assistant',
                        type: 'text',
                        content: 'Đã nhận phản hồi nhưng không thể hiển thị. Vui lòng thử lại.'
                    };
                    return newArr;
                });
            }

        } catch (error) {
            console.error("[ChatPage] Streaming error", error);
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1] = {
                    role: 'assistant',
                    type: 'text',
                    content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.'
                };
                return newArr;
            });
        } finally {
            console.log('[ChatPage] Query complete');
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-white overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 flex-shrink-0">
                <h1 className="text-2xl font-serif tracking-tight">AI Agent</h1>
                <p className="text-xs text-luxury-gray uppercase tracking-widest mt-1">
                    Phân tích dữ liệu thông minh • Powered by Gemini AI
                </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                <div className="w-full">
                    {messages.map((msg, idx) => (
                        <ChatMessage key={idx} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-shrink-0 bg-gradient-to-t from-black via-black to-transparent pt-6 pb-8 px-4 md:px-8 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <ChatInterface
                        onSearch={handleSearch}
                        isSearching={isSearching}
                        hasSearched={hasSearched}
                    />
                </div>
            </div>
        </div>
    );
}

export default ChatPage;

