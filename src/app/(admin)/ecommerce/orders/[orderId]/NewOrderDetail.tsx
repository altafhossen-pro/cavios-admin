import { useEffect, useState } from 'react'
import { Col, Row, Button, Dropdown, DropdownMenu, DropdownToggle, DropdownItem, Modal, Form } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import { getAdminOrderById, updateOrderStatus } from '@/features/admin/api/orderApi'
import Preloader from '@/components/Preloader'
import NewOrderProducts from './components/NewOrderProducts'
import NewOrderSummery from './components/NewOrderSummery'
import NewShippingInformation from './components/NewShippingInformation'
import NewBillingInformation from './components/NewBillingInformation'
import NewDeliveryInformation from './components/NewDeliveryInformation'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface Order {
  _id: string
  orderId: string
  createdAt: string
  updatedAt: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  total: number
  shippingCost: number
  discount: number
  couponDiscount?: number
  loyaltyDiscount?: number
  upsellDiscount?: number
  user?: {
    _id: string
    name: string
    email: string
    phone: string
  }
  guestInfo?: {
    name: string
    email: string
    phone: string
    address: string
  }
  manualOrderInfo?: {
    name: string
    email: string
    phone: string
    address: string
  }
  shippingAddress?: {
    label?: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    division?: string
    district?: string
    upazila?: string
    area?: string
  }
  billingAddress?: {
    label?: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    division?: string
    district?: string
    upazila?: string
    area?: string
  }
  items: Array<{
    product: {
      _id: string
      title: string
      featuredImage: string
      slug?: string
    }
    name: string
    image: string
    quantity: number
    price: number
    subtotal: number
    variant?: {
      size?: string
      color?: string
      colorHexCode?: string
      sku?: string
    }
  }>
  orderNotes?: string
  adminNotes?: string
  tracking?: Array<{
    status: string
    date: string
    note: string
  }>
  statusTimestamps?: {
    pending?: string
    confirmed?: string
    processing?: string
    shipped?: string
    delivered?: string
    cancelled?: string
    returned?: string
  }
}

const NewOrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusModalShow, setStatusModalShow] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [statusReason, setStatusReason] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  const fetchOrder = async () => {
    if (!orderId) {
      navigate('/pages/error-404-alt')
      return
    }

    setLoading(true)
    try {
      const response = await getAdminOrderById(orderId)
      if (response.success && response.data) {
        setOrder(response.data as Order)
      } else {
        showNotification({ message: response.message || 'Order not found', variant: 'danger' })
        navigate('/pages/error-404-alt')
      }
    } catch (error: any) {
      console.error('Error fetching order:', error)
      showNotification({ message: 'Failed to fetch order', variant: 'danger' })
      navigate('/pages/error-404-alt')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    setStatusModalShow(true)
  }

  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus) return

    try {
      const response = await updateOrderStatus(orderId, {
        status: selectedStatus,
        reason: statusReason,
        notes: statusNotes,
      })

      if (response.success) {
        showNotification({ message: 'Order status updated successfully', variant: 'success' })
        setStatusModalShow(false)
        setStatusReason('')
        setStatusNotes('')
        fetchOrder() // Refresh order data
      } else {
        showNotification({ message: response.message || 'Failed to update status', variant: 'danger' })
      }
    } catch (error: any) {
      console.error('Error updating order status:', error)
      showNotification({ message: 'Failed to update order status', variant: 'danger' })
    }
  }

  const getStatusProgress = () => {
    if (!order) return []
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
    const currentIndex = statuses.indexOf(order.status)
    return statuses.map((status, index) => ({
      status,
      active: index <= currentIndex,
      completed: index < currentIndex,
    }))
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return <Preloader />
  }

  if (!order) {
    return null
  }

  const statusProgress = getStatusProgress()

  return (
    <>
      <PageBreadcrumb subName="Ecommerce" title="Order Details" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Order #{order.orderId}</h4>
              <p className="text-muted mb-0">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="d-flex gap-2">
              <Dropdown>
                <DropdownToggle variant="primary" id="status-dropdown">
                  <IconifyIcon icon="bx:edit" className="me-1" />
                  Update Status
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => handleStatusChange('pending')}>Pending</DropdownItem>
                  <DropdownItem onClick={() => handleStatusChange('confirmed')}>Confirmed</DropdownItem>
                  <DropdownItem onClick={() => handleStatusChange('processing')}>Processing</DropdownItem>
                  <DropdownItem onClick={() => handleStatusChange('shipped')}>Shipped</DropdownItem>
                  <DropdownItem onClick={() => handleStatusChange('delivered')}>Delivered</DropdownItem>
                  <DropdownItem onClick={() => handleStatusChange('cancelled')}>Cancelled</DropdownItem>
                  <DropdownItem onClick={() => handleStatusChange('returned')}>Returned</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button
                variant="outline-primary"
                onClick={() => {
                  navigate(`/invoices/${order._id}`)
                }}
              >
                <IconifyIcon icon="bx:file" className="me-1" />
                View Invoice
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col lg={10} xl={8}>
          <ul className="progressbar ps-0 my-5 pb-5">
            {statusProgress.map((item, idx) => (
              <li key={idx} className={item.active ? 'active' : ''}>
                {getStatusLabel(item.status)}
              </li>
            ))}
          </ul>
        </Col>
      </Row>

      <Row>
        <Col xl={7}>
          <NewOrderProducts order={order} />
        </Col>
        <Col xl={5}>
          <NewOrderSummery order={order} />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col lg={4}>
          <NewShippingInformation order={order} onUpdate={fetchOrder} />
        </Col>
        <Col lg={4}>
          <NewBillingInformation order={order} onUpdate={fetchOrder} />
        </Col>
        <Col lg={4}>
          <NewDeliveryInformation order={order} />
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal show={statusModalShow} onHide={() => setStatusModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Reason for status change..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Admin Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setStatusModalShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate} disabled={!selectedStatus}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default NewOrderDetail

