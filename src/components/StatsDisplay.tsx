'use client'

import React from 'react'
import { StatsDisplayProps, LatestDataItem } from '@/types'
// Import utility functions directly to avoid Supabase import issues in tests
const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ja-JP')
}

export default function StatsDisplay({ data, isLoading = false }: StatsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded mb-1"></div>
              <div className="h-3 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDataItem = (
    item: LatestDataItem, 
    label: string, 
    unit: string,
    testId: string
  ) => {
    const hasCurrentValue = item.current !== null && item.current !== undefined
    const hasChange = item.change !== null && item.change !== undefined
    const isPositiveChange = hasChange && item.change! > 0
    const isNegativeChange = hasChange && item.change! < 0
    
    return (
      <div className="text-center" data-testid={testId}>
        <div className="text-2xl md:text-3xl font-light text-white mb-1">
          <span data-testid={`${testId}-value`}>
            {hasCurrentValue ? formatNumber(item.current!, 1) : '--'}
          </span>
          {hasCurrentValue && unit && (
            <span className="text-lg text-white/70 ml-1">
              {unit}
            </span>
          )}
        </div>
        <div className="text-sm text-white/80 font-medium mb-1">
          {label}
        </div>
        {hasChange && (
          <div className={`text-xs font-medium flex items-center justify-center gap-1 ${
            isPositiveChange ? 'text-red-300' : isNegativeChange ? 'text-green-300' : 'text-white/60'
          }`} data-testid={`${testId}-change`}>
            <span>
              {isPositiveChange ? '↗' : isNegativeChange ? '↙' : '→'}
            </span>
            <span>
              {isPositiveChange ? '+' : ''}{formatNumber(item.change!, 1)}{unit}
            </span>
            {item.changePercent !== null && (
              <span className="text-white/50">
                ({isPositiveChange ? '+' : ''}{formatNumber(item.changePercent, 1)}%)
              </span>
            )}
          </div>
        )}
        {!hasChange && item.previous === null && (
          <div className="text-xs text-white/50">
            初回計測
          </div>
        )}
      </div>
    )
  }

  const { latestData } = data

  const stats = [
    {
      item: latestData.weight,
      label: '体重',
      unit: 'kg',
      testId: 'weight-stat'
    },
    {
      item: latestData.bmi,
      label: 'BMI',
      unit: '',
      testId: 'bmi-stat'
    },
    {
      item: latestData.bodyFat,
      label: '体脂肪率',
      unit: '%',
      testId: 'body-fat-stat'
    },
    {
      item: latestData.muscleMass,
      label: '筋肉量',
      unit: 'kg',
      testId: 'muscle-mass-stat'
    },
    {
      item: latestData.visceralFat,
      label: '内臓脂肪',
      unit: '',
      testId: 'visceral-fat-stat'
    },
    {
      item: latestData.calories,
      label: 'カロリー',
      unit: 'kcal',
      testId: 'calories-stat'
    }
  ]

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index}>
            {renderDataItem(stat.item, stat.label, stat.unit, stat.testId)}
          </div>
        ))}
      </div>
      
      {/* Measurement Date Info */}
      {latestData.measurementDate && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-xs text-white/60 text-center">
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <span>
                📊 最新: {formatDate(latestData.measurementDate)}
              </span>
              {latestData.previousDate && (
                <span>
                  📋 前回: {formatDate(latestData.previousDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}