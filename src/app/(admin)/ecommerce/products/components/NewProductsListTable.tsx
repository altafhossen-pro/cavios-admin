import { type ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getStockStatus } from '@/utils/other'

interface ProductVariant {
  sku?: string
  stockQuantity?: number
  [key: string]: unknown
}

interface Product {
  _id?: string
  id?: string
  title?: string
  name?: string
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

// Helper function to calculate total stock from variants
const calculateTotalStock = (product: Product): number => {
  const variants = product.variants || []
  if (variants.length > 0) {
    return variants.reduce((sum: number, variant: ProductVariant) => {
      return sum + (variant.stockQuantity || 0)
    }, 0)
  }
  return product.totalStock || product.quantity || 0
}

const columns: ColumnDef<Product>[] = [
  {
    header: 'Product Name',
    cell: ({
      row: {
        original: product,
      },
    }) => {
      const productId = (product.id || product._id) as string | undefined
      const productName = product.name || product.title || 'N/A'
      const productDescription = product.description || product.shortDescription || ''
      const productImage = product.images?.[0] || product.featuredImage || '/images/placeholder.png'
      
      if (!productId) {
        return <div>N/A</div>
      }
      
      return (
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
      )
    },
  },
  {
    header: 'Category',
    cell: ({ row: { original: product } }) => {
      return product.category?.name || 'N/A'
    },
  },
  {
    header: 'Inventory',
    cell: ({
      row: {
        original: product,
      },
    }) => {
      const quantity = calculateTotalStock(product)
      const stockStatus = getStockStatus(quantity)
      return (
        <div className={'text-' + stockStatus.variant}>
          <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
          {stockStatus.text} ({quantity})
        </div>
      )
    },
  },
  {
    header: 'Status',
    cell: ({ row: { original: product } }) => {
      const status = product.status || (product.isActive ? 'active' : 'inactive')
      return (
        <span className={`badge badge-soft-${status === 'active' ? 'success' : 'secondary'}`}>
          {status}
        </span>
      )
    },
  },
  {
    header: 'Action',
    cell: ({ row: { original: product } }) => {
      const productId = (product.id || product._id) as string | undefined
      if (!productId) {
        return <div>N/A</div>
      }
      return (
        <>
          <Link to={`/products/${productId}`} className="btn btn-sm btn-soft-secondary me-1">
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </Link>
          <button type="button" className="btn btn-sm btn-soft-danger">
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </>
      )
    },
  },
]

const NewProductsListTable = ({ products }: { products: Product[] }) => {
  return (
    <div className="table-responsive">
      <table className="table text-nowrap mb-0">
        <thead className="bg-light bg-opacity-50">
          <tr>
            {columns.map((column, idx) => (
              <th key={idx}>{typeof column.header === 'string' ? column.header : 'Header'}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => {
            const productId = (product.id || product._id) as string | undefined
            const productName = product.name || product.title || 'N/A'
            const productDescription = product.description || product.shortDescription || ''
            const productImage = product.images?.[0] || product.featuredImage || '/images/placeholder.png'
            const quantity = calculateTotalStock(product)
            const stockStatus = getStockStatus(quantity)
            const status = product.status || (product.isActive ? 'active' : 'inactive')
            
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
                <td>{product.category?.name || 'N/A'}</td>
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
                  <Link to={`/products/${productId}`} className="btn btn-sm btn-soft-secondary me-1">
                    <IconifyIcon icon="bx:edit" className="fs-18" />
                  </Link>
                  <button type="button" className="btn btn-sm btn-soft-danger">
                    <IconifyIcon icon="bx:trash" className="fs-18" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default NewProductsListTable

