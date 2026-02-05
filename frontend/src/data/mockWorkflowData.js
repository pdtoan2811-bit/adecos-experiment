/**
 * Mock Workflow Data Generator
 * 
 * Generates sample workflow responses for development and testing.
 */

// Sample workflow response with all section types
export const generateMockWorkflow = (query = "Optimize ad campaigns") => {
    const workflows = [
        generateCampaignOptimizationWorkflow(),
        generateBudgetAnalysisWorkflow(),
        generatePerformanceReviewWorkflow(),
    ];

    // Check for Deep Dive / Specific Campaign Analysis triggers FIRST
    // We prioritize these to ensure we generate a specific workflow even if the campaign name matches a general keyword like 'analysis'
    const isDeepDive = ['deep dive', 'analysis for', 'phân tích cho', 'chi tiết'].some(k => query.toLowerCase().includes(k));

    // Dynamic matching for Deep Dive or specific campaign queries
    if (isDeepDive || query.includes('Summer Sale') || query.includes('New User')) {
        // Extract campaign name mock (naive implementation for demo)
        let campaignName = "Summer Sale";
        if (query.toLowerCase().includes('brand')) campaignName = "Brand Awareness Q1";
        if (query.toLowerCase().includes('new user')) campaignName = "New User Acquisition";
        if (query.toLowerCase().includes('retargeting')) campaignName = "Retargeting High Intent";
        if (query.toLowerCase().includes('flash')) campaignName = "Flash Sale 2.2";

        // Return dynamic optimization workflow with specific title
        return generateCampaignOptimizationWorkflow(campaignName);
    }

    if (query.includes('brand_awareness')) return workflows[1];

    // General queries -> Return campaign selection list
    const generalKeywords = ['optimize', 'tối ưu', 'analysis', 'phân tích', 'list', 'danh sách'];
    const isGeneralQuery = generalKeywords.some(k => query.toLowerCase().includes(k));

    if (isGeneralQuery) {
        return {
            type: 'campaign_selection',
            content: {
                title: 'Active Campaigns Analysis',
                campaigns: generateCampaignList()
            }
        };
    }

    // Fallback for specific mocked keywords
    if (query.toLowerCase().includes('budget') || query.toLowerCase().includes('ngân sách')) {
        return workflows[1];
    }
    if (query.toLowerCase().includes('performance') || query.toLowerCase().includes('hiệu suất')) {
        return workflows[2];
    }
    return workflows[0];
};

// Generate list of campaigns for selection table
const generateCampaignList = () => [
    {
        id: 'cmp_101',
        name: 'Summer Sale 2025',
        status: 'running',
        cpc: 2500,
        cost_30d: 45000000,
        roas_30d: 4.2,
        affiliate_program: 'Shopee'
    },
    {
        id: 'cmp_102',
        name: 'Brand Awareness Q1',
        status: 'running',
        cpc: 1200,
        cost_30d: 15000000,
        roas_30d: 1.8,
        affiliate_program: 'Lazada'
    },
    {
        id: 'cmp_103',
        name: 'Retargeting High Intent',
        status: 'running',
        cpc: 5500,
        cost_30d: 28000000,
        roas_30d: 6.5,
        affiliate_program: 'Tiki'
    },
    {
        id: 'cmp_104',
        name: 'New User Acquisition',
        status: 'paused',
        cpc: 8900,
        cost_30d: 12000000,
        roas_30d: 0.9,
        affiliate_program: 'Shopee'
    },
    {
        id: 'cmp_105',
        name: 'Flash Sale 2.2',
        status: 'running',
        cpc: 3100,
        cost_30d: 8500000,
        roas_30d: 3.2,
        affiliate_program: 'TikTok Shop'
    }
];

