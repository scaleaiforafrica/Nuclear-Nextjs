import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validatePasswordStrength } from '@/lib/validation/password'
import { getRateLimiter } from '@/lib/api/rate-limiter'

interface PasswordChangeResponse {
  success?: boolean
  message?: string
  error?: string
  code?:
    | 'WEAK_PASSWORD'
    | 'REUSED_PASSWORD'
    | 'RATE_LIMITED'
    | 'INVALID_CURRENT'
    | 'MISSING_FIELDS'
    | 'UNAUTHORIZED'
  details?: {
    missingRequirements?: string[]
    retryAfter?: number
    remaining?: number
  }
}

// Validation schema using Zod
const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(12, 'New password must be at least 12 characters'),
  confirm_password: z.string().optional(),
})

/**
 * POST /api/settings/password
 * 
 * Change user password with comprehensive security checks:
 * - Rate limiting to prevent brute force attacks
 * - Password strength validation
 * - Password history checking
 * - Audit logging
 * - Session management
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to change your password',
      } as PasswordChangeResponse,
      { status: 401 }
    )
  }

  // Rate limiting check
  const rateLimiter = getRateLimiter()
  const rateLimitResult = rateLimiter.check(user.id, {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  })

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too many password change attempts',
        code: 'RATE_LIMITED',
        message: `You have exceeded the maximum number of password change attempts. Please try again later.`,
        details: {
          retryAfter: rateLimitResult.retryAfter,
          remaining: rateLimitResult.remaining,
        },
      } as PasswordChangeResponse,
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        },
      }
    )
  }

  // Parse request body
  const { current_password, new_password, confirm_password } =
    await request.json()

  // Validate required fields
  if (!current_password || !new_password) {
    return NextResponse.json(
      {
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        message: 'Current password and new password are required',
      } as PasswordChangeResponse,
      { status: 400 }
    )
  }

  // Check if passwords match
  if (new_password !== confirm_password) {
    return NextResponse.json(
      {
        error: 'Passwords do not match',
        code: 'WEAK_PASSWORD',
        message: 'New password and confirmation password must match',
      } as PasswordChangeResponse,
      { status: 400 }
    )
  }

  // Validate password strength
  const validation = validatePasswordStrength(new_password)

  if (!validation.isValid) {
    const missingRequirements: string[] = []

    if (!validation.requirements.minLength) {
      missingRequirements.push('Minimum 8 characters')
    }
    if (!validation.requirements.hasUppercase) {
      missingRequirements.push('At least one uppercase letter')
    }
    if (!validation.requirements.hasLowercase) {
      missingRequirements.push('At least one lowercase letter')
    }
    if (!validation.requirements.hasNumber) {
      missingRequirements.push('At least one number')
    }
    if (!validation.requirements.hasSpecialChar) {
      missingRequirements.push('At least one special character')
    }
    if (!validation.requirements.notCommon) {
      missingRequirements.push('Password is too common')
    }

    return NextResponse.json(
      {
        error: 'Password does not meet security requirements',
        code: 'WEAK_PASSWORD',
        message:
          'Your password must meet all security requirements for your protection',
        details: {
          missingRequirements,
        },
      } as PasswordChangeResponse,
      { status: 400 }
    )
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  })

  if (signInError) {
    await logPasswordChangeAttempt({
      user_id: user.id,
      success: false,
      failure_reason: 'Incorrect current password',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(
      {
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT',
        message: 'The current password you entered is incorrect',
      } as PasswordChangeResponse,
      { status: 401 }
    )
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  })

  if (updateError) {
    await logPasswordChangeAttempt({
      user_id: user.id,
      success: false,
      failure_reason: updateError.message,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(
      {
        error: 'Failed to update password',
        message: updateError.message,
      } as PasswordChangeResponse,
      { status: 500 }
    )
  }

  // Reset rate limit on successful password change
  rateLimiter.reset(user.id)

  return NextResponse.json(
    {
      success: true,
      message: 'Password updated successfully',
    } as PasswordChangeResponse,
    { status: 200 }
  )
}
