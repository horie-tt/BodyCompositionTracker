import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Polyfill for global Response and Request
import { Response, Request } from 'whatwg-fetch'
global.Response = Response
global.Request = Request

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}))

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mock Line Chart
    </div>
  ),
}))

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Setup MSW (conditional import to avoid issues)
// Only set up MSW if not using Supabase
const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                   process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

let server
if (!useSupabase) {
  try {
    const mswModule = require('./src/mocks/server')
    server = mswModule.server
    
    beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())
  } catch (error) {
    console.warn('MSW server setup skipped:', error.message)
  }
} else {
  console.log('MSW setup skipped - using Supabase')
}