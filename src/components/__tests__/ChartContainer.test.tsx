import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ChartContainer from '../ChartContainer'
import { BodyData, DateRange } from '@/types'

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('chart.js', () => {
  const ChartMock = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    resize: jest.fn(),
  }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ChartMock as any).register = jest.fn()
  
  return {
    Chart: ChartMock,
    registerables: [],
  }
})

// Mock HTML Canvas Element getContext method
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    resetTransform: jest.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    strokeStyle: '#000000',
    fillStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    imageSmoothingEnabled: true,
  }),
  writable: true,
  configurable: true,
})

describe('ChartContainer', () => {
  const mockOnTabChange = jest.fn()
  const mockOnDateRangeChange = jest.fn()
  
  // Use recent dates to ensure data appears in date range filters
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const dayBefore = new Date(today)
  dayBefore.setDate(today.getDate() - 2)

  const mockData: BodyData[] = [
    {
      id: 1,
      date: dayBefore.toISOString().split('T')[0],
      weight: 70.5,
      bmi: 22.1,
      body_fat: 15.2,
      muscle_mass: 55.3,
      calories: 2200,
    },
    {
      id: 2,
      date: yesterday.toISOString().split('T')[0],
      weight: 70.0,
      bmi: 21.9,
      body_fat: 15.0,
      muscle_mass: 55.5,
      calories: 2150,
    },
    {
      id: 3,
      date: today.toISOString().split('T')[0],
      weight: 69.8,
      bmi: 21.8,
      body_fat: 14.8,
      muscle_mass: 55.7,
      calories: 2300,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    data: [],
    activeTab: 'weight' as const,
    onTabChange: mockOnTabChange,
    dateRange: '1week' as DateRange,
    onDateRangeChange: mockOnDateRangeChange,
  }

  it('renders chart tabs correctly', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    expect(screen.getByTestId('weight-tab')).toBeInTheDocument()
    expect(screen.getByTestId('body-fat-tab')).toBeInTheDocument()
    expect(screen.getByTestId('muscle-tab')).toBeInTheDocument()
  })

  it('displays correct tab labels', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    expect(screen.getByText('体重')).toBeInTheDocument()
    expect(screen.getByText('体脂肪率')).toBeInTheDocument()
    expect(screen.getByText('筋肉量')).toBeInTheDocument()
  })

  it('highlights active tab correctly', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    const weightTab = screen.getByTestId('weight-tab')
    const bodyFatTab = screen.getByTestId('body-fat-tab')
    const muscleTab = screen.getByTestId('muscle-tab')

    expect(weightTab).toHaveClass('bg-white/20', 'text-white')
    expect(bodyFatTab).toHaveClass('text-white/70')
    expect(muscleTab).toHaveClass('text-white/70')
  })

  it('calls onTabChange when tab is clicked', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    fireEvent.click(screen.getByTestId('body-fat-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('bodyFat')

    fireEvent.click(screen.getByTestId('muscle-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('muscle')
  })

  it('shows correct chart container based on active tab', () => {
    const { rerender } = render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
        activeTab="weight"
      />
    )

    expect(screen.getByTestId('weight-chart-container')).toHaveClass('block')
    expect(screen.getByTestId('body-fat-chart-container')).toHaveClass('hidden')
    expect(screen.getByTestId('muscle-chart-container')).toHaveClass('hidden')

    rerender(
      <ChartContainer
        {...defaultProps}
        data={mockData}
        activeTab="bodyFat"
      />
    )

    expect(screen.getByTestId('weight-chart-container')).toHaveClass('hidden')
    expect(screen.getByTestId('body-fat-chart-container')).toHaveClass('block')
    expect(screen.getByTestId('muscle-chart-container')).toHaveClass('hidden')
  })

  it('renders canvas elements for each chart', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    expect(screen.getByTestId('weight-chart')).toBeInTheDocument()
    expect(screen.getByTestId('body-fat-chart')).toBeInTheDocument()
    expect(screen.getByTestId('muscle-chart')).toBeInTheDocument()
  })

  it('displays empty state when no data is provided', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={[]}
      />
    )

    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('applies correct styling to chart container', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    const container = screen.getByTestId('weight-tab').parentElement?.parentElement
    expect(container).toHaveClass('bg-white/10', 'backdrop-blur-sm', 'rounded-2xl')
  })

  it('handles tab change for all three tabs', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    // Test weight tab
    fireEvent.click(screen.getByTestId('weight-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('weight')

    // Test body fat tab
    fireEvent.click(screen.getByTestId('body-fat-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('bodyFat')

    // Test muscle tab
    fireEvent.click(screen.getByTestId('muscle-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('muscle')

    expect(mockOnTabChange).toHaveBeenCalledTimes(3)
  })

  it('renders with different active tabs correctly', () => {
    // Test body fat tab active
    const { rerender } = render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
        activeTab="bodyFat"
      />
    )

    expect(screen.getByTestId('body-fat-tab')).toHaveClass('bg-white/20', 'text-white')
    expect(screen.getByTestId('weight-tab')).toHaveClass('text-white/70')
    expect(screen.getByTestId('muscle-tab')).toHaveClass('text-white/70')

    // Test muscle tab active
    rerender(
      <ChartContainer
        {...defaultProps}
        data={mockData}
        activeTab="muscle"
      />
    )

    expect(screen.getByTestId('muscle-tab')).toHaveClass('bg-white/20', 'text-white')
    expect(screen.getByTestId('weight-tab')).toHaveClass('text-white/70')
    expect(screen.getByTestId('body-fat-tab')).toHaveClass('text-white/70')
  })

  it('maintains chart container structure with data', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    // Check that chart containers exist
    expect(screen.getByTestId('weight-chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('body-fat-chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('muscle-chart-container')).toBeInTheDocument()

    // Check that canvas elements exist
    expect(screen.getByTestId('weight-chart')).toBeInTheDocument()
    expect(screen.getByTestId('body-fat-chart')).toBeInTheDocument()
    expect(screen.getByTestId('muscle-chart')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={[]}
      />
    )

    // Should still render tabs
    expect(screen.getByTestId('weight-tab')).toBeInTheDocument()
    expect(screen.getByTestId('body-fat-tab')).toBeInTheDocument()
    expect(screen.getByTestId('muscle-tab')).toBeInTheDocument()

    // Should show empty state
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('applies correct hover styles to inactive tabs', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    const bodyFatTab = screen.getByTestId('body-fat-tab')
    const muscleTab = screen.getByTestId('muscle-tab')

    expect(bodyFatTab).toHaveClass('hover:text-white/90')
    expect(muscleTab).toHaveClass('hover:text-white/90')
  })

  it('renders date range selector correctly', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    expect(screen.getByTestId('date-range-1week')).toBeInTheDocument()
    expect(screen.getByTestId('date-range-1month')).toBeInTheDocument()
    expect(screen.getByTestId('date-range-3months')).toBeInTheDocument()
    expect(screen.getByTestId('date-range-all')).toBeInTheDocument()
  })

  it('calls onDateRangeChange when date range is clicked', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
      />
    )

    fireEvent.click(screen.getByTestId('date-range-1month'))
    expect(mockOnDateRangeChange).toHaveBeenCalledWith('1month')

    fireEvent.click(screen.getByTestId('date-range-3months'))
    expect(mockOnDateRangeChange).toHaveBeenCalledWith('3months')
  })

  it('highlights active date range correctly', () => {
    render(
      <ChartContainer
        {...defaultProps}
        data={mockData}
        dateRange="1month"
      />
    )

    const weekButton = screen.getByTestId('date-range-1week')
    const monthButton = screen.getByTestId('date-range-1month')

    expect(weekButton).toHaveClass('text-white/60')
    expect(monthButton).toHaveClass('bg-white/20', 'text-white')
  })
})