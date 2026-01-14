import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Button, Alert, Tab, Tabs } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { updateProduct, getAdminProductById, CreateProductRequest } from '@/features/admin/api/productApi'
import { getAllCategories, Category } from '@/features/admin/api/categoryApi'
import { uploadSingleImage, uploadMultipleImages } from '@/features/admin/api/uploadApi'
import { ProductFormData } from '../../../create/components/types'
import BasicInfoTab from '../../../create/components/BasicInfoTab'
import ImagesTab from '../../../create/components/ImagesTab'
import PricingInventoryTab from '../../../create/components/PricingInventoryTab'
import SEOTab from '../../../create/components/SEOTab'
import AdditionalInfoTab from '../../../create/components/AdditionalInfoTab'

const EditProductForm = () => {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      productType: 'variable',
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

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is missing')
        setFetching(false)
        return
      }

      setFetching(true)
      try {
        const response = await getAdminProductById(productId)
        
        if (response.success && response.data) {
          const product = response.data
          
          // Populate form with existing product data
          const categoryId = (() => {
            if (product.category && typeof product.category === 'object' && '_id' in product.category) {
              return (product.category as { _id?: string })._id || ''
            }
            return typeof product.category === 'string' ? product.category : ''
          })()

          reset({
            title: product.title || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            category: categoryId,
            subCategories: product.subCategories?.map((cat: { _id?: string } | string) => {
              if (typeof cat === 'object' && cat && '_id' in cat && cat._id) {
                return cat._id
              }
              return typeof cat === 'string' ? cat : ''
            }).filter((id): id is string => typeof id === 'string' && id !== '') || [],
            brand: product.brand || '',
            tags: product.tags || [],
            slug: product.slug || '',
            productType: 'variable' as const,
            featuredImage: product.featuredImage || '',
            gallery: product.gallery || [],
            basePrice: typeof product.basePrice === 'number' ? product.basePrice : 0,
            originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : 0,
            costPrice: typeof product.costPrice === 'number' ? product.costPrice : 0,
            totalStock: typeof product.totalStock === 'number' ? product.totalStock : 0,
            lowStockThreshold: typeof product.lowStockThreshold === 'number' ? product.lowStockThreshold : 5,
            stockStatus: (product.stockStatus as 'in_stock' | 'out_of_stock' | 'low_stock' | 'pre_order') || 'in_stock',
            variants: product.variants?.map((variant: {
              sku?: string
              barcode?: string
              attributes?: Array<{ name: string; value: string; displayValue?: string; hexCode?: string }>
              currentPrice?: number
              originalPrice?: number
              costPrice?: number
              stockQuantity?: number
              lowStockThreshold?: number
              stockStatus?: string
              weight?: number
              dimensions?: { length?: number; width?: number; height?: number }
              images?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>
            }) => ({
              sku: variant.sku || '',
              barcode: variant.barcode,
              attributes: (variant.attributes || []).map((attr) => ({
                name: attr.name || '',
                value: attr.value || '',
                displayValue: attr.displayValue || attr.value || '',
                hexCode: attr.hexCode || '',
              })),
              currentPrice: typeof variant.currentPrice === 'number' ? variant.currentPrice : 0,
              originalPrice: typeof variant.originalPrice === 'number' ? variant.originalPrice : 0,
              costPrice: variant.costPrice,
              stockQuantity: variant.stockQuantity,
              lowStockThreshold: variant.lowStockThreshold,
              stockStatus: variant.stockStatus,
              weight: typeof variant.weight === 'number' ? variant.weight : 0,
              dimensions: variant.dimensions || { length: 0, width: 0, height: 0 },
              images: (variant.images || []).map((img) => ({
                url: img.url || '',
                altText: img.altText || '',
                isPrimary: img.isPrimary || false,
                sortOrder: img.sortOrder || 0,
              })),
            })) || [],
            status: product.status || 'draft',
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
            isBestselling: product.isBestselling ?? false,
            isNewArrival: product.isNewArrival ?? false,
            shippingWeight: typeof product.shippingInfo?.weight === 'number' ? product.shippingInfo.weight : 0,
            shippingLength: typeof product.shippingInfo?.dimensions?.length === 'number' ? product.shippingInfo.dimensions.length : 0,
            shippingWidth: typeof product.shippingInfo?.dimensions?.width === 'number' ? product.shippingInfo.dimensions.width : 0,
            shippingHeight: typeof product.shippingInfo?.dimensions?.height === 'number' ? product.shippingInfo.dimensions.height : 0,
            shippingClass: product.shippingInfo?.shippingClass || '',
            freeShippingEligible: product.shippingInfo?.freeShippingEligible ?? false,
            handlingTime: typeof product.shippingInfo?.handlingTime === 'number' ? product.shippingInfo.handlingTime : 0,
            additionalInfo: product.additionalInfo || '',
            deliveryInfo: product.deliveryInfo || '',
            returnPolicy: product.returnPolicy || '',
            warrantyInfo: product.warrantyInfo || '',
            metaTitle: product.seo?.metaTitle || '',
            metaDescription: product.seo?.metaDescription || '',
            metaKeywords: product.seo?.metaKeywords || [],
            canonicalUrl: product.seo?.canonicalUrl || '',
            ogTitle: product.seo?.ogTitle || '',
            ogDescription: product.seo?.ogDescription || '',
            ogImage: product.seo?.ogImage || '',
            specifications: product.specifications || [],
            availableAttributes: product.availableAttributes || [],
          })
        } else {
          setError(response.message || 'Failed to fetch product')
        }
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Failed to fetch product')
      } finally {
        setFetching(false)
      }
    }

    fetchProduct()
  }, [productId, reset])

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
    if (!productId) {
      setError('Product ID is missing')
      return
    }

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
        tags: data.tags.filter((tag: string) => tag.trim() !== ''),
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
        productData.variants = data.variants.map((variant: ProductFormData['variants'][0]) => ({
          sku: variant.sku,
          barcode: variant.barcode,
          attributes: variant.attributes,
          currentPrice: variant.currentPrice,
          originalPrice: variant.originalPrice,
          costPrice: variant.costPrice,
          stockQuantity: variant.stockQuantity ?? 0,
          lowStockThreshold: variant.lowStockThreshold,
          stockStatus: variant.stockStatus as 'in_stock' | 'out_of_stock' | 'low_stock' | 'pre_order' | undefined,
          weight: variant.weight,
          dimensions: variant.dimensions,
          images: variant.images,
          isActive: true,
        }))
      }

      // Include totalStock if it exists (for products without variants)
      if (data.totalStock !== undefined) {
        productData.totalStock = data.totalStock
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
          metaKeywords: data.metaKeywords.filter((keyword: string) => keyword.trim() !== ''),
          canonicalUrl: data.canonicalUrl,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
        }
      }

      // Add specifications
      if (data.specifications.length > 0) {
        productData.specifications = data.specifications.filter((spec: ProductFormData['specifications'][0]) => spec.key.trim() !== '' && spec.value.trim() !== '')
      }

      // Add available attributes for variable products
      if (data.productType === 'variable' && data.availableAttributes.length > 0) {
        productData.availableAttributes = data.availableAttributes.filter((attr: ProductFormData['availableAttributes'][0]) => attr.name.trim() !== '' && attr.values.length > 0)
      }

      // Add shipping info
      if (data.shippingWeight || data.shippingLength || data.shippingWidth || data.shippingHeight) {
        productData.shippingInfo = {
          weight: data.shippingWeight,
          dimensions: {
            length: data.shippingLength,
            width: data.shippingWidth,
            height: data.shippingHeight,
          },
          shippingClass: data.shippingClass,
          freeShippingEligible: data.freeShippingEligible,
          handlingTime: data.handlingTime,
        }
      }

      const response = await updateProduct(productId, productData)

      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/products/${productId}`)
        }, 2000)
      } else {
        setError(response.message || 'Failed to update product')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to update product')
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

  if (fetching) {
    return (
      <div className="text-center p-4">
        <Preloader />
        <p className="mt-2">Loading product data...</p>
      </div>
    )
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
          Product updated successfully! Redirecting to product details...
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
        <Button variant="secondary" onClick={() => navigate(`/products/${productId}`)}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="me-2">
                <Preloader />
              </span>
              Updating...
            </>
          ) : (
            <>
              <IconifyIcon icon="bx:save" className="me-2" />
              Update Product
            </>
          )}
        </Button>
      </div>
    </Form>
  )
}

export default EditProductForm

