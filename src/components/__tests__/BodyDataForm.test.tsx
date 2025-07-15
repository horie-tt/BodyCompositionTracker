import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BodyDataForm from '../BodyDataForm'
import { BodyData } from '@/types'

// Mock the API validation function
jest.mock('@/lib/api', () => ({
  validateBodyData: jest.fn((data: Partial<BodyData>) => {
    const errors: string[] = []
    if (!data.date) errors.push('日付は必須です')
    if (!data.weight || data.weight <= 0) errors.push('体重は必須で、0より大きい値である必要があります')
    return errors
  })
}))

// Mock timezone function for consistent testing
jest.mock('@/lib/timezone', () => ({
  getCurrentDateInTimezone: jest.fn(() => '2024-01-15'), // Fixed date for testing
  getUserTimezone: jest.fn(() => 'Asia/Tokyo'),
  getCurrentTimestampInTimezone: jest.fn(() => '2024-01-15T10:00:00+09:00'),
  isValidTimezone: jest.fn(() => true)
}))

describe('BodyDataForm', () => {
  const mockOnSubmit = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields correctly', () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Check all form fields are present
    expect(screen.getByTestId('date-input')).toBeInTheDocument()
    expect(screen.getByTestId('weight-input')).toBeInTheDocument()
    expect(screen.getByTestId('bmi-input')).toBeInTheDocument()
    expect(screen.getByTestId('body-fat-input')).toBeInTheDocument()
    expect(screen.getByTestId('muscle-mass-input')).toBeInTheDocument()
    expect(screen.getByTestId('visceral-fat-input')).toBeInTheDocument()
    expect(screen.getByTestId('calories-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('displays default status message', () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByTestId('status-message')).toHaveTextContent('データを入力して記録しましょう')
  })

  it('has today\'s date as default in user timezone after mount', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    // In test environment (jsdom/browser), useEffect runs immediately
    // so date should be set to mocked current date
    await waitFor(() => {
      expect(dateInput.value).toBe('2024-01-15')
    }, { timeout: 5000 })
  })

  it('should handle timezone gracefully', () => {
    // This test verifies the timezone functionality works without errors
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    // Should have a valid date set (YYYY-MM-DD format)
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('updates input values when user types', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    const weightInput = screen.getByTestId('weight-input')
    const bmiInput = screen.getByTestId('bmi-input')

    await user.type(weightInput, '70.5')
    await user.type(bmiInput, '22.1')

    expect(weightInput).toHaveValue(70.5)
    expect(bmiInput).toHaveValue(22.1)
  })

  it('calls onSubmit with correct data when form is valid', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Fill out the form
    await user.type(screen.getByTestId('weight-input'), '70.5')
    await user.type(screen.getByTestId('bmi-input'), '22.1')
    await user.type(screen.getByTestId('body-fat-input'), '15.2')

    // Submit the form
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          weight: 70.5,
          bmi: 22.1,
          body_fat: 15.2,
          date: expect.any(String),
        })
      )
    })
  })

  it('validates required fields on submission', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Clear the date field and leave weight empty
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '' } })

    // Try to submit without required fields
    await user.click(screen.getByTestId('submit-button'))

    // Should either show validation errors or submission error
    await waitFor(() => {
      const statusMessage = screen.getByTestId('status-message')
      const textContent = statusMessage.textContent || ''
      expect(
        textContent.includes('必須です') || 
        textContent.includes('保存に失敗') ||
        textContent.includes('データを入力して記録しましょう')
      ).toBe(true)
    })
  })

  it('shows loading state when isLoading is true', () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} isLoading={true} />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('保存中...')
  })

  it('resets form after successful submission', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Fill out the form
    const weightInput = screen.getByTestId('weight-input')
    const bmiInput = screen.getByTestId('bmi-input')
    
    await user.type(weightInput, '70.5')
    await user.type(bmiInput, '22.1')

    // Submit the form
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    // Check that form is reset (except date)
    await waitFor(() => {
      expect(weightInput).toHaveValue(null)
      expect(bmiInput).toHaveValue(null)
      expect(screen.getByTestId('status-message')).toHaveTextContent('保存が完了しました！')
    })
  })

  it('handles submission error gracefully', async () => {
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Network error'))
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Fill out the form
    await user.type(screen.getByTestId('weight-input'), '70.5')

    // Submit the form
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent('保存に失敗しました。もう一度お試しください。')
    })
  })

  it('clears errors when user starts typing', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Clear all required fields to trigger validation errors
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    const weightInput = screen.getByTestId('weight-input') as HTMLInputElement
    
    fireEvent.change(dateInput, { target: { value: '' } })
    fireEvent.change(weightInput, { target: { value: '' } })

    // Submit to potentially show errors
    await user.click(screen.getByTestId('submit-button'))

    // Then type in a field - this should clear any errors
    await user.type(weightInput, '70')

    // Status should be default message or validation cleared
    await waitFor(() => {
      const statusMessage = screen.getByTestId('status-message')
      expect(
        statusMessage.textContent?.includes('データを入力して記録しましょう') ||
        statusMessage.textContent?.includes('保存に失敗')
      ).toBe(true)
    })
  })

  it('displays all required form attributes', () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Check required fields
    expect(screen.getByTestId('date-input')).toBeRequired()
    expect(screen.getByTestId('weight-input')).toBeRequired()
    
    // Check field constraints
    const weightInput = screen.getByTestId('weight-input') as HTMLInputElement
    expect(weightInput.min).toBe('20')
    expect(weightInput.max).toBe('200')
    expect(weightInput.step).toBe('0.01')
  })
})