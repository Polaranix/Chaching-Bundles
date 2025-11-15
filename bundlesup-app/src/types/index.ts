// Type definitions for BundlesUp

export type BundleType = 'fixed' | 'mix_match' | 'upsell' | 'frequently_together';
export type BundleStatus = 'active' | 'draft' | 'paused';
export type PricingStrategy = 'fixed_price' | 'percentage_discount' | 'amount_discount';
export type DisplayTemplate = 'list' | 'grid' | 'tiered' | 'radio_list';

export interface Product {
  product_id: string;
  product_name: string;
  product_image?: string;
  original_price: number;
  quantity: number;
  is_required: boolean;
}

export interface DisplaySettings {
  show_savings: boolean;
  show_individual_prices: boolean;
  layout: 'grid' | 'list';
}

export interface Bundle {
  id?: string;
  name: string;
  description?: string;
  bundle_type: BundleType;
  status: BundleStatus;
  pricing_strategy: PricingStrategy;
  discount_value?: number;
  fixed_price?: number;
  products: Product[];
  min_items?: number;
  max_items?: number;
  total_sales?: number;
  total_revenue?: number;
  conversion_rate?: number;
  display_template: DisplayTemplate;
  display_settings?: DisplaySettings;
  shop_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Shop {
  id: string;
  shop_name: string;
  access_token: string;
  scopes?: string;
  installed_at: string;
  has_active_subscription?: boolean;
  subscription_id?: string;
  trial_ends_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  has_completed_onboarding: boolean;
  shop_domain?: string;
  shop_id?: string;
}

export interface ShopifyProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  shopify_product_id: string;
  inventory: number;
  shop_id: string;
}

export interface BundleOrder {
  id: string;
  bundle_id: string;
  shop_id: string;
  order_id: string;
  discount_amount: number;
  total_amount: number;
  items_count: number;
  created_at: string;
}

export interface BundleAnalytic {
  id: string;
  bundle_id: string;
  shop_id: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  date: string;
}

export interface DashboardStats {
  active_bundles: number;
  total_revenue: number;
  total_sales: number;
  avg_conversion: number;
}
