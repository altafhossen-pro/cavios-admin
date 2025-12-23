import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import {
  Category,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/features/admin/api/categoryApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'

interface CategoryModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  category?: Category | null
}

const CategoryModal = ({ show, onHide, onSuccess, category }: CategoryModalProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    image: '',
    parent: null,
    isFeatured: false,
  })

  const isEditMode = !!category

  useEffect(() => {
    if (show) {
      // Load parent categories for dropdown
      loadParentCategories()
      
      if (category) {
        // Edit mode - populate form
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          image: category.image || '',
          parent: typeof category.parent === 'string' ? category.parent : category.parent?._id || null,
          isFeatured: category.isFeatured || false,
        })
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          slug: '',
          image: '',
          parent: null,
          isFeatured: false,
        })
      }
    }
  }, [show, category])

  const loadParentCategories = async () => {
    try {
      const categories = await getAllCategories()
      // Filter out current category if editing (can't be its own parent)
      const filtered = category
        ? categories.filter((cat) => cat._id !== category._id)
        : categories
      setParentCategories(filtered)
    } catch (error) {
      console.error('Error loading parent categories:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === '' ? null : value,
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug if slug is empty or matches the old name's slug
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug,
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
      if (isEditMode && category) {
        const updateData: UpdateCategoryRequest = {
          name: formData.name,
          slug: formData.slug,
          image: formData.image || undefined,
          parent: formData.parent,
          isFeatured: formData.isFeatured,
        }
        await updateCategory(category._id, updateData)
        showNotification({
          message: 'Category updated successfully',
          variant: 'success',
        })
      } else {
        const createData: CreateCategoryRequest = {
          name: formData.name,
          slug: formData.slug,
          image: formData.image || undefined,
          parent: formData.parent || null,
          isFeatured: formData.isFeatured,
        }
        await createCategory(createData)
        showNotification({
          message: 'Category created successfully',
          variant: 'success',
        })
      }
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} category`,
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!category || !window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteCategory(category._id)
      showNotification({
        message: 'Category deleted successfully',
        variant: 'success',
      })
      onSuccess()
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete category',
        variant: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Category' : 'Create Category'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Category Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Slug <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="category-slug"
              required
            />
            <Form.Text className="text-muted">
              URL-friendly version of the name (auto-generated from name)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category Image</Form.Label>
            <div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block mb-2">
                Upload an image for this category (Max size: 5MB, Supported formats: JPG, PNG, GIF, WebP)
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
                    alt="Category preview"
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
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
            <Form.Label>Parent Category</Form.Label>
            <Form.Select
              name="parent"
              value={formData.parent || ''}
              onChange={handleChange}
            >
              <option value="">None (Top Level)</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select a parent category to create a subcategory
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="isFeatured"
              label="Featured Category"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Featured categories will be highlighted on the homepage
            </Form.Text>
          </Form.Group>

          {isEditMode && (
            <Alert variant="warning" className="mt-3">
              <strong>Delete Category</strong>
              <p className="mb-2">Permanently delete this category. This action cannot be undone.</p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Category'}
              </Button>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CategoryModal

