import { useState } from 'react'
import { Card, CardBody, CardTitle, Modal, Button, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { updateOrderComprehensive } from '@/features/admin/api/orderApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface BillingAddress {
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

interface Order {
  _id: string
  orderId: string
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  billingAddress?: BillingAddress
}

const NewBillingInformation = ({ order, onUpdate }: { order: Order; onUpdate?: () => void }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(order.paymentStatus)
  const [paymentReason, setPaymentReason] = useState<string>('')
  const [paymentNotes, setPaymentNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotificationContext()
  const formatAddress = (addr: BillingAddress) => {
    const parts = []
    if (addr.street) parts.push(addr.street)
    if (addr.area) parts.push(addr.area)
    if (addr.upazila) parts.push(addr.upazila)
    if (addr.district) parts.push(addr.district)
    if (addr.division) parts.push(addr.division)
    if (addr.city) parts.push(addr.city)
    if (addr.state) parts.push(addr.state)
    if (addr.postalCode) parts.push(addr.postalCode)
    if (addr.country) parts.push(addr.country)
    return parts.join(', ')
  }

  const address = order.billingAddress ? formatAddress(order.billingAddress) : 'Same as shipping address'

  const getPaymentStatusColor = () => {
    switch (order.paymentStatus) {
      case 'paid':
        return 'success'
      case 'failed':
        return 'danger'
      case 'refunded':
        return 'warning'
      case 'pending':
      default:
        return 'secondary'
    }
  }

  const handleOpenModal = () => {
    setSelectedPaymentStatus(order.paymentStatus)
    setPaymentReason('')
    setPaymentNotes('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedPaymentStatus(order.paymentStatus)
    setPaymentReason('')
    setPaymentNotes('')
  }

  const handlePaymentStatusUpdate = async () => {
    if (!selectedPaymentStatus || selectedPaymentStatus === order.paymentStatus) {
      showNotification({ message: 'Please select a different payment status', variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const response = await updateOrderComprehensive(order._id, {
        paymentStatus: selectedPaymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        reason: paymentReason || undefined,
        adminNotes: paymentNotes || undefined,
      })

      if (response.success) {
        showNotification({ message: 'Payment status updated successfully', variant: 'success' })
        handleCloseModal()
        onUpdate?.()
      } else {
        showNotification({ message: response.message || 'Failed to update payment status', variant: 'danger' })
      }
    } catch (error: any) {
      showNotification({ message: error.message || 'Failed to update payment status', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="card-height-100">
        <CardBody>
          <div className="float-end">
            <span role="button" className="text-primary" onClick={handleOpenModal}>
              <IconifyIcon icon="bx:edit" className="me-1" />
              Edit
            </span>
          </div>
        <CardTitle as={'h5'} className="mb-3">
          Billing Information
        </CardTitle>
        <p className="mb-1">
          Payment Type :
          <span className="text-muted me-2" />
          <b>{order.paymentMethod || 'COD'}</b>
        </p>
        <p className="mb-1">
          Payment Status :
          <span className="text-muted me-2" />
          <span className={`badge badge-soft-${getPaymentStatusColor()}`}>
            {order.paymentStatus}
          </span>
        </p>
        {order.billingAddress && (
          <div className="mt-3">
            <p className="mb-1 fw-semibold">Billing Address:</p>
            <address className="mb-0">
              {address.split(',').map((line, idx) => (
                <span key={idx}>
                  {line.trim()}
                  {idx < address.split(',').length - 1 && <br />}
                </span>
              ))}
            </address>
          </div>
        )}
        {!order.billingAddress && (
          <p className="mb-0 text-muted">
            <small>{address}</small>
          </p>
        )}
      </CardBody>
    </Card>

    {/* Payment Status Update Modal */}
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Update Payment Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Current Payment Method</Form.Label>
            <Form.Control type="text" value={order.paymentMethod?.toUpperCase() || 'N/A'} disabled />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>New Payment Status *</Form.Label>
            <Form.Select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Reason (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={paymentReason}
              onChange={(e) => setPaymentReason(e.target.value)}
              placeholder="Reason for payment status change..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Admin Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handlePaymentStatusUpdate}
          disabled={!selectedPaymentStatus || selectedPaymentStatus === order.paymentStatus || loading}
        >
          {loading ? 'Updating...' : 'Update Payment Status'}
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  )
}

export default NewBillingInformation

