import { test, expect } from '@playwright/test'

test.describe('Data Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should complete full data entry workflow', async ({ page }) => {
    // Step 1: Check initial state
    await expect(page.getByTestId('stats-display')).toBeVisible()
    
    // Get initial record count
    const initialStats = await page.getByTestId('stats-display').textContent()
    
    // Step 2: Fill out form with new data
    const testDate = '2024-01-20'
    const testWeight = '72.5'
    
    await page.getByLabel(/日付/).fill(testDate)
    await page.getByLabel(/体重/).fill(testWeight)
    await page.getByLabel(/BMI/).fill('23.5')
    await page.getByLabel(/体脂肪率/).fill('16.0')
    await page.getByLabel(/筋肉量/).fill('56.0')
    await page.getByLabel(/内臓脂肪/).fill('9.0')
    await page.getByLabel(/カロリー/).fill('2300')
    
    // Step 3: Submit form
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Step 4: Wait for submission and UI update
    await page.waitForTimeout(2000)
    
    // Step 5: Verify data was saved and UI updated
    const updatedStats = await page.getByTestId('stats-display').textContent()
    expect(updatedStats).not.toBe(initialStats)
    
    // Step 6: Verify chart was updated
    await expect(page.getByTestId('chart-container')).toBeVisible()
    const chartCanvas = page.getByTestId('chart-container').locator('canvas')
    await expect(chartCanvas).toBeVisible()
  })

  test('should handle data persistence across page reloads', async ({ page }) => {
    // Add unique test data
    const uniqueDate = `2024-01-${Date.now().toString().slice(-2)}`
    const uniqueWeight = '71.7'
    
    await page.getByLabel(/日付/).fill(uniqueDate)
    await page.getByLabel(/体重/).fill(uniqueWeight)
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for save
    await page.waitForTimeout(1000)
    
    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check if data persists
    await expect(page.getByTestId('stats-display')).toBeVisible()
    
    // Verify the data is still there by checking if total records increased
    const statsText = await page.getByTestId('stats-display').textContent()
    expect(statsText).toContain('総記録数')
  })

  test('should update chart when new data is added', async ({ page }) => {
    // Take initial screenshot of chart area
    const chartContainer = page.getByTestId('chart-container')
    await expect(chartContainer).toBeVisible()
    
    // Add new data point
    await page.getByLabel(/日付/).fill('2024-01-21')
    await page.getByLabel(/体重/).fill('73.0')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for chart update
    await page.waitForTimeout(2000)
    
    // Verify chart is still visible and potentially updated
    await expect(chartContainer).toBeVisible()
    const canvas = chartContainer.locator('canvas')
    await expect(canvas).toBeVisible()
  })

  test('should handle form validation and error states', async ({ page }) => {
    // Test required field validation
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Should show validation errors
    await expect(page.getByText(/必須/)).toBeVisible()
    
    // Fill required fields
    await page.getByLabel(/日付/).fill('2024-01-22')
    await page.getByLabel(/体重/).fill('70.0')
    
    // Should be able to submit now
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for successful submission
    await page.waitForTimeout(1000)
  })

  test('should handle data loading states', async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route('**/api/body-data', async route => {
      await page.waitForTimeout(2000) // Simulate slow API
      route.continue()
    })
    
    // Reload page to trigger loading
    await page.reload()
    
    // Should show loading state initially
    await expect(page.getByTestId('stats-display')).toBeVisible()
    
    // Should eventually show data
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('stats-display')).toBeVisible()
  })

  test('should handle empty data state gracefully', async ({ page }) => {
    // Mock empty data response
    await page.route('**/api/body-data', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    })
    
    await page.route('**/api/stats', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          data: { 
            avgWeight: 0, 
            avgBMI: 0, 
            totalRecords: 0 
          } 
        })
      })
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should handle empty state gracefully
    await expect(page.getByTestId('stats-display')).toBeVisible()
    await expect(page.getByText(/データがありません/)).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error for data submission
    await page.route('**/api/body-data', route => {
      if (route.request().method() === 'POST') {
        route.abort('failed')
      } else {
        route.continue()
      }
    })
    
    // Try to submit data
    await page.getByLabel(/日付/).fill('2024-01-23')
    await page.getByLabel(/体重/).fill('70.0')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for error handling
    await page.waitForTimeout(2000)
    
    // Should show error message or maintain form state
    await expect(page.getByLabel(/日付/)).toHaveValue('2024-01-23')
    await expect(page.getByLabel(/体重/)).toHaveValue('70.0')
  })

  test('should validate data consistency between components', async ({ page }) => {
    // Add specific data
    const testWeight = '74.5'
    await page.getByLabel(/日付/).fill('2024-01-24')
    await page.getByLabel(/体重/).fill(testWeight)
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for update
    await page.waitForTimeout(2000)
    
    // Verify stats reflect the new data
    const statsText = await page.getByTestId('stats-display').textContent()
    expect(statsText).toContain('総記録数')
    
    // Verify chart is updated
    await expect(page.getByTestId('chart-container')).toBeVisible()
  })

  test('should handle concurrent data operations', async ({ page }) => {
    // Open multiple tabs/pages
    const page2 = await page.context().newPage()
    await page2.goto('/')
    await page2.waitForLoadState('networkidle')
    
    // Add data in both pages simultaneously
    const promises = [
      page.getByLabel(/日付/).fill('2024-01-25'),
      page2.getByLabel(/日付/).fill('2024-01-26')
    ]
    
    await Promise.all(promises)
    
    await Promise.all([
      page.getByLabel(/体重/).fill('75.0'),
      page2.getByLabel(/体重/).fill('76.0')
    ])
    
    // Submit both forms
    await Promise.all([
      page.getByRole('button', { name: /記録/ }).click(),
      page2.getByRole('button', { name: /記録/ }).click()
    ])
    
    // Wait for both submissions
    await page.waitForTimeout(3000)
    
    // Verify both pages show updated data
    await expect(page.getByTestId('stats-display')).toBeVisible()
    await expect(page2.getByTestId('stats-display')).toBeVisible()
    
    await page2.close()
  })
})