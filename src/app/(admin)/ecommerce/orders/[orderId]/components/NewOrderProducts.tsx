import { Card, CardBody, CardTitle, Table } from 'react-bootstrap'
import { currency } from '@/context/constants'

interface OrderItem {
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
}

interface Order {
  _id: string
  orderId: string
  items: OrderItem[]
}

const NewOrderProducts = ({ order }: { order: Order }) => {
  return (
    <Card>
      <CardBody>
        <CardTitle as={'h5'} className="mb-3">
          Products From Order #{order.orderId}
        </CardTitle>
        <div className="table-responsive">
          <Table className="table table-centered table-dashed mb-0">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const productImage = item.image || item.product?.featuredImage || '/images/placeholder.png'
                  const variantInfo = item.variant
                    ? `${item.variant.size || ''}${item.variant.size && item.variant.color ? ' / ' : ''}${item.variant.color || ''}`.trim() || 'N/A'
                    : 'N/A'

                  return (
                    <tr key={idx}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="shrink-0 me-3">
                            <img
                              src={productImage}
                              alt={item.name || item.product?.title || 'Product'}
                              className="img-fluid avatar-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.png'
                              }}
                            />
                          </div>
                          <div className="grow">
                            <h6 className="mb-0">{item.name || item.product?.title || 'N/A'}</h6>
                            {item.product?.slug && (
                              <small className="text-muted">SKU: {item.variant?.sku || 'N/A'}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {variantInfo !== 'N/A' && item.variant?.colorHexCode && (
                          <span
                            className="badge bg-light text-dark me-1"
                            style={{
                              backgroundColor: item.variant.colorHexCode + '20',
                              border: `1px solid ${item.variant.colorHexCode}`,
                            }}
                          >
                            {variantInfo}
                          </span>
                        )}
                        {variantInfo === 'N/A' && <span className="text-muted">N/A</span>}
                        {variantInfo !== 'N/A' && !item.variant?.colorHexCode && (
                          <span className="badge bg-light text-dark">{variantInfo}</span>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{currency}{item.price?.toFixed(2) || '0.00'}</td>
                      <td className="fw-semibold">{currency}{item.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}

export default NewOrderProducts

