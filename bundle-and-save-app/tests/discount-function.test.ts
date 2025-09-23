import { describe, it, expect } from 'vitest'

// Mock types for the discount function tests
interface BundleItem {
  variant_gid: string
  quantity: number
}

interface Bundle {
  id: string
  type: 'FIXED' | 'MIX_MATCH'
  discount_type: 'PERCENT' | 'AMOUNT'
  discount_value: number
  min_qty?: number
  items: BundleItem[]
}

interface CartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
  }
}

// Discount function logic (simplified for testing)
function findApplicableLines(bundle: Bundle, cartLines: CartLine[]): CartLine[] {
  if (bundle.type === 'FIXED') {
    return findFixedBundleLines(bundle, cartLines)
  } else {
    return findMixMatchBundleLines(bundle, cartLines)
  }
}

function findFixedBundleLines(bundle: Bundle, cartLines: CartLine[]): CartLine[] {
  const applicableLines: CartLine[] = []
  
  for (const bundleItem of bundle.items) {
    const cartLine = cartLines.find(line => 
      line.merchandise.id === bundleItem.variant_gid && 
      line.quantity >= bundleItem.quantity
    )
    
    if (cartLine) {
      applicableLines.push(cartLine)
    } else {
      return [] // If any required item is missing, no discount applies
    }
  }
  
  return applicableLines
}

function findMixMatchBundleLines(bundle: Bundle, cartLines: CartLine[]): CartLine[] {
  const minQty = bundle.min_qty || 2
  const allowedVariants = bundle.items.map(item => item.variant_gid)
  
  const applicableLines: CartLine[] = []
  let totalQuantity = 0
  
  for (const cartLine of cartLines) {
    if (allowedVariants.includes(cartLine.merchandise.id)) {
      applicableLines.push(cartLine)
      totalQuantity += cartLine.quantity
    }
  }
  
  return totalQuantity >= minQty ? applicableLines : []
}

describe('Discount Function Logic', () => {
  describe('Fixed Bundle', () => {
    const fixedBundle: Bundle = {
      id: 'test-fixed-bundle',
      type: 'FIXED',
      discount_type: 'PERCENT',
      discount_value: 20,
      items: [
        {
          variant_gid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
        {
          variant_gid: 'gid://shopify/ProductVariant/2',
          quantity: 1,
        },
      ],
    }

    it('should apply discount when all items are present', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        {
          id: 'line2',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/2' },
        },
      ]

      const applicableLines = findApplicableLines(fixedBundle, cartLines)
      expect(applicableLines).toHaveLength(2)
    })

    it('should not apply discount when items are missing', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        // Missing second item
      ]

      const applicableLines = findApplicableLines(fixedBundle, cartLines)
      expect(applicableLines).toHaveLength(0)
    })

    it('should not apply discount when quantity is insufficient', () => {
      const bundleWithHigherQty: Bundle = {
        ...fixedBundle,
        items: [
          {
            variant_gid: 'gid://shopify/ProductVariant/1',
            quantity: 2, // Requires 2, but cart only has 1
          },
          {
            variant_gid: 'gid://shopify/ProductVariant/2',
            quantity: 1,
          },
        ],
      }

      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1, // Only 1 in cart
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        {
          id: 'line2',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/2' },
        },
      ]

      const applicableLines = findApplicableLines(bundleWithHigherQty, cartLines)
      expect(applicableLines).toHaveLength(0)
    })

    it('should handle extra items in cart', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        {
          id: 'line2',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/2' },
        },
        {
          id: 'line3',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/3' }, // Extra item
        },
      ]

      const applicableLines = findApplicableLines(fixedBundle, cartLines)
      expect(applicableLines).toHaveLength(2) // Only the bundle items
    })
  })

  describe('Mix & Match Bundle', () => {
    const mixMatchBundle: Bundle = {
      id: 'test-mix-match-bundle',
      type: 'MIX_MATCH',
      discount_type: 'AMOUNT',
      discount_value: 5,
      min_qty: 2,
      items: [
        {
          variant_gid: 'gid://shopify/ProductVariant/1',
          quantity: 1,
        },
        {
          variant_gid: 'gid://shopify/ProductVariant/2',
          quantity: 1,
        },
        {
          variant_gid: 'gid://shopify/ProductVariant/3',
          quantity: 1,
        },
      ],
    }

    it('should apply discount when minimum quantity is met', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        {
          id: 'line2',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/2' },
        },
      ]

      const applicableLines = findApplicableLines(mixMatchBundle, cartLines)
      expect(applicableLines).toHaveLength(2)
    })

    it('should apply discount with higher quantities', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 2,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        {
          id: 'line2',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/3' },
        },
      ]

      const applicableLines = findApplicableLines(mixMatchBundle, cartLines)
      expect(applicableLines).toHaveLength(2) // Total qty = 3, min = 2
    })

    it('should not apply discount when minimum quantity is not met', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        // Only 1 item, but min_qty is 2
      ]

      const applicableLines = findApplicableLines(mixMatchBundle, cartLines)
      expect(applicableLines).toHaveLength(0)
    })

    it('should ignore items not in the bundle', () => {
      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
        {
          id: 'line2',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/4' }, // Not in bundle
        },
        {
          id: 'line3',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/2' },
        },
      ]

      const applicableLines = findApplicableLines(mixMatchBundle, cartLines)
      expect(applicableLines).toHaveLength(2) // Only lines 1 and 3
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty cart', () => {
      const bundle: Bundle = {
        id: 'test-bundle',
        type: 'FIXED',
        discount_type: 'PERCENT',
        discount_value: 20,
        items: [
          {
            variant_gid: 'gid://shopify/ProductVariant/1',
            quantity: 1,
          },
        ],
      }

      const cartLines: CartLine[] = []
      const applicableLines = findApplicableLines(bundle, cartLines)
      expect(applicableLines).toHaveLength(0)
    })

    it('should handle bundle with no items', () => {
      const bundle: Bundle = {
        id: 'empty-bundle',
        type: 'FIXED',
        discount_type: 'PERCENT',
        discount_value: 20,
        items: [],
      }

      const cartLines: CartLine[] = [
        {
          id: 'line1',
          quantity: 1,
          merchandise: { id: 'gid://shopify/ProductVariant/1' },
        },
      ]

      const applicableLines = findApplicableLines(bundle, cartLines)
      expect(applicableLines).toHaveLength(0)
    })

    it('should handle zero min_qty for mix & match', () => {
      const bundle: Bundle = {
        id: 'zero-min-bundle',
        type: 'MIX_MATCH',
        discount_type: 'PERCENT',
        discount_value: 10,
        min_qty: 0,
        items: [
          {
            variant_gid: 'gid://shopify/ProductVariant/1',
            quantity: 1,
          },
        ],
      }

      const cartLines: CartLine[] = []
      const applicableLines = findApplicableLines(bundle, cartLines)
      expect(applicableLines).toHaveLength(0) // Still no applicable lines with empty cart
    })
  })
})
