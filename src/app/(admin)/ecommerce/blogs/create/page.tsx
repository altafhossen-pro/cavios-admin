import { useState, useEffect, useRef } from 'react'
import { Card, CardBody, Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import PageMetaData from '@/components/PageTitle'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { createBlog, CreateBlogRequest, checkSlugAvailability } from '@/features/admin/api/blogApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'
import TinyMCEEditor from '@/components/wrappers/TinyMCEEditor'

const CreateBlogPage = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true)
  const [formData, setFormData] = useState<CreateBlogRequest>({
    title: '',
    slug: '',
    description: '',
    content: '',
    image: '',
    author: 'Admin',
    isActive: true,
    publishedAt: new Date().toISOString(),
    metaTitle: '',
    metaDescription: '',
  })

  // Generate slug from text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Debounced slug availability check
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear existing timeout
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current)
    }

    // If slug is empty or auto-generate is off, skip check
    if (!formData.slug || !formData.slug.trim()) {
      setSlugAvailable(null)
      return
    }

    // Set timeout for 1 second debounce
    slugCheckTimeoutRef.current = setTimeout(async () => {
      setSlugChecking(true)
      try {
        const response = await checkSlugAvailability(formData.slug || '')
        setSlugAvailable(response.available)
        if (response.available && response.slug !== formData.slug) {
          setFormData((prev) => ({ ...prev, slug: response.slug }))
        }
      } catch (error) {
        setSlugAvailable(false)
      } finally {
        setSlugChecking(false)
      }
    }, 1000)

    // Cleanup
    return () => {
      if (slugCheckTimeoutRef.current) {
        clearTimeout(slugCheckTimeoutRef.current)
      }
    }
  }, [formData.slug])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
      }

      // Auto-generate slug from title if enabled
      if (name === 'title' && autoGenerateSlug) {
        updated.slug = generateSlug(value)
        setSlugAvailable(null) // Reset availability check
      }

      return updated
    })
  }

  const handleGenerateSlug = () => {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title)
      setFormData((prev) => ({ ...prev, slug: generatedSlug }))
      setAutoGenerateSlug(true)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showNotification({
        message: 'Please select a valid image file',
        variant: 'danger',
      })
      return
    }

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
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      showNotification({
        message: 'Title is required',
        variant: 'danger',
      })
      return
    }

    if (!formData.description.trim()) {
      showNotification({
        message: 'Description is required',
        variant: 'danger',
      })
      return
    }

    if (!formData.content.trim()) {
      showNotification({
        message: 'Content is required',
        variant: 'danger',
      })
      return
    }

    if (!formData.image) {
      showNotification({
        message: 'Image is required',
        variant: 'danger',
      })
      return
    }

    setLoading(true)
    try {
      await createBlog(formData)
      showNotification({
        message: 'Blog created successfully',
        variant: 'success',
      })
      navigate('/ecommerce/blogs')
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to create blog',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMetaData title="Create Blog" />
      <PageBreadcrumb
        title="Create Blog"
        subName="Ecommerce"
      />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter blog title"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Slug *</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={(e) => {
                        setAutoGenerateSlug(false)
                        handleChange(e)
                      }}
                      placeholder="blog-slug"
                      required
                      className={slugAvailable === false ? 'is-invalid' : slugAvailable === true ? 'is-valid' : ''}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleGenerateSlug}
                      disabled={!formData.title}
                      type="button"
                    >
                      <IconifyIcon icon="bx:refresh" className="me-1" />
                      Generate
                    </Button>
                  </div>
                  {slugChecking && (
                    <Form.Text className="text-muted">
                      <span className="spinner-border spinner-border-sm me-1" />
                      Checking availability...
                    </Form.Text>
                  )}
                  {!slugChecking && slugAvailable === false && (
                    <Form.Text className="text-danger">
                      This slug is already taken. Please use a different one.
                    </Form.Text>
                  )}
                  {!slugChecking && slugAvailable === true && (
                    <Form.Text className="text-success">
                      This slug is available.
                    </Form.Text>
                  )}
                  <Form.Check
                    type="checkbox"
                    label="Auto-generate slug from title"
                    checked={autoGenerateSlug}
                    onChange={(e) => {
                      setAutoGenerateSlug(e.target.checked)
                      if (e.target.checked && formData.title) {
                        setFormData((prev) => ({ ...prev, slug: generateSlug(formData.title) }))
                      }
                    }}
                    className="mt-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter blog description"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content *</Form.Label>
                  <TinyMCEEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    height={400}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Author</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                  />
                </Form.Group>
              </Col>

              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Featured Image *</Form.Label>
                  {formData.image ? (
                    <div className="mb-2">
                      <img
                        src={formData.image}
                        alt="Blog"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleRemoveImage}
                        type="button"
                      >
                        <IconifyIcon icon="bx:trash" className="me-1" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded p-3 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="d-none"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="mb-0">
                        <Button
                          variant="outline-primary"
                          as="span"
                          disabled={uploading}
                          className="w-100"
                        >
                          {uploading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <IconifyIcon icon="bx:upload" className="me-1" />
                              Upload Image
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Published Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="publishedAt"
                    value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        publishedAt: new Date(e.target.value).toISOString(),
                      }))
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Active"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta Title (SEO)</Form.Label>
                  <Form.Control
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Enter meta title for SEO"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta Description (SEO)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Enter meta description for SEO"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="bx:save" className="me-1" />
                    Create Blog
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateBlogPage

