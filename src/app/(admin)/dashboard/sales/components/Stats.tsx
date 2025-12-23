import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import { Card, CardBody, Col, Row } from 'react-bootstrap'

interface StatsProps {
  totalSales: number
  profit: number
  salesGrowth: number
}

const Stats = ({ totalSales, profit, salesGrowth }: StatsProps) => {
  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M'
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(2) + 'k'
    }
    return amount.toFixed(2)
  }

  const growthColor = salesGrowth >= 0 ? 'success' : 'danger'
  const growthSign = salesGrowth >= 0 ? '+' : ''

  return (
    <Row>
      <Col lg={6} md={6}>
        <Card>
          <CardBody className="overflow-hidden position-relative">
            <IconifyIcon icon="iconamoon:shopping-card-add-duotone" className="fs-36 text-info" />
            <h3 className="mb-0 fw-bold mt-3 mb-1">
              {currency}
              {formatAmount(totalSales)}
            </h3>
            <p className="text-muted">Total Sales</p>
            <span className={`badge fs-12 badge-soft-${growthColor}`}>
              {growthSign}{salesGrowth}%
            </span>
            <IconifyIcon icon="bx:doughnut-chart" className="widget-icon" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} md={6}>
        <Card>
          <CardBody className="overflow-hidden position-relative">
            <IconifyIcon icon="iconamoon:gift-duotone" className="fs-36 text-orange" />
            <h3 className="mb-0 fw-bold mt-3 mb-1">
              {currency}
              {formatAmount(profit)}
            </h3>
            <p className="text-muted">Profit</p>
            <span className={`badge fs-12 badge-soft-${growthColor}`}>
              {growthSign}{salesGrowth}%
            </span>
            <IconifyIcon icon="bx:bowl-hot" className="widget-icon" />
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default Stats
