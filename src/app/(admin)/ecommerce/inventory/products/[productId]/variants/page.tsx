import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Row, Col, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { getInventoryProductById, updateStock, type InventoryProduct } from '@/features/admin/api/inventoryApi'

const ProductVariantsStock = () => {
  const { productId } = useParams<{ productId: string }>()
  const [product, setProduct] = useState<InventoryProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<{
    sku: string
    currentStock: number
    attributes: Array<{ name: string; value: string; displayValue?: string }>
  } | null>(null)
  const [stockForm, setStockForm] = useState({
    type: 'add' as 'add' | 'remove',
    quantity: 0,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProduct = useCallback(async () => {
    if (!productId) return

    setLoading(true)
    setError(null)
    try {
      const response = await getInventoryProductById(productId)
      if (response.success) {
        setProduct(response.data)
      } else {
        setError(response.message || 'Failed to fetch product')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleOpenStockModal = (variant: InventoryProduct['variants'][0]) => {
    setSelectedVariant({
      sku: variant.sku,
      currentStock: variant.stockQuantity || 0,
      attributes: variant.attributes || [],
    })
    setStockForm({
      type: 'add',
      quantity: 0,
      notes: '',
    })
    setShowStockModal(true)
  }

  const handleCloseStockModal = () => {
    setShowStockModal(false)
    setSelectedVariant(null)
    setStockForm({
      type: 'add',
      quantity: 0,
      notes: '',
    })
  }

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || !selectedVariant || stockForm.quantity <= 0) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await updateStock({
        productId,
        variantSku: selectedVariant.sku,
        type: stockForm.type,
        quantity: stockForm.quantity,
        notes: stockForm.notes || undefined,
        reason: stockForm.type === 'add' ? 'Stock added' : 'Stock removed',
      })

      if (response.success) {
        handleCloseStockModal()
        fetchProduct() // Refresh product data
      } else {
        setError(response.message || 'Failed to update stock')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to update stock')
    } finally {
      setSubmitting(false)
    }
  }

  const getAttributeDisplay = (attributes: Array<{ name: string; value: string; displayValue?: string }>) => {
    return attributes.map((attr) => `${attr.name}: ${attr.displayValue || attr.value}`).join(', ')
  }

  const getStockStatus = (stock: number): { variant: string; label: string } => {
    if (stock === 0) {
      return { variant: 'danger', label: 'Out of Stock' }
    } else if (stock <= 5) {
      return { variant: 'warning', label: 'Low Stock' }
    }
    return { variant: 'success', label: 'In Stock' }
  }

  if (loading) {
    return (
      <>
        <PageBreadcrumb subName="Inventory" title="Product Variants" />
        <PageMetaData title="Product Variants" />
        <div className="text-center py-5">
          <Preloader />
        </div>
      </>
    )
  }

  if (error && !product) {
    return (
      <>
        <PageBreadcrumb subName="Inventory" title="Product Variants" />
        <PageMetaData title="Product Variants" />
        <Alert variant="danger">{error}</Alert>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <PageBreadcrumb subName="Inventory" title="Product Variants" />
        <PageMetaData title="Product Variants" />
        <Alert variant="info">Product not found</Alert>
      </>
    )
  }

  return (
    <>
      <PageBreadcrumb subName="Inventory" title="Product Variants" />
      <PageMetaData title="Product Variants" />

      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">{product.title}</h5>
                {product.brand && <p className="text-muted mb-0">{product.brand}</p>}
              </div>
              <Link to="/inventory" className="btn btn-secondary">
                <IconifyIcon icon="bx:arrow-back" className="me-1" />
                Back to Inventory
              </Link>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {product.variants && product.variants.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Attributes</th>
                        <th>Current Price</th>
                        <th>Stock Quantity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => {
                        const stockStatus = getStockStatus(variant.stockQuantity || 0)
                        return (
                          <tr key={variant._id}>
                            <td>
                              <code>{variant.sku}</code>
                            </td>
                            <td>{getAttributeDisplay(variant.attributes || [])}</td>
                            <td>${variant.currentPrice?.toFixed(2) || '0.00'}</td>
                            <td>
                              <strong>{variant.stockQuantity || 0}</strong>
                            </td>
                            <td>
                              <Badge bg={stockStatus.variant}>{stockStatus.label}</Badge>
                            </td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenStockModal(variant)}
                              >
                                <IconifyIcon icon="bx:edit" className="me-1" />
                                Manage Stock
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">No variants found for this product</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock Management Modal */}
      <Modal show={showStockModal} onHide={handleCloseStockModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Stock</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStockSubmit}>
          <Modal.Body>
            {selectedVariant && (
              <>
                <div className="mb-3">
                  <strong>Variant:</strong> {getAttributeDisplay(selectedVariant.attributes)}
                </div>
                <div className="mb-3">
                  <strong>SKU:</strong> <code>{selectedVariant.sku}</code>
                </div>
                <div className="mb-3">
                  <strong>Current Stock:</strong> <Badge bg="info">{selectedVariant.currentStock}</Badge>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Action</Form.Label>
                  <Form.Select
                    value={stockForm.type}
                    onChange={(e) => setStockForm({ ...stockForm, type: e.target.value as 'add' | 'remove' })}
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={stockForm.type === 'remove' ? selectedVariant.currentStock : undefined}
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })}
                    required
                    placeholder="Enter quantity"
                  />
                  {stockForm.type === 'remove' && (
                    <Form.Text className="text-muted">
                      Maximum: {selectedVariant.currentStock} (current stock)
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={stockForm.notes}
                    onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                    placeholder="Add notes about this stock change..."
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseStockModal} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || stockForm.quantity <= 0}>
              {submitting ? (
                <>
                  <span className="me-2">
                    <Preloader />
                  </span>
                  {stockForm.type === 'add' ? 'Adding...' : 'Removing...'}
                </>
              ) : (
                <>
                  <IconifyIcon icon="bx:save" className="me-1" />
                  {stockForm.type === 'add' ? 'Add Stock' : 'Remove Stock'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default ProductVariantsStock

