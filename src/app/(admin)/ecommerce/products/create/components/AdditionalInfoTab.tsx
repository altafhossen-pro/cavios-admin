import { Card, CardBody, Row, Col, Form } from 'react-bootstrap'
import { TabComponentProps } from './types'

const AdditionalInfoTab = ({ register }: TabComponentProps) => {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Additional Information</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                {...register('additionalInfo')}
                placeholder="Any additional information about the product"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Delivery Information</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                {...register('deliveryInfo')}
                placeholder="Delivery information and timelines"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Return Policy</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                {...register('returnPolicy')}
                placeholder="Return and refund policy"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Warranty Information</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                {...register('warrantyInfo')}
                placeholder="Warranty details and terms"
              />
            </Form.Group>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default AdditionalInfoTab

