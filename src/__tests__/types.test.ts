import { BodyData, SaveResponse, StatsData, AppInfo } from '@/types'

describe('Type Definitions', () => {
  describe('BodyData', () => {
    it('should allow valid body data structure', () => {
      const bodyData: BodyData = {
        id: 1,
        date: '2024-01-15',
        weight: 70.5,
        bmi: 22.1,
        body_fat: 15.2,
        muscle_mass: 55.8,
        visceral_fat: 8,
        calories: 2200,
        created_at: '2024-01-15T09:00:00Z'
      }

      expect(bodyData.id).toBe(1)
      expect(bodyData.date).toBe('2024-01-15')
      expect(bodyData.weight).toBe(70.5)
    })

    it('should allow minimal body data with required fields only', () => {
      const minimalData: BodyData = {
        date: '2024-01-15',
        weight: 70.5,
      }

      expect(minimalData.date).toBe('2024-01-15')
      expect(minimalData.weight).toBe(70.5)
      expect(minimalData.id).toBeUndefined()
      expect(minimalData.bmi).toBeUndefined()
    })
  })

  describe('SaveResponse', () => {
    it('should structure successful response correctly', () => {
      const successResponse: SaveResponse = {
        success: true,
        data: {
          id: 1,
          date: '2024-01-15',
          weight: 70.5,
        }
      }

      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBeDefined()
      expect(successResponse.error).toBeUndefined()
    })

    it('should structure error response correctly', () => {
      const errorResponse: SaveResponse = {
        success: false,
        error: 'Validation failed'
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe('Validation failed')
      expect(errorResponse.data).toBeUndefined()
    })
  })

  describe('StatsData', () => {
    it('should structure stats data correctly', () => {
      const stats: StatsData = {
        avgWeight: 70.5,
        avgBMI: 22.1,
        totalRecords: 10,
        latestRecord: {
          id: 1,
          date: '2024-01-15',
          weight: 70.5,
        }
      }

      expect(stats.avgWeight).toBe(70.5)
      expect(stats.avgBMI).toBe(22.1)
      expect(stats.totalRecords).toBe(10)
      expect(stats.latestRecord).toBeDefined()
    })
  })

  describe('AppInfo', () => {
    it('should structure app info correctly', () => {
      const appInfo: AppInfo = {
        version: '2.0.0',
        buildNumber: '42',
        lastUpdated: '2024-01-15T09:00:00Z'
      }

      expect(appInfo.version).toBe('2.0.0')
      expect(appInfo.buildNumber).toBe('42')
      expect(appInfo.lastUpdated).toBeDefined()
    })
  })
})