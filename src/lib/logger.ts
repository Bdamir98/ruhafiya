type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  url?: string
  method?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }
  }

  private log(level: LogLevel, message: string, data?: any, context?: Partial<LogEntry>) {
    const logEntry: LogEntry = {
      ...this.formatMessage(level, message, data),
      ...context,
    }

    // Always log to console in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'log'
      
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '')
    }

    // In production, you might want to send logs to an external service
    if (this.isProduction) {
      this.sendToExternalService(logEntry)
    }

    // Store critical errors locally for debugging
    if (level === 'error') {
      this.storeErrorLocally(logEntry)
    }
  }

  private async sendToExternalService(logEntry: LogEntry) {
    try {
      // Example: Send to external logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // })
    } catch (error) {
      // Fallback to console if external service fails
      console.error('Failed to send log to external service:', error)
    }
  }

  private storeErrorLocally(logEntry: LogEntry) {
    try {
      if (typeof window !== 'undefined') {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
        errors.push(logEntry)
        
        // Keep only last 50 errors
        if (errors.length > 50) {
          errors.splice(0, errors.length - 50)
        }
        
        localStorage.setItem('app_errors', JSON.stringify(errors))
      }
    } catch (error) {
      console.error('Failed to store error locally:', error)
    }
  }

  debug(message: string, data?: any, context?: Partial<LogEntry>) {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: Partial<LogEntry>) {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: Partial<LogEntry>) {
    this.log('warn', message, data, context)
  }

  error(message: string, error?: Error | any, context?: Partial<LogEntry>) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error

    this.log('error', message, errorData, context)
  }

  // API request logging
  apiRequest(method: string, url: string, data?: any, context?: Partial<LogEntry>) {
    this.info(`API Request: ${method} ${url}`, data, {
      ...context,
      method,
      url,
    })
  }

  apiResponse(method: string, url: string, status: number, data?: any, context?: Partial<LogEntry>) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    this.log(level, `API Response: ${method} ${url} - ${status}`, data, {
      ...context,
      method,
      url,
    })
  }

  // User action logging
  userAction(action: string, data?: any, context?: Partial<LogEntry>) {
    this.info(`User Action: ${action}`, data, context)
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Partial<LogEntry>) {
    const level = duration > 1000 ? 'warn' : 'info'
    this.log(level, `Performance: ${operation} took ${duration}ms`, undefined, context)
  }

  // Security logging
  security(event: string, data?: any, context?: Partial<LogEntry>) {
    this.warn(`Security Event: ${event}`, data, context)
  }

  // Get stored errors (for debugging)
  getStoredErrors(): LogEntry[] {
    try {
      if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('app_errors') || '[]')
      }
    } catch (error) {
      console.error('Failed to get stored errors:', error)
    }
    return []
  }

  // Clear stored errors
  clearStoredErrors() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('app_errors')
      }
    } catch (error) {
      console.error('Failed to clear stored errors:', error)
    }
  }
}

// Create singleton instance
export const logger = new Logger()

// Performance measurement utility
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: Partial<LogEntry>
): T | Promise<T> {
  const start = performance.now()
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result
        .then((value) => {
          const duration = performance.now() - start
          logger.performance(operation, duration, context)
          return value
        })
        .catch((error) => {
          const duration = performance.now() - start
          logger.performance(`${operation} (failed)`, duration, context)
          logger.error(`Performance measurement failed for ${operation}`, error, context)
          throw error
        })
    } else {
      const duration = performance.now() - start
      logger.performance(operation, duration, context)
      return result
    }
  } catch (error) {
    const duration = performance.now() - start
    logger.performance(`${operation} (failed)`, duration, context)
    logger.error(`Performance measurement failed for ${operation}`, error, context)
    throw error
  }
}

// Request context helper for API routes
export function createRequestContext(request: Request): Partial<LogEntry> {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        undefined,
  }
}