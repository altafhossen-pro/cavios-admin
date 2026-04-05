import { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { deleteSubscriber } from '@/features/admin/api/newsletterApi';
import { useNotificationContext } from '@/context/useNotificationContext';

interface DeleteSubscriberModalProps {
  show: boolean;
  onHide: () => void;
  subscriberId: string | null;
  subscriberEmail: string;
  onSuccess: () => void;
}

const DeleteSubscriberModal = ({ show, onHide, subscriberId, subscriberEmail, onSuccess }: DeleteSubscriberModalProps) => {
  const { showNotification } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!subscriberId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await deleteSubscriber(subscriberId);
      if (response.success) {
        showNotification({ message: 'Subscriber deleted successfully', variant: 'success' });
        onSuccess();
        onHide();
      } else {
        setError(response.message || 'Failed to delete subscriber');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscriber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
      </Modal.Header>
      <Modal.Body className="text-center pt-0 px-4">
        <div className="avatar-lg mx-auto mb-3 bg-soft-danger text-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
          <IconifyIcon icon="solar:trash-bin-trash-bold" className="fs-1" />
        </div>
        
        <h4 className="fw-bold mb-2">Delete</h4>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '250px' }}>
          Are you sure you want to delete <strong>{subscriberEmail}</strong>?
        </p>

        {error && (
          <Alert variant="danger" className="py-2 small mb-3">
            {error}
          </Alert>
        )}

        <div className="d-flex gap-2">
          <Button variant="light" className="w-100 py-2 fw-medium" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" className="w-100 py-2 fw-medium" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            ) : null}
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteSubscriberModal;
