import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import ProductSearchSection from './components/ProductSearchSection'
import CartItemsSection from './components/CartItemsSection'
import UserInfoSection from './components/UserInfoSection'
import OrderSummarySection from './components/OrderSummarySection'
import { createManualOrder, type CreateManualOrderRequest } from '@/features/admin/api/orderApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import Preloader from '@/components/Preloader'

export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  variantId?: string
  variant?: {
    sku: string
    attributes: Array<{ name: string; value: string; displayValue?: string; hexCode?: string }>
    currentPrice: number
    stockQuantity: number
    stockStatus: string
  }
  quantity: number
  price: number
  subtotal: number
}

const CreateManualOrder = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<'existing' | 'guest'>('existing')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [orderDetails, setOrderDetails] = useState({
    discount: 0,
    shippingCost: 0,
    status: 'confirmed',
    notes: '',
    deliveryAddress: '',
  })
  const [loading, setLoading] = useState(false)

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += item.quantity
        updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].price
        return updated
      }
      return [...prev, item]
    })
  }

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates }
          
          // Validate quantity against stock
          if (updates.quantity !== undefined && updated.variant?.stockQuantity !== undefined) {
            if (updates.quantity > updated.variant.stockQuantity) {
              updated.quantity = updated.variant.stockQuantity
              showNotification({
                message: `Maximum ${updated.variant.stockQuantity} available for this variant`,
                variant: 'warning',
              })
            }
          }
          
          if (updates.quantity !== undefined || updates.price !== undefined) {
            updated.subtotal = updated.quantity * updated.price
          }
          return updated
        }
        return item
      })
    )
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal - (orderDetails.discount || 0) + (orderDetails.shippingCost || 0)
  }

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      showNotification({ message: 'Please add at least one item to the cart', variant: 'danger' })
      return
    }

    if (orderType === 'existing' && !selectedUserId) {
      showNotification({ message: 'Please select a customer', variant: 'danger' })
      return
    }

    if (orderType === 'guest') {
      if (!guestInfo.name || !guestInfo.phone || !guestInfo.address) {
        showNotification({ message: 'Please fill in all required guest information', variant: 'danger' })
        return
      }
    }

    const orderData: CreateManualOrderRequest = {
      orderType,
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        size: item.variant?.attributes.find((attr) => attr.name === 'Size')?.value,
        color: item.variant?.attributes.find((attr) => attr.name === 'Color')?.value,
        colorHexCode: item.variant?.attributes.find((attr) => attr.name === 'Color')?.hexCode,
        sku: item.variant?.sku,
        stockQuantity: item.variant?.stockQuantity,
        stockStatus: item.variant?.stockStatus,
      })),
      subtotal: calculateSubtotal(),
      discount: orderDetails.discount || 0,
      shippingCost: orderDetails.shippingCost || 0,
      totalAmount: calculateTotal(),
      status: orderDetails.status,
      notes: orderDetails.notes,
      userId: orderType === 'existing' ? selectedUserId : undefined,
      guestInfo: orderType === 'guest' ? guestInfo : undefined,
      deliveryAddress: orderDetails.deliveryAddress || guestInfo.address,
      orderSource: 'manual',
    }

    setLoading(true)
    try {
      const response = await createManualOrder(orderData)
      if (response.success) {
        showNotification({ message: 'Manual order created successfully!', variant: 'success' })
        navigate(`/ecommerce/orders/${response.data._id}`)
      } else {
        showNotification({ message: response.message || 'Failed to create order', variant: 'danger' })
      }
    } catch (error: any) {
      showNotification({ message: error.message || 'Failed to create order', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Preloader />
  }

  return (
    <>
      <PageBreadcrumb title="Create Manual Order" subName="Ecommerce" />
      <PageMetaData title="Create Manual Order" />

      <Row>
        <Col lg={8}>
          <ProductSearchSection onAddToCart={addToCart} cartItems={cartItems} />
          <CartItemsSection
            items={cartItems}
            onUpdate={updateCartItem}
            onRemove={removeFromCart}
          />
          <UserInfoSection
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            selectedUserId={selectedUserId}
            onUserIdChange={setSelectedUserId}
            guestInfo={guestInfo}
            onGuestInfoChange={setGuestInfo}
            deliveryAddress={orderDetails.deliveryAddress}
            onDeliveryAddressChange={(address) =>
              setOrderDetails((prev) => ({ ...prev, deliveryAddress: address }))
            }
          />
        </Col>
        <Col lg={4}>
          <OrderSummarySection
            cartItems={cartItems}
            subtotal={calculateSubtotal()}
            discount={orderDetails.discount}
            shippingCost={orderDetails.shippingCost}
            total={calculateTotal()}
            status={orderDetails.status}
            notes={orderDetails.notes}
            onDiscountChange={(discount) =>
              setOrderDetails((prev) => ({ ...prev, discount }))
            }
            onShippingCostChange={(shippingCost) =>
              setOrderDetails((prev) => ({ ...prev, shippingCost }))
            }
            onStatusChange={(status) =>
              setOrderDetails((prev) => ({ ...prev, status }))
            }
            onNotesChange={(notes) =>
              setOrderDetails((prev) => ({ ...prev, notes }))
            }
            onSubmit={handleSubmit}
          />
        </Col>
      </Row>
    </>
  )
}

export default CreateManualOrder
