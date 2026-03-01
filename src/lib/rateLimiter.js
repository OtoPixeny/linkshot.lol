// Rate limiting utility for Supabase requests
class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = new Map()
  }

  // Check if request is allowed
  isAllowed(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.timeWindow

    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }

    const userRequests = this.requests.get(key)
    
    // Remove old requests outside the time window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart)
    this.requests.set(key, validRequests)

    // Check if under limit
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now)
      return { allowed: true, remaining: this.maxRequests - validRequests.length - 1 }
    }

    return { 
      allowed: false, 
      remaining: 0,
      resetTime: Math.min(...validRequests) + this.timeWindow
    }
  }

  // Get current status
  getStatus(key = 'default') {
    const now = Date.now()
    const windowStart = now - this.timeWindow

    if (!this.requests.has(key)) {
      return { current: 0, remaining: this.maxRequests, resetTime: now + this.timeWindow }
    }

    const userRequests = this.requests.get(key)
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart)
    
    return {
      current: validRequests.length,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      resetTime: validRequests.length > 0 ? Math.min(...validRequests) + this.timeWindow : now + this.timeWindow
    }
  }

  // Reset rate limit for a specific key
  reset(key = 'default') {
    this.requests.delete(key)
  }
}

// Create rate limiter instances for different operations
export const supabaseRateLimiter = new RateLimiter(50, 60000) // 50 requests per minute
export const authRateLimiter = new RateLimiter(10, 60000) // 10 auth requests per minute
export const balanceRateLimiter = new RateLimiter(20, 60000) // 20 balance operations per minute

// Rate limiting wrapper for Supabase operations
export const withRateLimit = async (operation, rateLimiter, key = 'default') => {
  const status = rateLimiter.isAllowed(key)
  
  if (!status.allowed) {
    const error = new Error('Rate limit exceeded')
    error.code = 'RATE_LIMIT_EXCEEDED'
    error.resetTime = status.resetTime
    error.remaining = status.remaining
    throw error
  }

  try {
    const result = await operation()
    return result
  } catch (error) {
    // Don't count rate limit errors towards the limit
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      const userRequests = rateLimiter.requests.get(key) || []
      userRequests.pop() // Remove the last request
    }
    throw error
  }
}

// Export rate limiting middleware for API routes
export const createRateLimitMiddleware = (rateLimiter, getKey = (req) => req.ip || 'default') => {
  return (req, res, next) => {
    const key = getKey(req)
    const status = rateLimiter.isAllowed(key)
    
    if (!status.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded',
        resetTime: status.resetTime,
        remaining: status.remaining
      })
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimiter.maxRequests,
      'X-RateLimit-Remaining': status.remaining,
      'X-RateLimit-Reset': status.resetTime
    })

    next()
  }
}
