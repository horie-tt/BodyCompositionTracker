// Type definitions for Body Composition Tracker
// Migrated from GAS Types.ts and enhanced for React environment

export interface BodyData {
  id?: number
  date: string
  weight: number
  bmi?: number
  body_fat?: number
  muscle_mass?: number
  visceral_fat?: number
  calories?: number
  created_at?: string
}

export interface SaveResponse {
  success: boolean
  data?: BodyData
  error?: string
}

export interface LatestDataItem {
  current: number | null
  previous: number | null
  change: number | null
  changePercent: number | null
}

export interface LatestData {
  weight: LatestDataItem
  bmi: LatestDataItem
  bodyFat: LatestDataItem
  muscleMass: LatestDataItem
  visceralFat: LatestDataItem
  calories: LatestDataItem
  measurementDate: string | null
  previousDate: string | null
}

export interface StatsData {
  avgWeight: number
  avgBMI: number
  totalRecords: number
  latestRecord?: BodyData
}

export interface LatestStatsData {
  latestData: LatestData
}

export interface AppInfo {
  version: string
  buildNumber: string
  lastUpdated: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Chart.js related types
export interface ChartDataPoint {
  x: string // date
  y: number // value
}

export interface ChartDataset {
  label: string
  data: ChartDataPoint[]
  borderColor: string
  backgroundColor: string
  tension?: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// Component props types
export interface BodyDataFormProps {
  onSubmit: (data: BodyData) => Promise<void>
  isLoading?: boolean
}

export interface StatsDisplayProps {
  data: LatestStatsData
  isLoading?: boolean
}

export type DateRange = '1week' | '1month' | '3months' | 'all'

export interface ChartContainerProps {
  data: BodyData[]
  activeTab: 'weight' | 'bodyFat' | 'muscle'
  onTabChange: (tab: 'weight' | 'bodyFat' | 'muscle') => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export interface FooterProps {
  appInfo: AppInfo
}