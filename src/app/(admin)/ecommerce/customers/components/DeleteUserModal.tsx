import { useState } from 'react'
import { Modal, Button, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { deleteUser } from '@/features/admin/api/userApi'

interface DeleteUserModalProps {
  show: boolean
  onHide: () => void
  userId: string | null
  userName: string
  onSuccess: () => void
}

const DeleteUserModal = ({ show, onHide, userId, userName, onSuccess }: DeleteUserModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await deleteUser(userId)
      if (response.success) {
        onSuccess()
        onHide()
      } else {
        setError(response.message || 'Failed to delete user')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="bx:trash" className="me-2 text-danger" />
          Delete User
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <p>Are you sure you want to delete <strong>{userName}</strong>?</p>
        <p className="text-muted small">This action cannot be undone.</p>
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
              Delete User
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteUserModal

