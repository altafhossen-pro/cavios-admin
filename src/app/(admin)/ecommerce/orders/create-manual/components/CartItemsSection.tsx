import { Card, CardBody, CardTitle, Table, Button, FormControl } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { CartItem } from '../page'

interface CartItemsSectionProps {
  items: CartItem[]
  onUpdate: (id: string, updates: Partial<CartItem>) => void
  onRemove: (id: string) => void
}

const CartItemsSection = ({ items, onUpdate, onRemove }: CartItemsSectionProps) => {
  if (items.length === 0) {
    return (
      <Card className="mb-4">
        <CardBody>
          <CardTitle className="mb-3">
            <IconifyIcon icon="bx:cart" className="me-2" />
            Cart Items
          </CardTitle>
          <div className="text-center text-muted py-4">
            <IconifyIcon icon="bx:cart-alt" style={{ fontSize: '48px' }} />
            <p className="mt-2 mb-0">No items in cart</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle className="mb-3">
          <IconifyIcon icon="bx:cart" className="me-2" />
          Cart Items ({items.length})
        </CardTitle>
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div className="fw-semibold">{item.productName}</div>
                        {item.variant?.sku && (
                          <small className="text-muted">SKU: {item.variant.sku}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.variant?.attributes && item.variant.attributes.length > 0 ? (
                      <div>
                        {item.variant.attributes.map((attr, idx) => (
                          <div key={idx} className="small">
                            <span className="fw-semibold">{attr.name}:</span>{' '}
                            {attr.hexCode ? (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: attr.hexCode,
                                  color: '#fff',
                                }}
                              >
                                {attr.displayValue || attr.value}
                              </span>
                            ) : (
                              <span>{attr.displayValue || attr.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">Default</span>
                    )}
                  </td>
                  <td>
                    <FormControl
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        onUpdate(item.id, { price: parseFloat(e.target.value) || 0 })
                      }
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>
                    <FormControl
                      type="number"
                      min="1"
                      max={item.variant?.stockQuantity || 999}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1
                        const maxStock = item.variant?.stockQuantity || 999
                        // Limit to available stock
                        const limitedQuantity = newQuantity > maxStock ? maxStock : newQuantity
                        onUpdate(item.id, { quantity: limitedQuantity })
                      }}
                      style={{ width: '80px' }}
                    />
                    {item.variant?.stockQuantity !== undefined && (
                      <small className="text-muted d-block">
                        Max: {item.variant.stockQuantity}
                      </small>
                    )}
                  </td>
                  <td className="fw-semibold">৳{item.subtotal.toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRemove(item.id)}
                    >
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}

export default CartItemsSection
