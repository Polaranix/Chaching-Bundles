import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function calculateTotalPrice(products: any[]): number {
  return products.reduce((sum, p) => sum + (p.original_price * p.quantity), 0)
}

export function calculateDiscountedPrice(
  total: number,
  strategy: string,
  value?: number,
  fixedPrice?: number
): number {
  if (strategy === 'fixed_price' && fixedPrice !== undefined) {
    return fixedPrice
  }

  if (strategy === 'percentage_discount' && value !== undefined) {
    return total * (1 - value / 100)
  }

  if (strategy === 'amount_discount' && value !== undefined) {
    return Math.max(0, total - value)
  }

  return total
}

export function calculateSavings(original: number, discounted: number): number {
  return Math.max(0, original - discounted)
}

export function getBundleStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50'
    case 'draft':
      return 'text-yellow-600 bg-yellow-50'
    case 'paused':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}
