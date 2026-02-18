import { describe, test, expect, vi, beforeEach } from 'vitest'
import { getWealthDashboardData } from '@/actions/wealth-engine';

// Define mocks first, inside the mock factory or hoisted
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

// Mock dependencies
vi.mock('@/utils/supabase/server', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
    from: mockFrom,
  };
  return {
    createClient: vi.fn().mockResolvedValue(mockSupabase),
  };
});

// Since we mocked 'from' with a hoisted var, we need to ensure it's accessible.
// However, 'vi.mock' is hoisted. So 'mockFrom' might not be defined inside the factory if defined outside.
// The fix: Define the mock implementation *inside* the tests or use 'vi.hoisted'.

// Let's refactor to use standard Vitest mocking pattern
vi.mock('@/utils/supabase/server', () => {
    // Create local mocks inside the factory or use a shared mutable object if needed
    // But better to expose the mocks via import or just rely on 'vi.fn()' behavior

    // Simplest: Mock the whole module and access it via import in the test
    return {
        createClient: vi.fn()
    }
});

// Re-import to access the mock
import { createClient } from '@/utils/supabase/server';

describe('Wealth Engine Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the mock return values for this test suite
    const mockSupabase = {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        },
        from: mockFrom,
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
        single: mockSingle,
    });
  });

  test('calculates Total Net Worth correctly with Stocks and Real Estate', async () => {
    const mockAssets = [
      {
        id: '1',
        user_id: 'test-user-id',
        asset_type: 'Stock',
        ticker_or_code: 'AAPL',
        quantity: 10,
        avg_price_inr: 100,
        market_value_inr: 0,
        loan_amount_inr: 0,
      },
      {
        id: '2',
        user_id: 'test-user-id',
        asset_type: 'Real Estate',
        ticker_or_code: 'RE-1',
        quantity: 1,
        avg_price_inr: 5000000,
        market_value_inr: 6000000,
        loan_amount_inr: 2000000,
      },
    ];

    const mockHistory = null;

    mockFrom.mockImplementation((table: string) => {
        if (table === 'assets') {
             return {
                 select: vi.fn().mockReturnValue({
                     eq: vi.fn().mockResolvedValue({ data: mockAssets, error: null })
                 })
             };
        }
        if (table === 'net_worth_history') {
             return {
                 select: vi.fn().mockReturnValue({
                     eq: vi.fn().mockReturnValue({
                         eq: vi.fn().mockReturnValue({
                             single: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
                         })
                     })
                 }),
                 insert: mockInsert
             };
        }
        return { select: mockSelect };
    });

    const result = await getWealthDashboardData();

    expect(result).not.toBeNull();
    if (!result) return;

    const { summary, assets } = result;

    const stockAsset = assets.find((a: any) => a.asset_type === 'Stock');
    expect(stockAsset.current_price_inr).toBeGreaterThan(0);
    expect(stockAsset.calculated_market_value).toBeGreaterThan(0);

    const reAsset = assets.find((a: any) => a.asset_type === 'Real Estate');
    expect(reAsset.calculated_market_value).toBe(6000000);

    expect(summary.realEstateEquity).toBe(4000000);
    expect(summary.totalNetWorth).toBeGreaterThan(4000000);

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'test-user-id',
        total_net_worth_inr: summary.totalNetWorth
    }));
  });
});
