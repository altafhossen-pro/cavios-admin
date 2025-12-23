import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, Form, Button, Row, Col, Modal } from 'react-bootstrap'
import PageMetaData from '@/components/PageTitle'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import Preloader from '@/components/Preloader'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { getBlogById, updateBlog, UpdateBlogRequest, checkSlugAvailability } from '@/features/admin/api/blogApi'
import { uploadSingleImage } from '@/features/admin/api/uploadApi'
import TinyMCEEditor from '@/components/wrappers/TinyMCEEditor'

const EditBlogPage = () => {
  const params = useParams<{ blogId: string }>()
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const blogId = params.blogId || ''
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(false)
  const [imageKey, setImageKey] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState<UpdateBlogRequest>({
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

  useEffect(() => {
    const fetchBlog = async () => {
      setFetching(true)
      try {
        const response = await getBlogById(blogId)
        if (response.success && response.data.blog) {
          const blog = response.data.blog
          setFormData({
            title: blog.title || '',
            slug: blog.slug || '',
            description: blog.description || '',
            content: blog.content || '',
            image: blog.image || '',
            author: blog.author || 'Admin',
            isActive: blog.isActive !== undefined ? blog.isActive : true,
            publishedAt: blog.publishedAt || new Date().toISOString(),
            metaTitle: blog.metaTitle || '',
            metaDescription: blog.metaDescription || '',
          })
        } else {
          showNotification({
            message: 'Blog not found',
            variant: 'danger',
          })
          navigate('/ecommerce/blogs')
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        showNotification({
          message: err.message || 'Failed to fetch blog',
          variant: 'danger',
        })
        navigate('/ecommerce/blogs')
      } finally {
        setFetching(false)
      }
    }

    if (blogId) {
      fetchBlog()
    }
  }, [blogId, navigate, showNotification])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  // Generate slug from text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Debounced slug availability check
  useEffect(() => {
    // Clear existing timeout
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current)
    }

    // If slug is empty, skip check
    if (!formData.slug || !formData.slug.trim()) {
      setSlugAvailable(null)
      return
    }

    // Set timeout for 1 second debounce
    slugCheckTimeoutRef.current = setTimeout(async () => {
      setSlugChecking(true)
      try {
        const response = await checkSlugAvailability(formData.slug || '', blogId)
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
  }, [formData.slug, blogId])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewImage(previewUrl)
    setShowImageModal(true)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload image first
      const response = await uploadSingleImage(selectedFile)
      const imageUrl = response.data?.url
      
      if (!imageUrl || typeof imageUrl !== 'string') {
        showNotification({
          message: 'Failed to get image URL from response',
          variant: 'danger',
        })
        return
      }

      // Update formData with new image URL
      const updatedFormData = {
        ...formData,
        image: imageUrl,
      }

      setFormData(updatedFormData)
      
      // Update blog via API
      await updateBlog(blogId, updatedFormData)
      
      // Force image re-render by updating key
      setImageKey(prev => prev + 1)
      showNotification({
        message: 'Image uploaded and blog updated successfully',
        variant: 'success',
      })
      
      // Cleanup
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
      setShowImageModal(false)
      setPreviewImage(null)
      setSelectedFile(null)
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to upload image',
        variant: 'danger',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCancelUpload = () => {
    // Cleanup preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage)
    }
    setShowImageModal(false)
    setPreviewImage(null)
    setSelectedFile(null)
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
    // Force image re-render by updating key
    setImageKey(prev => prev + 1)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title?.trim()) {
      showNotification({
        message: 'Title is required',
        variant: 'danger',
      })
      return
    }

    if (!formData.description?.trim()) {
      showNotification({
        message: 'Description is required',
        variant: 'danger',
      })
      return
    }

    if (!formData.content?.trim()) {
      showNotification({
        message: 'Content is required',
        variant: 'danger',
      })
      return
    }

    if (!formData.image?.trim()) {
      showNotification({
        message: 'Featured image is required',
        variant: 'danger',
      })
      return
    }

    setLoading(true)
    try {
      await updateBlog(blogId, formData)
      showNotification({
        message: 'Blog updated successfully',
        variant: 'success',
      })
      navigate('/ecommerce/blogs')
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to update blog',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <>
        <PageMetaData title="Edit Blog" />
        <PageBreadcrumb
          title="Edit Blog"
          subName="Ecommerce"
        />
        <Card>
          <CardBody>
            <div className="text-center py-5">
              <Preloader />
              <p className="mt-3 text-muted">Loading blog...</p>
            </div>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageMetaData title="Edit Blog" />
      <PageBreadcrumb
        title="Edit Blog"
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
                        setFormData((prev) => ({ ...prev, slug: generateSlug(formData.title || '') }))
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
                    value={formData.content || ''}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="d-none"
                    id="image-upload"
                  />
                  {formData.image ? (
                    <div className="mb-2">
                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">Current Image URL:</small>
                        <code className="small">{formData.image}</code>
                      </div>
                      <img
                        key={`image-${imageKey}`}
                        src={`${formData.image}?t=${Date.now()}`}
                        alt="Blog"
                        className="img-fluid rounded mb-2"
                        style={{ maxHeight: '200px', width: '100%', objectFit: 'cover', border: '1px solid #ddd' }}
                        onError={() => {
                          showNotification({
                            message: 'Failed to load image',
                            variant: 'danger',
                          })
                        }}
                      />
                      <div className="d-flex gap-2">
                        <label htmlFor="image-upload" className="mb-0 flex-grow-1">
                          <Button
                            variant="outline-primary"
                            as="span"
                            disabled={uploading}
                            size="sm"
                            className="w-100"
                          >
                            {uploading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <IconifyIcon icon="bx:image" className="me-1" />
                                Change Image
                              </>
                            )}
                          </Button>
                        </label>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleRemoveImage}
                          type="button"
                        >
                          <IconifyIcon icon="bx:trash" className="me-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded p-3 text-center">
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
                    Updating...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="bx:save" className="me-1" />
                    Update Blog
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      {/* Image Upload Preview Modal */}
      <Modal show={showImageModal} onHide={handleCancelUpload} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview & Upload Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewImage && (
            <div className="text-center">
              <img
                src={previewImage}
                alt="Preview"
                className="img-fluid rounded mb-3"
                style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
              />
              {selectedFile && (
                <div className="text-muted small">
                  <p className="mb-1"><strong>Filename:</strong> {selectedFile.name}</p>
                  <p className="mb-0"><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelUpload} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmUpload} disabled={uploading}>
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
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default EditBlogPage

