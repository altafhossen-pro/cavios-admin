import { Card, CardBody, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { TabComponentProps } from './types'

// Common colors for color picker palette
const COLOR_PALETTE = [
  { name: 'Red', hexCode: '#FF0000' },
  { name: 'Blue', hexCode: '#0000FF' },
  { name: 'Green', hexCode: '#008000' },
  { name: 'Black', hexCode: '#000000' },
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Yellow', hexCode: '#FFFF00' },
  { name: 'Orange', hexCode: '#FFA500' },
  { name: 'Purple', hexCode: '#800080' },
  { name: 'Pink', hexCode: '#FFC0CB' },
  { name: 'Gray', hexCode: '#808080' },
  { name: 'Brown', hexCode: '#A52A2A' },
  { name: 'Navy', hexCode: '#000080' },
  { name: 'Cyan', hexCode: '#00FFFF' },
  { name: 'Magenta', hexCode: '#FF00FF' },
  { name: 'Lime', hexCode: '#00FF00' },
  { name: 'Maroon', hexCode: '#800000' },
  { name: 'Olive', hexCode: '#808000' },
  { name: 'Teal', hexCode: '#008080' },
  { name: 'Silver', hexCode: '#C0C0C0' },
  { name: 'Gold', hexCode: '#FFD700' },
]

const PricingInventoryTab = ({ watch, setValue }: TabComponentProps) => {
  const variants = watch('variants') || []

  const addVariant = () => {
    const currentVariants = watch('variants') || []
    setValue('variants', [
      ...currentVariants,
      {
        sku: '',
        attributes: [],
        currentPrice: 0,
        originalPrice: 0,
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

  const updateVariantAttribute = (index: number, attributeName: string, attributeValue: string, displayValue?: string, hexCode?: string) => {
    const currentVariants = watch('variants') || []
    const updated = [...currentVariants]
    const variant = updated[index]
    const attributes = variant.attributes || []
    
    // Remove existing attribute with same name
    const filteredAttributes = attributes.filter((attr: { name: string }) => attr.name !== attributeName)
    
    // Add new attribute
    filteredAttributes.push({
      name: attributeName,
      value: attributeValue,
      displayValue: displayValue || attributeValue,
      hexCode: hexCode || '',
    })
    
    updated[index] = { ...variant, attributes: filteredAttributes }
    setValue('variants', updated)
  }

  const getVariantAttribute = (variant: unknown, attributeName: string): string => {
    const v = variant as { attributes?: Array<{ name: string; value: string }> }
    const attr = v.attributes?.find((a) => a.name === attributeName)
    return attr?.value || ''
  }

  const getVariantAttributeHexCode = (variant: unknown, attributeName: string): string => {
    const v = variant as { attributes?: Array<{ name: string; hexCode?: string }> }
    const attr = v.attributes?.find((a) => a.name === attributeName)
    return attr?.hexCode || ''
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Product Variants & Pricing</h5>
          <Button variant="primary" size="sm" onClick={addVariant}>
            <IconifyIcon icon="bx:plus" className="me-1" />
            Add Variant
          </Button>
        </div>

        {variants.length > 0 ? (
          variants.map((variant: unknown, index: number) => {
            const v = variant as {
              sku: string
              attributes: Array<{ name: string; value: string; displayValue: string; hexCode: string }>
              currentPrice: number
              originalPrice: number
            }
            
            const sizeValue = getVariantAttribute(variant, 'Size')
            const colorValue = getVariantAttribute(variant, 'Color')
            const colorHexCode = getVariantAttributeHexCode(variant, 'Color')

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
                        <Form.Label>Size</Form.Label>
                        <Form.Control
                          type="text"
                          value={sizeValue}
                          onChange={(e) => {
                            const size = e.target.value
                            updateVariantAttribute(index, 'Size', size, size)
                          }}
                          placeholder="e.g., S, M, L, XL or custom size"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Color</Form.Label>
                        <Row>
                          <Col md={6}>
                            <Form.Label className="small text-muted">Color Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={colorValue}
                              onChange={(e) => {
                                const colorName = e.target.value
                                updateVariantAttribute(
                                  index,
                                  'Color',
                                  colorName,
                                  colorName,
                                  colorHexCode || ''
                                )
                              }}
                              placeholder="Enter color name (e.g., Red, Blue)"
                            />
                          </Col>
                          <Col md={6}>
                            <Form.Label className="small text-muted">Color Picker</Form.Label>
                            <div className="d-flex align-items-center gap-2">
                              <Form.Control
                                type="color"
                                value={colorHexCode || '#000000'}
                                onChange={(e) => {
                                  const hexCode = e.target.value
                                  updateVariantAttribute(
                                    index,
                                    'Color',
                                    colorValue || 'Custom',
                                    colorValue || 'Custom',
                                    hexCode
                                  )
                                }}
                                style={{ width: '60px', height: '38px', cursor: 'pointer' }}
                                title="Pick a color"
                              />
                              {colorHexCode && (
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      backgroundColor: colorHexCode,
                                      border: '2px solid #ddd',
                                      borderRadius: '4px',
                                    }}
                                    title={colorHexCode}
                                  />
                                  <span className="text-muted small">{colorHexCode}</span>
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                        <div className="mt-2">
                          <Form.Label className="small text-muted mb-2 d-block">Quick Color Palette</Form.Label>
                          <div className="d-flex flex-wrap gap-2">
                            {COLOR_PALETTE.map((color) => (
                              <button
                                key={color.name}
                                type="button"
                                className="btn btn-sm"
                                style={{
                                  width: '35px',
                                  height: '35px',
                                  backgroundColor: color.hexCode,
                                  border: colorHexCode === color.hexCode ? '3px solid #007bff' : '2px solid #ddd',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                                onClick={() => {
                                  updateVariantAttribute(
                                    index,
                                    'Color',
                                    color.name,
                                    color.name,
                                    color.hexCode
                                  )
                                }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
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

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Old Price (Original Price)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={v.originalPrice}
                          onChange={(e) => updateVariant(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Alert variant="info" className="mb-0">
                        <small>
                          <strong>Note:</strong> Stock quantity will be managed from the Inventory page. Variant images can be added after product creation in the product edit page.
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
            No variants added yet. Click "Add Variant" to create product variants with pricing.
          </Alert>
        )}
      </CardBody>
    </Card>
  )
}

export default PricingInventoryTab
