import { Card, CardBody, Row, Col, Form, Button, InputGroup } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { TabComponentProps } from './types'
import { Category } from '@/features/admin/api/categoryApi'
import TagsInput from './TagsInput'

interface BasicInfoTabProps extends TabComponentProps {
  categories: Category[]
}

const BasicInfoTab = ({ register, watch, setValue, errors, categories }: BasicInfoTabProps) => {
  const tags = watch('tags') || []
  const title = watch('title') || ''

  // Generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleGenerateSlug = () => {
    if (title) {
      const slug = generateSlug(title)
      setValue('slug', slug)
    }
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Product Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                {...register('title', { required: 'Product title is required' })}
                placeholder="Enter product title"
              />
              {errors.title && <Form.Text className="text-danger">{errors.title.message}</Form.Text>}
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Product Slug <span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  {...register('slug', { required: 'Product slug is required' })}
                  placeholder="product-slug-url"
                  onChange={(e) => {
                    // Auto-format slug: lowercase, replace spaces with hyphens, remove special chars
                    const formatted = e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_]+/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-+|-+$/g, '')
                    setValue('slug', formatted)
                  }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={handleGenerateSlug}
                  disabled={!title}
                  title="Generate slug from title"
                >
                  <IconifyIcon icon="bx:refresh" className="me-1" />
                  Generate
                </Button>
              </InputGroup>
              {errors.slug && <Form.Text className="text-danger">{errors.slug.message}</Form.Text>}
              <Form.Text className="text-muted">
                URL-friendly version of the product name (e.g., product-name-slug)
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Short Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                {...register('shortDescription')}
                placeholder="Brief description (max 500 characters)"
                maxLength={500}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                {...register('description', { required: 'Description is required' })}
                placeholder="Detailed product description"
              />
              {errors.description && <Form.Text className="text-danger">{errors.description.message}</Form.Text>}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
              {errors.category && <Form.Text className="text-danger">{errors.category.message}</Form.Text>}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                {...register('brand')}
                placeholder="Enter brand name"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="out_of_stock">Out of Stock</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <TagsInput
                tags={tags}
                onChange={(newTags) => setValue('tags', newTags)}
                placeholder="Type and press Enter to add tags"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                {...register('isActive')}
              />
              <Form.Check
                type="checkbox"
                label="Featured"
                {...register('isFeatured')}
              />
              <Form.Check
                type="checkbox"
                label="Bestselling"
                {...register('isBestselling')}
              />
              <Form.Check
                type="checkbox"
                label="New Arrival"
                {...register('isNewArrival')}
              />
            </Form.Group>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default BasicInfoTab

