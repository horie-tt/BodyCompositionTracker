// Analytics and monitoring utilities

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: object) => void
  }
}

// Google Analytics
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

export const event = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now()
    fn()
    const end = performance.now()
    const duration = end - start
    
    // Log performance metrics
    console.log(`Performance: ${name} took ${duration} milliseconds`)
    
    // Send to analytics
    event('performance', 'timing', name, Math.round(duration))
  } else {
    fn()
  }
}

// Error tracking
export const trackError = (error: Error, context?: string) => {
  console.error('Error tracked:', error, context)
  
  // Send to analytics
  event('error', 'javascript', `${context || 'Unknown'}: ${error.message}`)
  
  // Send to external error tracking service if configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry integration would go here
    console.log('Error would be sent to Sentry:', error)
  }
}

// User interaction tracking
export const trackInteraction = (element: string, action: string, details?: object) => {
  event('interaction', element, action)
  
  if (details) {
    console.log('User interaction:', element, action, details)
  }
}

// Custom metrics
export const trackCustomMetric = (name: string, value: number, unit?: string) => {
  event('custom_metric', name, unit, value)
  
  console.log(`Custom metric: ${name} = ${value} ${unit || ''}`)
}

// Core Web Vitals tracking
export const trackWebVitals = (metric: {
  name: string
  value: number
  id: string
  delta: number
}) => {
  event('web_vitals', metric.name, metric.id, Math.round(metric.value))
  
  console.log('Web Vitals:', metric)
}

// Feature usage tracking
export const trackFeatureUsage = (feature: string, details?: object) => {
  event('feature_usage', feature, JSON.stringify(details))
  
  console.log('Feature used:', feature, details)
}

// Data operation tracking
export const trackDataOperation = (operation: string, success: boolean, duration?: number) => {
  event('data_operation', operation, success ? 'success' : 'failure', duration)
  
  console.log('Data operation:', operation, success ? 'succeeded' : 'failed', duration ? `in ${duration}ms` : '')
}

// Initialize analytics
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)
    
    window.gtag = window.gtag || function(...args) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).dataLayer = (window as any).dataLayer || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).dataLayer.push(args)
    }
    
    window.gtag('js', new Date().toISOString())
    window.gtag('config', GA_MEASUREMENT_ID)
    
    console.log('Analytics initialized')
  }
}

// Performance observer
export const observePerformance = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Observe Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          trackWebVitals({
            name: 'LCP',
            value: entry.startTime,
            id: 'lcp',
            delta: entry.startTime,
          })
        }
        
        if (entry.entryType === 'first-input') {
          const firstInputEntry = entry as PerformanceEntry & { processingStart: number }
          trackWebVitals({
            name: 'FID',
            value: firstInputEntry.processingStart - entry.startTime,
            id: 'fid',
            delta: firstInputEntry.processingStart - entry.startTime,
          })
        }
        
        const layoutShiftEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
        if (entry.entryType === 'layout-shift' && !layoutShiftEntry.hadRecentInput) {
          trackWebVitals({
            name: 'CLS',
            value: layoutShiftEntry.value,
            id: 'cls',
            delta: layoutShiftEntry.value,
          })
        }
      })
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
  }
}

// Resource loading tracking
export const trackResourceLoading = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Track slow resources
          if (resourceEntry.duration > 1000) {
            trackCustomMetric('slow_resource', resourceEntry.duration, 'ms')
            console.warn('Slow resource:', resourceEntry.name, resourceEntry.duration)
          }
        }
      })
    })
    
    observer.observe({ entryTypes: ['resource'] })
  }
}

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memory = (performance as any).memory
    
    trackCustomMetric('memory_used', memory.usedJSHeapSize, 'bytes')
    trackCustomMetric('memory_total', memory.totalJSHeapSize, 'bytes')
    trackCustomMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes')
    
    console.log('Memory usage:', memory)
  }
}

// Bundle size tracking
export const trackBundleSize = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming
          
          trackCustomMetric('bundle_transfer_size', navigationEntry.transferSize, 'bytes')
          trackCustomMetric('bundle_encoded_size', navigationEntry.encodedBodySize, 'bytes')
          trackCustomMetric('bundle_decoded_size', navigationEntry.decodedBodySize, 'bytes')
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation'] })
  }
}