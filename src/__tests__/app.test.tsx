import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '@/App'

describe('BREACH application', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the entry wordmark and primary action', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getAllByText(/BREACH/i).length).toBeGreaterThan(0)
    })
    await waitFor(() => {
      expect(screen.getAllByText(/INITIALIZE BREACH/i).length).toBeGreaterThan(0)
    })
  })

  it('has the primary CTA as a button', async () => {
    render(<App />)
    const btns = await screen.findAllByRole('button', { name: /INITIALIZE BREACH/i })
    expect(btns.length).toBeGreaterThan(0)
  })
})