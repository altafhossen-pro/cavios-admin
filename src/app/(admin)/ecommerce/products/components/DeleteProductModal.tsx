import { useState } from 'react'
import { Modal, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { deleteProduct } from '@/features/admin/api/productApi'

interface DeleteProductModalProps {
  show: boolean
  onHide: () => void
  productId: string | null
  productName: string
  onSuccess: () => void
}

const DeleteProductModal = ({ show, onHide, productId, productName, onSuccess }: DeleteProductModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!productId) return

    setLoading(true)
    setError(null)

    try {
      const response = await deleteProduct(productId)
      if (response.success) {
        onSuccess()
        onHide()
      } else {
        setError(response.message || 'Failed to delete product')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="bx:trash" className="me-2 text-danger" />
          Delete Product
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <p>Are you sure you want to delete <strong>{productName}</strong>?</p>
        <p className="text-muted small">This action cannot be undone. All product data, variants, and related information will be permanently deleted.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? (
            <>
              <span className="me-2">
                <Preloader />
              </span>
              Deleting...
            </>
          ) : (
            <>
              <IconifyIcon icon="bx:trash" className="me-2" />
              Delete Product
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteProductModal

