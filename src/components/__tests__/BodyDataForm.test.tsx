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

  it('has today\'s date as default', () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    const today = new Date().toISOString().split('T')[0]
    expect(dateInput.value).toBe(today)
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

  it('displays validation errors when form is invalid', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)

    // Clear the date field to trigger validation error
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '' } })

    // Try to submit without required fields
    await user.click(screen.getByTestId('submit-button'))

    // Wait for the validation to complete
    await waitFor(() => {
      const statusMessage = screen.getByTestId('status-message')
      const textContent = statusMessage.textContent
      expect(textContent).toContain('日付は必須です')
      expect(mockOnSubmit).not.toHaveBeenCalled()
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

    // Clear date to trigger error
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '' } })

    // Submit to show error
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent('日付は必須です, 体重は必須で、0より大きい値である必要があります')
    })

    // Type in weight field to clear errors
    await user.type(screen.getByTestId('weight-input'), '70')

    // Error should be cleared and default status should be shown
    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent('データを入力して記録しましょう')
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