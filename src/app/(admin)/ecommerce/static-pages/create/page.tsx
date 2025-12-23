import { useState, useEffect, useRef } from 'react'
import { Card, CardBody, Form, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import PageMetaData from '@/components/PageTitle'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { createStaticPage, CreateStaticPageRequest, checkSlugAvailability } from '@/features/admin/api/staticPageApi'
import TinyMCEEditor from '@/components/wrappers/TinyMCEEditor'

const CreateStaticPagePage = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true)
  const [formData, setFormData] = useState<CreateStaticPageRequest>({
    title: '',
    slug: '',
    content: '',
    pageType: 'other',
    isActive: true,
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
        // Update slug with normalized version if provided
        if (response.slug && response.slug !== formData.slug) {
          setFormData((prev) => ({ ...prev, slug: response.slug! }))
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoGenerateSlug(false) // Disable auto-generation when manually editing
    handleChange(e)
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

    if (!formData.slug.trim()) {
      showNotification({
        message: 'Slug is required',
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

    // Check slug availability before submitting
    if (slugChecking) {
      showNotification({
        message: 'Please wait for slug availability check to complete',
        variant: 'warning',
      })
      return
    }

    if (slugAvailable === false) {
      showNotification({
        message: 'Slug is not available. Please choose a different slug.',
        variant: 'danger',
      })
      return
    }

    setLoading(true)
    try {
      await createStaticPage(formData)
      showNotification({
        message: 'Static page created successfully',
        variant: 'success',
      })
      navigate('/ecommerce/static-pages')
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to create static page',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMetaData title="Create Static Page" />
      <PageBreadcrumb title="Create Static Page" subName="Ecommerce" />
      <Card>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter page title"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Slug <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      placeholder="Enter URL slug (e.g., shipping-policy)"
                      required
                      className={slugChecking ? '' : slugAvailable === false ? 'is-invalid' : slugAvailable === true ? 'is-valid' : ''}
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={handleGenerateSlug}
                      disabled={!formData.title}
                    >
                      Generate
                    </Button>
                  </div>
                  {slugChecking && (
                    <Form.Text className="text-muted">
                      <IconifyIcon icon="bx:loader-alt" className="spinning" /> Checking availability...
                    </Form.Text>
                  )}
                  {!slugChecking && slugAvailable === false && (
                    <Form.Text className="text-danger">This slug is already taken. Please choose a different one.</Form.Text>
                  )}
                  {!slugChecking && slugAvailable === true && (
                    <Form.Text className="text-success">This slug is available!</Form.Text>
                  )}
                  <Form.Text className="text-muted">Slug will be used in the URL (e.g., /page/shipping-policy)</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Content <span className="text-danger">*</span>
                  </Form.Label>
                  <TinyMCEEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    height={500}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Page Type</Form.Label>
                  <Form.Select name="pageType" value={formData.pageType} onChange={handleChange}>
                    <option value="shipping">Shipping</option>
                    <option value="return-refund">Return & Refund</option>
                    <option value="privacy-policy">Privacy Policy</option>
                    <option value="terms-conditions">Terms & Conditions</option>
                    <option value="faqs">FAQs</option>
                    <option value="other">Other</option>
                  </Form.Select>
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
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="SEO meta title (optional)"
                  />
                  <Form.Text className="text-muted">Leave empty to use page title</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="SEO meta description (optional)"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconifyIcon icon="bx:loader-alt" className="spinning me-1" />
                    Creating...
                  </>
                ) : (
                  <>
                    <IconifyIcon icon="bx:save" className="me-1" />
                    Create Page
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

export default CreateStaticPagePage

