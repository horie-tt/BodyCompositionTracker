'use client'

import React, { useState, useEffect } from 'react'
import BodyDataForm from '@/components/BodyDataForm'
import StatsDisplay from '@/components/StatsDisplay'
import ChartContainer from '@/components/ChartContainer'
import { BodyData, StatsData, AppInfo } from '@/types'
import { saveBodyData, getBodyData, calculateStats, getAppInfo } from '@/lib/api'

export default function Home() {
  const [bodyData, setBodyData] = useState<BodyData[]>([])
  const [statsData, setStatsData] = useState<StatsData>({
    avgWeight: 0,
    avgBMI: 0,
    totalRecords: 0,
  })
  const [appInfo, setAppInfo] = useState<AppInfo>({
    version: '--',
    buildNumber: '--',
    lastUpdated: '--',
  })
  const [activeTab, setActiveTab] = useState<'weight' | 'composition' | 'calories'>('weight')
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    loadData()
    loadAppInfo()
  }, [])

  const loadData = async () => {
    try {
      setIsDataLoading(true)
      const data = await getBodyData()
      setBodyData(data)
      
      const stats = await calculateStats(data)
      setStatsData(stats)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }

  const loadAppInfo = async () => {
    try {
      const info = await getAppInfo()
      setAppInfo(info)
    } catch (error) {
      console.error('Failed to load app info:', error)
    }
  }

  const handleSubmit = async (formData: BodyData) => {
    try {
      setIsLoading(true)
      await saveBodyData(formData)
      await loadData() // Refresh data after saving
    } catch (error) {
      console.error('Failed to save data:', error)
      throw error // Re-throw to let the form handle the error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: 'weight' | 'composition' | 'calories') => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-2">
            Body Tracker
          </h1>
          <p className="text-lg text-white/80">
            Track your body composition journey
          </p>
        </div>

        {/* Body Data Form */}
        <div className="mb-8">
          <BodyDataForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Stats Display */}
        <div className="mb-8">
          <StatsDisplay data={statsData} isLoading={isDataLoading} />
        </div>

        {/* Chart Container */}
        <div className="mb-8">
          <ChartContainer
            data={bodyData}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span>🏷️</span>
              <span>v{appInfo.version}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔨</span>
              <span>Build {appInfo.buildNumber}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🕒</span>
              <span>{appInfo.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}