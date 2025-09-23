import { z } from 'zod'

// Bundle validation schemas
export const BundleTypeEnum = z.enum(['FIXED', 'MIX_MATCH'])
export const DiscountTypeEnum = z.enum(['PERCENT', 'AMOUNT'])
export const StatusEnum = z.enum(['DRAFT', 'ACTIVE'])

export const BundleItemSchema = z.object({
  id: z.string().optional(),
  productGid: z.string().min(1, 'Product GID is required'),
  variantGid: z.string().min(1, 'Variant GID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const BundleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  type: BundleTypeEnum,
  discountType: DiscountTypeEnum,
  discountValue: z.number().min(0.01, 'Discount value must be greater than 0'),
  minQty: z.number().int().min(1).optional(),
  items: z.array(BundleItemSchema).min(2, 'Bundle must have at least 2 items'),
  status: StatusEnum.optional(),
})

// Validate discount value based on type
export const validateDiscountValue = (discountType: string, value: number): boolean => {
  if (discountType === 'PERCENT') {
    return value >= 1 && value <= 90
  }
  if (discountType === 'AMOUNT') {
    return value >= 0.01 && value <= 10000
  }
  return false
}

// Enhanced bundle validation with business rules
export const validateBundle = (data: unknown) => {
  const result = BundleSchema.safeParse(data)
  
  if (!result.success) {
    return { success: false, errors: result.error.errors }
  }
  
  const bundle = result.data
  
  // Additional business rule validations
  const errors: string[] = []
  
  // Validate discount value range
  if (!validateDiscountValue(bundle.discountType, bundle.discountValue)) {
    if (bundle.discountType === 'PERCENT') {
      errors.push('Percent discount must be between 1% and 90%')
    } else {
      errors.push('Amount discount must be between $0.01 and $10,000')
    }
  }
  
  // Validate minQty for MIX_MATCH bundles
  if (bundle.type === 'MIX_MATCH' && !bundle.minQty) {
    errors.push('Mix & Match bundles require a minimum quantity')
  }
  
  // Validate minQty doesn't exceed total items for MIX_MATCH
  if (bundle.type === 'MIX_MATCH' && bundle.minQty && bundle.minQty > bundle.items.length) {
    errors.push('Minimum quantity cannot exceed the number of available items')
  }
  
  // Validate unique products in bundle items
  const productGids = bundle.items.map(item => item.productGid)
  const uniqueProductGids = new Set(productGids)
  if (productGids.length !== uniqueProductGids.size) {
    errors.push('Bundle cannot contain duplicate products')
  }
  
  if (errors.length > 0) {
    return { success: false, errors }
  }
  
  return { success: true, data: bundle }
}

// Analytics event validation
export const AnalyticsEventSchema = z.object({
  shop: z.string().min(1),
  bundleId: z.string().min(1),
  event: z.enum(['impression', 'click', 'order']),
  metadata: z.record(z.unknown()).optional(),
})

export const validateAnalyticsEvent = (data: unknown) => {
  return AnalyticsEventSchema.safeParse(data)
}
