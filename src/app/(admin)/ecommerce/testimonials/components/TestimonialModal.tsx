import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import {
  Testimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
} from '@/features/admin/api/testimonialApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'

interface TestimonialModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  testimonial?: Testimonial | null
}

const TestimonialModal = ({ show, onHide, onSuccess, testimonial }: TestimonialModalProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<CreateTestimonialRequest>({
    profilePic: '',
    name: '',
    designation: '',
    rating: 5,
    reviewText: '',
    isActive: true,
    order: 0,
  })

  const isEditMode = !!testimonial

  useEffect(() => {
    if (show) {
      if (testimonial) {
        // Edit mode - populate form
        setFormData({
          profilePic: testimonial.profilePic || '',
          name: testimonial.name || '',
          designation: testimonial.designation || '',
          rating: testimonial.rating || 5,
          reviewText: testimonial.reviewText || '',
          isActive: testimonial.isActive !== undefined ? testimonial.isActive : true,
          order: testimonial.order || 0,
        })
      } else {
        // Create mode - reset form
        setFormData({
          profilePic: '',
          name: '',
          designation: '',
          rating: 5,
          reviewText: '',
          isActive: true,
          order: 0,
        })
      }
    }
  }, [show, testimonial])

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
        profilePic: response.data.url,
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
      profilePic: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditMode && testimonial) {
        const updateData: UpdateTestimonialRequest = {
          profilePic: formData.profilePic || undefined,
          name: formData.name,
          designation: formData.designation || undefined,
          rating: formData.rating,
          reviewText: formData.reviewText,
          isActive: formData.isActive,
          order: formData.order,
        }
        await updateTestimonial(testimonial._id, updateData)
        showNotification({
          message: 'Testimonial updated successfully',
          variant: 'success',
        })
      } else {
        const createData: CreateTestimonialRequest = {
          profilePic: formData.profilePic,
          name: formData.name,
          designation: formData.designation || undefined,
          rating: formData.rating,
          reviewText: formData.reviewText,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          order: formData.order || 0,
        }
        await createTestimonial(createData)
        showNotification({
          message: 'Testimonial created successfully',
          variant: 'success',
        })
      }
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} testimonial`,
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!testimonial || !window.confirm(`Are you sure you want to delete testimonial from "${testimonial.name}"?`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteTestimonial(testimonial._id)
      showNotification({
        message: 'Testimonial deleted successfully',
        variant: 'success',
      })
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete testimonial',
        variant: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <IconifyIcon
        key={index}
        icon={index < rating ? 'bx:bxs-star' : 'bx:bx-star'}
        className={`text-warning ${index < rating ? 'fill' : ''}`}
        style={{ fontSize: '20px', cursor: 'pointer' }}
        onClick={() => setFormData((prev) => ({ ...prev, rating: index + 1 }))}
      />
    ))
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Testimonial' : 'Create Testimonial'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Profile Picture <span className="text-danger">*</span>
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
                Upload a profile picture (Max size: 5MB, Supported formats: JPG, PNG, GIF, WebP)
              </Form.Text>
              {uploading && (
                <div className="d-flex align-items-center text-primary mb-2">
                  <span className="me-2">
                    <Preloader />
                  </span>
                  <span>Uploading image...</span>
                </div>
              )}
              {formData.profilePic && (
                <div className="mt-2 position-relative d-inline-block">
                  <img
                    src={formData.profilePic}
                    alt="Profile preview"
                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '50%' }}
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
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Designation</Form.Label>
            <Form.Control
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g., CEO, Customer, etc."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Rating <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex align-items-center gap-2 mb-2">
              {renderStars(formData.rating)}
              <span className="text-muted">({formData.rating} / 5)</span>
            </div>
            <Form.Control
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="1"
              max="5"
              required
            />
            <Form.Text className="text-muted">Click on stars above or enter a value between 1-5</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Review Text <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="reviewText"
              value={formData.reviewText}
              onChange={handleChange}
              placeholder="Enter customer review/testimonial"
              required
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
            <Form.Text className="text-muted">Only active testimonials will be displayed on the frontend</Form.Text>
          </Form.Group>

          {isEditMode && (
            <Alert variant="warning" className="mt-3">
              <strong>Delete Testimonial</strong>
              <p className="mb-2">Permanently delete this testimonial. This action cannot be undone.</p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Testimonial'}
              </Button>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Testimonial' : 'Create Testimonial'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default TestimonialModal

