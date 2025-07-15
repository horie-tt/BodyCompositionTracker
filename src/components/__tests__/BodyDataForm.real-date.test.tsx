import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import BodyDataForm from '../BodyDataForm'
import { getCurrentDateInTimezone } from '@/lib/timezone'

// Mock Supabase dependencies to avoid ESM module issues
jest.mock('@/lib/supabase-api', () => ({
  supabaseApiClient: {
    saveBodyData: jest.fn(),
    getBodyData: jest.fn(),
    calculateStats: jest.fn(),
    getAppInfo: jest.fn(),
    healthCheck: jest.fn(),
  }
}))

// Disable Supabase through environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = undefined
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined

// このテストは実際のAPIを使用して、本当に今日の日付が設定されるかテストします
describe('BodyDataForm - Real Date Integration', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with actual today\'s date', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    await waitFor(() => {
      const formDate = dateInput.value
      const actualToday = getCurrentDateInTimezone()
      
      console.log('Form date:', formDate)
      console.log('Actual today:', actualToday)
      
      expect(formDate).toBe(actualToday)
    }, { timeout: 5000 })
  })

  it('should set today\'s date in user timezone', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    await waitFor(() => {
      const formDate = dateInput.value
      
      // 日付が設定されている
      expect(formDate).toBeTruthy()
      
      // YYYY-MM-DD形式である
      expect(formDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // 今日の日付である（前後1日以内）
      const formDateObj = new Date(formDate)
      const today = new Date()
      const diffInDays = Math.abs(formDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffInDays).toBeLessThan(1)
    }, { timeout: 5000 })
  })

  it('should set date on component mount', async () => {
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    // useEffectが実行されて日付が設定される
    await waitFor(() => {
      expect(dateInput.value).not.toBe('')
      expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }, { timeout: 5000 })
  })

  it('should verify getCurrentDateInTimezone function works correctly', () => {
    const today = getCurrentDateInTimezone()
    
    // 正しい形式
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    
    // 実際の今日の日付と比較
    const jsToday = new Date().toISOString().split('T')[0]
    const todayObj = new Date(today)
    const jsTodayObj = new Date(jsToday)
    
    // 同じ日付または1日以内の差（タイムゾーンの違いを考慮）
    const diffInDays = Math.abs(todayObj.getTime() - jsTodayObj.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffInDays).toBeLessThanOrEqual(1)
  })
})