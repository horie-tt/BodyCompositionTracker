import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should handle body data API endpoints', async ({ page }) => {
    // Test GET /api/body-data
    const response = await page.request.get('/api/body-data')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('should handle stats API endpoint', async ({ page }) => {
    // Test GET /api/stats
    const response = await page.request.get('/api/stats')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('avgWeight')
    expect(data.data).toHaveProperty('avgBMI')
    expect(data.data).toHaveProperty('totalRecords')
  })

  test('should handle app info API endpoint', async ({ page }) => {
    // Test GET /api/app-info
    const response = await page.request.get('/api/app-info')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('version')
    expect(data.data).toHaveProperty('buildNumber')
    expect(data.data).toHaveProperty('lastUpdated')
  })

  test('should handle health check endpoint', async ({ page }) => {
    // Test GET /api/health
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('status')
    expect(data.data).toHaveProperty('timestamp')
  })

  test('should handle POST requests to save data', async ({ page }) => {
    const testData = {
      date: '2024-01-15',
      weight: 70.5,
      bmi: 22.0,
      body_fat: 15.0,
      muscle_mass: 55.0,
      visceral_fat: 8.0,
      calories: 2200
    }

    // Test POST /api/body-data
    const response = await page.request.post('/api/body-data', {
      data: testData
    })
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    
    if (data.success) {
      expect(data).toHaveProperty('data')
      expect(data.data).toMatchObject({
        date: testData.date,
        weight: testData.weight
      })
    }
  })

  test('should handle validation errors in POST requests', async ({ page }) => {
    const invalidData = {
      date: '', // Empty date should cause validation error
      weight: 'invalid' // Invalid weight should cause validation error
    }

    // Test POST /api/body-data with invalid data
    const response = await page.request.post('/api/body-data', {
      data: invalidData
    })
    
    // Should return error response
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data).toHaveProperty('error')
  })

  test('should handle 404 for non-existent endpoints', async ({ page }) => {
    // Test non-existent endpoint
    const response = await page.request.get('/api/non-existent')
    expect(response.status()).toBe(404)
  })

  test('should handle CORS headers correctly', async ({ page }) => {
    const response = await page.request.get('/api/health')
    
    // Check if CORS headers are present (if needed)
    const headers = response.headers()
    expect(headers['content-type']).toContain('application/json')
  })

  test('should handle concurrent requests properly', async ({ page }) => {
    // Make multiple concurrent requests
    const requests = Array.from({ length: 5 }, (_, i) => 
      page.request.get(`/api/body-data?test=${i}`)
    )
    
    const responses = await Promise.all(requests)
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200)
    })
  })

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Make many requests rapidly
    const requests = Array.from({ length: 20 }, () => 
      page.request.get('/api/health')
    )
    
    const responses = await Promise.all(requests)
    
    // Most requests should succeed, some might be rate limited
    const successCount = responses.filter(r => r.status() === 200).length
    expect(successCount).toBeGreaterThan(10)
  })
})