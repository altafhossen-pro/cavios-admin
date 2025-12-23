import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import {
  BannerCountdown,
  createBannerCountdown,
  updateBannerCountdown,
  deleteBannerCountdown,
  CreateBannerCountdownRequest,
  UpdateBannerCountdownRequest,
} from '@/features/admin/api/bannerCountdownApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'

interface BannerCountdownModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  bannerCountdown?: BannerCountdown | null
}

const BannerCountdownModal = ({ show, onHide, onSuccess, bannerCountdown }: BannerCountdownModalProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<CreateBannerCountdownRequest>({
    title: '',
    description: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop-default-grid',
    image: '',
    endDate: '',
    isActive: true,
    order: 0,
  })

  const isEditMode = !!bannerCountdown

  useEffect(() => {
    if (show) {
      if (bannerCountdown) {
        // Edit mode - populate form
        // Format endDate to YYYY-MM-DDTHH:mm for datetime-local input
        const endDate = bannerCountdown.endDate 
          ? new Date(bannerCountdown.endDate).toISOString().slice(0, 16)
          : ''
        
        setFormData({
          title: bannerCountdown.title || '',
          description: bannerCountdown.description || '',
          buttonText: bannerCountdown.buttonText || 'Shop Now',
          buttonLink: bannerCountdown.buttonLink || '/shop-default-grid',
          image: bannerCountdown.image || '',
          endDate: endDate,
          isActive: bannerCountdown.isActive !== undefined ? bannerCountdown.isActive : true,
          order: bannerCountdown.order || 0,
        })
      } else {
        // Create mode - reset form with default end date (7 days from now)
        const defaultEndDate = new Date()
        defaultEndDate.setDate(defaultEndDate.getDate() + 7)
        const formattedEndDate = defaultEndDate.toISOString().slice(0, 16)
        
        setFormData({
          title: '',
          description: '',
          buttonText: 'Shop Now',
          buttonLink: '/shop-default-grid',
          image: '',
          endDate: formattedEndDate,
          isActive: true,
          order: 0,
        })
      }
    }
  }, [show, bannerCountdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true)
    try {
      const response = await uploadSingleImage(file)
      setFormData((prev) => ({
        ...prev,
        image: response.data.url,
      }))
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
      setUploading(false)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate endDate is in the future
    if (formData.endDate) {
      const endDateObj = new Date(formData.endDate)
      if (endDateObj <= new Date()) {
        showNotification({
          message: 'End date must be in the future',
          variant: 'danger',
        })
        return
      }
    }
    
    setLoading(true)

    try {
      if (isEditMode && bannerCountdown) {
        const updateData: UpdateBannerCountdownRequest = {
          title: formData.title,
          description: formData.description || undefined,
          buttonText: formData.buttonText || undefined,
          buttonLink: formData.buttonLink || undefined,
          image: formData.image || undefined,
          endDate: formData.endDate || undefined,
          isActive: formData.isActive,
          order: formData.order,
        }
        await updateBannerCountdown(bannerCountdown._id, updateData)
        showNotification({
          message: 'Banner countdown updated successfully',
          variant: 'success',
        })
      } else {
        const createData: CreateBannerCountdownRequest = {
          title: formData.title,
          description: formData.description || undefined,
          buttonText: formData.buttonText || 'Shop Now',
          buttonLink: formData.buttonLink || '/shop-default-grid',
          image: formData.image,
          endDate: formData.endDate,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          order: formData.order || 0,
        }
        await createBannerCountdown(createData)
        showNotification({
          message: 'Banner countdown created successfully',
          variant: 'success',
        })
      }
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} banner countdown`,
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!bannerCountdown || !window.confirm(`Are you sure you want to delete banner countdown "${bannerCountdown.title}"?`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteBannerCountdown(bannerCountdown._id)
      showNotification({
        message: 'Banner countdown deleted successfully',
        variant: 'success',
      })
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete banner countdown',
        variant: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Banner Countdown' : 'Create Banner Countdown'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter banner title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter banner description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Button Text</Form.Label>
            <Form.Control
              type="text"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
              placeholder="Shop Now"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Button Link</Form.Label>
            <Form.Control
              type="text"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              placeholder="/shop-default-grid"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Image <span className="text-danger">*</span>
            </Form.Label>
            <div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block mb-2">
                Upload a banner image (Max size: 5MB, Supported formats: JPG, PNG, GIF, WebP)
              </Form.Text>
              {uploading && (
                <div className="d-flex align-items-center text-primary mb-2">
                  <span className="me-2">
                    <Preloader />
                  </span>
                  <span>Uploading image...</span>
                </div>
              )}
              {formData.image && (
                <div className="mt-2 position-relative d-inline-block">
                  <img
                    src={formData.image}
                    alt="Banner preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                    className="img-thumbnail"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    onClick={handleRemoveImage}
                    style={{ borderRadius: '50%', width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove image"
                  >
                    <IconifyIcon icon="bx:x" className="fs-14" />
                  </button>
                </div>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              End Date (Countdown Expiry) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
            <Form.Text className="text-muted">
              Select when the countdown should expire. Must be a future date and time.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Display Order</Form.Label>
            <Form.Control
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
            <Form.Text className="text-muted">Lower numbers appear first (0 = default). Only one active banner countdown is shown on homepage.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Active"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">Only active banner countdowns will be displayed on the frontend (and only if end date hasn't passed)</Form.Text>
          </Form.Group>

          {isEditMode && (
            <Alert variant="warning" className="mt-3">
              <strong>Delete Banner Countdown</strong>
              <p className="mb-2">Permanently delete this banner countdown. This action cannot be undone.</p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Banner Countdown'}
              </Button>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Banner Countdown' : 'Create Banner Countdown'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default BannerCountdownModal

