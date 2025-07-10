'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { ChartContainerProps } from '@/types'

Chart.register(...registerables)

export default function ChartContainer({ data, activeTab, onTabChange }: ChartContainerProps) {
  const weightChartRef = useRef<HTMLCanvasElement>(null)
  const compositionChartRef = useRef<HTMLCanvasElement>(null)
  const caloriesChartRef = useRef<HTMLCanvasElement>(null)
  const chartsRef = useRef<{ [key: string]: Chart | null }>({})

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
        labels: data.map(d => formatDate(d.date)),
        datasets: [{
          label: '体重 (kg)',
          data: data.map(d => d.weight),
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
  }, [data])

  const initCompositionChart = useCallback(() => {
    if (!compositionChartRef.current) return

    const ctx = compositionChartRef.current.getContext('2d')
    if (!ctx) return

    if (chartsRef.current.composition) {
      chartsRef.current.composition.destroy()
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.map(d => formatDate(d.date)),
        datasets: [
          {
            label: '体脂肪率 (%)',
            data: data.map(d => d.body_fat || 0),
            borderColor: '#ff6b9d',
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            pointBackgroundColor: '#ff6b9d',
            pointBorderColor: '#ff6b9d',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
            fill: false
          },
          {
            label: '筋肉量 (kg)',
            data: data.map(d => d.muscle_mass || 0),
            borderColor: '#6bcf7f',
            backgroundColor: 'rgba(107, 207, 127, 0.1)',
            pointBackgroundColor: '#6bcf7f',
            pointBorderColor: '#6bcf7f',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
            fill: false
          }
        ]
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: getChartOptions('') as any
    }

    chartsRef.current.composition = new Chart(ctx, config)
  }, [data])

  const initCaloriesChart = useCallback(() => {
    if (!caloriesChartRef.current) return

    const ctx = caloriesChartRef.current.getContext('2d')
    if (!ctx) return

    if (chartsRef.current.calories) {
      chartsRef.current.calories.destroy()
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(d => formatDate(d.date)),
        datasets: [{
          label: '消費カロリー (kcal)',
          data: data.map(d => d.calories || 0),
          backgroundColor: 'rgba(255, 211, 61, 0.6)',
          borderColor: '#ffd93d',
          borderWidth: 1
        }]
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: getChartOptions('kcal') as any
    }

    chartsRef.current.calories = new Chart(ctx, config)
  }, [data])

  const initCharts = useCallback(() => {
    initWeightChart()
    initCompositionChart()
    initCaloriesChart()
  }, [initWeightChart, initCompositionChart, initCaloriesChart])

  useEffect(() => {
    if (data.length > 0) {
      initCharts()
    }
    
    return () => {
      // Cleanup charts on unmount
      const charts = chartsRef.current
      Object.values(charts).forEach(chart => {
        if (chart) {
          chart.destroy()
        }
      })
    }
  }, [data, initCharts])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
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



  const handleTabClick = (tab: 'weight' | 'composition' | 'calories') => {
    onTabChange(tab)
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
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
          onClick={() => handleTabClick('composition')}
          className={`flex-1 py-3 px-2 text-center rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 ${
            activeTab === 'composition'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/70 hover:text-white/90'
          }`}
          data-testid="composition-tab"
        >
          体組成
        </button>
        <button
          onClick={() => handleTabClick('calories')}
          className={`flex-1 py-3 px-2 text-center rounded-lg text-xs font-medium cursor-pointer transition-all duration-300 ${
            activeTab === 'calories'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/70 hover:text-white/90'
          }`}
          data-testid="calories-tab"
        >
          カロリー
        </button>
      </div>

      {/* Chart Containers */}
      <div className="relative h-80">
        {data.length === 0 ? (
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
              className={`absolute inset-0 ${activeTab === 'composition' ? 'block' : 'hidden'}`}
              data-testid="composition-chart-container"
            >
              <canvas
                ref={compositionChartRef}
                data-testid="composition-chart"
                className="w-full h-full"
              />
            </div>
            
            <div
              className={`absolute inset-0 ${activeTab === 'calories' ? 'block' : 'hidden'}`}
              data-testid="calories-chart-container"
            >
              <canvas
                ref={caloriesChartRef}
                data-testid="calories-chart"
                className="w-full h-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}