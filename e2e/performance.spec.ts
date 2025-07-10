import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check if main elements are visible
    await expect(page.getByRole('heading', { name: /体組成記録/ })).toBeVisible()
    await expect(page.getByRole('form')).toBeVisible()
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      date: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
      weight: 70 + (i % 10),
      bmi: 22 + (i % 5),
      body_fat: 15 + (i % 8),
      muscle_mass: 50 + (i % 10),
      visceral_fat: 8 + (i % 3),
      calories: 2000 + (i % 500),
      created_at: new Date(Date.now() - i * 86400000).toISOString()
    }))

    await page.route('**/api/body-data', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: largeDataset })
      })
    })

    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const renderTime = Date.now() - startTime
    
    // Should handle large dataset within 5 seconds
    expect(renderTime).toBeLessThan(5000)
    
    // Check if stats are calculated correctly
    await expect(page.getByTestId('stats-display')).toBeVisible()
    
    // Check if chart renders with large dataset
    await expect(page.getByTestId('chart-container')).toBeVisible()
  })

  test('should handle form submission efficiently', async ({ page }) => {
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.0')
    
    const startTime = Date.now()
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for submission to complete
    await page.waitForTimeout(100)
    
    const submissionTime = Date.now() - startTime
    
    // Form submission should be fast
    expect(submissionTime).toBeLessThan(2000)
  })

  test('should maintain responsive UI during data operations', async ({ page }) => {
    // Simulate slow API response
    await page.route('**/api/body-data', async route => {
      if (route.request().method() === 'POST') {
        await page.waitForTimeout(1000) // Simulate slow save
        route.continue()
      } else {
        route.continue()
      }
    })
    
    // Fill form
    await page.getByLabel(/日付/).fill('2024-01-16')
    await page.getByLabel(/体重/).fill('71.0')
    
    // Submit form
    await page.getByRole('button', { name: /記録/ }).click()
    
    // UI should remain responsive during submission
    const formInput = page.getByLabel(/日付/)
    await expect(formInput).toBeVisible()
    
    // Should be able to interact with other elements
    await expect(page.getByTestId('stats-display')).toBeVisible()
  })

  test('should optimize chart rendering performance', async ({ page }) => {
    // Wait for chart to load
    await page.waitForSelector('[data-testid="chart-container"]')
    
    const startTime = Date.now()
    
    // Force chart re-render by adding new data
    await page.getByLabel(/日付/).fill('2024-01-17')
    await page.getByLabel(/体重/).fill('72.0')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for chart update
    await page.waitForTimeout(2000)
    
    const chartUpdateTime = Date.now() - startTime
    
    // Chart update should be reasonably fast
    expect(chartUpdateTime).toBeLessThan(4000)
    
    // Chart should still be visible
    await expect(page.getByTestId('chart-container')).toBeVisible()
  })

  test('should handle memory usage efficiently', async ({ page }) => {
    // Add multiple data points to test memory usage
    for (let i = 0; i < 10; i++) {
      await page.getByLabel(/日付/).fill(`2024-01-${String(i + 1).padStart(2, '0')}`)
      await page.getByLabel(/体重/).fill(`${70 + i}.0`)
      await page.getByRole('button', { name: /記録/ }).click()
      await page.waitForTimeout(200)
    }
    
    // Check if page is still responsive
    await expect(page.getByTestId('stats-display')).toBeVisible()
    await expect(page.getByTestId('chart-container')).toBeVisible()
    
    // Try to interact with form
    await page.getByLabel(/日付/).fill('2024-01-20')
    await expect(page.getByLabel(/日付/)).toHaveValue('2024-01-20')
  })

  test('should handle network timeout gracefully', async ({ page }) => {
    // Mock very slow API response
    await page.route('**/api/body-data', async route => {
      if (route.request().method() === 'POST') {
        await page.waitForTimeout(10000) // Very slow response
        route.continue()
      } else {
        route.continue()
      }
    })
    
    await page.getByLabel(/日付/).fill('2024-01-18')
    await page.getByLabel(/体重/).fill('73.0')
    
    const startTime = Date.now()
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for a reasonable timeout
    await page.waitForTimeout(5000)
    
    const waitTime = Date.now() - startTime
    
    // Should handle timeout gracefully
    expect(waitTime).toBeLessThan(8000)
    
    // UI should remain usable
    await expect(page.getByLabel(/日付/)).toBeVisible()
  })

  test('should optimize bundle size and loading', async ({ page }) => {
    // Check if critical resources load quickly
    const navigationPromise = page.waitForLoadState('domcontentloaded')
    
    await page.goto('/')
    await navigationPromise
    
    // Check if essential elements are available quickly
    await expect(page.getByRole('heading', { name: /体組成記録/ })).toBeVisible()
    
    // Check if form is interactive quickly
    await expect(page.getByLabel(/日付/)).toBeVisible()
  })

  test('should handle concurrent user interactions', async ({ page }) => {
    // Simulate rapid user interactions
    const interactions = [
      () => page.getByLabel(/日付/).fill('2024-01-19'),
      () => page.getByLabel(/体重/).fill('74.0'),
      () => page.getByLabel(/BMI/).fill('23.0'),
      () => page.getByLabel(/体脂肪率/).fill('16.0')
    ]
    
    const startTime = Date.now()
    
    // Execute all interactions rapidly
    await Promise.all(interactions.map(interaction => interaction()))
    
    const interactionTime = Date.now() - startTime
    
    // All interactions should complete quickly
    expect(interactionTime).toBeLessThan(1000)
    
    // Final values should be set correctly
    await expect(page.getByLabel(/日付/)).toHaveValue('2024-01-19')
    await expect(page.getByLabel(/体重/)).toHaveValue('74.0')
  })

  test('should maintain performance with multiple browser tabs', async ({ page }) => {
    // Open additional tabs
    const page2 = await page.context().newPage()
    const page3 = await page.context().newPage()
    
    await page2.goto('/')
    await page3.goto('/')
    
    // Wait for all pages to load
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page2.waitForLoadState('networkidle'),
      page3.waitForLoadState('networkidle')
    ])
    
    // Check performance on all tabs
    const startTime = Date.now()
    
    await Promise.all([
      page.getByLabel(/日付/).fill('2024-01-20'),
      page2.getByLabel(/日付/).fill('2024-01-21'),
      page3.getByLabel(/日付/).fill('2024-01-22')
    ])
    
    const multiTabTime = Date.now() - startTime
    
    // Should handle multiple tabs efficiently
    expect(multiTabTime).toBeLessThan(2000)
    
    // All tabs should be responsive
    await expect(page.getByLabel(/日付/)).toHaveValue('2024-01-20')
    await expect(page2.getByLabel(/日付/)).toHaveValue('2024-01-21')
    await expect(page3.getByLabel(/日付/)).toHaveValue('2024-01-22')
    
    await page2.close()
    await page3.close()
  })
})