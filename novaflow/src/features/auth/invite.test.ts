import { describe, it, expect, vi } from 'vitest';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('../../lib/supabaseClient', () => ({
  supabaseAdmin: { auth: { admin: { inviteUserByEmail: vi.fn().mockResolvedValue({ data: {}, error: null }) } } },
  supabase: {},
}));

const { inviteUser } = await import('./invite');
const { supabaseAdmin } = await import('../../lib/supabaseClient');

describe('inviteUser', () => {
  it('calls supabase admin invite', async () => {
    const email = 'test@example.com';
    await inviteUser(email);
    expect(supabaseAdmin.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(email);
  });
});
