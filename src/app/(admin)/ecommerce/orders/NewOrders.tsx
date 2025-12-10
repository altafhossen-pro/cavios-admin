import clsx from 'clsx'
import { Card, CardBody, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAdminOrders } from '@/features/admin/api/orderApi'
import Preloader from '@/components/Preloader'

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
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  items: Array<{
    product: {
      _id: string
      title: string
      featuredImage: string
    }
    name: string
    image: string
    quantity: number
    price: number
    subtotal: number
  }>
}

const NewOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const fetchOrders = async (page: number = 1, searchTerm: string = '', status: string = 'all', paymentStatus: string = 'all') => {
    setLoading(true)
    try {
      const response = await getAdminOrders({
        page,
        limit: 10,
        search: searchTerm || undefined,
        status: status !== 'all' ? status : undefined,
        paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
      })

      if (response.success) {
        setOrders(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(currentPage, search, statusFilter, paymentStatusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, paymentStatusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchOrders(1, search, statusFilter, paymentStatusFilter)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'processing':
      case 'confirmed':
        return 'primary'
      case 'shipped':
        return 'info'
      case 'cancelled':
        return 'danger'
      case 'returned':
        return 'warning'
      case 'pending':
      default:
        return 'secondary'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
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

  const getCustomerEmail = (order: Order) => {
    if (order.user?.email) return order.user.email
    if (order.guestInfo?.email) return order.guestInfo.email
    if (order.manualOrderInfo?.email) return order.manualOrderInfo.email
    return 'N/A'
  }

  const getCustomerPhone = (order: Order) => {
    if (order.user?.phone) return order.user.phone
    if (order.guestInfo?.phone) return order.guestInfo.phone
    if (order.manualOrderInfo?.phone) return order.manualOrderInfo.phone
    return 'N/A'
  }


  const getFirstProductImage = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0]
      if (firstItem.image) return firstItem.image
      if (firstItem.product?.featuredImage) return firstItem.product.featuredImage
    }
    return '/images/placeholder.png'
  }

  if (loading && orders.length === 0) {
    return <Preloader />
  }

  return (
    <>
      <PageBreadcrumb subName="Ecommerce" title="Orders List" />
      <PageMetaData title="Orders List" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                <form onSubmit={handleSearch} className="search-bar grow me-3">
                  <span>
                    <IconifyIcon icon="bx:search-alt" />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    id="search"
                    placeholder="Search by Order ID, Email, Phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <Dropdown>
                    <DropdownToggle as={'a'} role="button" className="arrow-none btn btn-light dropdown-toggle">
                      <div className="flex-centered mb-0">
                        <IconifyIcon icon="bx:filter" className="me-1" />
                        Status: {statusFilter === 'all' ? 'All' : statusFilter}
                        <IconifyIcon icon="bx:chevron-down" height={16} width={16} className="ms-2" />
                      </div>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
                        All
                      </DropdownItem>
                      <DropdownItem onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}>
                        Pending
                      </DropdownItem>
                      <DropdownItem onClick={() => { setStatusFilter('confirmed'); setCurrentPage(1); }}>
                        Confirmed
                      </DropdownItem>
                      <DropdownItem onClick={() => { setStatusFilter('processing'); setCurrentPage(1); }}>
                        Processing
                      </DropdownItem>
                      <DropdownItem onClick={() => { setStatusFilter('shipped'); setCurrentPage(1); }}>
                        Shipped
                      </DropdownItem>
                      <DropdownItem onClick={() => { setStatusFilter('delivered'); setCurrentPage(1); }}>
                        Delivered
                      </DropdownItem>
                      <DropdownItem onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1); }}>
                        Cancelled
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Dropdown>
                    <DropdownToggle as={'a'} role="button" className="arrow-none btn btn-light dropdown-toggle">
                      <div className="flex-centered mb-0">
                        <IconifyIcon icon="bx:credit-card" className="me-1" />
                        Payment: {paymentStatusFilter === 'all' ? 'All' : paymentStatusFilter}
                        <IconifyIcon icon="bx:chevron-down" height={16} width={16} className="ms-2" />
                      </div>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem onClick={() => { setPaymentStatusFilter('all'); setCurrentPage(1); }}>
                        All
                      </DropdownItem>
                      <DropdownItem onClick={() => { setPaymentStatusFilter('pending'); setCurrentPage(1); }}>
                        Pending
                      </DropdownItem>
                      <DropdownItem onClick={() => { setPaymentStatusFilter('paid'); setCurrentPage(1); }}>
                        Paid
                      </DropdownItem>
                      <DropdownItem onClick={() => { setPaymentStatusFilter('failed'); setCurrentPage(1); }}>
                        Failed
                      </DropdownItem>
                      <DropdownItem onClick={() => { setPaymentStatusFilter('refunded'); setCurrentPage(1); }}>
                        Refunded
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </CardBody>
            <div className="table-responsive table-centered">
              <table className="table text-nowrap mb-0">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Email ID</th>
                    <th>Phone No.</th>
                    <th>Payment Type</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        <Preloader />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4 text-muted">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      return (
                        <tr key={order._id}>
                          <td>
                            <Link to={`/ecommerce/orders/${order._id}`} className="fw-semibold">
                              {order.orderId}
                            </Link>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>
                            <img
                              src={getFirstProductImage(order)}
                              alt="product"
                              className="img-fluid avatar-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.png'
                              }}
                            />
                          </td>
                          <td>{getCustomerEmail(order)}</td>
                          <td>{getCustomerPhone(order)}</td>
                          <td>{order.paymentMethod || 'COD'}</td>
                          <td>
                            <span className={`badge badge-soft-${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <div className="icons-center">
                              <IconifyIcon
                                icon="bxs:circle"
                                className={clsx('me-1', `text-${getStatusColor(order.status)}`)}
                              />
                              <span className={`badge badge-soft-${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td className="fw-semibold">${order.total?.toFixed(2) || '0.00'}</td>
                          <td>
                            <Link
                              to={`/ecommerce/orders/${order._id}`}
                              className="btn btn-sm btn-soft-primary"
                            >
                              <IconifyIcon icon="bx:show" className="me-1" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 0 && (
              <div className="align-items-center justify-content-between row g-0 text-center text-sm-start p-3 border-top">
                <div className="col-sm">
                  <div className="text-muted">
                    Showing&nbsp;
                    <span className="fw-semibold">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                    </span>
                    &nbsp;to&nbsp;
                    <span className="fw-semibold">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span>
                    &nbsp;of&nbsp;
                    <span className="fw-semibold">{pagination.totalItems}</span>&nbsp;orders
                  </div>
                </div>
                <Col sm="auto" className="mt-3 mt-sm-0">
                  <ul className="pagination pagination-rounded m-0">
                    <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => pagination.hasPrevPage && handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        <IconifyIcon icon="bx:left-arrow-alt" />
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }
                      return (
                        <li key={pageNum} className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      )
                    })}
                    <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => pagination.hasNextPage && handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        <IconifyIcon icon="bx:right-arrow-alt" />
                      </button>
                    </li>
                  </ul>
                </Col>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default NewOrders

