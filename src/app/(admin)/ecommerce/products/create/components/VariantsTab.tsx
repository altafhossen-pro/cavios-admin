import { Card, CardBody, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { TabComponentProps } from './types'

const VariantsTab = ({ watch, setValue }: TabComponentProps) => {
  const variants = watch('variants') || []
  const productType = watch('productType')

  if (productType !== 'variable') {
    return null
  }

  const addVariant = () => {
    const currentVariants = watch('variants') || []
    setValue('variants', [
      ...currentVariants,
      {
        sku: '',
        barcode: '',
        attributes: [],
        currentPrice: 0,
        originalPrice: 0,
        costPrice: 0,
        stockQuantity: 0,
        lowStockThreshold: 5,
        stockStatus: 'in_stock',
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        images: [],
      },
    ])
  }

  const removeVariant = (index: number) => {
    const currentVariants = watch('variants') || []
    setValue('variants', currentVariants.filter((_: unknown, i: number) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: unknown) => {
    const currentVariants = watch('variants') || []
    const updated = [...currentVariants]
    updated[index] = { ...updated[index], [field]: value }
    setValue('variants', updated)
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Product Variants</h5>
          <Button variant="primary" size="sm" onClick={addVariant}>
            <IconifyIcon icon="bx:plus" className="me-1" />
            Add Variant
          </Button>
        </div>

        {variants.length > 0 ? (
          variants.map((variant: unknown, index: number) => {
            const v = variant as {
              sku: string
              barcode: string
              currentPrice: number
              originalPrice: number
              costPrice: number
              stockQuantity: number
              lowStockThreshold: number
              stockStatus: string
            }
            return (
              <Card key={index} className="mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Variant {index + 1}</h6>
                    <Button variant="danger" size="sm" onClick={() => removeVariant(index)}>
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SKU <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          placeholder="e.g., PRODUCT-SIZE-COLOR"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Barcode</Form.Label>
                        <Form.Control
                          type="text"
                          value={v.barcode}
                          onChange={(e) => updateVariant(index, 'barcode', e.target.value)}
                          placeholder="Barcode"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Price <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={v.currentPrice}
                          onChange={(e) => updateVariant(index, 'currentPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Original Price</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={v.originalPrice}
                          onChange={(e) => updateVariant(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cost Price</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={v.costPrice}
                          onChange={(e) => updateVariant(index, 'costPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          value={v.stockQuantity}
                          onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Low Stock Threshold</Form.Label>
                        <Form.Control
                          type="number"
                          value={v.lowStockThreshold}
                          onChange={(e) => updateVariant(index, 'lowStockThreshold', parseInt(e.target.value) || 5)}
                          placeholder="5"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Status</Form.Label>
                        <Form.Select
                          value={v.stockStatus}
                          onChange={(e) => updateVariant(index, 'stockStatus', e.target.value)}
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="pre_order">Pre Order</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Alert variant="info" className="mb-0">
                        <small>
                          <strong>Note:</strong> Variant attributes (Size, Color, etc.) and images can be added after product creation in the product edit page.
                        </small>
                      </Alert>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )
          })
        ) : (
          <Alert variant="info">
            No variants added yet. Click "Add Variant" to create product variants.
          </Alert>
        )}
      </CardBody>
    </Card>
  )
}

export default VariantsTab

