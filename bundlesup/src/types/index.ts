export interface Bundle {
  id: string
  name: string
  description: string
  bundle_type: 'fixed' | 'mix_match' | 'upsell' | 'frequently_together'
  status: 'active' | 'draft' | 'paused'
  pricing_strategy: 'fixed_price' | 'percentage_discount' | 'amount_discount'
  discount_value: number
  fixed_price?: number
  products: BundleProduct[]
  min_items?: number
  max_items?: number
  total_sales: number
  total_revenue: number
  conversion_rate: number
  display_template: 'list' | 'grid' | 'tiered' | 'radio_list'
  display_settings: {
    show_savings: boolean
    show_individual_prices: boolean
    layout: 'grid' | 'list'
  }
  created_at?: string
  updated_at?: string
}

export interface BundleProduct {
  product_id: string
  product_name: string
  product_image: string
  original_price: number
  quantity: number
  is_required: boolean
}

export interface Product {
  id: string
  name: string
  price: number
  image_url: string
  shopify_product_id: string
  inventory: number
}

export interface Shop {
  id: string
  shop_name: string
  access_token: string
  scopes: string
  installed_at: string
}

export interface BundleOrder {
  id: string
  bundle_id: string
  shop_id: string
  order_id: string
  discount_amount: number
  total_amount: number
  items_count: number
  created_at: string
}

export interface BundleAnalytic {
  id: string
  bundle_id: string
  shop_id: string
  views: number
  clicks: number
  conversions: number
  revenue: number
  date: string
}

export interface Stats {
  activeBundles: number
  totalRevenue: number
  totalSales: number
  avgConversion: number
}
