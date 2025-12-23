import { useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getStockStatus } from '@/utils/other'
import DeleteProductModal from './DeleteProductModal'
import type { Product } from '@/features/admin/api/productApi'

interface ProductVariant {
  sku?: string
  stockQuantity?: number
  [key: string]: unknown
}

// AdminProduct type for table display - compatible with Product but allows simpler variants
type AdminProduct = Product & {
  variants?: ProductVariant[]
  quantity?: number
}

// Helper function to calculate total stock from variants
const calculateTotalStock = (product: AdminProduct): number => {
  const variants = product.variants || []
  if (variants.length > 0) {
    return variants.reduce((sum: number, variant: ProductVariant) => {
      return sum + (variant.stockQuantity || 0)
    }, 0)
  }
  return product.totalStock || product.quantity || 0
}

interface NewProductsListTableProps {
  products: AdminProduct[]
  onProductDeleted?: () => void
}

const NewProductsListTable = ({ products, onProductDeleted }: NewProductsListTableProps) => {
  const [deleteModalShow, setDeleteModalShow] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null)

  const handleDeleteClick = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName })
    setDeleteModalShow(true)
  }

  const handleDeleteSuccess = () => {
    if (onProductDeleted) {
      onProductDeleted()
    }
    setSelectedProduct(null)
  }

  const handleModalClose = () => {
    setDeleteModalShow(false)
    setSelectedProduct(null)
  }

  return (
    <>
      <div className="table-responsive">
      <table className="table text-nowrap mb-0">
        <thead className="bg-light bg-opacity-50">
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Inventory</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => {
            const productId = (product.id || product._id) as string | undefined
            const productName: string = (product.name || product.title || 'N/A') as string
            const productDescription = (product.description || product.shortDescription || '') as string
            // Handle images as string array or gallery array
            const imagesArray = Array.isArray(product.images) 
              ? (product.images as string[]).length > 0 && typeof product.images[0] === 'string'
                ? product.images as string[]
                : []
              : []
            const productImage: string = imagesArray[0] || (product.featuredImage as string) || '/images/placeholder.png'
            const quantity = calculateTotalStock(product)
            const stockStatus = getStockStatus(quantity)
            const status = (product.status || (product.isActive ? 'active' : 'inactive')) as string
            
            if (!productId) {
              return null
            }
            
            return (
              <tr key={productId || idx}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="shrink-0 me-3">
                      <Link to={`/products/${productId}`}>
                        <img src={productImage} alt={productName} className="img-fluid avatar-sm" />
                      </Link>
                    </div>
                    <div className="grow">
                      <h5 className="mt-0 mb-1">
                        <Link to={`/products/${productId}`} className="text-reset">
                          {productName}
                        </Link>
                      </h5>
                      {productDescription && <span className="fs-13">{productDescription}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  {typeof product.category === 'string'
                    ? 'N/A'
                    : product.category?.name || 'N/A'}
                </td>
                <td>
                  <div className={'text-' + stockStatus.variant}>
                    <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
                    {stockStatus.text} ({quantity})
                  </div>
                </td>
                <td>
                  <span className={`badge badge-soft-${status === 'active' ? 'success' : 'secondary'}`}>
                    {status}
                  </span>
                </td>
                <td>
                  <Link to={`/products/${productId}/edit`} className="btn btn-sm btn-soft-secondary me-1">
                    <IconifyIcon icon="bx:edit" className="fs-18" />
                  </Link>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-soft-danger"
                    onClick={() => handleDeleteClick(productId, productName)}
                  >
                    <IconifyIcon icon="bx:trash" className="fs-18" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>

      <DeleteProductModal
        show={deleteModalShow}
        onHide={handleModalClose}
        productId={selectedProduct?.id || null}
        productName={selectedProduct?.name || ''}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}

export default NewProductsListTable