// Campaign Optimization Workflow
const generateCampaignOptimizationWorkflow = (campaignName = 'Campaign Optimization Workflow') => ({
    type: 'workflow',
    content: {
        workflowId: `wf-${Date.now()}`,
        title: campaignName.includes('Optimization') ? campaignName : `Optimizing: ${campaignName}`,
        sections: [
            {
                type: 'narrative',
                content: `## Phân tích tối ưu hóa chiến dịch: ${campaignName}

Tôi đã phân tích dữ liệu chiến dịch quảng cáo của bạn trong 30 ngày qua. Dưới đây là những điểm nổi bật và các đề xuất cải thiện cụ thể.`
            },
            {
                type: 'comparison',
                content: {
                    items: [
                        { label: 'CPC Hiện tại', value: '2,500 ₫', change: -12, highlight: true },
                        { label: 'CPC Tháng trước', value: '2,840 ₫' },
                        { label: 'CTR Hiện tại', value: '3.2%', change: 8, highlight: true },
                        { label: 'CTR Tháng trước', value: '2.96%' },
                    ]
                }
            },
            {
                type: 'chart',
                content: {
                    chartType: 'line',
                    title: 'Chi phí vs Doanh thu - 14 ngày gần nhất',
                    data: generateTimeSeriesData(14),
                    config: {
                        xAxis: 'date',
                        series: [
                            { dataKey: 'cost', name: 'Chi phí', color: '#ef4444' },
                            { dataKey: 'revenue', name: 'Doanh thu', color: '#22c55e' }
                        ]
                    }
                }
            },
            {
                type: 'insight',
                content: {
                    text: `Chiến dịch "${campaignName}" đang có hiệu suất vượt trội với ROAS 5.2x. Đề xuất tăng ngân sách cho chiến dịch này trong 7 ngày tới.`
                }
            }
        ],
        todoItems: [
            {
                id: 1,
                text: `Tăng ngân sách chiến dịch "${campaignName}" thêm 20%`,
                priority: 'high',
                completed: false,
                comments: [],
                smart: {
                    specific: `Tăng ngân sách từ 10M lên 12M cho chiến dịch ${campaignName}`,
                    measurable: 'ROAS duy trì >= 5.0x, CPA <= 40,000đ',
                    achievable: 'Ngân sách sẵn có, không vượt quá limit',
                    relevant: 'Chiến dịch đang outperform, cần scale',
                    timeBound: 'Thực hiện ngay, review sau 3 ngày',
                    tradeoffs: [{ option1: 'Chi phí tăng', option2: 'Doanh thu tăng', balance: 70 }]
                }
            },
            {
                id: 2,
                text: 'Tạm dừng 3 ad sets có CPA > 50,000 ₫',
                priority: 'high',
                completed: false,
                comments: [],
                smart: {
                    specific: 'Pause ad sets: AS_001, AS_007, AS_012',
                    measurable: 'Giảm overall CPA xuống < 35,000đ',
                    achievable: 'Có thể pause ngay trên Ads Manager',
                    relevant: 'Đang burn budget với ROI âm',
                    timeBound: 'Thực hiện trong hôm nay',
                    tradeoffs: [{ option1: 'Mất reach', option2: 'Tiết kiệm chi phí', balance: 30 }]
                }
            },
            {
                id: 3,
                text: 'A/B test tiêu đề mới cho chiến dịch có CTR thấp',
                priority: 'medium',
                completed: false,
                comments: [],
                smart: {
                    specific: 'Test 3 tiêu đề mới với hook khác nhau',
                    measurable: 'Tăng CTR từ 1.2% lên 2.5%',
                    achievable: 'Copy team có capacity, template sẵn',
                    relevant: 'CTR thấp ảnh hưởng quality score',
                    timeBound: 'Setup trong 2 ngày, test 5 ngày',
                    tradeoffs: []
                }
            },
            {
                id: 4,
                text: 'Đánh giá lại target audience sau 7 ngày',
                priority: 'low',
                completed: false,
                comments: [],
                smart: {
                    specific: '',
                    measurable: '',
                    achievable: '',
                    relevant: '',
                    timeBound: 'Review vào ngày 15/02',
                    tradeoffs: []
                }
            }
        ]
    },
    context: {
        followupSuggestions: [
            `Phân tích chi tiết chiến dịch ${campaignName}`,
            'So sánh với đối thủ cạnh tranh',
            'Dự báo ngân sách tháng tới'
        ]
    }
});

// Budget Analysis Workflow
const generateBudgetAnalysisWorkflow = () => ({
    type: 'workflow',
    content: {
        workflowId: `wf-${Date.now()}`,
        title: 'Budget Allocation Analysis',
        sections: [
            {
                type: 'narrative',
                content: `## Phân tích phân bổ ngân sách

Dựa trên dữ liệu hiệu suất hiện tại, tôi đề xuất điều chỉnh phân bổ ngân sách để tối ưu hóa ROI tổng thể.`
            },
            {
                type: 'table',
                content: [
                    { campaign: 'Brand Awareness', current: '15,000,000 ₫', suggested: '10,000,000 ₫', change: '-33%' },
                    { campaign: 'Retargeting', current: '10,000,000 ₫', suggested: '18,000,000 ₫', change: '+80%' },
                    { campaign: 'Conversion', current: '20,000,000 ₫', suggested: '22,000,000 ₫', change: '+10%' },
                ]
            },
            {
                type: 'insight',
                content: 'Retargeting đang under-invested với ROAS 6.8x nhưng chỉ chiếm 22% ngân sách.'
            }
        ],
        todoItems: [
            {
                id: 1,
                text: 'Giảm ngân sách Brand Awareness xuống 10M',
                priority: 'high',
                completed: false,
                comments: []
            },
            {
                id: 2,
                text: 'Tăng ngân sách Retargeting lên 18M',
                priority: 'high',
                completed: false,
                comments: []
            },
            {
                id: 3,
                text: 'Theo dõi KPIs trong 7 ngày sau điều chỉnh',
                priority: 'medium',
                completed: false,
                comments: []
            }
        ]
    }
});

