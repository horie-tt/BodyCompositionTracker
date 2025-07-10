// Performance optimization utilities

import React from 'react'
import { trackCustomMetric, trackError } from './analytics'

// Debounce utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Memoization utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  maxCacheSize = 100
): T {
  const cache = new Map()
  const keys: string[] = []
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    
    // Manage cache size
    if (keys.length >= maxCacheSize) {
      const oldestKey = keys.shift()
      if (oldestKey) {
        cache.delete(oldestKey)
      }
    }
    
    cache.set(key, result)
    keys.push(key)
    
    return result
  }) as T
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>
): () => Promise<T> {
  let loadPromise: Promise<T> | null = null
  
  return () => {
    if (!loadPromise) {
      loadPromise = loader()
    }
    return loadPromise
  }
}

// Image lazy loading
export function setupImageLazyLoading() {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              observer.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: '50px',
      }
    )
    
    document.querySelectorAll('img[data-src]').forEach((img) => {
      observer.observe(img)
    })
  }
}

// Virtual scrolling utility
export class VirtualScroller {
  private container: HTMLElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private items: any[]
  private itemHeight: number
  private visibleCount: number
  private scrollTop = 0
  private startIndex = 0
  private endIndex = 0
  
  constructor(
    container: HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[],
    itemHeight: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderItem: (item: any, index: number) => HTMLElement
  ) {
    this.container = container
    this.items = items
    this.itemHeight = itemHeight
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2
    
    this.setupScrollListener()
    this.render(renderItem)
  }
  
  private setupScrollListener() {
    this.container.addEventListener('scroll', throttle(() => {
      this.scrollTop = this.container.scrollTop
      this.updateVisibleRange()
    }, 16)) // 60fps
  }
  
  private updateVisibleRange() {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight)
    this.endIndex = Math.min(
      this.startIndex + this.visibleCount,
      this.items.length
    )
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private render(renderItem: (item: any, index: number) => HTMLElement) {
    this.updateVisibleRange()
    
    const visibleItems = this.items.slice(this.startIndex, this.endIndex)
    const fragment = document.createDocumentFragment()
    
    visibleItems.forEach((item, index) => {
      const element = renderItem(item, this.startIndex + index)
      element.style.position = 'absolute'
      element.style.top = `${(this.startIndex + index) * this.itemHeight}px`
      fragment.appendChild(element)
    })
    
    this.container.innerHTML = ''
    this.container.appendChild(fragment)
    this.container.style.height = `${this.items.length * this.itemHeight}px`
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  
  startTimer(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordMetric(name, duration)
      trackCustomMetric(name, duration, 'ms')
    }
  }
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }
  
  getMetricStats(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null
    
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const sortedValues = [...values].sort((a, b) => a - b)
    const p95 = sortedValues[Math.floor(values.length * 0.95)]
    
    return { avg, min, max, p95, count: values.length }
  }
  
  getAllStats(): Record<string, ReturnType<PerformanceMonitor['getMetricStats']>> {
    const stats: Record<string, ReturnType<PerformanceMonitor['getMetricStats']>> = {}
    
    for (const [name] of this.metrics) {
      stats[name] = this.getMetricStats(name)
    }
    
    return stats
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Bundle splitting utilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadChunk(chunkName: string): Promise<any> {
  const startTime = performance.now()
  
  return import(
    /* webpackChunkName: "[request]" */
    `../chunks/${chunkName}`
  )
    .then((module) => {
      const endTime = performance.now()
      trackCustomMetric(`chunk_load_${chunkName}`, endTime - startTime, 'ms')
      return module
    })
    .catch((error) => {
      trackError(error, `chunk_load_${chunkName}`)
      throw error
    })
}

// Critical resource preloading
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      // Add other critical fonts
    ]
    
    criticalFonts.forEach((fontUrl) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = fontUrl
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
    
    // Preload critical API endpoints
    const criticalEndpoints = [
      '/api/health',
      '/api/app-info',
    ]
    
    criticalEndpoints.forEach((endpoint) => {
      fetch(endpoint, { method: 'HEAD' }).catch(() => {
        // Ignore preload errors
      })
    })
  }
}

// Service Worker utilities
export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
          trackCustomMetric('sw_registration', 1)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
          trackError(registrationError, 'sw_registration')
        })
    })
  }
}

// Resource hints
export function addResourceHints() {
  if (typeof window !== 'undefined') {
    // DNS prefetch for external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://www.googletagmanager.com',
      // Add other external domains
    ]
    
    externalDomains.forEach((domain) => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = domain
      document.head.appendChild(link)
    })
    
    // Prefetch likely next pages
    const likelyPages = [
      '/settings',
      '/help',
    ]
    
    likelyPages.forEach((page) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = page
      document.head.appendChild(link)
    })
  }
}

// Memory management
export function cleanupMemory() {
  if (typeof window !== 'undefined') {
    // Clear unused caches
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.includes('old') || cacheName.includes('unused')) {
            caches.delete(cacheName)
          }
        })
      })
    }
    
    // Force garbage collection (if available)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ('gc' in window && typeof (window as any).gc === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gc()
    }
  }
}

// Error boundary for performance
export function createPerformanceErrorBoundary(
  component: React.ComponentType,
  fallback: React.ComponentType
) {
  return class PerformanceErrorBoundary extends React.Component {
    state = { hasError: false }
    
    static getDerivedStateFromError() {
      return { hasError: true }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      trackError(error, 'performance_error_boundary')
      console.error('Performance error boundary caught an error:', error, errorInfo)
    }
    
    render() {
      if (this.state.hasError) {
        return React.createElement(fallback)
      }
      
      return React.createElement(component, this.props)
    }
  }
}

// Initialize all performance optimizations
export function initializePerformanceOptimizations() {
  preloadCriticalResources()
  setupImageLazyLoading()
  registerServiceWorker()
  addResourceHints()
  
  // Schedule memory cleanup
  setInterval(cleanupMemory, 5 * 60 * 1000) // Every 5 minutes
  
  console.log('Performance optimizations initialized')
}