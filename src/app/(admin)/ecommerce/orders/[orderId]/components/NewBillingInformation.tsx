import { Card, CardBody, CardTitle } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

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

  return (
    <Card className="card-height-100">
      <CardBody>
        <div className="float-end">
          <span role="button" className="text-primary" onClick={() => onUpdate?.()}>
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
  )
}

export default NewBillingInformation

