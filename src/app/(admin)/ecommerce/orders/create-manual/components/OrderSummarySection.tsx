import { Card, CardBody, CardTitle, FormControl, FormGroup, FormLabel, Button, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import type { CartItem } from '../page'

interface OrderSummarySectionProps {
  cartItems: CartItem[]
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  status: string
  notes: string
  onDiscountChange: (discount: number) => void
  onShippingCostChange: (shippingCost: number) => void
  onStatusChange: (status: string) => void
  onNotesChange: (notes: string) => void
  onSubmit: () => void
}

const OrderSummarySection = ({
  subtotal,
  discount,
  shippingCost,
  total,
  status,
  notes,
  onDiscountChange,
  onShippingCostChange,
  onStatusChange,
  onNotesChange,
  onSubmit,
}: OrderSummarySectionProps) => {
  return (
    <Card className="sticky-top z-1" style={{ top: '20px' }}>
      <CardBody>
        <CardTitle className="mb-3">
          <IconifyIcon icon="bx:receipt" className="me-2" />
          Order Summary
        </CardTitle>

        <div className="mb-3">
          <Table borderless size="sm" className="mb-0">
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td className="text-end fw-semibold">
                  {currency}
                  {subtotal.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td className="text-end">
                  <FormControl
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                    style={{ width: '100px', display: 'inline-block' }}
                    className="text-end"
                  />
                  <span className="ms-2">
                    {currency}
                    {discount.toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td className="text-end">
                  <FormControl
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingCost}
                    onChange={(e) => onShippingCostChange(parseFloat(e.target.value) || 0)}
                    style={{ width: '100px', display: 'inline-block' }}
                    className="text-end"
                  />
                  <span className="ms-2">
                    {currency}
                    {shippingCost.toFixed(2)}
                  </span>
                </td>
              </tr>
              <tr className="border-top">
                <td className="fw-bold">Total:</td>
                <td className="text-end fw-bold fs-5">
                  {currency}
                  {total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        <FormGroup className="mb-3">
          <FormLabel>Order Status</FormLabel>
          <FormControl
            as="select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </FormControl>
        </FormGroup>

        <FormGroup className="mb-3">
          <FormLabel>Order Notes</FormLabel>
          <FormControl
            as="textarea"
            rows={3}
            placeholder="Add any notes about this order..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </FormGroup>

        <Button
          variant="primary"
          className="w-100"
          size="lg"
          onClick={onSubmit}
        >
          <IconifyIcon icon="bx:check" className="me-2" />
          Create Order
        </Button>
      </CardBody>
    </Card>
  )
}

export default OrderSummarySection
