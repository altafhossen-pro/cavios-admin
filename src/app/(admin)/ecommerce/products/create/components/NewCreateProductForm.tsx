import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Alert, Tab, Tabs } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { createProduct, CreateProductRequest } from '@/features/admin/api/productApi'
import { getAllCategories, Category } from '@/features/admin/api/categoryApi'
import { uploadSingleImage, uploadMultipleImages } from '@/features/admin/api/uploadApi'
import { ProductFormData } from './types'
import BasicInfoTab from './BasicInfoTab'
import ImagesTab from './ImagesTab'
import PricingInventoryTab from './PricingInventoryTab'
import SEOTab from './SEOTab'
import AdditionalInfoTab from './AdditionalInfoTab'

const NewCreateProductForm = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      productType: 'variable', // All products will have variants
      status: 'draft',
      isActive: true,
      isFeatured: false,
      isBestselling: false,
      isNewArrival: false,
      stockStatus: 'in_stock',
      lowStockThreshold: 5,
      gallery: [],
      variants: [],
      tags: [],
      subCategories: [],
      specifications: [],
      availableAttributes: [],
      metaKeywords: [],
    },
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Handle featured image upload
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await uploadSingleImage(file)
      setValue('featuredImage', response.data.url)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Handle gallery images upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      const response = await uploadMultipleImages(files)
      const currentGallery = watch('gallery') || []
      const newImages = response.data.map((img, index) => ({
        url: img.url,
        altText: img.originalName,
        isPrimary: false,
        sortOrder: currentGallery.length + index,
      }))
      setValue('gallery', [...currentGallery, ...newImages])
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const currentGallery = watch('gallery') || []
    setValue('gallery', currentGallery.filter((_: unknown, i: number) => i !== index))
  }

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Use manual slug if provided, otherwise generate from title
      const slug = data.slug?.trim() || generateSlug(data.title)

      // Prepare product data according to backend model
      const productData: CreateProductRequest = {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category,
        subCategories: data.subCategories,
        brand: data.brand,
        tags: data.tags.filter((tag) => tag.trim() !== ''),
        productType: data.productType,
        status: data.status,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestselling: data.isBestselling,
        isNewArrival: data.isNewArrival,
        slug,
        featuredImage: data.featuredImage,
        gallery: data.gallery,
      }

      // All products use variants for pricing and inventory
      if (data.variants.length > 0) {
        productData.variants = data.variants.map((variant) => ({
          sku: variant.sku,
          attributes: variant.attributes,
          currentPrice: variant.currentPrice,
          originalPrice: variant.originalPrice,
          weight: variant.weight,
          dimensions: variant.dimensions,
          images: variant.images,
          isActive: true,
        }))
      }


      // Add additional info
      if (data.additionalInfo) productData.additionalInfo = data.additionalInfo
      if (data.deliveryInfo) productData.deliveryInfo = data.deliveryInfo
      if (data.returnPolicy) productData.returnPolicy = data.returnPolicy
      if (data.warrantyInfo) productData.warrantyInfo = data.warrantyInfo

      // Add SEO
      if (data.metaTitle || data.metaDescription || data.metaKeywords.length > 0) {
        productData.seo = {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords.filter((keyword) => keyword.trim() !== ''),
          canonicalUrl: data.canonicalUrl,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
        }
      }

      // Add specifications
      if (data.specifications.length > 0) {
        productData.specifications = data.specifications.filter((spec) => spec.key.trim() !== '' && spec.value.trim() !== '')
      }

      // Add available attributes for variable products
      if (data.productType === 'variable' && data.availableAttributes.length > 0) {
        productData.availableAttributes = data.availableAttributes.filter((attr) => attr.name.trim() !== '' && attr.values.length > 0)
      }

      const response = await createProduct(productData)

      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/products/${response.data._id || response.data.id}`)
        }, 2000)
      } else {
        setError(response.message || 'Failed to create product')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  // Tab component props
  const tabProps = {
    register,
    watch,
    setValue,
    errors,
    categories,
    uploading,
    onFeaturedImageUpload: handleFeaturedImageUpload,
    onGalleryUpload: handleGalleryUpload,
    onRemoveGalleryImage: removeGalleryImage,
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          Product created successfully! Redirecting to product details...
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'basic')} className="mb-4">
        {/* Basic Information Tab */}
        <Tab
          eventKey="basic"
          title={
            <span>
              <IconifyIcon icon="bxs:contact" className="me-1" />
              Basic Info
            </span>
          }
        >
          <BasicInfoTab {...tabProps} />
        </Tab>

        {/* Images Tab */}
        <Tab
          eventKey="images"
          title={
            <span>
              <IconifyIcon icon="bx:images" className="me-1" />
              Images
            </span>
          }
        >
          <ImagesTab {...tabProps} />
        </Tab>

        {/* Variants & Pricing Tab */}
        <Tab
          eventKey="pricing"
          title={
            <span>
              <IconifyIcon icon="bx:dollar" className="me-1" />
              Variants & Pricing
            </span>
          }
        >
          <PricingInventoryTab {...tabProps} />
        </Tab>

        {/* SEO Tab */}
        <Tab
          eventKey="seo"
          title={
            <span>
              <IconifyIcon icon="bx:search" className="me-1" />
              SEO
            </span>
          }
        >
          <SEOTab {...tabProps} />
        </Tab>

        {/* Additional Info Tab */}
        <Tab
          eventKey="additional"
          title={
            <span>
              <IconifyIcon icon="bx:info-circle" className="me-1" />
              Additional Info
            </span>
          }
        >
          <AdditionalInfoTab {...tabProps} />
        </Tab>
      </Tabs>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={() => navigate('/products')}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="me-2">
                <Preloader />
              </span>
              Creating...
            </>
          ) : (
            <>
              <IconifyIcon icon="bx:save" className="me-2" />
              Create Product
            </>
          )}
        </Button>
      </div>
    </Form>
  )
}

export default NewCreateProductForm
