export const mockAccounts = [
    {
        id: '9923841102',
        name: 'MDW_Exness_Search_01',
        email: 'tk01@admin-mdw.com',
        source: 'Via',
        sourceAccount: 'Nguyen Van A',
        dateAdded: '2026-01-15',
        digitalStaff: 'Thomas',
        budgetLoaded: 50000000,
        budgetLoadedAPI: 50000000,
        budgetSpent: 42000000,
        budgetRemaining: 8000000,
        status: 'Active',
        notes: 'TK chính chạy search, ổn định',
        proxyId: 'PRX-001',
        paymentId: 'CC-8842',
        platform: 'google'
    },
    {
        id: '1120039485',
        name: 'MDW_Exness_Display_Low',
        email: 'tk02@admin-mdw.com',
        source: 'Clone',
        sourceAccount: 'Tran Thi B',
        dateAdded: '2026-01-16',
        digitalStaff: 'Thomas',
        budgetLoaded: 20000000,
        budgetLoadedAPI: 20000000,
        budgetSpent: 19500000,
        budgetRemaining: 500000,
        status: 'Warning',
        notes: 'Sắp hết ngân sách, cần nạp gấp',
        proxyId: 'PRX-001',
        paymentId: 'CC-8842',
        platform: 'google'
    },
    {
        id: '8829102039',
        name: 'MDW_Binance_Video',
        email: 'tk01@tiktok-agency.com',
        source: 'Agency',
        sourceAccount: 'Agency Partner',
        dateAdded: '2026-01-20',
        digitalStaff: 'Sarah',
        budgetLoaded: 100000000,
        budgetLoadedAPI: 100000000,
        budgetSpent: 98000000,
        budgetRemaining: 2000000,
        status: 'Disabled',
        notes: 'Policy violation: Creative issues',
        proxyId: 'PRX-002',
        paymentId: 'CC-9911',
        platform: 'tiktok'
    },
    {
        id: 'FB_29384811',
        name: 'MDW_Sephora_Social',
        email: 'fb01@social-ads.com',
        source: 'BM50',
        sourceAccount: 'Le Van C',
        dateAdded: '2026-02-01',
        digitalStaff: 'Thomas',
        budgetLoaded: 5000000,
        budgetLoadedAPI: 5000000,
        budgetSpent: 100000,
        budgetRemaining: 4900000,
        status: 'Pending',
        notes: 'Đang warm up, chưa cắn tiền',
        proxyId: 'PRX-003',
        paymentId: 'CC-9911',
        platform: 'meta'
    },
    {
        id: 'FB_99887766',
        name: 'MDW_Fintech_Lead',
        email: 'fb02@social-ads.com',
        source: 'BM2500',
        sourceAccount: 'Doan Van D',
        dateAdded: '2026-01-25',
        digitalStaff: 'Sarah',
        budgetLoaded: 200000000,
        budgetLoadedAPI: 200000000,
        budgetSpent: 156000000,
        budgetRemaining: 44000000,
        status: 'Active',
        notes: 'TK chạy lead, vít ngân sách mạnh',
        proxyId: 'PRX-003',
        paymentId: 'CC-1234',
        platform: 'meta'
    }
];

export const mockProxies = [
    {
        id: 'PRX-001',
        name: 'US Residential #1',
        ip: '192.168.1.101',
        location: 'New York, US',
        status: 'Live',
        provider: 'BrightData'
    },
    {
        id: 'PRX-002',
        name: 'VN 4G Mobile',
        ip: '113.161.0.55',
        location: 'Hanoi, VN',
        status: 'Live',
        provider: 'Proxy6'
    },
    {
        id: 'PRX-003',
        name: 'SG Datacenter',
        ip: '103.20.5.12',
        location: 'Singapore',
        status: 'Dead',
        provider: 'DigitalOcean'
    }
];

export const mockAssets = {
    paymentMethods: [
        { id: 'CC-8842', name: 'Visa **** 8842', type: 'Credit Card', expiry: '12/28', status: 'Active' },
        { id: 'CC-9911', name: 'Mastercard **** 9911', type: 'Credit Card', expiry: '05/27', status: 'Active' },
        { id: 'PP-user1', name: 'PayPal (user1@bk.com)', type: 'PayPal', expiry: '-', status: 'Limited' }
    ],
    creatives: [
        { id: 'CR-001', name: 'Exness Banner Q1', type: 'Image', url: '/assets/banner_q1.jpg' },
        { id: 'CR-002', name: 'Binance Video Intro', type: 'Video', url: '/assets/video_intro.mp4' },
        { id: 'CR-003', name: 'Sephora Collection', type: 'Carousel', url: '/assets/sephora_col.json' }
    ]
};
