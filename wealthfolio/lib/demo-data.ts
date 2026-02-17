export const DEMO_ASSETS = [
    { id: 'demo-1', user_id: 'demo', asset_type: 'Stock', ticker_or_code: 'AAPL', quantity: 15, avg_price_inr: 14500, market_value_inr: 0, loan_amount_inr: 0, name: 'Apple Inc.' },
    { id: 'demo-2', user_id: 'demo', asset_type: 'MF', ticker_or_code: 'SBI-BLUECHIP', quantity: 5000, avg_price_inr: 120, market_value_inr: 0, loan_amount_inr: 0, name: 'SBI Bluechip Fund' },
    { id: 'demo-3', user_id: 'demo', asset_type: 'Real Estate', ticker_or_code: 'APT-101', quantity: 1, avg_price_inr: 8500000, market_value_inr: 12000000, loan_amount_inr: 4500000, name: 'Luxury Apartment' },
]

export const DEMO_EXPENSES = [
    { id: 'demo-exp-1', user_id: 'demo', category: 'Rent', amount_inr: 25000, is_recurring: true, next_post_date: '2026-03-01', date: '2026-02-01' },
    { id: 'demo-exp-2', user_id: 'demo', category: 'Groceries', amount_inr: 5000, is_recurring: false, next_post_date: null, date: '2026-02-14' },
    { id: 'demo-exp-3', user_id: 'demo', category: 'Netflix', amount_inr: 699, is_recurring: true, next_post_date: '2026-03-10', date: '2026-02-10' },
]
