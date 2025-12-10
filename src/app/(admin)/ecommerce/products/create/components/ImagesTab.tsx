import { Card, CardBody, Row, Col, Form, Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { TabComponentProps } from './types'

const ImagesTab = ({ register, watch, setValue, uploading, onFeaturedImageUpload, onGalleryUpload, onRemoveGalleryImage }: TabComponentProps) => {
  const gallery = watch('gallery') || []
  const featuredImage = watch('featuredImage')

  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Featured Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={onFeaturedImageUpload}
                disabled={uploading}
              />
              {featuredImage && (
                <div className="mt-2">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Gallery Images</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={onGalleryUpload}
                disabled={uploading}
              />
              {uploading && <div className="mt-2">Uploading...</div>}
              {gallery.length > 0 && (
                <div className="mt-3">
                  <Row>
                    {gallery.map((img: { url: string; altText: string }, index: number) => (
                      <Col md={3} key={index} className="mb-3">
                        <div className="position-relative">
                          <img
                            src={img.url}
                            alt={img.altText}
                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                            className="img-thumbnail"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0"
                            onClick={() => onRemoveGalleryImage?.(index)}
                          >
                            <IconifyIcon icon="bx:x" />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default ImagesTab

