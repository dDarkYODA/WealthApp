import { describe, test, expect, vi, beforeEach } from 'vitest'
import { checkRecurringExpenses } from '@/actions/expenses';

// Define mocks
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockEq = vi.fn();
const mockLte = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

// Mock the module
vi.mock('@/utils/supabase/server', () => {
    return {
        createClient: vi.fn()
    }
});

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

describe('Expense Engine Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
        update: mockUpdate,
    });
    mockSelect.mockReturnValue({
        eq: mockEq,
    });
    mockEq.mockReturnValue({
        eq: mockEq,
        lte: mockLte,
    });

    mockLte.mockReturnValue({
        then: (cb: any) => cb({ data: [], error: null })
    });

    mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
    });

    mockInsert.mockResolvedValue({ error: null });
  });

  test('detects due recurring expenses and creates transaction + updates date', async () => {
    const overdueExpense = {
        id: 'exp-1',
        user_id: 'test-user-id',
        category: 'Netflix',
        amount_inr: 199,
        is_recurring: true,
        next_post_date: '2026-02-14',
    };

    mockFrom.mockImplementation((table: string) => {
        if (table === 'expenses') {
             return {
                 select: vi.fn().mockReturnValue({
                     eq: vi.fn().mockReturnValue({
                         eq: vi.fn().mockReturnValue({
                             lte: vi.fn().mockResolvedValue({
                                 data: [overdueExpense],
                                 error: null
                             })
                         })
                     })
                 }),
                 insert: mockInsert,
                 update: mockUpdate
             };
        }
        return { select: mockSelect };
    });

    const processedCount = await checkRecurringExpenses();

    expect(processedCount).toBe(1);

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'test-user-id',
        category: 'Netflix',
        amount_inr: 199,
        is_recurring: false
    }));

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        next_post_date: '2026-03-14'
    }));

    expect(revalidatePath).toHaveBeenCalled();
  });

  test('does nothing if no recurring expenses are due', async () => {
    mockFrom.mockImplementation((table: string) => {
        return {
             select: vi.fn().mockReturnValue({
                 eq: vi.fn().mockReturnValue({
                     eq: vi.fn().mockReturnValue({
                         lte: vi.fn().mockResolvedValue({
                             data: [],
                             error: null
                         })
                     })
                 })
             })
        };
    });

    const processedCount = await checkRecurringExpenses();

    expect(processedCount).toBe(0);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
