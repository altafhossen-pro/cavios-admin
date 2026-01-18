import { useState, useEffect, useRef } from 'react'
import { Card, CardBody, CardTitle, FormControl, FormGroup, FormLabel, Button, ListGroup } from 'react-bootstrap'
import { searchProducts, type Product } from '@/features/admin/api/productApi'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import type { CartItem } from '../page'

interface ProductSearchSectionProps {
  onAddToCart: (item: CartItem) => void
  cartItems: CartItem[]
}

const ProductSearchSection = ({ onAddToCart, cartItems }: ProductSearchSectionProps) => {
  const { showNotification } = useNotificationContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length < 2) {
      setProducts([])
      setSelectedProduct(null)
      setSelectedVariant(null)
      setShowSuggestions(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await searchProducts(searchQuery, 10)
        if (response.success) {
          setProducts(response.data)
          
          // Check if exact SKU match exists
          let exactMatchProduct: Product | null = null
          let exactMatchVariant: any = null
          
          for (const product of response.data) {
            if (product.variants && product.variants.length > 0) {
              const matchedVariant = product.variants.find(
                (variant: any) => variant.sku?.toLowerCase() === searchQuery.trim().toLowerCase()
              )
              if (matchedVariant) {
                exactMatchProduct = product
                exactMatchVariant = matchedVariant
                break
              }
            }
          }

          // If exact SKU match found, automatically add to cart
          if (exactMatchProduct && exactMatchVariant) {
            // Calculate available stock considering cart items
            const cartQuantity = cartItems
              .filter((item) => item.variantId === exactMatchVariant._id || item.variant?.sku === exactMatchVariant.sku)
              .reduce((sum, item) => sum + item.quantity, 0)
            const availableStock = Math.max(0, (exactMatchVariant.stockQuantity || 0) - cartQuantity)
            
            if (availableStock > 0) {
              const getProductImage = () => {
                if (exactMatchProduct.featuredImage) return exactMatchProduct.featuredImage
                if (Array.isArray(exactMatchProduct.images) && exactMatchProduct.images.length > 0) {
                  const firstImage = exactMatchProduct.images[0]
                  return typeof firstImage === 'string' ? firstImage : firstImage.url
                }
                return ''
              }

              const cartItem: CartItem = {
                id: `${exactMatchProduct._id || exactMatchProduct.id}-${exactMatchVariant._id || exactMatchVariant.sku}-${Date.now()}`,
                productId: exactMatchProduct._id || exactMatchProduct.id || '',
                productName: exactMatchProduct.title || '',
                productImage: getProductImage(),
                variantId: exactMatchVariant._id,
                variant: {
                  sku: exactMatchVariant.sku || '',
                  attributes: exactMatchVariant.attributes || [],
                  currentPrice: exactMatchVariant.currentPrice || 0,
                  stockQuantity: availableStock,
                  stockStatus: exactMatchVariant.stockStatus || 'in_stock',
                },
                quantity: 1,
                price: exactMatchVariant.currentPrice || 0,
                subtotal: exactMatchVariant.currentPrice || 0,
              }

              // Automatically add to cart
              onAddToCart(cartItem)
              
              // Clear search and reset state
              setSearchQuery('')
              setProducts([])
              setSelectedProduct(null)
              setSelectedVariant(null)
              setShowSuggestions(false)
            } else {
              // Stock is 0, show red toast notification
              showNotification({
                message: 'No more quantity available',
                variant: 'danger',
              })
              // Clear input and reset state
              setSearchQuery('')
              setProducts([])
              setSelectedProduct(null)
              setSelectedVariant(null)
              setShowSuggestions(false)
            }
          } else {
            // No exact match, show suggestions
            setShowSuggestions(true)
          }
        }
      } catch (error) {
        console.error('Error searching products:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, cartItems])

  // Calculate available stock considering cart items
  const getAvailableStock = (variant: any) => {
    const originalStock = variant.stockQuantity || 0
    // Find if same variant is already in cart
    const cartQuantity = cartItems
      .filter((item) => item.variantId === variant._id || item.variant?.sku === variant.sku)
      .reduce((sum, item) => sum + item.quantity, 0)
    return Math.max(0, originalStock - cartQuantity)
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setSelectedVariant(null)
    setShowSuggestions(false) // Hide suggestions after selection
    setSearchQuery(product.title || '')
    setQuantity(1)
  }

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant)
    // Reset quantity to 1 when variant changes, but limit to available stock
    const availableStock = getAvailableStock(variant)
    setQuantity(Math.min(1, availableStock))
  }

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) {
      return
    }

    const getProductImage = () => {
      if (selectedProduct.featuredImage) return selectedProduct.featuredImage
      if (Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0) {
        const firstImage = selectedProduct.images[0]
        return typeof firstImage === 'string' ? firstImage : firstImage.url
      }
      return ''
    }

    const cartItem: CartItem = {
      id: `${selectedProduct._id || selectedProduct.id}-${selectedVariant._id || selectedVariant.sku}-${Date.now()}`,
      productId: selectedProduct._id || selectedProduct.id || '',
      productName: selectedProduct.title || '',
      productImage: getProductImage(),
      variantId: selectedVariant._id,
      variant: {
        sku: selectedVariant.sku || '',
        attributes: selectedVariant.attributes || [],
        currentPrice: selectedVariant.currentPrice || 0,
        stockQuantity: selectedVariant.stockQuantity || 0,
        stockStatus: selectedVariant.stockStatus || 'in_stock',
      },
      quantity,
      price: selectedVariant.currentPrice || 0,
      subtotal: (selectedVariant.currentPrice || 0) * quantity,
    }

    const availableStock = getAvailableStock(selectedVariant)
    
    // Validate quantity against available stock
    if (quantity > availableStock) {
      return
    }

    onAddToCart(cartItem)
    setSearchQuery('')
    setSelectedProduct(null)
    setSelectedVariant(null)
    setQuantity(1)
    setShowSuggestions(false) // Hide suggestions after adding to cart
  }

  const getVariantDisplayName = (variant: any) => {
    if (!variant.attributes || variant.attributes.length === 0) {
      return variant.sku || 'Default'
    }
    return variant.attributes
      .map((attr: any) => `${attr.name}: ${attr.displayValue || attr.value}`)
      .join(', ')
  }

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle className="mb-3">
          <IconifyIcon icon="bx:search-alt" className="me-2" />
          Search Product by SKU or Name
        </CardTitle>

        <FormGroup className="mb-3 position-relative">
          <FormLabel>Search</FormLabel>
          <FormControl
            ref={searchInputRef}
            type="text"
            placeholder="Type SKU or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => products.length > 0 && setShowSuggestions(true)}
            autoFocus
          />
          {loading && (
            <div className="position-absolute" style={{ right: '10px', top: '40px' }}>
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && products.length > 0 && (
            <div
              ref={suggestionsRef}
              className="position-absolute w-100 bg-white border rounded shadow-lg"
              style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto', top: '100%', marginTop: '4px' }}
            >
              <ListGroup variant="flush">
                {products.map((product) => {
                  // Calculate total available stock for this product
                  const totalAvailableStock = product.variants?.reduce((sum: number, variant: any) => {
                    const cartQuantity = cartItems
                      .filter((item) => item.variantId === variant._id || item.variant?.sku === variant.sku)
                      .reduce((qty, item) => qty + item.quantity, 0)
                    return sum + Math.max(0, (variant.stockQuantity || 0) - cartQuantity)
                  }, 0) || 0

                  return (
                    <ListGroup.Item
                      key={product._id || product.id}
                      action
                      onClick={() => handleProductSelect(product)}
                      className="cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        {product.featuredImage && (
                          <img
                            src={product.featuredImage}
                            alt={product.title}
                            className="me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        )}
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{product.title}</div>
                          {product.variants && product.variants.length > 0 && (
                            <small className="text-muted">
                              {product.variants.length} variant{product.variants.length > 1 ? 's' : ''} • Available: {totalAvailableStock}
                            </small>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  )
                })}
              </ListGroup>
            </div>
          )}
        </FormGroup>

        {/* Selected Product and Variant Selection */}
        {selectedProduct && (
          <div className="border rounded p-3 mb-3">
            <div className="d-flex align-items-center mb-3">
              {selectedProduct.featuredImage && (
                <img
                  src={selectedProduct.featuredImage}
                  alt={selectedProduct.title}
                  className="me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
              )}
              <div>
                <h6 className="mb-0">{selectedProduct.title}</h6>
                <small className="text-muted">
                  {selectedProduct.variants?.length || 0} variant{selectedProduct.variants?.length !== 1 ? 's' : ''} available
                </small>
              </div>
            </div>

            {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
              <div>
                <FormLabel>Select Variant</FormLabel>
                <FormControl
                  as="select"
                  value={selectedVariant?.sku || ''}
                  onChange={(e) => {
                    const variant = selectedProduct.variants?.find(
                      (v: any) => v.sku === e.target.value
                    )
                    handleVariantSelect(variant)
                  }}
                  className="mb-3"
                >
                  <option value="">Choose a variant...</option>
                  {selectedProduct.variants.map((variant: any) => {
                    const availableStock = getAvailableStock(variant)
                    return (
                      <option key={variant.sku || variant._id} value={variant.sku} disabled={availableStock === 0}>
                        {getVariantDisplayName(variant)} - ৳{variant.currentPrice || 0} (Available: {availableStock})
                      </option>
                    )
                  })}
                </FormControl>
              </div>
            ) : (
              <div className="alert alert-info mb-3">
                No variants available for this product
              </div>
            )}

            {selectedVariant && (() => {
              const availableStock = getAvailableStock(selectedVariant)
              return (
                <div className="d-flex gap-2 align-items-end">
                  <FormGroup className="flex-grow-1">
                    <FormLabel>
                      Quantity
                      {availableStock !== undefined && (
                        <small className="text-muted ms-2">
                          (Available: {availableStock})
                        </small>
                      )}
                    </FormLabel>
                    <FormControl
                      type="number"
                      min="1"
                      max={availableStock}
                      value={quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1
                        // Limit to available stock
                        const limitedQuantity = newQuantity > availableStock ? availableStock : newQuantity
                        setQuantity(limitedQuantity)
                      }}
                    />
                    {availableStock === 0 && (
                      <small className="text-danger d-block mt-1">
                        This variant is out of stock
                      </small>
                    )}
                    {availableStock > 0 && quantity > availableStock && (
                      <small className="text-danger d-block mt-1">
                        Maximum {availableStock} available
                      </small>
                    )}
                  </FormGroup>
                  <Button
                    variant="primary"
                    onClick={handleAddToCart}
                    disabled={
                      !selectedVariant ||
                      quantity < 1 ||
                      availableStock === 0 ||
                      quantity > availableStock
                    }
                  >
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add to Cart
                  </Button>
                </div>
              )
            })()}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default ProductSearchSection
