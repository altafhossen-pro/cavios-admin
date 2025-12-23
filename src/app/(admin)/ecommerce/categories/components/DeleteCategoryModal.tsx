import { useState } from 'react'
import { Modal, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { deleteCategory } from '@/features/admin/api/categoryApi'

interface DeleteCategoryModalProps {
  show: boolean
  onHide: () => void
  categoryId: string | null
  categoryName: string
  onSuccess: () => void
}

const DeleteCategoryModal = ({ show, onHide, categoryId, categoryName, onSuccess }: DeleteCategoryModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!categoryId) return

    setLoading(true)
    setError(null)

    try {
      const response = await deleteCategory(categoryId)
      if (response.success) {
        onSuccess()
        onHide()
      } else {
        setError(response.message || 'Failed to delete category')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="bx:trash" className="me-2 text-danger" />
          Delete Category
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <p>Are you sure you want to delete <strong>{categoryName}</strong>?</p>
        <p className="text-muted small">This action cannot be undone. All subcategories and related data will be permanently deleted.</p>
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
              Delete Category
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteCategoryModal

