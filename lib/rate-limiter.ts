// Rate limiting for API routes
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const userLimit = rateLimit.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    // First request or window expired
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (userLimit.count >= maxRequests) {
    // Rate limit exceeded
    const resetIn = userLimit.resetTime - now
    return { allowed: false, remaining: 0, resetIn }
  }

  // Increment count
  userLimit.count++
  rateLimit.set(identifier, userLimit)
  
  return {
    allowed: true,
    remaining: maxRequests - userLimit.count,
    resetIn: userLimit.resetTime - now
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime + 60000) { // 1 minute after reset
      rateLimit.delete(key)
    }
  }
}, 300000) // Clean every 5 minutes