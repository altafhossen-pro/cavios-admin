import { Card, CardBody, CardTitle, Modal, Form, Button, Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { updateOrderComprehensive } from '@/features/admin/api/orderApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface ShippingAddress {
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
  shippingAddress?: ShippingAddress
}

const NewShippingInformation = ({ order, onUpdate }: { order: Order; onUpdate?: () => void }) => {
  const { showNotification } = useNotificationContext()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    street: order.shippingAddress?.street || '',
    city: order.shippingAddress?.city || '',
    state: order.shippingAddress?.state || '',
    postalCode: order.shippingAddress?.postalCode || '',
    country: order.shippingAddress?.country || '',
    division: order.shippingAddress?.division || '',
    district: order.shippingAddress?.district || '',
    upazila: order.shippingAddress?.upazila || '',
    area: order.shippingAddress?.area || '',
  })

  const handleSave = async () => {
    try {
      const response = await updateOrderComprehensive(order._id, {
        shippingAddress: formData,
        reason: 'Shipping address updated by admin',
      })

      if (response.success) {
        showNotification({ message: 'Shipping address updated successfully', variant: 'success' })
        setShowModal(false)
        onUpdate?.()
      } else {
        showNotification({ message: response.message || 'Failed to update address', variant: 'danger' })
      }
    } catch (error: any) {
      console.error('Error updating shipping address:', error)
      showNotification({ message: 'Failed to update shipping address', variant: 'danger' })
    }
  }
  const getCustomerName = () => {
    if (order.user?.name) return order.user.name
    if (order.guestInfo?.name) return order.guestInfo.name
    if (order.manualOrderInfo?.name) return order.manualOrderInfo.name
    return 'N/A'
  }

  const getCustomerPhone = () => {
    // Priority: Checkout form phone (manualOrderInfo) > User account phone > Guest info phone
    if (order.manualOrderInfo?.phone) return order.manualOrderInfo.phone
    if (order.user?.phone) return order.user.phone
    if (order.guestInfo?.phone) return order.guestInfo.phone
    return 'N/A'
  }

  const getCustomerEmail = () => {
    if (order.user?.email) return order.user.email
    if (order.guestInfo?.email) return order.guestInfo.email
    if (order.manualOrderInfo?.email) return order.manualOrderInfo.email
    return 'N/A'
  }


  return (
    <Card className="card-height-100">
      <CardBody>
        <div className="float-end">
          <span role="button" className="text-primary" onClick={() => setShowModal(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </span>
        </div>
        <CardTitle as={'h5'} className="mb-3">
          Shipping Information
        </CardTitle>
        <div className="shipping-info-details">
          {getCustomerName() !== 'N/A' && (
            <div className="mb-2">
              <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                Name:
              </span>
              <span>{getCustomerName()}</span>
            </div>
          )}
          
          {order.shippingAddress && (
            <>
              {order.shippingAddress.street && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    Street:
                  </span>
                  <span>{order.shippingAddress.street}</span>
                </div>
              )}
              {order.shippingAddress.area && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    Area:
                  </span>
                  <span>{order.shippingAddress.area}</span>
                </div>
              )}
              {order.shippingAddress.upazila && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    Upazila:
                  </span>
                  <span>{order.shippingAddress.upazila}</span>
                </div>
              )}
              {order.shippingAddress.district && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    District:
                  </span>
                  <span>{order.shippingAddress.district}</span>
                </div>
              )}
              {order.shippingAddress.division && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    Division:
                  </span>
                  <span>{order.shippingAddress.division}</span>
                </div>
              )}
              {order.shippingAddress.city && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    City:
                  </span>
                  <span>{order.shippingAddress.city}</span>
                </div>
              )}
              {order.shippingAddress.state && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    State:
                  </span>
                  <span>{order.shippingAddress.state}</span>
                </div>
              )}
              {order.shippingAddress.postalCode && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    Postal Code:
                  </span>
                  <span>{order.shippingAddress.postalCode}</span>
                </div>
              )}
              {order.shippingAddress.country && (
                <div className="mb-2">
                  <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                    Country:
                  </span>
                  <span>{order.shippingAddress.country}</span>
                </div>
              )}
            </>
          )}
          
          {!order.shippingAddress && (order.guestInfo?.address || order.manualOrderInfo?.address) && (
            <div className="mb-2">
              <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                Address:
              </span>
              <span>{order.guestInfo?.address || order.manualOrderInfo?.address}</span>
            </div>
          )}
          
          {getCustomerPhone() !== 'N/A' && (
            <div className="mb-2">
              <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                Phone:
              </span>
              <span>{getCustomerPhone()}</span>
            </div>
          )}
          
          {getCustomerEmail() !== 'N/A' && (
            <div className="mb-2">
              <span className="text-muted fw-semibold d-inline-block" style={{ minWidth: '120px' }}>
                Email:
              </span>
              <span>{getCustomerEmail()}</span>
            </div>
          )}
        </div>
      </CardBody>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Shipping Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Street</Form.Label>
              <Form.Control
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            {formData.division && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Division</Form.Label>
                    <Form.Control
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            {formData.upazila && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Upazila</Form.Label>
                    <Form.Control
                      value={formData.upazila}
                      onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Area</Form.Label>
                    <Form.Control
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  )
}

export default NewShippingInformation

