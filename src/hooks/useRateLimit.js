import { useState, useCallback } from 'react'

export const useRateLimit = () => {
  const [rateLimitError, setRateLimitError] = useState(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const handleRateLimitError = useCallback((error) => {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      setRateLimitError({
        message: 'Too many requests. Please try again later.',
        resetTime: error.resetTime,
        remaining: error.remaining
      })
      setIsRateLimited(true)
      
      // Auto-clear error after reset time
      const timeUntilReset = error.resetTime - Date.now()
      if (timeUntilReset > 0) {
        setTimeout(() => {
          setRateLimitError(null)
          setIsRateLimited(false)
        }, timeUntilReset)
      }
      return true
    }
    return false
  }, [])

  const clearRateLimitError = useCallback(() => {
    setRateLimitError(null)
    setIsRateLimited(false)
  }, [])

  const getTimeUntilReset = useCallback(() => {
    if (!rateLimitError?.resetTime) return 0
    return Math.max(0, rateLimitError.resetTime - Date.now())
  }, [rateLimitError])

  const formatTimeUntilReset = useCallback(() => {
    const timeMs = getTimeUntilReset()
    if (timeMs === 0) return 'now'
    
    const seconds = Math.ceil(timeMs / 1000)
    if (seconds < 60) return `${seconds}s`
    
    const minutes = Math.ceil(seconds / 60)
    return `${minutes}m`
  }, [getTimeUntilReset])

  return {
    rateLimitError,
    isRateLimited,
    handleRateLimitError,
    clearRateLimitError,
    getTimeUntilReset,
    formatTimeUntilReset
  }
}

// HOC for wrapping API calls with rate limit handling
export const withRateLimitHandling = (apiFunction, { onRateLimit, onError } = {}) => {
  return async (...args) => {
    try {
      const result = await apiFunction(...args)
      return result
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        onRateLimit?.(error)
        throw error
      }
      onError?.(error)
      throw error
    }
  }
}
