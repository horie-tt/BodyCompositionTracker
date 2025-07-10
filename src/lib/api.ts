// API client for Body Composition Tracker
// Replaces google.script.run calls with REST API calls

import { BodyData, SaveResponse, StatsData, AppInfo, ApiResponse } from '@/types'
import { supabaseApiClient } from './supabase-api'

// Check if we should use Supabase instead of MSW
const useSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                   process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : '/api' // In development, MSW will intercept these calls

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Save body data (replaces google.script.run.saveBodyData)
  async saveBodyData(data: BodyData): Promise<SaveResponse> {
    if (useSupabase) {
      return supabaseApiClient.saveBodyData(data)
    }
    
    const response = await this.request<BodyData>('/body-data', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    return {
      success: response.success,
      data: response.data,
      error: response.error,
    }
  }

  // Get all body data (replaces google.script.run.getBodyData)
  async getBodyData(): Promise<ApiResponse<BodyData[]>> {
    if (useSupabase) {
      return supabaseApiClient.getBodyData()
    }
    
    return this.request<BodyData[]>('/body-data')
  }

  // Calculate statistics from data
  calculateStats(data: BodyData[]): StatsData {
    if (useSupabase) {
      return supabaseApiClient.calculateStats(data)
    }
    
    if (data.length === 0) {
      return {
        avgWeight: 0,
        avgBMI: 0,
        totalRecords: 0,
      }
    }

    const validWeights = data.filter(d => d.weight).map(d => d.weight)
    const validBMIs = data.filter(d => d.bmi).map(d => d.bmi!)

    return {
      avgWeight: validWeights.length > 0 
        ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length 
        : 0,
      avgBMI: validBMIs.length > 0 
        ? validBMIs.reduce((a, b) => a + b, 0) / validBMIs.length 
        : 0,
      totalRecords: data.length,
      latestRecord: data[0], // Assuming data is sorted by date desc
    }
  }

  // Get app info (replaces google.script.run.getAppInfo)
  async getAppInfo(): Promise<ApiResponse<AppInfo>> {
    if (useSupabase) {
      return supabaseApiClient.getAppInfo()
    }
    
    return this.request<AppInfo>('/app-info')
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    if (useSupabase) {
      return supabaseApiClient.healthCheck()
    }
    
    return this.request('/health')
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Utility functions for data processing
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ja-JP')
}

export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals)
}

export const validateBodyData = (data: Partial<BodyData>): string[] => {
  const errors: string[] = []

  if (!data.date) {
    errors.push('日付は必須です')
  }

  if (!data.weight || data.weight <= 0) {
    errors.push('体重は必須で、0より大きい値である必要があります')
  }

  if (data.weight && (data.weight < 20 || data.weight > 200)) {
    errors.push('体重は20kg〜200kgの範囲で入力してください')
  }

  if (data.bmi && (data.bmi < 10 || data.bmi > 50)) {
    errors.push('BMIは10〜50の範囲で入力してください')
  }

  if (data.body_fat && (data.body_fat < 0 || data.body_fat > 50)) {
    errors.push('体脂肪率は0〜50%の範囲で入力してください')
  }

  if (data.muscle_mass && (data.muscle_mass < 0 || data.muscle_mass > 100)) {
    errors.push('筋肉量は0〜100kgの範囲で入力してください')
  }

  if (data.visceral_fat && (data.visceral_fat < 0 || data.visceral_fat > 30)) {
    errors.push('内臓脂肪量は0〜30レベルの範囲で入力してください')
  }

  if (data.calories && (data.calories < 0 || data.calories > 5000)) {
    errors.push('消費カロリーは0〜5000kcalの範囲で入力してください')
  }

  return errors
}

// Convenience functions for easier usage
export const saveBodyData = async (data: BodyData): Promise<void> => {
  const response = await apiClient.saveBodyData(data)
  if (!response.success) {
    throw new Error(response.error || 'Failed to save data')
  }
}

export const getBodyData = async (): Promise<BodyData[]> => {
  const response = await apiClient.getBodyData()
  if (!response.success) {
    throw new Error(response.error || 'Failed to get data')
  }
  return response.data || []
}

export const calculateStats = async (data: BodyData[]): Promise<StatsData> => {
  return apiClient.calculateStats(data)
}

export const getAppInfo = async (): Promise<AppInfo> => {
  const response = await apiClient.getAppInfo()
  if (!response.success) {
    throw new Error(response.error || 'Failed to get app info')
  }
  return response.data || { version: '--', buildNumber: '--', lastUpdated: '--' }
}