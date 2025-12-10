import { useEffect, useState } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAdminProducts } from '@/features/admin/api/productApi'
import NewProductsListTable from './components/NewProductsListTable'

interface ProductVariant {
  sku?: string
  stockQuantity?: number
  [key: string]: unknown
}

interface Product {
  _id: string
  id?: string
  title: string
  name?: string
  slug?: string
  description?: string
  shortDescription?: string
  images?: string[]
  featuredImage?: string
  price?: number
  currentPrice?: number
  category?: {
    _id: string
    name: string
  }
  variants?: ProductVariant[]
  quantity?: number
  totalStock?: number
  status?: string
  isActive?: boolean
  [key: string]: unknown
}

const NewProducts = () => {
  const [productsList, setProductsList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const fetchProducts = async (page: number = 1, search: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAdminProducts({
        page,
        limit: 10,
        search: search || undefined,
        sort: '-createdAt',
      })

      if (response.success) {
        // Transform backend product data to match frontend format
        const transformedProducts = response.data.map((product: Product) => {
          // Calculate total stock from variants
          const variants = product.variants || []
          const totalVariantStock = variants.reduce((sum: number, variant: ProductVariant) => {
            return sum + (variant.stockQuantity || 0)
          }, 0)
          
          // Use variant stock if variants exist, otherwise use totalStock
          const calculatedStock = variants.length > 0 ? totalVariantStock : (product.totalStock || 0)
          
          return {
            ...product,
            id: product._id || product.id,
            name: product.title || product.name,
            images: product.images || (product.featuredImage ? [product.featuredImage] : []),
            quantity: calculatedStock,
          }
        })
        setProductsList(transformedProducts)
        setPagination(response.pagination)
      } else {
        setError(response.message || 'Failed to fetch products')
        setProductsList([])
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError(err.message || 'An error occurred while fetching products')
      setProductsList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(currentPage, searchQuery)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts(1, searchQuery)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <>
      <PageMetaData title="Products List" />
      <PageBreadcrumb title="Products List" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <form onSubmit={handleSearch} className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input
                    type="search"
                    className="form-control"
                    id="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <div>
                  <Link to="/products/create" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Product
                  </Link>
                </div>
              </div>
            </CardBody>
            {loading ? (
              <div className="text-center p-4">
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-danger">
                <p>{error}</p>
              </div>
            ) : productsList.length === 0 ? (
              <div className="text-center p-4">
                <p>No products found</p>
              </div>
            ) : (
              <>
                <div>
                  <NewProductsListTable products={productsList} />
                </div>
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <div className="text-muted">
                      Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
                      {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} products
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="d-flex align-items-center px-3">
                        Page {currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= pagination.totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default NewProducts

