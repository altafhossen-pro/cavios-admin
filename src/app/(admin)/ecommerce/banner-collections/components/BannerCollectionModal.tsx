import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import {
  BannerCollection,
  createBannerCollection,
  updateBannerCollection,
  deleteBannerCollection,
  CreateBannerCollectionRequest,
  UpdateBannerCollectionRequest,
} from '@/features/admin/api/bannerCollectionApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'

interface BannerCollectionModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  bannerCollection?: BannerCollection | null
}

const BannerCollectionModal = ({ show, onHide, onSuccess, bannerCollection }: BannerCollectionModalProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<CreateBannerCollectionRequest>({
    image: '',
    title: '',
    description: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop-collection',
    style: 'default',
    isActive: true,
    order: 0,
  })

  const isEditMode = !!bannerCollection

  useEffect(() => {
    if (show) {
      if (bannerCollection) {
        // Edit mode - populate form
        setFormData({
          image: bannerCollection.image || '',
          title: bannerCollection.title || '',
          description: bannerCollection.description || '',
          buttonText: bannerCollection.buttonText || 'Shop Now',
          buttonLink: bannerCollection.buttonLink || '/shop-collection',
          style: bannerCollection.style || 'default',
          isActive: bannerCollection.isActive !== undefined ? bannerCollection.isActive : true,
          order: bannerCollection.order || 0,
        })
      } else {
        // Create mode - reset form
        setFormData({
          image: '',
          title: '',
          description: '',
          buttonText: 'Shop Now',
          buttonLink: '/shop-collection',
          style: 'default',
          isActive: true,
          order: 0,
        })
      }
    }
  }, [show, bannerCollection])

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
    setLoading(true)

    try {
      if (isEditMode && bannerCollection) {
        const updateData: UpdateBannerCollectionRequest = {
          image: formData.image || undefined,
          title: formData.title,
          description: formData.description || undefined,
          buttonText: formData.buttonText || undefined,
          buttonLink: formData.buttonLink || undefined,
          style: formData.style,
          isActive: formData.isActive,
          order: formData.order,
        }
        await updateBannerCollection(bannerCollection._id, updateData)
        showNotification({
          message: 'Banner collection updated successfully',
          variant: 'success',
        })
      } else {
        const createData: CreateBannerCollectionRequest = {
          image: formData.image,
          title: formData.title,
          description: formData.description || undefined,
          buttonText: formData.buttonText || 'Shop Now',
          buttonLink: formData.buttonLink || '/shop-collection',
          style: formData.style || 'default',
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          order: formData.order || 0,
        }
        await createBannerCollection(createData)
        showNotification({
          message: 'Banner collection created successfully',
          variant: 'success',
        })
      }
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} banner collection`,
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!bannerCollection || !window.confirm(`Are you sure you want to delete banner collection "${bannerCollection.title}"?`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteBannerCollection(bannerCollection._id)
      showNotification({
        message: 'Banner collection deleted successfully',
        variant: 'success',
      })
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete banner collection',
        variant: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Banner Collection' : 'Create Banner Collection'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
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
                    style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
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
              placeholder="/shop-collection"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Style</Form.Label>
            <Form.Select
              name="style"
              value={formData.style}
              onChange={handleChange}
            >
              <option value="default">Default</option>
              <option value="position">Position (White Text)</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Default: Normal text. Position: White text overlay (for darker images)
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
            <Form.Text className="text-muted">Lower numbers appear first (0 = default). Only first 2 banners are shown on homepage.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Active"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">Only active banner collections will be displayed on the frontend</Form.Text>
          </Form.Group>

          {isEditMode && (
            <Alert variant="warning" className="mt-3">
              <strong>Delete Banner Collection</strong>
              <p className="mb-2">Permanently delete this banner collection. This action cannot be undone.</p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Banner Collection'}
              </Button>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Banner Collection' : 'Create Banner Collection'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default BannerCollectionModal

