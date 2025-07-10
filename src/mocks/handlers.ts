import { http, HttpResponse } from 'msw'
import { BodyData } from '@/types'

// Mock data that matches the current GAS app structure
const mockBodyData: BodyData[] = [
  {
    id: 1,
    date: '2024-01-15',
    weight: 70.5,
    bmi: 22.1,
    body_fat: 15.2,
    muscle_mass: 55.8,
    visceral_fat: 8,
    calories: 2200,
    created_at: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    date: '2024-01-14',
    weight: 70.8,
    bmi: 22.2,
    body_fat: 15.5,
    muscle_mass: 55.5,
    visceral_fat: 8,
    calories: 2150,
    created_at: '2024-01-14T09:00:00Z'
  },
  {
    id: 3,
    date: '2024-01-13',
    weight: 71.0,
    bmi: 22.3,
    body_fat: 15.8,
    muscle_mass: 55.2,
    visceral_fat: 9,
    calories: 2180,
    created_at: '2024-01-13T09:00:00Z'
  }
]

export const handlers = [
  // Get all body data
  http.get('/api/body-data', () => {
    return HttpResponse.json({
      success: true,
      data: mockBodyData
    })
  }),

  // Save new body data
  http.post('/api/body-data', async ({ request }) => {
    const newData = await request.json() as BodyData
    
    const bodyData = {
      id: mockBodyData.length + 1,
      created_at: new Date().toISOString(),
      ...newData
    }
    
    mockBodyData.unshift(bodyData)
    
    return HttpResponse.json({
      success: true,
      data: bodyData
    })
  }),

  // Get app info (mock version of GAS getAppInfo)
  http.get('/api/app-info', () => {
    return HttpResponse.json({
      success: true,
      data: {
        version: '2.0.0',
        buildNumber: '42',
        lastUpdated: new Date().toISOString()
      }
    })
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  })
]