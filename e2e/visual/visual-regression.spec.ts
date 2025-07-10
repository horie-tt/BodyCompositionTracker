import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should match homepage screenshot', async ({ page }) => {
    // Wait for all content to load
    await page.waitForSelector('[data-testid="stats-display"]')
    await page.waitForSelector('[data-testid="chart-container"]')
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('should match form component screenshot', async ({ page }) => {
    const formElement = page.getByRole('form')
    await expect(formElement).toBeVisible()
    
    // Take screenshot of just the form
    await expect(formElement).toHaveScreenshot('form-component.png', {
      animations: 'disabled'
    })
  })

  test('should match stats display screenshot', async ({ page }) => {
    const statsElement = page.getByTestId('stats-display')
    await expect(statsElement).toBeVisible()
    
    // Take screenshot of stats display
    await expect(statsElement).toHaveScreenshot('stats-display.png', {
      animations: 'disabled'
    })
  })

  test('should match chart container screenshot', async ({ page }) => {
    const chartElement = page.getByTestId('chart-container')
    await expect(chartElement).toBeVisible()
    
    // Wait for chart to render
    await page.waitForTimeout(2000)
    
    // Take screenshot of chart
    await expect(chartElement).toHaveScreenshot('chart-container.png', {
      animations: 'disabled'
    })
  })

  test('should match filled form screenshot', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.5')
    await page.getByLabel(/BMI/).fill('22.0')
    await page.getByLabel(/体脂肪率/).fill('15.0')
    await page.getByLabel(/筋肉量/).fill('55.0')
    await page.getByLabel(/内臓脂肪/).fill('8.0')
    await page.getByLabel(/カロリー/).fill('2200')
    
    const formElement = page.getByRole('form')
    await expect(formElement).toHaveScreenshot('filled-form.png', {
      animations: 'disabled'
    })
  })

  test('should match mobile layout screenshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for layout to adjust
    await page.waitForTimeout(500)
    
    // Take screenshot of mobile layout
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('should match tablet layout screenshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Wait for layout to adjust
    await page.waitForTimeout(500)
    
    // Take screenshot of tablet layout
    await expect(page).toHaveScreenshot('tablet-layout.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('should match dark mode screenshot', async ({ page }) => {
    // Check if dark mode is available
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]')
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click()
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        animations: 'disabled'
      })
    } else {
      // Skip if dark mode is not implemented
      test.skip()
    }
  })

  test('should match loading state screenshot', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/**', async route => {
      await page.waitForTimeout(5000)
      route.continue()
    })
    
    // Reload to trigger loading state
    await page.reload()
    
    // Take screenshot during loading
    await expect(page).toHaveScreenshot('loading-state.png', {
      animations: 'disabled'
    })
  })

  test('should match error state screenshot', async ({ page }) => {
    // Mock API error
    await page.route('**/api/body-data', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' })
      })
    })
    
    // Reload to trigger error state
    await page.reload()
    await page.waitForTimeout(2000)
    
    // Take screenshot of error state
    await expect(page).toHaveScreenshot('error-state.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('should match validation error screenshot', async ({ page }) => {
    // Try to submit empty form to trigger validation
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for validation errors to appear
    await page.waitForTimeout(500)
    
    // Take screenshot of validation errors
    const formElement = page.getByRole('form')
    await expect(formElement).toHaveScreenshot('validation-errors.png', {
      animations: 'disabled'
    })
  })

  test('should match different screen sizes', async ({ page }) => {
    const screenSizes = [
      { width: 320, height: 568, name: 'small-mobile' },
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop-small' },
      { width: 1440, height: 900, name: 'desktop-large' },
      { width: 1920, height: 1080, name: 'desktop-xl' }
    ]
    
    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot(`${size.name}-${size.width}x${size.height}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    }
  })
})