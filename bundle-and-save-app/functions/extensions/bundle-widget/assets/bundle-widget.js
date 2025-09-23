class BundleWidget {
  constructor() {
    this.appUrl = 'YOUR_APP_URL' // TODO: Replace with actual app URL
    this.shopDomain = window.Shopify?.shop || ''
    this.productId = this.getCurrentProductId()
    this.init()
  }

  getCurrentProductId() {
    // Try multiple methods to get the current product ID
    if (window.meta?.product?.id) {
      return `gid://shopify/Product/${window.meta.product.id}`
    }
    
    if (window.ShopifyAnalytics?.meta?.product?.id) {
      return `gid://shopify/Product/${window.ShopifyAnalytics.meta.product.id}`
    }
    
    // Try to extract from URL or other methods
    const pathMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/)
    if (pathMatch) {
      // This is a product handle, we'd need to convert it to ID
      // For now, return null and handle it differently
      return null
    }
    
    return null
  }

  async init() {
    if (!this.shopDomain) {
      console.warn('Bundle Widget: Shop domain not found')
      return
    }

    await this.loadBundles()
    this.setupCartObserver()
  }

  async loadBundles() {
    try {
      const response = await fetch(`${this.appUrl}/api/bundles/active?shop=${this.shopDomain}`)
      if (!response.ok) return

      const bundles = await response.json()
      this.renderProductPageBundles(bundles)
    } catch (error) {
      console.error('Bundle Widget: Failed to load bundles', error)
    }
  }

  renderProductPageBundles(bundles) {
    if (!this.productId) return

    const applicableBundles = bundles.filter(bundle => 
      bundle.items.some(item => item.productGid === this.productId)
    )

    if (applicableBundles.length === 0) return

    const container = this.findProductContainer()
    if (!container) return

    applicableBundles.forEach(bundle => {
      const widget = this.createBundleWidget(bundle)
      container.appendChild(widget)
      this.trackImpression(bundle.id)
    })
  }

  findProductContainer() {
    // Try common selectors for product containers
    const selectors = [
      '.product-form',
      '.product__form',
      '.product-single__form',
      '[data-product-form]',
      '.shopify-product-form',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) return element
    }

    // Fallback to product container
    return document.querySelector('.product') || document.querySelector('[data-product]')
  }

  createBundleWidget(bundle) {
    const widget = document.createElement('div')
    widget.className = 'bundle-widget'
    widget.innerHTML = `
      <div class="bundle-widget__container">
        <div class="bundle-widget__header">
          <h3 class="bundle-widget__title">Bundle & Save</h3>
          <span class="bundle-widget__discount">${this.formatDiscount(bundle)}</span>
        </div>
        <div class="bundle-widget__content">
          <div class="bundle-widget__items">
            ${bundle.items.map(item => `
              <div class="bundle-widget__item">
                <img src="${item.productImage || '/assets/placeholder.png'}" 
                     alt="${item.productTitle}" 
                     class="bundle-widget__item-image">
                <span class="bundle-widget__item-title">${item.productTitle}</span>
              </div>
            `).join('')}
          </div>
          <button class="bundle-widget__button" data-bundle-id="${bundle.id}">
            Add Bundle to Cart
          </button>
        </div>
      </div>
    `

    // Add click handler
    const button = widget.querySelector('.bundle-widget__button')
    button.addEventListener('click', () => this.handleAddToCart(bundle))

    return widget
  }

  formatDiscount(bundle) {
    if (bundle.discountType === 'PERCENT') {
      return `Save ${bundle.discountValue}%`
    } else {
      return `Save $${bundle.discountValue.toFixed(2)}`
    }
  }

  async handleAddToCart(bundle) {
    this.trackClick(bundle.id)

    try {
      // Get cart token if available
      const cartToken = this.getCartToken()
      
      // Call our API to get the cart lines
      const response = await fetch(`${this.appUrl}/api/bundles/${bundle.id}/add-to-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopDomain: this.shopDomain,
          cartId: cartToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to prepare bundle for cart')
      }

      const data = await response.json()
      
      // Add items to cart using Shopify's cart API
      await this.addItemsToCart(data.cartLines)
      
      // Show success message
      this.showSuccessMessage(bundle.title)
    } catch (error) {
      console.error('Bundle Widget: Failed to add bundle to cart', error)
      this.showErrorMessage()
    }
  }

  getCartToken() {
    // Try to get cart token from various sources
    if (window.Shopify?.routes?.root) {
      // Modern Shopify themes
      return fetch('/cart.js')
        .then(response => response.json())
        .then(cart => cart.token)
        .catch(() => null)
    }
    return null
  }

  async addItemsToCart(cartLines) {
    const items = cartLines.map(line => ({
      id: line.merchandiseId.replace('gid://shopify/ProductVariant/', ''),
      quantity: line.quantity,
    }))

    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })

    if (!response.ok) {
      throw new Error('Failed to add items to cart')
    }

    // Trigger cart update events
    document.dispatchEvent(new CustomEvent('cart:updated'))
    
    // Try common cart drawer/popup triggers
    if (window.theme?.openCartDrawer) {
      window.theme.openCartDrawer()
    } else if (window.Shopify?.theme?.cart?.open) {
      window.Shopify.theme.cart.open()
    }
  }

  showSuccessMessage(bundleTitle) {
    // Create and show success notification
    const notification = document.createElement('div')
    notification.className = 'bundle-widget__notification bundle-widget__notification--success'
    notification.textContent = `${bundleTitle} added to cart!`
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('bundle-widget__notification--visible')
    }, 100)
    
    setTimeout(() => {
      notification.classList.remove('bundle-widget__notification--visible')
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  showErrorMessage() {
    const notification = document.createElement('div')
    notification.className = 'bundle-widget__notification bundle-widget__notification--error'
    notification.textContent = 'Failed to add bundle to cart. Please try again.'
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('bundle-widget__notification--visible')
    }, 100)
    
    setTimeout(() => {
      notification.classList.remove('bundle-widget__notification--visible')
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  setupCartObserver() {
    // Watch for cart changes to show cart-specific bundles
    const cartObserver = new MutationObserver(() => {
      this.checkCartForBundles()
    })

    // Observe cart elements if they exist
    const cartElements = document.querySelectorAll('[data-cart], .cart, #cart')
    cartElements.forEach(element => {
      cartObserver.observe(element, { childList: true, subtree: true })
    })

    // Also listen for cart update events
    document.addEventListener('cart:updated', () => {
      setTimeout(() => this.checkCartForBundles(), 500)
    })
  }

  async checkCartForBundles() {
    try {
      const response = await fetch('/cart.js')
      if (!response.ok) return

      const cart = await response.json()
      await this.renderCartBundles(cart)
    } catch (error) {
      console.error('Bundle Widget: Failed to check cart', error)
    }
  }

  async renderCartBundles(cart) {
    // TODO: Implement cart bundle recommendations
    // This would suggest completing bundles based on current cart items
  }

  async trackImpression(bundleId) {
    this.trackEvent(bundleId, 'impression')
  }

  async trackClick(bundleId) {
    this.trackEvent(bundleId, 'click')
  }

  async trackEvent(bundleId, event) {
    try {
      await fetch(`${this.appUrl}/api/events/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: this.shopDomain,
          bundleId,
          event,
          metadata: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch (error) {
      console.error('Bundle Widget: Failed to track event', error)
    }
  }
}

// Initialize the widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BundleWidget())
} else {
  new BundleWidget()
}
