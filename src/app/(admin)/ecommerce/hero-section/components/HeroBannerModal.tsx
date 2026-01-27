import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import {
  HeroBanner,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  CreateHeroBannerRequest,
  UpdateHeroBannerRequest,
} from '@/features/admin/api/heroBannerApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'

interface HeroBannerModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  heroBanner?: HeroBanner | null
}

const HeroBannerModal = ({ show, onHide, onSuccess, heroBanner }: HeroBannerModalProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<CreateHeroBannerRequest>({
    imgSrc: '',
    alt: 'hero-slideshow',
    subheading: '',
    heading: '',
    btnText: 'Explore Collection',
    buttonLink: '/shop',
    isActive: true,
    order: 0,
  })

  const isEditMode = !!heroBanner

  useEffect(() => {
    if (show) {
      if (heroBanner) {
        // Edit mode - populate form
        setFormData({
          imgSrc: heroBanner.imgSrc || heroBanner.modelImage || '',
          alt: heroBanner.alt || 'hero-slideshow',
          subheading: heroBanner.subheading || '',
          heading: heroBanner.heading || heroBanner.title || '',
          btnText: heroBanner.btnText || heroBanner.button1Text || 'Explore Collection',
          buttonLink: heroBanner.buttonLink || heroBanner.button1Link || '/shop',
          isActive: heroBanner.isActive !== undefined ? heroBanner.isActive : true,
          order: heroBanner.order || 0,
        })
      } else {
        // Create mode - reset form
        setFormData({
          imgSrc: '',
          alt: 'hero-slideshow',
          subheading: '',
          heading: '',
          btnText: 'Explore Collection',
          buttonLink: '/shop',
          isActive: true,
          order: 0,
        })
      }
    }
  }, [show, heroBanner])

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
        imgSrc: response.data.url,
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
      imgSrc: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditMode && heroBanner) {
        const updateData: UpdateHeroBannerRequest = {
          imgSrc: formData.imgSrc || undefined,
          alt: formData.alt || undefined,
          subheading: formData.subheading || undefined,
          heading: formData.heading,
          btnText: formData.btnText,
          buttonLink: formData.buttonLink || undefined,
          isActive: formData.isActive,
          order: formData.order,
        }
        await updateHeroBanner(heroBanner._id, updateData)
        showNotification({
          message: 'Hero banner updated successfully',
          variant: 'success',
        })
      } else {
        const createData: CreateHeroBannerRequest = {
          imgSrc: formData.imgSrc,
          alt: formData.alt,
          subheading: formData.subheading,
          heading: formData.heading,
          btnText: formData.btnText,
          buttonLink: formData.buttonLink,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          order: formData.order || 0,
        }
        await createHeroBanner(createData)
        showNotification({
          message: 'Hero banner created successfully',
          variant: 'success',
        })
      }
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} hero banner`,
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!heroBanner || !window.confirm(`Are you sure you want to delete hero banner "${heroBanner.heading}"?`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteHeroBanner(heroBanner._id)
      showNotification({
        message: 'Hero banner deleted successfully',
        variant: 'success',
      })
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete hero banner',
        variant: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Hero Banner' : 'Create Hero Banner'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Hero Image <span className="text-danger">*</span>
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
                Upload a hero banner image (Max size: 5MB, Supported formats: JPG, PNG, GIF, WebP)
              </Form.Text>
              {uploading && (
                <div className="d-flex align-items-center text-primary mb-2">
                  <span className="me-2">
                    <Preloader />
                  </span>
                  <span>Uploading image...</span>
                </div>
              )}
              {formData.imgSrc && (
                <div className="mt-2 position-relative d-inline-block">
                  <img
                    src={formData.imgSrc}
                    alt="Hero banner preview"
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
            <Form.Label>Alt Text</Form.Label>
            <Form.Control
              type="text"
              name="alt"
              value={formData.alt}
              onChange={handleChange}
              placeholder="hero-slideshow"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Subheading</Form.Label>
            <Form.Control
              type="text"
              name="subheading"
              value={formData.subheading}
              onChange={handleChange}
              placeholder="e.g., BIKINIS & SWIMSUITS"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Heading <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g., Flash Sale Madness"
              required
            />
            <Form.Text className="text-muted">Use \n for line breaks</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Button Text <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="btnText"
              value={formData.btnText}
              onChange={handleChange}
              placeholder="Explore Collection"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Button Link</Form.Label>
            <Form.Control
              type="text"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              placeholder="/shop"
            />
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
            <Form.Text className="text-muted">Lower numbers appear first (0 = default)</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isActive"
              label="Active"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">Only active banners will be displayed on the frontend</Form.Text>
          </Form.Group>

          {isEditMode && (
            <Alert variant="warning" className="mt-3">
              <strong>Delete Hero Banner</strong>
              <p className="mb-2">Permanently delete this hero banner. This action cannot be undone.</p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Hero Banner'}
              </Button>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Hero Banner' : 'Create Hero Banner'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default HeroBannerModal
