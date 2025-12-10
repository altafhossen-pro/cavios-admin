import { Card, CardBody, CardTitle, Table } from 'react-bootstrap'
import { currency } from '@/context/constants'

interface Order {
  _id: string
  orderId: string
  total: number
  shippingCost: number
  discount: number
  couponDiscount?: number
  loyaltyDiscount?: number
  upsellDiscount?: number
}

const NewOrderSummery = ({ order }: { order: Order }) => {
  const subtotal = order.total - (order.shippingCost || 0) + (order.discount || 0) + (order.couponDiscount || 0) + (order.loyaltyDiscount || 0) + (order.upsellDiscount || 0)
  const totalDiscount = (order.discount || 0) + (order.couponDiscount || 0) + (order.loyaltyDiscount || 0) + (order.upsellDiscount || 0)

  return (
    <Card>
      <CardBody>
        <CardTitle as={'h5'} className="mb-3">
          Order Summary
        </CardTitle>
        <div className="table-responsive text-nowrap table-centered">
          <Table className="mb-0">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Subtotal :</td>
                <td className="text-end">{currency}{subtotal.toFixed(2)}</td>
              </tr>
              {totalDiscount > 0 && (
                <tr>
                  <td>Discount :</td>
                  <td className="text-end text-success">-{currency}{totalDiscount.toFixed(2)}</td>
                </tr>
              )}
              {order.couponDiscount && order.couponDiscount > 0 && (
                <tr>
                  <td className="ps-4">
                    <small className="text-muted">Coupon Discount</small>
                  </td>
                  <td className="text-end text-success">
                    <small>-{currency}{order.couponDiscount.toFixed(2)}</small>
                  </td>
                </tr>
              )}
              {order.loyaltyDiscount && order.loyaltyDiscount > 0 && (
                <tr>
                  <td className="ps-4">
                    <small className="text-muted">Loyalty Discount</small>
                  </td>
                  <td className="text-end text-success">
                    <small>-{currency}{order.loyaltyDiscount.toFixed(2)}</small>
                  </td>
                </tr>
              )}
              {order.upsellDiscount && order.upsellDiscount > 0 && (
                <tr>
                  <td className="ps-4">
                    <small className="text-muted">Upsell Discount</small>
                  </td>
                  <td className="text-end text-success">
                    <small>-{currency}{order.upsellDiscount.toFixed(2)}</small>
                  </td>
                </tr>
              )}
              <tr>
                <td>Shipping Charge :</td>
                <td className="text-end">{order.shippingCost > 0 ? `${currency}${order.shippingCost.toFixed(2)}` : 'FREE'}</td>
              </tr>
              <tr className="border-top">
                <td className="fw-semibold">Grand Total :</td>
                <td className="fw-semibold text-end">{currency}{order.total?.toFixed(2) || '0.00'}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </CardBody>
    </Card>
  )
}

export default NewOrderSummery

