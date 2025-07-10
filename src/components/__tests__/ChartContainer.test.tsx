import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ChartContainer from '../ChartContainer'
import { BodyData } from '@/types'

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('chart.js', () => {
  const ChartMock = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    resize: jest.fn(),
  }))
  ChartMock.register = jest.fn()
  
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
  
  const mockData: BodyData[] = [
    {
      id: 1,
      date: '2024-01-01',
      weight: 70.5,
      bmi: 22.1,
      body_fat: 15.2,
      muscle_mass: 55.3,
      calories: 2200,
    },
    {
      id: 2,
      date: '2024-01-02',
      weight: 70.0,
      bmi: 21.9,
      body_fat: 15.0,
      muscle_mass: 55.5,
      calories: 2150,
    },
    {
      id: 3,
      date: '2024-01-03',
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

  it('renders chart tabs correctly', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('weight-tab')).toBeInTheDocument()
    expect(screen.getByTestId('composition-tab')).toBeInTheDocument()
    expect(screen.getByTestId('calories-tab')).toBeInTheDocument()
  })

  it('displays correct tab labels', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByText('体重')).toBeInTheDocument()
    expect(screen.getByText('体組成')).toBeInTheDocument()
    expect(screen.getByText('カロリー')).toBeInTheDocument()
  })

  it('highlights active tab correctly', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    const weightTab = screen.getByTestId('weight-tab')
    const compositionTab = screen.getByTestId('composition-tab')
    const caloriesTab = screen.getByTestId('calories-tab')

    expect(weightTab).toHaveClass('bg-white/20', 'text-white')
    expect(compositionTab).toHaveClass('text-white/70')
    expect(caloriesTab).toHaveClass('text-white/70')
  })

  it('calls onTabChange when tab is clicked', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    fireEvent.click(screen.getByTestId('composition-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('composition')

    fireEvent.click(screen.getByTestId('calories-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('calories')
  })

  it('shows correct chart container based on active tab', () => {
    const { rerender } = render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('weight-chart-container')).toHaveClass('block')
    expect(screen.getByTestId('composition-chart-container')).toHaveClass('hidden')
    expect(screen.getByTestId('calories-chart-container')).toHaveClass('hidden')

    rerender(
      <ChartContainer
        data={mockData}
        activeTab="composition"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('weight-chart-container')).toHaveClass('hidden')
    expect(screen.getByTestId('composition-chart-container')).toHaveClass('block')
    expect(screen.getByTestId('calories-chart-container')).toHaveClass('hidden')
  })

  it('renders canvas elements for each chart', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('weight-chart')).toBeInTheDocument()
    expect(screen.getByTestId('composition-chart')).toBeInTheDocument()
    expect(screen.getByTestId('calories-chart')).toBeInTheDocument()
  })

  it('displays empty state when no data is provided', () => {
    render(
      <ChartContainer
        data={[]}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('applies correct styling to chart container', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    const container = screen.getByTestId('weight-tab').parentElement?.parentElement
    expect(container).toHaveClass('bg-white/10', 'backdrop-blur-sm', 'rounded-2xl')
  })

  it('handles tab change for all three tabs', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    // Test weight tab
    fireEvent.click(screen.getByTestId('weight-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('weight')

    // Test composition tab
    fireEvent.click(screen.getByTestId('composition-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('composition')

    // Test calories tab
    fireEvent.click(screen.getByTestId('calories-tab'))
    expect(mockOnTabChange).toHaveBeenCalledWith('calories')

    expect(mockOnTabChange).toHaveBeenCalledTimes(3)
  })

  it('renders with different active tabs correctly', () => {
    // Test composition tab active
    const { rerender } = render(
      <ChartContainer
        data={mockData}
        activeTab="composition"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('composition-tab')).toHaveClass('bg-white/20', 'text-white')
    expect(screen.getByTestId('weight-tab')).toHaveClass('text-white/70')
    expect(screen.getByTestId('calories-tab')).toHaveClass('text-white/70')

    // Test calories tab active
    rerender(
      <ChartContainer
        data={mockData}
        activeTab="calories"
        onTabChange={mockOnTabChange}
      />
    )

    expect(screen.getByTestId('calories-tab')).toHaveClass('bg-white/20', 'text-white')
    expect(screen.getByTestId('weight-tab')).toHaveClass('text-white/70')
    expect(screen.getByTestId('composition-tab')).toHaveClass('text-white/70')
  })

  it('maintains chart container structure with data', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    // Check that chart containers exist
    expect(screen.getByTestId('weight-chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('composition-chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('calories-chart-container')).toBeInTheDocument()

    // Check that canvas elements exist
    expect(screen.getByTestId('weight-chart')).toBeInTheDocument()
    expect(screen.getByTestId('composition-chart')).toBeInTheDocument()
    expect(screen.getByTestId('calories-chart')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(
      <ChartContainer
        data={[]}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    // Should still render tabs
    expect(screen.getByTestId('weight-tab')).toBeInTheDocument()
    expect(screen.getByTestId('composition-tab')).toBeInTheDocument()
    expect(screen.getByTestId('calories-tab')).toBeInTheDocument()

    // Should show empty state
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('applies correct hover styles to inactive tabs', () => {
    render(
      <ChartContainer
        data={mockData}
        activeTab="weight"
        onTabChange={mockOnTabChange}
      />
    )

    const compositionTab = screen.getByTestId('composition-tab')
    const caloriesTab = screen.getByTestId('calories-tab')

    expect(compositionTab).toHaveClass('hover:text-white/90')
    expect(caloriesTab).toHaveClass('hover:text-white/90')
  })
})