// Performance Review Workflow
const generatePerformanceReviewWorkflow = () => ({
    type: 'workflow',
    content: {
        workflowId: `wf-${Date.now()}`,
        title: 'Weekly Performance Review',
        sections: [
            {
                type: 'narrative',
                content: `## Báo cáo hiệu suất tuần

Tổng hợp hiệu suất quảng cáo tuần qua so với mục tiêu đặt ra.`
            },
            {
                type: 'comparison',
                content: {
                    items: [
                        { label: 'Mục tiêu ROAS', value: '3.5x' },
                        { label: 'ROAS thực tế', value: '4.2x', highlight: true, change: 20 },
                        { label: 'Mục tiêu CPA', value: '35,000 ₫' },
                        { label: 'CPA thực tế', value: '28,000 ₫', highlight: true, change: -20 },
                    ]
                }
            },
            {
                type: 'chart',
                content: {
                    chartType: 'bar',
                    title: 'Hiệu suất theo ngày',
                    data: generateTimeSeriesData(7),
                    config: {
                        xAxis: 'date',
                        series: [
                            { dataKey: 'conversions', name: 'Chuyển đổi', color: '#8b5cf6' },
                            { dataKey: 'clicks', name: 'Clicks', color: '#06b6d4' }
                        ]
                    }
                }
            }
        ],
        todoItems: [
            {
                id: 1,
                text: 'Scale chiến dịch đạt target ROAS',
                priority: 'high',
                completed: false,
                comments: []
            },
            {
                id: 2,
                text: 'Phân tích creative nào hoạt động tốt nhất',
                priority: 'medium',
                completed: false,
                comments: []
            }
        ]
    }
});

// Helper: Generate time series data
const generateTimeSeriesData = (days) => {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            cost: Math.floor(1000000 + Math.random() * 2000000),
            revenue: Math.floor(4000000 + Math.random() * 4000000),
            clicks: Math.floor(500 + Math.random() * 1500),
            conversions: Math.floor(20 + Math.random() * 80),
        });
    }

    return data;
};

// Sample experiments for the experiments page
export const getMockExperiments = () => {
    // Return default experiments
    return [
        {
            id: 'exp-demo-1',
            title: 'Q1 Campaign Optimization',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'running',
            result: 'pending',
            targetAccuracy: {
                current: 4.2,
                target: 4.0,
                unit: 'ROAS',
                status: 'over' // 'over' means performing better than target generally, or just strictly above
            },
            timeProgress: {
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'normal'
            },
            todoItems: [
                { id: 1, text: 'Increase budget for top performers', priority: 'high', completed: true },
                { id: 2, text: 'Pause underperforming ads', priority: 'high', completed: true },
                { id: 3, text: 'Review metrics after 7 days', priority: 'medium', completed: false },
            ],
            progress: 66,
            metrics: {
                roas: 4.2,
                cpc: 2500,
                conversions: 145
            }
        },
        {
            id: 'exp-demo-2',
            title: 'Budget Reallocation Test',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'paused',
            result: 'pending',
            targetAccuracy: {
                current: 38000,
                target: 35000,
                unit: 'CPA',
                status: 'under' // Performing worse (higher CPA)
            },
            timeProgress: {
                startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'normal'
            },
            todoItems: [
                { id: 1, text: 'Shift 30% budget to retargeting', priority: 'high', completed: true },
                { id: 2, text: 'Monitor CPA changes', priority: 'medium', completed: false },
            ],
            progress: 50,
            metrics: {
                roas: 3.8,
                cpc: 2200,
                conversions: 89
            }
        },
        {
            id: 'exp-demo-3',
            title: 'Creative A/B Testing',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            result: 'success',
            targetAccuracy: {
                current: 3.5,
                target: 2.0,
                unit: 'CTR %',
                status: 'over'
            },
            timeProgress: {
                startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'finished'
            },
            todoItems: [
                { id: 1, text: 'Test 3 new video hooks', priority: 'high', completed: true },
                { id: 2, text: 'Analyze retention rates', priority: 'high', completed: true },
            ],
            progress: 100,
            metrics: {
                roas: 3.1,
                cpc: 1800,
                conversions: 210
            }
        }
    ];
};

// Workflow trigger keywords
export const WORKFLOW_TRIGGERS = [
    'tối ưu',
    'optimize',
    'workflow',
    'action',
    'todo',
    'to-do',
    'đề xuất',
    'suggest',
    'plan',
    'kế hoạch',
    'chiến lược',
    'strategy',
    'deep dive',
    'analysis',
    'phân tích',
    'list',
    'danh sách',
    'campaign',
    'chiến dịch'
];

// Check if query should trigger workflow
export const shouldTriggerWorkflow = (query) => {
    const lowerQuery = query.toLowerCase();
    return WORKFLOW_TRIGGERS.some(trigger => lowerQuery.includes(trigger));
};
