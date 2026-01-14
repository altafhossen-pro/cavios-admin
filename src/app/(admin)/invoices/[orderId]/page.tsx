import { useEffect, useState } from 'react'
import { Card, CardBody, CardTitle, Col, Row, Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'

import { getAdminOrderById } from '@/features/admin/api/orderApi'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import { currency } from '@/context/constants'
import PageMetaData from '@/components/PageTitle'
import Preloader from '@/components/Preloader'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

import logoDark from '@/assets/images/logo-dark.png'

interface Order {
  _id: string
  orderId: string
  createdAt: string
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
}

const InvoiceDetail = () => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { orderId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
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
          navigate('/pages/error-404-alt')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        navigate('/pages/error-404-alt')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, navigate])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download when backend API is ready
    window.print()
  }

  if (loading) {
    return <Preloader />
  }

  if (!order) {
    return null
  }

  // Calculate totals
  const subtotal = order.total - (order.shippingCost || 0) + (order.discount || 0) + (order.couponDiscount || 0) + (order.loyaltyDiscount || 0) + (order.upsellDiscount || 0)
  const totalDiscount = (order.discount || 0) + (order.couponDiscount || 0) + (order.loyaltyDiscount || 0) + (order.upsellDiscount || 0)

  // Get customer info
  const customerName = order.user?.name || order.guestInfo?.name || order.manualOrderInfo?.name || 'N/A'
  const customerEmail = order.user?.email || order.guestInfo?.email || order.manualOrderInfo?.email || 'N/A'
  const customerPhone = order.user?.phone || order.guestInfo?.phone || order.manualOrderInfo?.phone || 'N/A'

  // Get billing address
  const billingAddress = order.billingAddress || order.shippingAddress
  
  // Main address (street/manual address) - shown on top
  const mainAddress = billingAddress?.street || 'N/A'
  
  // Location details (upazila/area, district, division) - shown below
  const locationParts = []
  if (billingAddress?.upazila) {
    locationParts.push(billingAddress.upazila)
  } else if (billingAddress?.area) {
    locationParts.push(billingAddress.area)
  }
  if (billingAddress?.district) {
    locationParts.push(billingAddress.district)
  }
  if (billingAddress?.division) {
    locationParts.push(billingAddress.division)
  }
  const locationText = locationParts.length > 0 ? locationParts.join(', ') : ''

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <PageBreadcrumb subName="Invoice" title={`Invoice #${order.orderId}`} />
      <PageMetaData title={`Invoice #${order.orderId}`} />

      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-end gap-2 print-hidden">
            <Button variant="outline-primary" onClick={handlePrint}>
              <IconifyIcon icon="bx:printer" className="me-1" />
              Print
            </Button>
            <Button variant="primary" onClick={handleDownload}>
              <IconifyIcon icon="bx:download" className="me-1" />
              Download PDF
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/ecommerce/orders/${order._id}`)}>
              <IconifyIcon icon="bx:arrow-back" className="me-1" />
              Back to Order
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="clearfix mb-4">
                <div className="float-sm-start">
                  <CardTitle as={'h5'} className="mb-2">
                    Invoice: #{order.orderId}
                  </CardTitle>
                  <p className="text-muted mb-1">
                    <strong>Date:</strong> {formatDate(order.createdAt)}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Status:</strong> <span className="text-capitalize">{order.status}</span>
                  </p>
                  <p className="text-muted mb-0">
                    <strong>Payment:</strong> <span className="text-capitalize">{order.paymentStatus}</span> ({order.paymentMethod || 'COD'})
                  </p>
                </div>
              </div>

              <Row className="mt-4 bill-address-row">
                <Col md={6} className="bill-from-col">
                  <h6 className="fw-normal text-muted">Bill From</h6>
                  <div className="auth-logo mb-2">
                    <img className="logo-dark me-1" src={logoDark} alt="logo-dark" height={24} />
                  </div>
                  <address>
                    <strong>Cavios</strong>
                    <br />
                    {/* TODO: Add company address from settings */}
                    <strong>Phone:</strong> +880 1234 567890
                    <br />
                    <strong>Email:</strong> info@cavios.com
                  </address>
                </Col>
                <Col md={6} className="text-end bill-to-col">
                  <h6 className="fw-normal text-muted">Bill To</h6>
                  <h6 className="fs-16">{customerName}</h6>
                  <div className="text-end" style={{ fontStyle: 'normal' }}>
                    {mainAddress}
                    {locationText && (
                      <>
                        <br />
                        <small className="text-muted">{locationText}</small>
                      </>
                    )}
                    <br />
                    <strong>Phone:</strong> {customerPhone}
                    <br />
                    <strong>Email:</strong> {customerEmail}
                  </div>
                </Col>
              </Row>

              <Row>
                <Col xs={12}>
                  <div className="table-responsive text-nowrap mt-3 table-centered">
                    <table className="table mb-0 invoice-product-table">
                      <thead className="bg-light bg-opacity-50">
                        <tr>
                          <th className="py-2">Product Name</th>
                          <th className="py-2">Quantity</th>
                          <th className="py-2">Price</th>
                          <th className="text-end py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <tr key={idx} className="product-row">
                              <td>
                                <div>
                                  <div className="fw-medium">{item.name || item.product?.title || 'N/A'}</div>
                                  {item.variant && (
                                    <small className="text-muted">
                                      {item.variant.size && `Size: ${item.variant.size}`}
                                      {item.variant.size && item.variant.color && ' | '}
                                      {item.variant.color && `Color: ${item.variant.color}`}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td>{item.quantity}</td>
                              <td>{currency}{item.price?.toFixed(2) || '0.00'}</td>
                              <td className="text-end">{currency}{item.subtotal?.toFixed(2) || '0.00'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-muted">
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col sm={7}>
                  {(order.orderNotes || order.adminNotes) && (
                    <div className="clearfix pt-xl-3 pt-0">
                      <h6 className="text-muted">Notes:</h6>
                      {order.orderNotes && (
                        <small className="text-muted d-block mb-2">
                          <strong>Order Notes:</strong> {order.orderNotes}
                        </small>
                      )}
                      {order.adminNotes && (
                        <small className="text-muted d-block">
                          <strong>Admin Notes:</strong> {order.adminNotes}
                        </small>
                      )}
                    </div>
                  )}
                </Col>
                <Col sm={5}>
                  <div className="float-end">
                    <p>
                      <span className="fw-medium">Subtotal :</span>
                      <span className="float-end">{currency}{subtotal.toFixed(2)}</span>
                    </p>
                    {totalDiscount > 0 && (
                      <>
                        <p>
                          <span className="fw-medium">Discount :</span>
                          <span className="float-end text-success">-{currency}{totalDiscount.toFixed(2)}</span>
                        </p>
                        {order.couponDiscount && order.couponDiscount > 0 && (
                          <p className="ps-3">
                            <small className="text-muted">Coupon Discount</small>
                            <span className="float-end text-success">
                              <small>-{currency}{order.couponDiscount.toFixed(2)}</small>
                            </span>
                          </p>
                        )}
                        {order.loyaltyDiscount && order.loyaltyDiscount > 0 && (
                          <p className="ps-3">
                            <small className="text-muted">Loyalty Discount</small>
                            <span className="float-end text-success">
                              <small>-{currency}{order.loyaltyDiscount.toFixed(2)}</small>
                            </span>
                          </p>
                        )}
                        {order.upsellDiscount && order.upsellDiscount > 0 && (
                          <p className="ps-3">
                            <small className="text-muted">Upsell Discount</small>
                            <span className="float-end text-success">
                              <small>-{currency}{order.upsellDiscount.toFixed(2)}</small>
                            </span>
                          </p>
                        )}
                      </>
                    )}
                    <p>
                      <span className="fw-medium">Shipping Charge :</span>
                      <span className="float-end">{order.shippingCost > 0 ? `${currency}${order.shippingCost.toFixed(2)}` : 'FREE'}</span>
                    </p>
                    <hr />
                    <h3 className="mb-0">
                      <span className="fw-medium">Grand Total :</span>
                      <span className="float-end">{currency}{order.total?.toFixed(2) || '0.00'}</span>
                    </h3>
                  </div>
                  <div className="clearfix" />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <style>{`
        .bill-address-row {
          display: flex;
          flex-wrap: nowrap;
        }
        .bill-from-col,
        .bill-to-col {
          flex: 0 0 50%;
          max-width: 50%;
        }
        .invoice-product-table {
          border: 1px solid #dee2e6;
        }
        .invoice-product-table thead th {
          border-bottom: 2px solid #dee2e6;
          border-right: 1px solid #dee2e6;
        }
        .invoice-product-table thead th:last-child {
          border-right: none;
        }
        .invoice-product-table tbody td {
          border-bottom: 1px solid #e9ecef;
          border-right: 1px solid #e9ecef;
        }
        .invoice-product-table tbody td:last-child {
          border-right: none;
        }
        .invoice-product-table tbody tr:last-child td {
          border-bottom: none;
        }
        @media print {
          .print-hidden {
            display: none !important;
          }
          .bill-address-row {
            display: flex !important;
            flex-wrap: nowrap !important;
          }
          .bill-from-col,
          .bill-to-col {
            flex: 0 0 50% !important;
            max-width: 50% !important;
          }
          .invoice-product-table {
            border: 1px solid #000 !important;
          }
          .invoice-product-table thead th {
            border-bottom: 2px solid #000 !important;
            border-right: 1px solid #000 !important;
          }
          .invoice-product-table thead th:last-child {
            border-right: none !important;
          }
          .invoice-product-table tbody td {
            border-bottom: 1px solid #000 !important;
            border-right: 1px solid #000 !important;
          }
          .invoice-product-table tbody td:last-child {
            border-right: none !important;
          }
          .invoice-product-table tbody tr:last-child td {
            border-bottom: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default InvoiceDetail

