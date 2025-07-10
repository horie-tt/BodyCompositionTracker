import React from 'react'
import { render, screen } from '@testing-library/react'
import StatsDisplay from '../StatsDisplay'
import { StatsData } from '@/types'

// Mock the formatNumber function
jest.mock('@/lib/api', () => ({
  formatNumber: jest.fn((num: number, decimals: number = 1) => num.toFixed(decimals))
}))

describe('StatsDisplay', () => {
  const mockStatsData: StatsData = {
    avgWeight: 70.5,
    avgBMI: 22.1,
    totalRecords: 15,
    latestRecord: {
      id: 1,
      date: '2024-01-15',
      weight: 71.0,
      bmi: 22.3,
    }
  }

  it('renders all statistics correctly', () => {
    render(<StatsDisplay data={mockStatsData} />)

    // Check if all stat components are rendered
    expect(screen.getByTestId('avg-weight-stat')).toBeInTheDocument()
    expect(screen.getByTestId('avg-bmi-stat')).toBeInTheDocument()
    expect(screen.getByTestId('total-records-stat')).toBeInTheDocument()
  })

  it('displays correct values for all statistics', () => {
    render(<StatsDisplay data={mockStatsData} />)

    // Check stat values
    expect(screen.getByTestId('avg-weight-value')).toHaveTextContent('70.5')
    expect(screen.getByTestId('avg-bmi-value')).toHaveTextContent('22.1')
    expect(screen.getByTestId('total-records-value')).toHaveTextContent('15')
  })

  it('displays units correctly', () => {
    render(<StatsDisplay data={mockStatsData} />)

    // Check that kg unit is displayed for weight
    expect(screen.getByTestId('avg-weight-stat')).toHaveTextContent('kg')
    
    // Check that BMI and records don't have units
    expect(screen.getByTestId('avg-bmi-stat')).not.toHaveTextContent('kg')
    expect(screen.getByTestId('total-records-stat')).not.toHaveTextContent('kg')
  })

  it('displays latest record information when available', () => {
    render(<StatsDisplay data={mockStatsData} />)

    expect(screen.getByText(/最新記録:/)).toBeInTheDocument()
    expect(screen.getByText(/2024\/1\/15/)).toBeInTheDocument()
    expect(screen.getByText(/体重 71.0kg/)).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const zeroStatsData: StatsData = {
      avgWeight: 0,
      avgBMI: 0,
      totalRecords: 0,
    }

    render(<StatsDisplay data={zeroStatsData} />)

    expect(screen.getByTestId('avg-weight-value')).toHaveTextContent('--')
    expect(screen.getByTestId('avg-bmi-value')).toHaveTextContent('--')
    expect(screen.getByTestId('total-records-value')).toHaveTextContent('0')
  })

  it('handles missing latest record', () => {
    const statsDataWithoutLatest: StatsData = {
      avgWeight: 70.5,
      avgBMI: 22.1,
      totalRecords: 15,
    }

    render(<StatsDisplay data={statsDataWithoutLatest} />)

    expect(screen.queryByText(/最新記録:/)).not.toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    const { container } = render(<StatsDisplay data={mockStatsData} isLoading={true} />)

    // Check for loading skeleton
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    
    // Check that actual stats are not rendered
    expect(screen.queryByTestId('avg-weight-stat')).not.toBeInTheDocument()
    expect(screen.queryByTestId('avg-bmi-stat')).not.toBeInTheDocument()
    expect(screen.queryByTestId('total-records-stat')).not.toBeInTheDocument()
  })

  it('displays correct number of loading skeletons', () => {
    const { container } = render(<StatsDisplay data={mockStatsData} isLoading={true} />)

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(3)
  })

  it('applies correct styling classes', () => {
    render(<StatsDisplay data={mockStatsData} />)

    const component = screen.getByTestId('avg-weight-stat').parentElement?.parentElement
    expect(component).toHaveClass('bg-white/10', 'backdrop-blur-sm', 'rounded-2xl')
  })

  it('displays labels correctly', () => {
    render(<StatsDisplay data={mockStatsData} />)

    expect(screen.getByText('平均体重')).toBeInTheDocument()
    expect(screen.getByText('平均BMI')).toBeInTheDocument()
    expect(screen.getByText('記録数')).toBeInTheDocument()
  })

  it('handles latest record without weight', () => {
    const statsDataWithoutWeight: StatsData = {
      avgWeight: 70.5,
      avgBMI: 22.1,
      totalRecords: 15,
      latestRecord: {
        id: 1,
        date: '2024-01-15',
        weight: 0, // No weight data
        bmi: 22.3,
      }
    }

    render(<StatsDisplay data={statsDataWithoutWeight} />)

    expect(screen.getByText(/最新記録:/)).toBeInTheDocument()
    expect(screen.getByText(/2024\/1\/15/)).toBeInTheDocument()
    // Should not display weight info when weight is 0
    expect(screen.queryByText(/体重.*kg/)).not.toBeInTheDocument()
  })

  it('formats numbers correctly', () => {
    const preciseStatsData: StatsData = {
      avgWeight: 70.567,
      avgBMI: 22.123,
      totalRecords: 15,
    }

    render(<StatsDisplay data={preciseStatsData} />)

    // Should format to 1 decimal place
    expect(screen.getByTestId('avg-weight-value')).toHaveTextContent('70.6')
    expect(screen.getByTestId('avg-bmi-value')).toHaveTextContent('22.1')
  })
})