import { useState, useEffect } from 'react'
import { Card, CardBody, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { TabComponentProps } from './types'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'
import { useNotificationContext } from '@/context/useNotificationContext'

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

const PricingInventoryTab = ({ watch, setValue, uploading: parentUploading }: TabComponentProps) => {
  const variants = watch('variants') || []
  const { showNotification } = useNotificationContext()
  const [uploadingVariants, setUploadingVariants] = useState<{ [key: number]: boolean }>({})
  // Track size and color enable/disable state for each variant
  const [variantSettings, setVariantSettings] = useState<{
    [key: number]: { sizeEnabled: boolean; colorEnabled: boolean }
  }>({})

  // Initialize variant settings when variants change
  useEffect(() => {
    const newSettings: { [key: number]: { sizeEnabled: boolean; colorEnabled: boolean } } = {}
    variants.forEach((variant: unknown, index: number) => {
      const v = variant as { attributes?: Array<{ name: string; value: string }> }
      const hasSize = v.attributes?.some((attr) => attr.name === 'Size' && attr.value.trim() !== '')
      const hasColor = v.attributes?.some((attr) => attr.name === 'Color' && attr.value.trim() !== '')
      
      // Initialize from existing attributes or default to enabled if attributes exist
      newSettings[index] = {
        sizeEnabled: variantSettings[index]?.sizeEnabled ?? hasSize ?? true,
        colorEnabled: variantSettings[index]?.colorEnabled ?? hasColor ?? true,
      }
    })
    setVariantSettings(newSettings)
  }, [variants.length]) // Only update when variant count changes

  const addVariant = () => {
    const currentVariants = watch('variants') || []
    const newIndex = currentVariants.length
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
    // Initialize settings for new variant (both enabled by default)
    setVariantSettings((prev) => ({
      ...prev,
      [newIndex]: { sizeEnabled: true, colorEnabled: true },
    }))
  }

  const removeVariant = (index: number) => {
    const currentVariants = watch('variants') || []
    setValue('variants', currentVariants.filter((_: unknown, i: number) => i !== index))
    // Remove variant settings
    setVariantSettings((prev) => {
      const updated = { ...prev }
      delete updated[index]
      // Reindex remaining variants
      const reindexed: { [key: number]: { sizeEnabled: boolean; colorEnabled: boolean } } = {}
      Object.keys(updated).forEach((key) => {
        const oldIndex = parseInt(key)
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = updated[oldIndex]
        } else if (oldIndex < index) {
          reindexed[oldIndex] = updated[oldIndex]
        }
      })
      return reindexed
    })
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
    
    // For Color: if color is enabled, always keep the attribute (even if empty) so we can validate
    // For Size: only add if value is not empty
    const settings = variantSettings[index]
    if (attributeName === 'Color' && settings?.colorEnabled !== false) {
      // Keep Color attribute even if empty when color is enabled (for validation)
      filteredAttributes.push({
        name: attributeName,
        value: attributeValue,
        displayValue: displayValue || attributeValue,
        hexCode: hexCode || '',
      })
    } else if (attributeValue.trim() !== '') {
      // For other attributes or when disabled, only add if value is not empty
      filteredAttributes.push({
        name: attributeName,
        value: attributeValue,
        displayValue: displayValue || attributeValue,
        hexCode: hexCode || '',
      })
    }
    
    updated[index] = { ...variant, attributes: filteredAttributes }
    setValue('variants', updated)
  }

  // Toggle size enabled/disabled
  const toggleSizeEnabled = (index: number, enabled: boolean) => {
    setVariantSettings((prev) => ({
      ...prev,
      [index]: { ...prev[index], sizeEnabled: enabled },
    }))
    
    // If disabling, remove size attribute
    if (!enabled) {
      const currentVariants = watch('variants') || []
      const updated = [...currentVariants]
      const variant = updated[index]
      const attributes = (variant.attributes || []).filter((attr: { name: string }) => attr.name !== 'Size')
      updated[index] = { ...variant, attributes }
      setValue('variants', updated)
    }
  }

  // Toggle color enabled/disabled
  const toggleColorEnabled = (index: number, enabled: boolean) => {
    setVariantSettings((prev) => ({
      ...prev,
      [index]: { ...prev[index], colorEnabled: enabled },
    }))
    
    // If disabling, remove color attribute (name and hexCode)
    if (!enabled) {
      const currentVariants = watch('variants') || []
      const updated = [...currentVariants]
      const variant = updated[index]
      const attributes = (variant.attributes || []).filter((attr: { name: string }) => attr.name !== 'Color')
      updated[index] = { ...variant, attributes }
      setValue('variants', updated)
    }
  }

  // Validate color when updating
  const handleColorNameChange = (index: number, colorName: string) => {
    const settings = variantSettings[index]
    if (settings?.colorEnabled && !colorName.trim()) {
      // Don't show error on every keystroke, only when trying to save
      // We'll validate on form submit
    }
    const colorHexCode = getVariantAttributeHexCode(variants[index], 'Color')
    updateVariantAttribute(
      index,
      'Color',
      colorName,
      colorName,
      colorHexCode || ''
    )
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

  // Handle variant image upload (single image only - replaces existing)
  const handleVariantImageUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification({
        message: 'Please select a valid image file',
        variant: 'danger',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        message: 'Image size should be less than 5MB',
        variant: 'danger',
      })
      return
    }

    setUploadingVariants((prev) => ({ ...prev, [variantIndex]: true }))
    try {
      const response = await uploadSingleImage(file)
      const currentVariants = watch('variants') || []
      const updated = [...currentVariants]
      const variant = updated[variantIndex]
      
      // Replace existing image with new one (only one image per variant)
      const newImage = {
        url: response.data.url,
        altText: response.data.originalName || `Variant ${variantIndex + 1} Image`,
        isPrimary: true,
        sortOrder: 0,
      }
      
      updated[variantIndex] = {
        ...variant,
        images: [newImage], // Replace, don't add
      }
      setValue('variants', updated)
      
      showNotification({
        message: 'Image uploaded successfully',
        variant: 'success',
      })
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to upload image',
        variant: 'danger',
      })
    } finally {
      setUploadingVariants((prev) => ({ ...prev, [variantIndex]: false }))
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  // Remove variant image
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const currentVariants = watch('variants') || []
    const updated = [...currentVariants]
    const variant = updated[variantIndex]
    const images = variant.images || []
    
    updated[variantIndex] = {
      ...variant,
      images: images.filter((_: unknown, i: number) => i !== imageIndex),
    }
    setValue('variants', updated)
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
              images: Array<{ url: string; altText: string; isPrimary: boolean; sortOrder: number }>
            }
            
            const sizeValue = getVariantAttribute(variant, 'Size')
            const colorValue = getVariantAttribute(variant, 'Color')
            const colorHexCode = getVariantAttributeHexCode(variant, 'Color')
            const isUploading = uploadingVariants[index] || parentUploading || false

            return (
              <Card key={index} className="mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Variant {index + 1}</h6>
                    <Button variant="danger" size="sm" onClick={() => removeVariant(index)}>
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </div>

                  {/* First Row: SKU (Left) and Variant Image (Right) */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SKU <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          placeholder="e.g., PRODUCT-SIZE-COLOR"
                          required
                        />
                        <Form.Text className="text-muted">SKU is required for all variants</Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Variant Image <span className="text-danger">*</span></Form.Label>
                        <div className="mb-2">
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantImageUpload(index, e as React.ChangeEvent<HTMLInputElement>)}
                            disabled={isUploading}
                            required={!v.images || v.images.length === 0}
                          />
                          <Form.Text className="text-muted">
                            One image per variant is required. Selecting a new image will replace the existing one.
                          </Form.Text>
                        </div>
                        {isUploading && (
                          <div className="text-muted mb-2">
                            <IconifyIcon icon="bx:loader-alt" className="spinner-border spinner-border-sm me-1" />
                            Uploading...
                          </div>
                        )}
                        {v.images && v.images.length > 0 && (
                          <div className="mt-2">
                            {v.images.map((img: { url: string; altText: string; isPrimary: boolean }, imgIndex: number) => (
                              <div key={imgIndex} className="position-relative d-inline-block me-2">
                                <img
                                  src={img.url}
                                  alt={img.altText}
                                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                  className="img-thumbnail"
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0 m-1"
                                  onClick={() => removeVariantImage(index, imgIndex)}
                                  style={{ padding: '2px 6px' }}
                                >
                                  <IconifyIcon icon="bx:x" style={{ fontSize: '14px' }} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Second Row: Size and Color */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label className="mb-0">Size</Form.Label>
                          <Form.Check
                            type="switch"
                            id={`size-toggle-${index}`}
                            label={variantSettings[index]?.sizeEnabled !== false ? 'Enabled' : 'Disabled'}
                            checked={variantSettings[index]?.sizeEnabled !== false}
                            onChange={(e) => toggleSizeEnabled(index, e.target.checked)}
                          />
                        </div>
                        {variantSettings[index]?.sizeEnabled !== false && (
                          <Form.Control
                            type="text"
                            value={sizeValue}
                            onChange={(e) => {
                              const size = e.target.value
                              updateVariantAttribute(index, 'Size', size, size)
                            }}
                            placeholder="e.g., S, M, L, XL or custom size"
                          />
                        )}
                        {variantSettings[index]?.sizeEnabled === false && (
                          <Form.Text className="text-muted">Size is disabled for this variant</Form.Text>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label className="mb-0">Color</Form.Label>
                          <Form.Check
                            type="switch"
                            id={`color-toggle-${index}`}
                            label={variantSettings[index]?.colorEnabled !== false ? 'Enabled' : 'Disabled'}
                            checked={variantSettings[index]?.colorEnabled !== false}
                            onChange={(e) => toggleColorEnabled(index, e.target.checked)}
                          />
                        </div>
                        {variantSettings[index]?.colorEnabled !== false ? (
                          <>
                            <Form.Label className="small text-muted">Color Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              value={colorValue}
                              onChange={(e) => handleColorNameChange(index, e.target.value)}
                              placeholder="Enter color name (e.g., Red, Blue)"
                              required
                              className="mb-2"
                            />
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Form.Label className="small text-muted mb-0">Color Picker:</Form.Label>
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
                                style={{ width: '50px', height: '38px', cursor: 'pointer' }}
                                title="Pick a color"
                              />
                              {colorHexCode && (
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: '30px',
                                      height: '30px',
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
                            <div>
                              <Form.Label className="small text-muted mb-2 d-block">Quick Color Palette</Form.Label>
                              <div className="d-flex flex-wrap gap-2">
                                {COLOR_PALETTE.map((color) => (
                                  <button
                                    key={color.name}
                                    type="button"
                                    className="btn btn-sm"
                                    style={{
                                      width: '32px',
                                      height: '32px',
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
                          </>
                        ) : (
                          <Form.Text className="text-muted">Color is disabled for this variant</Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Third Row: Pricing */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Price <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={v.currentPrice}
                          onChange={(e) => updateVariant(index, 'currentPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          required
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
