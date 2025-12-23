import { useState } from 'react'
import { Card, CardBody, Button, ButtonGroup, Form, Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export type FilterPeriod = 'today' | 'yesterday' | '7d' | '30d' | '90d' | '1y' | 'custom'

interface DateFilterProps {
  selectedPeriod: FilterPeriod
  onPeriodChange: (period: FilterPeriod) => void
  customStartDate?: string
  customEndDate?: string
  onCustomDateChange: (startDate: string, endDate: string) => void
}

const DateFilter = ({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}: DateFilterProps) => {
  const [localStartDate, setLocalStartDate] = useState(customStartDate || '')
  const [localEndDate, setLocalEndDate] = useState(customEndDate || '')

  const handleCustomDateApply = () => {
    if (localStartDate && localEndDate) {
      onCustomDateChange(localStartDate, localEndDate)
      onPeriodChange('custom')
    }
  }

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleQuickDateSet = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    setLocalStartDate(formatDateForInput(startDate))
    setLocalEndDate(formatDateForInput(endDate))
  }

  return (
    <Card className="mb-4">
      <CardBody>
        <Row className="align-items-end">
          <Col md={8}>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="text-muted me-2">Filter by:</span>
              <ButtonGroup>
                <Button
                  variant={selectedPeriod === 'today' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('today')}
                >
                  Today
                </Button>
                <Button
                  variant={selectedPeriod === 'yesterday' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('yesterday')}
                >
                  Yesterday
                </Button>
                <Button
                  variant={selectedPeriod === '7d' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('7d')}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={selectedPeriod === '30d' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('30d')}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant={selectedPeriod === '90d' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('90d')}
                >
                  Last 90 Days
                </Button>
                <Button
                  variant={selectedPeriod === '1y' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('1y')}
                >
                  Last 1 Year
                </Button>
                <Button
                  variant={selectedPeriod === 'custom' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => onPeriodChange('custom')}
                >
                  Custom
                </Button>
              </ButtonGroup>
            </div>

            {selectedPeriod === 'custom' && (
              <div className="mt-3 d-flex gap-2 align-items-end flex-wrap">
                <Form.Group className="mb-0" style={{ minWidth: '150px' }}>
                  <Form.Label className="small">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    size="sm"
                  />
                </Form.Group>
                <Form.Group className="mb-0" style={{ minWidth: '150px' }}>
                  <Form.Label className="small">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    size="sm"
                  />
                </Form.Group>
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleQuickDateSet(7)}
                  >
                    7 Days
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleQuickDateSet(30)}
                  >
                    30 Days
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCustomDateApply}
                    disabled={!localStartDate || !localEndDate}
                  >
                    <IconifyIcon icon="bx:check" className="me-1" />
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DateFilter

