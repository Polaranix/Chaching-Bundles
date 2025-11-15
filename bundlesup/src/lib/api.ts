const API_URL = import.meta.env.VITE_BASE44_API_URL || 'https://api.base44.com'
const APP_ID = import.meta.env.VITE_BASE44_APP_ID
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Function calls
  async callFunction<T>(functionName: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Function call failed',
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Function call error',
      }
    }
  }
}

export const api = new ApiClient()

// Entity operations
export const entities = {
  async query<T>(entityName: string, filters?: any): Promise<ApiResponse<T[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters)}` : ''
    return api.get<T[]>(`/apps/${APP_ID}/entities/${entityName}${queryParams}`)
  },

  async get<T>(entityName: string, id: string): Promise<ApiResponse<T>> {
    return api.get<T>(`/apps/${APP_ID}/entities/${entityName}/${id}`)
  },

  async create<T>(entityName: string, data: any): Promise<ApiResponse<T>> {
    return api.post<T>(`/apps/${APP_ID}/entities/${entityName}`, data)
  },

  async update<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>> {
    return api.put<T>(`/apps/${APP_ID}/entities/${entityName}/${id}`, data)
  },

  async delete(entityName: string, id: string): Promise<ApiResponse<void>> {
    return api.delete(`/apps/${APP_ID}/entities/${entityName}/${id}`)
  },
}

// Shopify API proxy
export const shopify = {
  async graphql<T>(query: string, variables?: any): Promise<ApiResponse<T>> {
    return api.callFunction<T>('shopifyApiProxy', {
      type: 'graphql',
      query,
      variables,
    })
  },

  async rest<T>(endpoint: string, method: string = 'GET', data?: any): Promise<ApiResponse<T>> {
    return api.callFunction<T>('shopifyApiProxy', {
      type: 'rest',
      endpoint,
      method,
      data,
    })
  },
}
