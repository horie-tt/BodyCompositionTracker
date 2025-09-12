import React from 'react'
import { render, screen } from '@testing-library/react'
import StatsDisplay from '../StatsDisplay'
import { LatestStatsData } from '@/types'

describe('StatsDisplay', () => {
  const mockLatestStatsData: LatestStatsData = {
    latestData: {
      weight: {
        current: 70.5,
        previous: 71.0,
        change: -0.5,
        changePercent: -0.7
      },
      bmi: {
        current: 22.1,
        previous: 22.3,
        change: -0.2,
        changePercent: -0.9
      },
      bodyFat: {
        current: 15.2,
        previous: 15.8,
        change: -0.6,
        changePercent: -3.8
      },
      muscleMass: {
        current: 55.3,
        previous: 55.0,
        change: 0.3,
        changePercent: 0.5
      },
      visceralFat: {
        current: 8.0,
        previous: 8.2,
        change: -0.2,
        changePercent: -2.4
      },
      calories: {
        current: 2200,
        previous: 2150,
        change: 50,
        changePercent: 2.3
      },
      measurementDate: '2024-01-15',
      previousDate: '2024-01-14'
    }
  }

  const emptyLatestStatsData: LatestStatsData = {
    latestData: {
      weight: { current: null, previous: null, change: null, changePercent: null },
      bmi: { current: null, previous: null, change: null, changePercent: null },
      bodyFat: { current: null, previous: null, change: null, changePercent: null },
      muscleMass: { current: null, previous: null, change: null, changePercent: null },
      visceralFat: { current: null, previous: null, change: null, changePercent: null },
      calories: { current: null, previous: null, change: null, changePercent: null },
      measurementDate: null,
      previousDate: null
    }
  }

  const firstMeasurementData: LatestStatsData = {
    latestData: {
      weight: { current: 70.5, previous: null, change: null, changePercent: null },
      bmi: { current: 22.1, previous: null, change: null, changePercent: null },
      bodyFat: { current: 15.2, previous: null, change: null, changePercent: null },
      muscleMass: { current: 55.3, previous: null, change: null, changePercent: null },
      visceralFat: { current: 8.0, previous: null, change: null, changePercent: null },
      calories: { current: 2200, previous: null, change: null, changePercent: null },
      measurementDate: '2024-01-15',
      previousDate: null
    }
  }

  it('renders loading state correctly', () => {
    render(<StatsDisplay data={emptyLatestStatsData} isLoading={true} />)
    
    // Should show 6 loading placeholders (for 6 stats)
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6)
  })

  it('renders empty state correctly', () => {
    render(<StatsDisplay data={emptyLatestStatsData} />)
    
    // All values should show "--"
    expect(screen.getAllByText('--')).toHaveLength(6)
    
    // Should show labels
    expect(screen.getByText('体重')).toBeInTheDocument()
    expect(screen.getByText('BMI')).toBeInTheDocument()
    expect(screen.getByText('体脂肪率')).toBeInTheDocument()
    expect(screen.getByText('筋肉量')).toBeInTheDocument()
    expect(screen.getByText('内臓脂肪')).toBeInTheDocument()
    expect(screen.getByText('カロリー')).toBeInTheDocument()
  })

  it('renders first measurement correctly', () => {
    render(<StatsDisplay data={firstMeasurementData} />)
    
    // Should show current values
    expect(screen.getByTestId('weight-stat-value')).toHaveTextContent('70.5')
    expect(screen.getByTestId('bmi-stat-value')).toHaveTextContent('22.1')
    expect(screen.getByTestId('body-fat-stat-value')).toHaveTextContent('15.2')
    expect(screen.getByTestId('muscle-mass-stat-value')).toHaveTextContent('55.3')
    expect(screen.getByTestId('visceral-fat-stat-value')).toHaveTextContent('8.0')
    expect(screen.getByTestId('calories-stat-value')).toHaveTextContent('2200.0')
    
    // Should show "初回計測" for all items since no previous data
    expect(screen.getAllByText('初回計測')).toHaveLength(6)
    
    // Should show measurement date
    expect(screen.getByText('📊 最新: 2024/1/15')).toBeInTheDocument()
  })

  it('renders latest data with changes correctly', () => {
    render(<StatsDisplay data={mockLatestStatsData} />)
    
    // Should show current values
    expect(screen.getByTestId('weight-stat-value')).toHaveTextContent('70.5')
    expect(screen.getByTestId('bmi-stat-value')).toHaveTextContent('22.1')
    expect(screen.getByTestId('body-fat-stat-value')).toHaveTextContent('15.2')
    expect(screen.getByTestId('muscle-mass-stat-value')).toHaveTextContent('55.3')
    expect(screen.getByTestId('visceral-fat-stat-value')).toHaveTextContent('8.0')
    expect(screen.getByTestId('calories-stat-value')).toHaveTextContent('2200.0')
    
    // Should show measurement dates
    expect(screen.getByText('📊 最新: 2024/1/15')).toBeInTheDocument()
    expect(screen.getByText('📋 前回: 2024/1/14')).toBeInTheDocument()
  })

  it('shows positive changes correctly', () => {
    render(<StatsDisplay data={mockLatestStatsData} />)
    
    // Muscle mass and calories should show positive changes with red color and up arrow
    const muscleMassChange = screen.getByTestId('muscle-mass-stat-change')
    const caloriesChange = screen.getByTestId('calories-stat-change')
    
    expect(muscleMassChange).toHaveTextContent('↗')
    expect(muscleMassChange).toHaveTextContent('+0.3kg')
    expect(muscleMassChange).toHaveTextContent('(+0.5%)')
    expect(muscleMassChange).toHaveClass('text-red-300')
    
    expect(caloriesChange).toHaveTextContent('↗')
    expect(caloriesChange).toHaveTextContent('+50.0kcal')
    expect(caloriesChange).toHaveTextContent('(+2.3%)')
    expect(caloriesChange).toHaveClass('text-red-300')
  })

  it('shows negative changes correctly', () => {
    render(<StatsDisplay data={mockLatestStatsData} />)
    
    // Weight, BMI, body fat, and visceral fat should show negative changes with green color and down arrow
    const weightChange = screen.getByTestId('weight-stat-change')
    const bmiChange = screen.getByTestId('bmi-stat-change')
    const bodyFatChange = screen.getByTestId('body-fat-stat-change')
    const visceralFatChange = screen.getByTestId('visceral-fat-stat-change')
    
    expect(weightChange).toHaveTextContent('↙')
    expect(weightChange).toHaveTextContent('-0.5kg')
    expect(weightChange).toHaveTextContent('(-0.7%)')
    expect(weightChange).toHaveClass('text-green-300')
    
    expect(bmiChange).toHaveTextContent('↙')
    expect(bmiChange).toHaveTextContent('-0.2')
    expect(bmiChange).toHaveTextContent('(-0.9%)')
    expect(bmiChange).toHaveClass('text-green-300')
    
    expect(bodyFatChange).toHaveTextContent('↙')
    expect(bodyFatChange).toHaveTextContent('-0.6%')
    expect(bodyFatChange).toHaveTextContent('(-3.8%)')
    expect(bodyFatChange).toHaveClass('text-green-300')
    
    expect(visceralFatChange).toHaveTextContent('↙')
    expect(visceralFatChange).toHaveTextContent('-0.2')
    expect(visceralFatChange).toHaveTextContent('(-2.4%)')
    expect(visceralFatChange).toHaveClass('text-green-300')
  })

  it('applies correct styling to container', () => {
    render(<StatsDisplay data={mockLatestStatsData} />)
    
    const container = screen.getByTestId('weight-stat').parentElement?.parentElement?.parentElement
    expect(container).toHaveClass('bg-white/10', 'backdrop-blur-sm', 'rounded-2xl')
  })

  it('shows units correctly for different metrics', () => {
    render(<StatsDisplay data={mockLatestStatsData} />)
    
    // Weight should have kg unit
    const weightStat = screen.getByTestId('weight-stat')
    expect(weightStat).toHaveTextContent('kg')
    
    // BMI should not have unit in the value itself, but may have % in change
    const bmiStat = screen.getByTestId('bmi-stat')
    expect(bmiStat).not.toHaveTextContent('kg')
    expect(bmiStat).not.toHaveTextContent('kcal')
    // BMI change can contain % in the change percentage display
    const bmiValue = screen.getByTestId('bmi-stat-value')
    expect(bmiValue).not.toHaveTextContent('%')
    expect(bmiValue).not.toHaveTextContent('kg')
    expect(bmiValue).not.toHaveTextContent('kcal')
    
    // Body fat should have % unit
    const bodyFatStat = screen.getByTestId('body-fat-stat')
    expect(bodyFatStat).toHaveTextContent('%')
    
    // Muscle mass should have kg unit
    const muscleMassStat = screen.getByTestId('muscle-mass-stat')
    expect(muscleMassStat).toHaveTextContent('kg')
    
    // Calories should have kcal unit
    const caloriesStat = screen.getByTestId('calories-stat')
    expect(caloriesStat).toHaveTextContent('kcal')
  })
})