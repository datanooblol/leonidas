import { render, screen, waitFor } from '@testing-library/react'
import HealthPage from '../app/(public)/health/page'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'healthy' }),
  })
) as jest.Mock

test('renders health check page after loading', async () => {
  render(<HealthPage />)
  await waitFor(() => {
    expect(screen.getByText('Health Check')).toBeInTheDocument()
  })
})

test('displays loading initially', () => {
  render(<HealthPage />)
  expect(screen.getByText('Loading....')).toBeInTheDocument()
})