import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardBody, Col, Row } from 'react-bootstrap'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import { getAdminProductById } from '@/features/admin/api/productApi'
import ProductDetailView from './components/ProductDetailView'
import ProductImages from './components/ProductImages'
import PageMetaData from '@/components/PageTitle'

interface BackendProduct {
  _id?: string
  id?: string
  title?: string
  name?: string
  description?: string
  shortDescription?: string
  featuredImage?: string
  gallery?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>
  variants?: Array<{
    sku?: string
    attributes?: Array<{ name: string; value: string; displayValue?: string; hexCode?: string; image?: string }>
    currentPrice?: number
    originalPrice?: number
    costPrice?: number
    stockQuantity?: number
    lowStockThreshold?: number
    stockStatus?: string
    images?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>
    isActive?: boolean
    _id?: string
    createdAt?: string
    updatedAt?: string
  }>
  priceRange?: {
    min?: number
    max?: number
  }
  totalStock?: number
  averageRating?: number
  totalReviews?: number
  ratingBreakdown?: {
    five?: number
    four?: number
    three?: number
    two?: number
    one?: number
  }
  category?: {
    _id: string
    name: string
    slug?: string
    image?: string
  }
  subCategories?: Array<{ _id: string; name: string }>
  brand?: string
  tags?: string[]
  productType?: string
  status?: string
  isActive?: boolean
  isFeatured?: boolean
  isBestselling?: boolean
  isNewArrival?: boolean
  specifications?: Array<{ key: string; value: string; group?: string }>
  totalSold?: number
  slug?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

const ProductDetail = () => {
  const [product, setProduct] = useState<BackendProduct>()
  const [loading, setLoading] = useState(true)

  const { productId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        navigate('/pages/error-404-alt')
        return
      }

      setLoading(true)
      try {
        const response = await getAdminProductById(productId)
        
        if (response.success && response.data) {
          // Use backend product data directly for admin panel
          const backendProduct = response.data as unknown as BackendProduct
          setProduct(backendProduct)
        } else {
          navigate('/pages/error-404-alt')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        navigate('/pages/error-404-alt')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, navigate])

  if (loading) {
    return (
      <>
        <PageBreadcrumb title="Product Details" subName="Ecommerce" />
        <PageMetaData title="Product Details" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <div className="text-center p-4">
                  <p>Loading product details...</p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

  if (!product) {
    return null
  }

  return (
    <>
      <PageBreadcrumb title="Product Details" subName="Ecommerce" />
      <PageMetaData title={product?.title || product?.name || 'Product Details'} />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Row>
                <Col lg={4}>{product && <ProductImages product={product} />}</Col>
                <Col lg={8}>{product && <ProductDetailView product={product} />}</Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ProductDetail
