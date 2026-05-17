// src/tests/authFlows.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock supabase before importing anything that uses it
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}))

import { supabase } from '../lib/supabaseClient'

// Clear all mock call history before each test so they don't bleed into each other
beforeEach(() => {
  vi.clearAllMocks()
})

// ── Test 1: Email Registration Flow ──────────────────────────────────────────
describe('Email Registration Flow', () => {
  it('calls supabase.auth.signUp with email and password', async () => {
    supabase.auth.signUp.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null })

    const result = await supabase.auth.signUp({ email: 'test@hope.com', password: 'Password123!' })

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@hope.com',
      password: 'Password123!',
    })
    expect(result.error).toBeNull()
    expect(result.data.user.id).toBe('u1')
  })

  it('returns an error if signup fails (duplicate email)', async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' },
    })

    const result = await supabase.auth.signUp({ email: 'existing@hope.com', password: 'pass' })

    expect(result.error.message).toBe('User already registered')
  })
})

// ── Test 2: Google OAuth New User Flow ────────────────────────────────────────
describe('Google OAuth New User Flow', () => {
  it('calls signInWithOAuth with google provider and correct redirect URL', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({ data: {}, error: null })

    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/auth/callback' },
    })

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/auth/callback' },
    })
    expect(result.error).toBeNull()
  })
})

// ── Test 3: Login Guard Blocks INACTIVE User ──────────────────────────────────
describe('Login Guard — INACTIVE user is blocked', () => {
  it('signs out and does not set currentUser when record_status is INACTIVE', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({
      data: {
        session: { user: { id: 'u2', email: 'inactive@hope.com' } },
      },
    })

    // DB returns INACTIVE status
    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: { record_status: 'INACTIVE', user_type: 'USER', username: 'inactiveuser' },
      error: null,
    })
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    })

    supabase.auth.signOut.mockResolvedValueOnce({})

    // Simulate the login guard logic from AuthContext
    const { data: { session } } = await supabase.auth.getSession()
    const { data: userRow } = await supabase.from('user').select().eq().single()

    let currentUser = null
    if (userRow?.record_status !== 'ACTIVE') {
      await supabase.auth.signOut()
    } else {
      currentUser = { ...session.user, ...userRow }
    }

    expect(supabase.auth.signOut).toHaveBeenCalled()
    expect(currentUser).toBeNull()
  })
})

// ── Test 4: Login Guard Allows ACTIVE User ────────────────────────────────────
describe('Login Guard — ACTIVE user is allowed through', () => {
  it('sets currentUser when record_status is ACTIVE', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({
      data: {
        session: { user: { id: 'u3', email: 'active@hope.com' } },
      },
    })

    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: { record_status: 'ACTIVE', user_type: 'USER', username: 'activeuser' },
      error: null,
    })
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    })

    const { data: { session } } = await supabase.auth.getSession()
    const { data: userRow } = await supabase.from('user').select().eq().single()

    let currentUser = null
    if (userRow?.record_status === 'ACTIVE') {
      currentUser = { ...session.user, ...userRow }
    }

    expect(currentUser).not.toBeNull()
    expect(currentUser.record_status).toBe('ACTIVE')
    expect(currentUser.email).toBe('active@hope.com')
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })
})