/**
 * API Service
 * Base API service with fetch wrapper and error handling
 * Implements Result types for predictable error handling
 */

import { Result, ValidationError } from '@/lib/types'

// API Error types
export interface ApiError {
  code: string
  message: string
  status?: number
  details?: unknown
}

// Request configuration
export interface ApiRequestConfig extends RequestInit {
  timeout?: number
  baseUrl?: string
}

// Default configuration
const DEFAULT_TIMEOUT = 30000 // 30 seconds
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Creates an API error from various error types
 */
function createApiError(error: unknown, status?: number): ApiError {
  if (error instanceof Error) {
    return {
      code: 'API_ERROR',
      message: error.message,
      status,
    }
  }
  
  if (typeof error === 'string') {
    return {
      code: 'API_ERROR',
      message: error,
      status,
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    status,
  }
}

/**
 * Parses response body based on content type
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  
  // Return text for non-JSON responses
  const text = await response.text()
  return text as unknown as T
}

/**
 * Fetch wrapper with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: ApiRequestConfig
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Main API fetch function
 * Returns a Result type for predictable error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options: ApiRequestConfig = {}
): Promise<Result<T, ApiError>> {
  const { baseUrl = DEFAULT_BASE_URL, ...requestOptions } = options
  const url = `${baseUrl}${endpoint}`
  
  try {
    const response = await fetchWithTimeout(url, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...requestOptions.headers,
      },
    })
    
    if (!response.ok) {
      // Try to parse error response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorBody = await response.json()
        errorMessage = errorBody.message || errorBody.error || errorMessage
      } catch {
        // Use default error message if parsing fails
      }
      
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorMessage,
          status: response.status,
        },
      }
    }
    
    const data = await parseResponse<T>(response)
    return { success: true, data }
  } catch (error) {
    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out',
        },
      }
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error - please check your connection',
        },
      }
    }
    
    return {
      success: false,
      error: createApiError(error),
    }
  }
}

/**
 * GET request helper
 */
export async function get<T>(
  endpoint: string,
  options: ApiRequestConfig = {}
): Promise<Result<T, ApiError>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST request helper
 */
export async function post<T, D = unknown>(
  endpoint: string,
  data?: D,
  options: ApiRequestConfig = {}
): Promise<Result<T, ApiError>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function put<T, D = unknown>(
  endpoint: string,
  data?: D,
  options: ApiRequestConfig = {}
): Promise<Result<T, ApiError>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PATCH request helper
 */
export async function patch<T, D = unknown>(
  endpoint: string,
  data?: D,
  options: ApiRequestConfig = {}
): Promise<Result<T, ApiError>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function del<T>(
  endpoint: string,
  options: ApiRequestConfig = {}
): Promise<Result<T, ApiError>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'DELETE',
  })
}

// Re-export Result type for convenience
export type { Result } from '@/lib/types'
