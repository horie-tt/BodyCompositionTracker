'use client'

import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { ChartContainerProps, DateRange, PeriodChanges, PeriodChangeItem } from '@/types'

Chart.register(...registerables)

export default function ChartContainer({ data, activeTab, onTabChange, dateRange, onDateRangeChange }: ChartContainerProps) {
  const weightChartRef = useRef<HTMLCanvasElement>(null)
  const bodyFatChartRef = useRef<HTMLCanvasElement>(null)
  const muscleChartRef = useRef<HTMLCanvasElement>(null)
  const chartsRef = useRef<{ [key: string]: Chart | null }>({})

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (dateRange === 'all') return data
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (dateRange) {
      case '1week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      default:
        return data
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate)
  }, [data, dateRange])

  const initWeightChart = useCallback(() => {
    if (!weightChartRef.current) return

    const ctx = weightChartRef.current.getContext('2d')
    if (!ctx) return

    if (chartsRef.current.weight) {
      chartsRef.current.weight.destroy()
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: filteredData.map(d => formatDate(d.date)),
        datasets: [{
          label: '体重 (kg)',
          data: filteredData.map(d => d.weight),
          borderColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.4,
          fill: true
        }]
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: getChartOptions('kg') as any
    }

    chartsRef.current.weight = new Chart(ctx, config)
  }, [filteredData])

  const initBodyFatChart = useCallback(() => {
    if (!bodyFatChartRef.current) return

    const ctx = bodyFatChartRef.current.getContext('2d')
    if (!ctx) return

    if (chartsRef.current.bodyFat) {
      chartsRef.current.bodyFat.destroy()
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: filteredData.map(d => formatDate(d.date)),
        datasets: [{
          label: '体脂肪率 (%)',
          data: filteredData.map(d => d.body_fat || 0),
          borderColor: 'rgba(255, 107, 157, 0.8)',
          backgroundColor: 'rgba(255, 107, 157, 0.1)',
          pointBackgroundColor: '#ff6b9d',
          pointBorderColor: 'rgba(255, 107, 157, 0.8)',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.4,
          fill: true
        }]
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: getChartOptions('%') as any
    }

    chartsRef.current.bodyFat = new Chart(ctx, config)
  }, [filteredData])

  const initMuscleChart = useCallback(() => {
    if (!muscleChartRef.current) return

    const ctx = muscleChartRef.current.getContext('2d')
    if (!ctx) return

    if (chartsRef.current.muscle) {
      chartsRef.current.muscle.destroy()
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: filteredData.map(d => formatDate(d.date)),
        datasets: [{
          label: '筋肉量 (kg)',
          data: filteredData.map(d => d.muscle_mass || 0),
          borderColor: 'rgba(107, 207, 127, 0.8)',
          backgroundColor: 'rgba(107, 207, 127, 0.1)',
          pointBackgroundColor: '#6bcf7f',
          pointBorderColor: 'rgba(107, 207, 127, 0.8)',
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.4,
          fill: true
        }]
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: getChartOptions('kg') as any
    }

    chartsRef.current.muscle = new Chart(ctx, config)
  }, [filteredData])

  const initCharts = useCallback(() => {
    initWeightChart()
    initBodyFatChart()
    initMuscleChart()
  }, [initWeightChart, initBodyFatChart, initMuscleChart])

  useEffect(() => {
    if (filteredData.length > 0) {
      initCharts()
    }
    
    return () => {
      // Cleanup charts on unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const charts = chartsRef.current
      Object.values(charts).forEach(chart => {
        if (chart) {
          chart.destroy()
        }
      })
    }
  }, [filteredData, initCharts])

  // Calculate period changes (latest vs oldest in filtered period)
  const periodChanges = useMemo((): PeriodChanges => {
    if (filteredData.length === 0) {
      return {
        weight: { current: null, previous: null, change: null, changePercent: null },
        bmi: { current: null, previous: null, change: null, changePercent: null },
        bodyFat: { current: null, previous: null, change: null, changePercent: null },
        muscleMass: { current: null, previous: null, change: null, changePercent: null },
        visceralFat: { current: null, previous: null, change: null, changePercent: null },
        calories: { current: null, previous: null, change: null, changePercent: null },
        currentDate: null,
        previousDate: null,
        period: dateRange
      }
    }

    // Sort by date to get latest and oldest
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const oldest = sortedData[0] // Oldest date in period
    const latest = sortedData[sortedData.length - 1] // Latest date in period

    const calculatePeriodChange = (current: number | null, previous: number | null): PeriodChangeItem => {
      if (current === null || current === undefined || previous === null || previous === undefined) {
        return { current, previous, change: null, changePercent: null }
      }

      const change = current - previous
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0

      return {
        current,
        previous,
        change,
        changePercent
      }
    }

    return {
      weight: calculatePeriodChange(latest.weight, oldest.weight),
      bmi: calculatePeriodChange(latest.bmi || null, oldest.bmi || null),
      bodyFat: calculatePeriodChange(latest.body_fat || null, oldest.body_fat || null),
      muscleMass: calculatePeriodChange(latest.muscle_mass || null, oldest.muscle_mass || null),
      visceralFat: calculatePeriodChange(latest.visceral_fat || null, oldest.visceral_fat || null),
      calories: calculatePeriodChange(latest.calories || null, oldest.calories || null),
      currentDate: latest.date,
      previousDate: oldest.date,
      period: dateRange
    }
  }, [filteredData, dateRange])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

  const getChartOptions = (unit: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: { dataset: { label?: string }; parsed: { y: number } }) {
            return `${context.dataset.label || ''}: ${context.parsed.y}${unit}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value: string | number) {
            return `${value}${unit}`
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  })



  const handleTabClick = (tab: 'weight' | 'bodyFat' | 'muscle') => {
    onTabChange(tab)
  }

  const handleDateRangeChange = (range: DateRange) => {
    onDateRangeChange(range)
  }

  const getDateRangeLabel = (range: DateRange): string => {
    switch (range) {
      case '1week': return '1週間'
      case '1month': return '1ヶ月'
      case '3months': return '3ヶ月'
      case 'all': return '全期間'
      default: return '1週間'
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      {/* Date Range Selector */}
      <div className="flex justify-end mb-4">
        <div className="bg-white/5 rounded-lg p-1 flex gap-1">
          {(['1week', '1month', '3months', 'all'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                dateRange === range
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
              data-testid={`date-range-${range}`}
            >
              {getDateRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex mb-5 bg-white/10 rounded-xl p-1">
        <button
          onClick={() => handleTabClick('weight')}
          className={`flex-1 py-3 px-2 text-center rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 ${
            activeTab === 'weight'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/70 hover:text-white/90'
          }`}
          data-testid="weight-tab"
        >
          体重
        </button>
        <button
          onClick={() => handleTabClick('bodyFat')}
          className={`flex-1 py-3 px-2 text-center rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 ${
            activeTab === 'bodyFat'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/70 hover:text-white/90'
          }`}
          data-testid="body-fat-tab"
        >
          体脂肪率
        </button>
        <button
          onClick={() => handleTabClick('muscle')}
          className={`flex-1 py-3 px-2 text-center rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 ${
            activeTab === 'muscle'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/70 hover:text-white/90'
          }`}
          data-testid="muscle-tab"
        >
          筋肉量
        </button>
      </div>

      {/* Chart Containers */}
      <div className="relative h-80">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/60">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm">データがありません</div>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`absolute inset-0 ${activeTab === 'weight' ? 'block' : 'hidden'}`}
              data-testid="weight-chart-container"
            >
              <canvas
                ref={weightChartRef}
                data-testid="weight-chart"
                className="w-full h-full"
              />
            </div>
            
            <div
              className={`absolute inset-0 ${activeTab === 'bodyFat' ? 'block' : 'hidden'}`}
              data-testid="body-fat-chart-container"
            >
              <canvas
                ref={bodyFatChartRef}
                data-testid="body-fat-chart"
                className="w-full h-full"
              />
            </div>
            
            <div
              className={`absolute inset-0 ${activeTab === 'muscle' ? 'block' : 'hidden'}`}
              data-testid="muscle-chart-container"
            >
              <canvas
                ref={muscleChartRef}
                data-testid="muscle-chart"
                className="w-full h-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Period Changes Display */}
      {filteredData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-sm text-white/80 font-medium mb-3 text-center">
            📈 {getDateRangeLabel(dateRange)}の変動
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'weight', label: '体重', unit: 'kg', data: periodChanges.weight },
              { key: 'bmi', label: 'BMI', unit: '', data: periodChanges.bmi },
              { key: 'bodyFat', label: '体脂肪率', unit: '%', data: periodChanges.bodyFat },
              { key: 'muscleMass', label: '筋肉量', unit: 'kg', data: periodChanges.muscleMass },
              { key: 'visceralFat', label: '内臓脂肪', unit: '', data: periodChanges.visceralFat },
              { key: 'calories', label: 'カロリー', unit: 'kcal', data: periodChanges.calories }
            ].map((item) => {
              const hasChange = item.data.change !== null && item.data.change !== undefined
              const isPositiveChange = hasChange && item.data.change! > 0
              const isNegativeChange = hasChange && item.data.change! < 0
              
              return (
                <div 
                  key={item.key}
                  className="bg-white/5 rounded-lg p-3 text-center"
                  data-testid={`period-change-${item.key}`}
                >
                  <div className="text-xs text-white/60 mb-1">{item.label}</div>
                  {hasChange ? (
                    <div className={`text-sm font-medium flex items-center justify-center gap-1 ${
                      isPositiveChange ? 'text-red-300' : isNegativeChange ? 'text-green-300' : 'text-white/80'
                    }`}>
                      <span>
                        {isPositiveChange ? '↗' : isNegativeChange ? '↙' : '→'}
                      </span>
                      <span data-testid={`period-change-${item.key}-value`}>
                        {isPositiveChange ? '+' : ''}{item.data.change!.toFixed(1)}{item.unit}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-white/40">
                      データなし
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {periodChanges.currentDate && periodChanges.previousDate && (
            <div className="text-xs text-white/50 text-center mt-3">
              {formatFullDate(periodChanges.previousDate)} → {formatFullDate(periodChanges.currentDate)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}