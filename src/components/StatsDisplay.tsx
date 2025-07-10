'use client'

import React from 'react'
import { StatsDisplayProps } from '@/types'
import { formatNumber } from '@/lib/api'

export default function StatsDisplay({ data, isLoading = false }: StatsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      id: 'avg-weight',
      value: data.avgWeight > 0 ? formatNumber(data.avgWeight, 1) : '--',
      label: '平均体重',
      unit: 'kg',
      testId: 'avg-weight-stat'
    },
    {
      id: 'avg-bmi',
      value: data.avgBMI > 0 ? formatNumber(data.avgBMI, 1) : '--',
      label: '平均BMI',
      unit: '',
      testId: 'avg-bmi-stat'
    },
    {
      id: 'total-records',
      value: data.totalRecords.toString(),
      label: '記録数',
      unit: '',
      testId: 'total-records-stat'
    }
  ]

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="text-center" data-testid={stat.testId}>
            <div className="text-2xl md:text-3xl font-light text-white mb-1">
              <span data-testid={`${stat.id}-value`}>
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-lg text-white/70 ml-1">
                  {stat.unit}
                </span>
              )}
            </div>
            <div className="text-sm text-white/80 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Latest Record Info */}
      {data.latestRecord && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-xs text-white/60 text-center">
            最新記録: {new Date(data.latestRecord.date).toLocaleDateString('ja-JP')}
            {data.latestRecord.weight && (
              <span className="ml-2">
                体重 {formatNumber(data.latestRecord.weight, 1)}kg
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}