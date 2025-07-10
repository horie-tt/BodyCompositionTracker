import { supabaseApiClient } from './supabase-api'
import { BodyData } from '@/types'

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{
  success: boolean
  message: string
  data?: {
    recordCount: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appInfo: any
    sampleData: BodyData[]
  }
}> => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test health check
    const healthResult = await supabaseApiClient.healthCheck()
    if (!healthResult.success) {
      return {
        success: false,
        message: `Health check failed: ${healthResult.error}`
      }
    }
    
    console.log('✅ Health check passed')
    
    // Test data fetch
    const dataResult = await supabaseApiClient.getBodyData()
    if (!dataResult.success) {
      return {
        success: false,
        message: `Data fetch failed: ${dataResult.error}`
      }
    }
    
    console.log('✅ Data fetch passed')
    console.log(`Found ${dataResult.data?.length || 0} records`)
    
    // Test app info
    const appInfoResult = await supabaseApiClient.getAppInfo()
    if (!appInfoResult.success) {
      return {
        success: false,
        message: `App info failed: ${appInfoResult.error}`
      }
    }
    
    console.log('✅ App info passed')
    
    return {
      success: true,
      message: 'All Supabase tests passed!',
      data: {
        recordCount: dataResult.data?.length || 0,
        appInfo: appInfoResult.data,
        sampleData: dataResult.data?.slice(0, 2) || [] // Show first 2 records
      }
    }
    
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Test data insertion
export const testSupabaseInsert = async (): Promise<{
  success: boolean
  message: string
  data?: BodyData
}> => {
  try {
    const testData: BodyData = {
      date: new Date().toISOString().split('T')[0], // Today's date
      weight: 70.0,
      bmi: 22.0,
      body_fat: 15.0,
      muscle_mass: 55.0,
      visceral_fat: 8.0,
      calories: 2200
    }
    
    console.log('Testing Supabase insert...')
    
    const result = await supabaseApiClient.saveBodyData(testData)
    
    if (!result.success) {
      return {
        success: false,
        message: `Insert failed: ${result.error}`
      }
    }
    
    console.log('✅ Insert test passed')
    
    return {
      success: true,
      message: 'Insert test passed!',
      data: result.data
    }
    
  } catch (error) {
    console.error('Supabase insert test failed:', error)
    return {
      success: false,
      message: `Insert test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Full test suite
export const runSupabaseTests = async (): Promise<void> => {
  console.log('🧪 Running Supabase test suite...')
  
  const connectionTest = await testSupabaseConnection()
  console.log('Connection test:', connectionTest)
  
  if (connectionTest.success) {
    const insertTest = await testSupabaseInsert()
    console.log('Insert test:', insertTest)
  }
  
  console.log('✅ Test suite complete')
}