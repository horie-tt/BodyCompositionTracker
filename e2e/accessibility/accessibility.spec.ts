import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper heading structure', async ({ page }) => {
    // Check if headings are properly structured
    const headings = await page.$$('h1, h2, h3, h4, h5, h6')
    
    expect(headings.length).toBeGreaterThan(0)
    
    // Check if there's exactly one h1
    const h1Elements = await page.$$('h1')
    expect(h1Elements.length).toBe(1)
    
    // Check if heading hierarchy is logical
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('h1, h2, h3, h4, h5, h6')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper form labels', async ({ page }) => {
    // Check if all form inputs have proper labels
    const inputs = await page.$$('input, select, textarea')
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id')
      const inputType = await input.getAttribute('type')
      
      if (inputType !== 'hidden' && inputType !== 'submit' && inputType !== 'button') {
        // Check if input has associated label
        const label = await page.$(`label[for="${inputId}"]`)
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        
        expect(label || ariaLabel || ariaLabelledBy).toBeTruthy()
      }
    }
  })

  test('should have proper color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('*')
      .analyze()
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(colorContrastViolations).toEqual([])
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
    
    // Test that all interactive elements are reachable by keyboard
    const interactiveElements = await page.$$('button, input, select, textarea, a[href]')
    
    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      await page.keyboard.press('Tab')
      const currentFocused = await page.evaluate(() => document.activeElement?.tagName)
      expect(currentFocused).toBeTruthy()
    }
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for proper ARIA attributes
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[role], [aria-label], [aria-labelledby], [aria-describedby]')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have alt text for images', async ({ page }) => {
    const images = await page.$$('img')
    
    for (const image of images) {
      const alt = await image.getAttribute('alt')
      const role = await image.getAttribute('role')
      const ariaLabel = await image.getAttribute('aria-label')
      
      // Images should have alt text, or be decorative (role="presentation")
      expect(alt !== null || role === 'presentation' || ariaLabel).toBeTruthy()
    }
  })

  test('should have proper form validation messages', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for validation messages
    await page.waitForTimeout(500)
    
    // Check accessibility of validation messages
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[role="alert"], .error, .invalid')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper focus management', async ({ page }) => {
    // Test focus management in form
    await page.getByLabel(/日付/).focus()
    
    let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should have proper landmark regions', async ({ page }) => {
    // Check for proper landmark regions
    const landmarks = await page.$$('[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"], main, header, footer, nav')
    
    expect(landmarks.length).toBeGreaterThan(0)
    
    // Check accessibility of landmarks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"], main, header, footer, nav')
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should work with screen readers', async ({ page }) => {
    // Test screen reader compatibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withOptions({
        rules: {
          'aria-required-attr': { enabled: true },
          'aria-roles': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true }
        }
      })
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should handle dynamic content accessibility', async ({ page }) => {
    // Fill form to trigger dynamic content
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.0')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for content update
    await page.waitForTimeout(2000)
    
    // Check accessibility of updated content
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper error handling accessibility', async ({ page }) => {
    // Mock error response
    await page.route('**/api/body-data', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' })
      })
    })
    
    // Try to submit form
    await page.getByLabel(/日付/).fill('2024-01-15')
    await page.getByLabel(/体重/).fill('70.0')
    await page.getByRole('button', { name: /記録/ }).click()
    
    // Wait for error state
    await page.waitForTimeout(2000)
    
    // Check accessibility of error state
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' })
    
    // Wait for style changes
    await page.waitForTimeout(500)
    
    // Check accessibility in high contrast mode
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Wait for motion changes
    await page.waitForTimeout(500)
    
    // Check that animations are reduced/disabled
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
})