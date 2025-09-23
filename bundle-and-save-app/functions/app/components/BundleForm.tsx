import { useState, useEffect, useCallback } from 'react'
import { Form, useSubmit } from '@remix-run/react'
import {
  FormLayout,
  TextField,
  Select,
  Card,
  Button,
  ButtonGroup,
  Stack,
  Badge,
  Banner,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
  Modal,
  Checkbox,
} from '@shopify/polaris'
import { ResourcePicker } from '@shopify/app-bridge-react'

interface BundleItem {
  id?: string
  productGid: string
  variantGid: string
  quantity: number
  productTitle?: string
  variantTitle?: string
  productImage?: string
  price?: string
}

interface Bundle {
  id?: string
  title: string
  type: 'FIXED' | 'MIX_MATCH'
  discountType: 'PERCENT' | 'AMOUNT'
  discountValue: number
  minQty?: number
  status: 'DRAFT' | 'ACTIVE'
  items: BundleItem[]
}

interface BundleFormProps {
  bundle?: Bundle
  isSubmitting?: boolean
  errors?: string[]
  onError?: () => void
  onSuccess?: () => void
}

export function BundleForm({ 
  bundle, 
  isSubmitting = false, 
  errors = [], 
  onError,
  onSuccess 
}: BundleFormProps) {
  const submit = useSubmit()
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [formData, setFormData] = useState<Bundle>({
    title: bundle?.title || '',
    type: bundle?.type || 'FIXED',
    discountType: bundle?.discountType || 'PERCENT',
    discountValue: bundle?.discountValue || 10,
    minQty: bundle?.minQty || undefined,
    status: bundle?.status || 'DRAFT',
    items: bundle?.items || [],
  })

  const [localErrors, setLocalErrors] = useState<string[]>([])
  
  useEffect(() => {
    if (errors.length > 0) {
      setLocalErrors(errors)
      onError?.()
    }
  }, [errors, onError])

  const handleInputChange = useCallback((field: keyof Bundle, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setLocalErrors([])
  }, [])

  const handleItemQuantityChange = useCallback((index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ),
    }))
  }, [])

  const handleRemoveItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }, [])

  const handleProductSelection = useCallback((selection: any) => {
    const newItems = selection.map((product: any) => 
      product.variants.map((variant: any) => ({
        productGid: product.id,
        variantGid: variant.id,
        quantity: 1,
        productTitle: product.title,
        variantTitle: variant.title,
        productImage: product.images?.[0]?.originalSrc,
        price: variant.price,
      }))
    ).flat()

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }))
    
    setShowProductPicker(false)
  }, [])

  const validateForm = useCallback((): string[] => {
    const errors: string[] = []
    
    if (!formData.title.trim()) {
      errors.push('Title is required')
    }
    
    if (formData.items.length < 2) {
      errors.push('Bundle must have at least 2 items')
    }
    
    if (formData.discountValue <= 0) {
      errors.push('Discount value must be greater than 0')
    }
    
    if (formData.discountType === 'PERCENT' && (formData.discountValue < 1 || formData.discountValue > 90)) {
      errors.push('Percent discount must be between 1% and 90%')
    }
    
    if (formData.discountType === 'AMOUNT' && formData.discountValue > 10000) {
      errors.push('Amount discount cannot exceed $10,000')
    }
    
    if (formData.type === 'MIX_MATCH' && (!formData.minQty || formData.minQty < 1)) {
      errors.push('Mix & Match bundles require a minimum quantity')
    }
    
    if (formData.type === 'MIX_MATCH' && formData.minQty && formData.minQty > formData.items.length) {
      errors.push('Minimum quantity cannot exceed the number of available items')
    }
    
    return errors
  }, [formData])

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setLocalErrors(validationErrors)
      onError?.()
      return
    }
    
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('intent', bundle ? 'update' : 'create')
    formDataToSubmit.append('bundle', JSON.stringify(formData))
    
    submit(formDataToSubmit, { method: 'POST' })
  }, [formData, validateForm, submit, bundle, onError])

  const bundleTypeOptions = [
    { label: 'Fixed Bundle', value: 'FIXED' },
    { label: 'Mix & Match', value: 'MIX_MATCH' },
  ]

  const discountTypeOptions = [
    { label: 'Percentage', value: 'PERCENT' },
    { label: 'Fixed Amount', value: 'AMOUNT' },
  ]

  const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Active', value: 'ACTIVE' },
  ]

  const errorBanner = (localErrors.length > 0 || errors.length > 0) ? (
    <Banner status="critical" title="Please fix the following errors:">
      <ul>
        {[...localErrors, ...errors].map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </Banner>
  ) : null

  const itemsResourceList = formData.items.length > 0 ? (
    <Card title="Bundle Items" sectioned>
      <ResourceList
        resourceName={{ singular: 'item', plural: 'items' }}
        items={formData.items.map((item, index) => ({ ...item, index }))}
        renderItem={(item: any) => {
          const { index, productTitle, variantTitle, productImage, price, quantity } = item
          
          return (
            <ResourceItem
              id={`${index}`}
              media={
                <Thumbnail
                  source={productImage || ''}
                  alt={productTitle}
                  size="small"
                />
              }
              accessibilityLabel={`View details for ${productTitle}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text variant="bodyMd" fontWeight="bold" as="h3">
                    {productTitle}
                  </Text>
                  <div>
                    {variantTitle && variantTitle !== 'Default Title' && (
                      <Text variant="bodyMd" as="p" color="subdued">
                        {variantTitle}
                      </Text>
                    )}
                    {price && (
                      <Text variant="bodyMd" as="p" color="subdued">
                        ${price}
                      </Text>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <TextField
                    label=""
                    type="number"
                    value={quantity.toString()}
                    onChange={(value) => handleItemQuantityChange(index, parseInt(value) || 1)}
                    min={1}
                    autoComplete="off"
                    connectedLeft={<Text variant="bodyMd" as="span">Qty:</Text>}
                  />
                  
                  <Button
                    size="slim"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </ResourceItem>
          )
        }}
      />
    </Card>
  ) : null

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        {errorBanner}
        
        <Card title="Bundle Settings" sectioned>
          <FormLayout>
            <TextField
              label="Bundle Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="e.g., Summer Essentials Bundle"
              autoComplete="off"
              disabled={isSubmitting}
            />
            
            <Select
              label="Bundle Type"
              options={bundleTypeOptions}
              value={formData.type}
              onChange={(value) => handleInputChange('type', value)}
              disabled={isSubmitting}
            />
            
            <FormLayout.Group>
              <Select
                label="Discount Type"
                options={discountTypeOptions}
                value={formData.discountType}
                onChange={(value) => handleInputChange('discountType', value)}
                disabled={isSubmitting}
              />
              
              <TextField
                label="Discount Value"
                type="number"
                value={formData.discountValue.toString()}
                onChange={(value) => handleInputChange('discountValue', parseFloat(value) || 0)}
                suffix={formData.discountType === 'PERCENT' ? '%' : '$'}
                min={formData.discountType === 'PERCENT' ? 1 : 0.01}
                max={formData.discountType === 'PERCENT' ? 90 : 10000}
                step={formData.discountType === 'PERCENT' ? 1 : 0.01}
                autoComplete="off"
                disabled={isSubmitting}
              />
            </FormLayout.Group>
            
            {formData.type === 'MIX_MATCH' && (
              <TextField
                label="Minimum Quantity"
                type="number"
                value={formData.minQty?.toString() || ''}
                onChange={(value) => handleInputChange('minQty', parseInt(value) || undefined)}
                helpText="Customers must select at least this many items"
                min={1}
                max={formData.items.length}
                autoComplete="off"
                disabled={isSubmitting}
              />
            )}
            
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              disabled={isSubmitting}
            />
          </FormLayout>
        </Card>
        
        {itemsResourceList}
        
        <Card sectioned>
          <Button
            onClick={() => setShowProductPicker(true)}
            disabled={isSubmitting}
          >
            Add Products
          </Button>
        </Card>
        
        <ButtonGroup>
          <Button 
            submit
            variant="primary"
            loading={isSubmitting}
            disabled={formData.items.length < 2}
          >
            {bundle ? 'Update Bundle' : 'Create Bundle'}
          </Button>
        </ButtonGroup>
      </FormLayout>
      
      <ResourcePicker
        resourceType="Product"
        open={showProductPicker}
        onCancel={() => setShowProductPicker(false)}
        onSelection={handleProductSelection}
        selectMultiple
        showVariants
      />
    </Form>
  )
}
