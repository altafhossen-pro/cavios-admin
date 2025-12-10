import { Card, CardBody, Row, Col, Form } from 'react-bootstrap'
import { TabComponentProps } from './types'

const SEOTab = ({ register, setValue }: TabComponentProps) => {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Meta Title</Form.Label>
              <Form.Control
                type="text"
                {...register('metaTitle')}
                placeholder="SEO meta title"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Meta Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register('metaDescription')}
                placeholder="SEO meta description"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Meta Keywords (comma separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="keyword1, keyword2, keyword3"
                onChange={(e) => {
                  const keywords = e.target.value.split(',').map((k) => k.trim()).filter((k) => k !== '')
                  setValue('metaKeywords', keywords)
                }}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Canonical URL</Form.Label>
              <Form.Control
                type="url"
                {...register('canonicalUrl')}
                placeholder="https://example.com/product"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>OG Title</Form.Label>
              <Form.Control
                type="text"
                {...register('ogTitle')}
                placeholder="Open Graph title"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>OG Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                {...register('ogDescription')}
                placeholder="Open Graph description"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>OG Image URL</Form.Label>
              <Form.Control
                type="url"
                {...register('ogImage')}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default SEOTab

