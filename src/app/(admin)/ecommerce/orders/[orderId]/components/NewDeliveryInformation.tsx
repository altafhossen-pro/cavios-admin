import { Card, CardBody, CardTitle } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface Order {
  _id: string
  orderId: string
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  tracking?: Array<{
    status: string
    date: string
    note: string
  }>
}

const NewDeliveryInformation = ({ order }: { order: Order }) => {
  const getStatusIcon = () => {
    switch (order.status) {
      case 'delivered':
        return 'bx:check-circle'
      case 'shipped':
        return 'bx:package'
      case 'processing':
        return 'bx:cog'
      case 'confirmed':
        return 'bx:check'
      case 'cancelled':
        return 'bx:x-circle'
      case 'returned':
        return 'bx:undo'
      case 'pending':
      default:
        return 'bx:time'
    }
  }

  const getStatusColor = () => {
    switch (order.status) {
      case 'delivered':
        return 'text-success'
      case 'shipped':
        return 'text-info'
      case 'processing':
      case 'confirmed':
        return 'text-primary'
      case 'cancelled':
        return 'text-danger'
      case 'returned':
        return 'text-warning'
      case 'pending':
      default:
        return 'text-secondary'
    }
  }

  return (
    <Card className="card-height-100">
      <CardBody>
        <CardTitle as={'h5'} className="mb-3">
          Delivery Information
        </CardTitle>
        <div className="text-center">
          <IconifyIcon icon={getStatusIcon()} className={`h2 ${getStatusColor()}`} />
          <h5 className="mt-2">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h5>
          <p className="mb-1">
            Order ID :
            <span className="text-muted me-2" />
            <b>#{order.orderId}</b>
          </p>
          <p className="mb-1">
            Payment Mode :
            <span className="text-muted me-2" />
            <b>{order.paymentMethod || 'COD'}</b>
          </p>
          {order.tracking && order.tracking.length > 0 && (
            <div className="mt-3 text-start">
              <p className="mb-2 fw-semibold">Tracking History:</p>
              {order.tracking.map((track, idx) => (
                <div key={idx} className="mb-2">
                  <small className="d-block text-muted">
                    {new Date(track.date).toLocaleString()}
                  </small>
                  <small className="d-block">{track.status}</small>
                  {track.note && (
                    <small className="d-block text-muted">{track.note}</small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default NewDeliveryInformation

