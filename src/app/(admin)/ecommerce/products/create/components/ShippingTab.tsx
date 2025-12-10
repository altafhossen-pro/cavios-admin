import { Card, CardBody, Row, Col, Form } from 'react-bootstrap'
import { TabComponentProps } from './types'

const ShippingTab = ({ register }: TabComponentProps) => {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                {...register('shippingWeight', { min: 0 })}
                placeholder="0.00"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Length (cm)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                {...register('shippingLength', { min: 0 })}
                placeholder="0.00"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Width (cm)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                {...register('shippingWidth', { min: 0 })}
                placeholder="0.00"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Height (cm)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                {...register('shippingHeight', { min: 0 })}
                placeholder="0.00"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Shipping Class</Form.Label>
              <Form.Control
                type="text"
                {...register('shippingClass')}
                placeholder="e.g., Standard, Express"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Handling Time (days)</Form.Label>
              <Form.Control
                type="number"
                {...register('handlingTime', { min: 0 })}
                placeholder="1"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Free Shipping Eligible"
                {...register('freeShippingEligible')}
              />
            </Form.Group>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default ShippingTab

