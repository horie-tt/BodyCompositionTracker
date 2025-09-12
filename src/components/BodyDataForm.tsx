'use client'

import React, { useState, useEffect } from 'react'
import { BodyData, BodyDataFormProps } from '@/types'
import { validateBodyData } from '@/lib/api'
import { getCurrentDateInTimezone } from '@/lib/timezone'

export default function BodyDataForm({ onSubmit, isLoading = false }: BodyDataFormProps) {
  const [formData, setFormData] = useState<Partial<BodyData>>({
    date: '', // Will be set by useEffect to avoid SSR mismatch
    weight: undefined,
    bmi: undefined,
    body_fat: undefined,
    muscle_mass: undefined,
    visceral_fat: undefined,
    calories: undefined,
  })

  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<string>('データを入力して記録しましょう')

  // Set current date in user's timezone on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && formData.date === '') {
      const currentDate = getCurrentDateInTimezone();
      setFormData(prev => ({
        ...prev,
        date: currentDate
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  const handleInputChange = (field: keyof BodyData, value: string) => {
    const numericValue = value === '' ? undefined : Number(value)
    setFormData(prev => ({
      ...prev,
      [field]: field === 'date' ? value : numericValue,
    }))
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const validationErrors = validateBodyData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setStatus('入力内容を確認してください')
      return
    }

    try {
      setStatus('保存中...')
      await onSubmit(formData as BodyData)
      setStatus('保存が完了しました！')
      
      // Reset form (keep date)
      setFormData(prev => ({
        date: prev.date,
        weight: undefined,
        bmi: undefined,
        body_fat: undefined,
        muscle_mass: undefined,
        visceral_fat: undefined,
        calories: undefined,
      }))
    } catch (error) {
      setStatus('保存に失敗しました。もう一度お試しください。')
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      <form onSubmit={handleSubmit} data-testid="body-data-form">
        <div className="space-y-4">
          {/* Date Input */}
          <div className="w-full">
            <label htmlFor="date" className="block text-sm font-medium text-white/90 mb-1">
              日付
            </label>
            <input
              type="date"
              id="date"
              data-testid="date-input"
              value={formData.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            />
          </div>

          {/* Weight and BMI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="weight" className="block text-sm font-medium text-white/90 mb-1">
                体重
              </label>
              <input
                type="number"
                id="weight"
                data-testid="weight-input"
                placeholder="70.00"
                step="0.01"
                min="20"
                max="200"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                required
                className="w-full px-3 py-2 pr-8 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              />
              <span className="absolute right-3 top-8 text-white/60 text-sm">kg</span>
            </div>
            
            <div className="relative">
              <label htmlFor="bmi" className="block text-sm font-medium text-white/90 mb-1">
                BMI
              </label>
              <input
                type="number"
                id="bmi"
                data-testid="bmi-input"
                placeholder="22.00"
                step="0.01"
                min="10"
                max="50"
                value={formData.bmi || ''}
                onChange={(e) => handleInputChange('bmi', e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              />
            </div>
          </div>

          {/* Body Fat and Muscle Mass Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="body_fat" className="block text-sm font-medium text-white/90 mb-1">
                体脂肪率
              </label>
              <input
                type="number"
                id="body_fat"
                data-testid="body-fat-input"
                placeholder="15.00"
                step="0.01"
                min="0"
                max="50"
                value={formData.body_fat || ''}
                onChange={(e) => handleInputChange('body_fat', e.target.value)}
                className="w-full px-3 py-2 pr-8 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              />
              <span className="absolute right-3 top-8 text-white/60 text-sm">%</span>
            </div>
            
            <div className="relative">
              <label htmlFor="muscle_mass" className="block text-sm font-medium text-white/90 mb-1">
                筋肉量
              </label>
              <input
                type="number"
                id="muscle_mass"
                data-testid="muscle-mass-input"
                placeholder="55.00"
                step="0.01"
                min="0"
                max="100"
                value={formData.muscle_mass || ''}
                onChange={(e) => handleInputChange('muscle_mass', e.target.value)}
                className="w-full px-3 py-2 pr-8 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              />
              <span className="absolute right-3 top-8 text-white/60 text-sm">kg</span>
            </div>
          </div>

          {/* Visceral Fat and Calories Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="visceral_fat" className="block text-sm font-medium text-white/90 mb-1">
                内臓脂肪量
              </label>
              <input
                type="number"
                id="visceral_fat"
                data-testid="visceral-fat-input"
                placeholder="8.00"
                step="0.01"
                min="0"
                max="30"
                value={formData.visceral_fat || ''}
                onChange={(e) => handleInputChange('visceral_fat', e.target.value)}
                className="w-full px-3 py-2 pr-12 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              />
              <span className="absolute right-3 top-8 text-white/60 text-sm">レベル</span>
            </div>
            
            <div className="relative">
              <label htmlFor="calories" className="block text-sm font-medium text-white/90 mb-1">
                消費カロリー
              </label>
              <input
                type="number"
                id="calories"
                data-testid="calories-input"
                placeholder="2200"
                step="1"
                min="0"
                max="5000"
                value={formData.calories || ''}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                className="w-full px-3 py-2 pr-12 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
              />
              <span className="absolute right-3 top-8 text-white/60 text-sm">kcal</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          data-testid="submit-button"
          disabled={isLoading}
          className="w-full mt-6 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-3 px-6 rounded-lg border border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '記録を保存'}
        </button>

        {/* Status Message */}
        <div 
          className={`mt-4 text-center text-sm ${
            errors.length > 0 ? 'text-red-300' : 'text-white/80'
          }`}
          data-testid="status-message"
        >
          {errors.length > 0 ? errors.join(', ') : status}
        </div>
      </form>
    </div>
  )
}