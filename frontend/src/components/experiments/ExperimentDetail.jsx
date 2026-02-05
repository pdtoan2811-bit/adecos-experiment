import React, { useState } from 'react';
import TodoList from '../workflow/TodoList';
import { useChatContext } from '../../context/ChatContext';

/**
 * ExperimentDetail - Detailed experiment view
 * 
 * Features:
 * - Full experiment context
 * - To-do items with status
 * - Embedded contextual AI chat
 * - Timeline of actions
 */
const ExperimentDetail = ({ experiment, onUpdate, onClose }) => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [chatInput, setChatInput] = useState('');
    const [experimentChat, setExperimentChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const {
        id,
        title,
        createdAt,
        status,
        todoItems = [],
        context = {},
        sections = []
    } = experiment;

    const handleUpdateTodos = (items) => {
        onUpdate(id, { todoItems: items });
    };

    const handleStatusChange = (newStatus) => {
        onUpdate(id, { status: newStatus });
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = { role: 'user', content: chatInput };
        setExperimentChat(prev => [...prev, userMessage]);
        setChatInput('');
        setIsLoading(true);

        // Simulate AI response (in real app, this would call API with experiment context)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const aiResponse = {
            role: 'assistant',
            content: generateContextualResponse(chatInput, experiment)
        };
        setExperimentChat(prev => [...prev, aiResponse]);
        setIsLoading(false);
    };

    const statusConfig = {
        running: { color: 'text-green-400', bg: 'bg-green-500/20', text: 'Đang chạy' },
        paused: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', text: 'Tạm dừng' },
        completed: { color: 'text-blue-400', bg: 'bg-blue-500/20', text: 'Hoàn thành' }
    };

    const config = statusConfig[status] || statusConfig.running;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-serif text-white">{title}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${config.bg} ${config.color}`}>
                                    {config.text}
                                </span>
                                <span className="text-xs text-luxury-gray">
                                    Created {new Date(createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-2">
                        {status !== 'completed' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange(status === 'paused' ? 'running' : 'paused')}
                                    className="px-4 py-2 text-sm border border-white/20 text-white/80 rounded-lg
                                               hover:bg-white/10 transition-colors"
                                >
                                    {status === 'paused' ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    className="px-4 py-2 text-sm bg-green-500/20 text-green-400 border border-green-500/30
                                               rounded-lg hover:bg-green-500/30 transition-colors"
                                >
                                    Mark Complete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-4">
                    {['tasks', 'chat', 'timeline'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm pb-2 border-b-2 transition-colors capitalize
                                       ${activeTab === tab
                                    ? 'text-white border-white'
                                    : 'text-luxury-gray border-transparent hover:text-white/80'}`}
                        >
                            {tab === 'tasks' ? 'Action Items' : tab === 'chat' ? 'AI Context Chat' : 'Timeline'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'tasks' && (
                    <div className="max-w-3xl mx-auto">
                        <TodoList
                            items={todoItems}
                            onUpdateItems={handleUpdateTodos}
                            onReviseAll={() => { }}
                            title="Experiment Tasks"
                        />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="max-w-3xl mx-auto flex flex-col h-full">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <div className="text-sm text-blue-400 font-medium">Contextual Chat</div>
                                    <div className="text-xs text-white/70 mt-1">
                                        This chat is specific to this experiment. AI will remember the context and provide relevant insights.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 space-y-4 mb-4 min-h-[300px]">
                            {experimentChat.length === 0 && (
                                <div className="text-center text-luxury-gray py-12">
                                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm">Ask AI about this experiment</p>
                                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        {['Tiến độ hiện tại?', 'Đề xuất cải thiện?', 'Báo cáo tổng hợp'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setChatInput(s)}
                                                className="px-3 py-1.5 text-xs border border-white/10 rounded-full
                                                           hover:bg-white/10 transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {experimentChat.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-white text-black rounded-tr-sm'
                                            : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
                                        <div className="flex items-center gap-2 text-luxury-gray">
                                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                                            Đang phân tích...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about this experiment..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                                           placeholder-white/30 focus:outline-none focus:border-white/30"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isLoading}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors
                                           disabled:opacity-30"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="space-y-4">
                            {/* Mock timeline */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="w-0.5 flex-1 bg-white/10"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="text-sm text-white font-medium">Experiment Created</div>
                                    <div className="text-xs text-luxury-gray mt-1">
                                        {new Date(createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            {todoItems.filter(t => t.completed).map((item, idx) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <div className="w-0.5 flex-1 bg-white/10"></div>
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="text-sm text-white">Completed: {item.text}</div>
                                        <div className="text-xs text-luxury-gray mt-1">Task completed</div>
                                    </div>
                                </div>
                            ))}

                            {status === 'completed' && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm text-green-400 font-medium">Experiment Completed</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Mock contextual AI response
const generateContextualResponse = (query, experiment) => {
    const completedTasks = experiment.todoItems?.filter(t => t.completed).length || 0;
    const totalTasks = experiment.todoItems?.length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (query.includes('tiến độ') || query.includes('progress')) {
        return `Experiment "${experiment.title}" hiện đang có tiến độ ${progress}%. Đã hoàn thành ${completedTasks}/${totalTasks} tasks. ${completedTasks === totalTasks
                ? 'Tất cả các tasks đã được hoàn thành!'
                : `Còn ${totalTasks - completedTasks} tasks cần thực hiện.`
            }`;
    }

    if (query.includes('đề xuất') || query.includes('cải thiện') || query.includes('suggest')) {
        return `Dựa trên phân tích experiment này, tôi đề xuất:\n\n1. Tập trung hoàn thành các tasks có priority cao trước\n2. Theo dõi metrics sau mỗi task hoàn thành\n3. Đánh giá lại sau khi đạt 80% tiến độ`;
    }

    if (query.includes('báo cáo') || query.includes('report')) {
        return `📊 **Báo cáo Experiment: ${experiment.title}**\n\n- Tiến độ: ${progress}%\n- Tasks hoàn thành: ${completedTasks}/${totalTasks}\n- Trạng thái: ${experiment.status}\n- Bắt đầu: ${new Date(experiment.createdAt).toLocaleDateString('vi-VN')}`;
    }

    return `Tôi đang theo dõi experiment "${experiment.title}". Tiến độ hiện tại: ${progress}%. Bạn có thể hỏi tôi về tiến độ, đề xuất cải thiện, hoặc yêu cầu báo cáo tổng hợp.`;
};

export default ExperimentDetail;
