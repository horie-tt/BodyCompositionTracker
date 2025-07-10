import { test, expect } from '@playwright/test'

test.describe('Body Composition Tracker', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display the main page correctly', async ({ page }) => {
    // Check if the main title is visible
    await expect(page.getByRole('heading', { name: /体組成記録/ })).toBeVisible()
    
    // Check if the form is visible
    await expect(page.getByRole('form')).toBeVisible()
    
    // Check if the stats section is visible
    await expect(page.getByText(/統計情報/)).toBeVisible()
    
    // Check if the chart container is visible
    await expect(page.getByTestId('chart-container')).toBeVisible()
  })

  test('should allow data entry and submission', async ({ page }) => {
    // Fill in the form
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.5')
    await page.getByLabel(/BMI/).fill('22.0')
    await page.getByLabel(/体脂肪率/).fill('15.0')
    await page.getByLabel(/筋肉量/).fill('55.0')
    await page.getByLabel(/内臓脂肪/).fill('8.0')
    await page.getByLabel(/カロリー/).fill('2200')
    
    // Submit the form
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for the response
    await page.waitForTimeout(1000)
    
    // Check if success message appears or data is updated
    // This depends on how the app handles success feedback
  })

  test('should display validation errors for invalid input', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Check for validation errors
    await expect(page.getByText(/必須/)).toBeVisible()
  })

  test('should display stats when data is present', async ({ page }) => {
    // Wait for stats to load
    await page.waitForSelector('[data-testid="stats-display"]', { timeout: 5000 })
    
    // Check if stats are displayed
    const statsElement = page.getByTestId('stats-display')
    await expect(statsElement).toBeVisible()
    
    // Check if average weight is displayed
    await expect(statsElement.getByText(/平均体重/)).toBeVisible()
    
    // Check if total records is displayed
    await expect(statsElement.getByText(/総記録数/)).toBeVisible()
  })

  test('should display chart when data is available', async ({ page }) => {
    // Wait for chart to load
    await page.waitForSelector('[data-testid="chart-container"]', { timeout: 5000 })
    
    // Check if chart container is visible
    const chartContainer = page.getByTestId('chart-container')
    await expect(chartContainer).toBeVisible()
    
    // Check if chart canvas is present
    await expect(chartContainer.locator('canvas')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if mobile layout is working
    await expect(page.getByRole('heading', { name: /体組成記録/ })).toBeVisible()
    await expect(page.getByRole('form')).toBeVisible()
    
    // Check if elements are properly arranged for mobile
    const formContainer = page.getByRole('form')
    await expect(formContainer).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate network error
    await page.route('**/api/**', route => {
      route.abort('failed')
    })
    
    // Try to submit form
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.5')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for error handling
    await page.waitForTimeout(2000)
    
    // Check if error message is displayed
    // This depends on how the app handles network errors
  })

  test('should display app version information', async ({ page }) => {
    // Check if version info is displayed in footer or header
    await expect(page.getByText(/バージョン/)).toBeVisible()
  })

  test('should maintain data between page reloads', async ({ page }) => {
    // Add some data first
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.5')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for submission
    await page.waitForTimeout(1000)
    
    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check if data is still there
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
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check if empty state is handled properly
    await expect(page.getByTestId('stats-display')).toBeVisible()
    await expect(page.getByText(/データがありません/)).toBeVisible()
  })
})