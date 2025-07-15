import { getCurrentDateInTimezone, getUserTimezone } from '../timezone'
import { render, screen, waitFor } from '@testing-library/react'
import BodyDataForm from '../../components/BodyDataForm'
import React from 'react'

// このテストファイルは実際のAPI動作をテストします（モックなし）
describe('Date generation functionality - Real API Tests', () => {
  describe('getCurrentDateInTimezone function', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const result = getCurrentDateInTimezone()
      
      // 形式チェック
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // 実際の今日の日付と比較（同一タイムゾーン）
      const today = new Date()
      const userTz = getUserTimezone()
      const expectedDate = today.toLocaleDateString('sv-SE', { 
        timeZone: userTz 
      }) // sv-SE locale gives YYYY-MM-DD format
      
      expect(result).toBe(expectedDate)
    })

    it('should return correct date for specific timezone', () => {
      const tokyoDate = getCurrentDateInTimezone('Asia/Tokyo')
      const nyDate = getCurrentDateInTimezone('America/New_York')
      
      // 両方とも有効な日付形式
      expect(tokyoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(nyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // タイムゾーンが13時間違うときの日付差確認
      const tokyoDateObj = new Date(tokyoDate)
      const nyDateObj = new Date(nyDate)
      const dayDiff = Math.abs(tokyoDateObj.getTime() - nyDateObj.getTime()) / (1000 * 60 * 60 * 24)
      
      // 日付差は0日または1日のはず（タイムゾーン差による）
      expect(dayDiff).toBeLessThanOrEqual(1)
    })

    it('should handle invalid timezone gracefully', () => {
      const result = getCurrentDateInTimezone('Invalid/Timezone')
      
      // エラーではなく有効な日付が返される
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result).toBeTruthy()
    })

    it('should return consistent date when called multiple times quickly', () => {
      const date1 = getCurrentDateInTimezone()
      const date2 = getCurrentDateInTimezone()
      const date3 = getCurrentDateInTimezone()
      
      // 短時間での連続呼び出しでは同じ日付
      expect(date1).toBe(date2)
      expect(date2).toBe(date3)
    })

    it('should return actual today\'s date verified multiple ways', () => {
      const result = getCurrentDateInTimezone('Asia/Tokyo')
      
      // 1. JavaScript標準APIとの比較
      const jsToday = new Date().toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Tokyo'
      })
      expect(result).toBe(jsToday)
      
      // 2. 年月日個別確認
      const now = new Date()
      const tokyoNow = new Intl.DateTimeFormat('ja-CA', {
        timeZone: 'Asia/Tokyo'
      }).format(now) // YYYY-MM-DD形式
      expect(result).toBe(tokyoNow)
      
      // 3. 解析して日付要素確認
      const [year, month, day] = result.split('-').map(Number)
      const tokyoDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
      
      expect(year).toBe(tokyoDate.getFullYear())
      expect(month).toBe(tokyoDate.getMonth() + 1)
      expect(day).toBe(tokyoDate.getDate())
    })
  })

  describe('Edge cases and error handling', () => {
    it('should work across different environments', () => {
      // Node.js環境のIntl APIが利用可能かテスト
      expect(typeof Intl.DateTimeFormat).toBe('function')
      
      const result = getCurrentDateInTimezone()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle leap year dates correctly', () => {
      // 現在が2月29日の場合のテスト（4年に1度）
      const result = getCurrentDateInTimezone()
      const dateObj = new Date(result)
      
      // 有効な日付として解析される
      expect(dateObj instanceof Date && !isNaN(dateObj.getTime())).toBe(true)
      
      // うるう年の2月29日も正しく処理される
      if (result.includes('-02-29')) {
        const year = parseInt(result.split('-')[0])
        const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
        expect(isLeapYear).toBe(true)
      }
    })

    it('should be within valid today range', () => {
      const result = getCurrentDateInTimezone()
      const resultDate = new Date(result)
      const now = new Date()
      
      // 日付オブジェクトとして比較（時差考慮）
      const daysDiff = Math.abs(resultDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      
      // 今日の日付なら差は1日未満のはず
      expect(daysDiff).toBeLessThan(1)
    })
  })
})

// モックを使わずに実際のBodyDataFormコンポーネントをテスト
describe('BodyDataForm real date integration', () => {
  // 一時的にモックを無効化
  beforeAll(() => {
    jest.unmock('@/lib/timezone')
  })

  it('should initialize with actual today\'s date', async () => {
    const mockOnSubmit = jest.fn()
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    await waitFor(() => {
      // フォームに設定された日付を取得
      const formDate = dateInput.value
      
      // 今日の日付と比較
      const expectedDate = getCurrentDateInTimezone()
      expect(formDate).toBe(expectedDate)
      
      // 追加検証：実際の今日の日付との一致
      const actualToday = new Date().toLocaleDateString('sv-SE', {
        timeZone: getUserTimezone()
      })
      expect(formDate).toBe(actualToday)
    })
  })

  it('should set valid date even near timezone boundary', async () => {
    const mockOnSubmit = jest.fn()
    render(<BodyDataForm onSubmit={mockOnSubmit} />)
    
    const dateInput = screen.getByTestId('date-input') as HTMLInputElement
    
    await waitFor(() => {
      const formDate = dateInput.value
      
      // 有効な日付形式
      expect(formDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // 実際の日付として解析可能
      const dateObj = new Date(formDate)
      expect(dateObj instanceof Date && !isNaN(dateObj.getTime())).toBe(true)
      
      // 過去または未来すぎない（前後1日以内）
      const today = new Date()
      const diffDays = Math.abs(dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBeLessThan(2)
    })
  })
})