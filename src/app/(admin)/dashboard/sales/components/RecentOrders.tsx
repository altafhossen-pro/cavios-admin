import clsx from 'clsx'
import { Button, Card, CardBody, CardTitle } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface Order {
  orderId: string
  _id: string
  createdAt: string
  total: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  user?: {
    name?: string
    email?: string
    phone?: string
  }
  items?: Array<{
    product?: {
      title?: string
      featuredImage?: string
    }
    name?: string
    image?: string
  }>
  shippingAddress?: {
    street?: string
    city?: string
    state?: string
  }
}

interface RecentOrdersProps {
  orders: Order[]
}

const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'cancelled':
        return 'text-danger'
      case 'processing':
      case 'confirmed':
      case 'shipped':
        return 'text-primary'
      case 'delivered':
        return 'text-success'
      default:
        return 'text-warning'
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex align-items-center justify-content-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="primary" size="sm">
            <span className="icons-center">
              <IconifyIcon icon="bx:plus" className="me-1" />
              Create Order
            </span>
          </Button>
        </div>
      </CardBody>
      <div className="table-responsive table-centered">
        <table className="table mb-0">
          <thead className="bg-light bg-opacity-50">
            <tr>
              <th className="border-0 py-2">Order ID.</th>
              <th className="border-0 py-2">Date</th>
              <th className="border-0 py-2">Product</th>
              <th className="border-0 py-2">Customer Name</th>
              <th className="border-0 py-2">Email ID</th>
              <th className="border-0 py-2">Phone No.</th>
              <th className="border-0 py-2">Address</th>
              <th className="border-0 py-2">Payment Type</th>
              <th className="border-0 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.slice(0, 5).map((order, idx) => {
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null
                const productImage = firstItem?.product?.featuredImage || firstItem?.image
                const productName = firstItem?.product?.title || firstItem?.name
                const address = order.shippingAddress
                  ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}`.trim()
                  : 'N/A'

                return (
                  <tr key={order._id || order.orderId || idx}>
                    <td>
                      <Link to={`/ecommerce/orders/${order._id || order.orderId}`}>
                        {order.orderId || order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {productImage ? (
                        <img src={productImage} alt={productName || 'product'} className="img-fluid avatar-sm" />
                      ) : (
                        <div className="avatar-sm bg-light text-center d-flex align-items-center justify-content-center">
                          <span className="text-muted small">N/A</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <Link to={`/customers`}>{order.user?.name || 'Guest'}</Link>
                    </td>
                    <td>{order.user?.email || 'N/A'}</td>
                    <td>{order.user?.phone || 'N/A'}</td>
                    <td>{address}</td>
                    <td>{order.paymentMethod?.toUpperCase() || 'N/A'}</td>
                    <td>
                      <div className="icons-center">
                        <IconifyIcon
                          icon="bxs:circle"
                          className={clsx('me-1', getStatusColor(order.status))}
                        />
                        {order.status || 'N/A'}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-muted">No recent orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="align-items-center justify-content-between row g-0 text-center text-sm-start p-3 border-top">
        <div className="col-sm">
          <div className="text-muted">
            Showing &nbsp;
            <span className="fw-semibold">{Math.min(orders.length, 5)}</span>&nbsp; of &nbsp;
            <span className="fw-semibold">{orders.length}</span>&nbsp; recent orders
          </div>
        </div>
        <div className="col-sm-auto mt-3 mt-sm-0">
          <Button variant="primary" size="sm" as={Link} to="/ecommerce/orders">
            View All Orders
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default RecentOrders
