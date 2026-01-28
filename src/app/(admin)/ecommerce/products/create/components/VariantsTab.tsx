import { useState } from 'react'
import { Card, CardBody, Row, Col, Form, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { TabComponentProps } from './types'
import { uploadSingleImage, uploadMultipleImages } from '@/features/admin/api/uploadApi'
import { useNotificationContext } from '@/context/useNotificationContext'

const VariantsTab = ({ watch, setValue, uploading: parentUploading }: TabComponentProps) => {
  const variants = watch('variants') || []
  const productType = watch('productType')
  const { showNotification } = useNotificationContext()
  const [uploadingVariants, setUploadingVariants] = useState<{ [key: number]: boolean }>({})

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

  // Handle variant image upload (single)
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
      const currentImages = variant.images || []
      
      // Add new image to variant
      const newImage = {
        url: response.data.url,
        altText: response.data.originalName || `Variant ${variantIndex + 1} Image`,
        isPrimary: currentImages.length === 0, // First image is primary
        sortOrder: currentImages.length,
      }
      
      updated[variantIndex] = {
        ...variant,
        images: [...currentImages, newImage],
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

  // Handle variant multiple images upload
  const handleVariantMultipleImagesUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showNotification({
          message: 'Please select valid image files',
          variant: 'danger',
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification({
          message: 'Image size should be less than 5MB',
          variant: 'danger',
        })
        return
      }
    }

    setUploadingVariants((prev) => ({ ...prev, [variantIndex]: true }))
    try {
      const response = await uploadMultipleImages(files)
      const currentVariants = watch('variants') || []
      const updated = [...currentVariants]
      const variant = updated[variantIndex]
      const currentImages = variant.images || []
      
      // Add new images to variant
      const newImages = response.data.map((img, index) => ({
        url: img.url,
        altText: img.originalName || `Variant ${variantIndex + 1} Image ${index + 1}`,
        isPrimary: currentImages.length === 0 && index === 0, // First image is primary if no images exist
        sortOrder: currentImages.length + index,
      }))
      
      updated[variantIndex] = {
        ...variant,
        images: [...currentImages, ...newImages],
      }
      setValue('variants', updated)
      
      showNotification({
        message: `${newImages.length} image(s) uploaded successfully`,
        variant: 'success',
      })
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to upload images',
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
              images: Array<{ url: string; altText: string; isPrimary: boolean; sortOrder: number }>
            }
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
                      <Form.Group className="mb-3">
                        <Form.Label>Variant Images</Form.Label>
                        <div className="mb-2">
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantImageUpload(index, e)}
                            disabled={isUploading}
                            className="mb-2"
                          />
                          <Form.Control
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleVariantMultipleImagesUpload(index, e)}
                            disabled={isUploading}
                          />
                        </div>
                        {isUploading && (
                          <div className="text-muted mb-2">
                            <IconifyIcon icon="bx:loader-alt" className="spinner-border spinner-border-sm me-1" />
                            Uploading...
                          </div>
                        )}
                        {v.images && v.images.length > 0 && (
                          <div className="mt-3">
                            <Row>
                              {v.images.map((img: { url: string; altText: string; isPrimary: boolean }, imgIndex: number) => (
                                <Col md={3} key={imgIndex} className="mb-3">
                                  <div className="position-relative">
                                    <img
                                      src={img.url}
                                      alt={img.altText}
                                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                      className="img-thumbnail"
                                    />
                                    {img.isPrimary && (
                                      <span className="badge bg-primary position-absolute top-0 start-0 m-1">
                                        Primary
                                      </span>
                                    )}
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="position-absolute top-0 end-0 m-1"
                                      onClick={() => removeVariantImage(index, imgIndex)}
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

