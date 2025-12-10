import { Link } from 'react-router-dom'
import { Table, Badge, Button, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { InventoryProduct } from '@/features/admin/api/inventoryApi'

interface NewInventoryListTableProps {
  products: InventoryProduct[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
}

const NewInventoryListTable = ({ products, pagination, onPageChange, onRefresh }: NewInventoryListTableProps) => {
  const calculateTotalStock = (product: InventoryProduct): number => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0)
    }
    return product.totalStock || 0
  }

  const getStockStatus = (stock: number): { variant: string; label: string } => {
    if (stock === 0) {
      return { variant: 'danger', label: 'Out of Stock' }
    } else if (stock <= 5) {
      return { variant: 'warning', label: 'Low Stock' }
    }
    return { variant: 'success', label: 'In Stock' }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No products found</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Total Stock</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = calculateTotalStock(product)
              const stockStatus = getStockStatus(totalStock)
              return (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {product.featuredImage && (
                        <div className="flex-shrink-0 me-3">
                          <img
                            src={product.featuredImage}
                            alt={product.title}
                            className="img-fluid avatar-sm"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mt-0 mb-1">{product.title}</h6>
                        {product.brand && <span className="fs-13 text-muted">{product.brand}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>
                    <strong>{totalStock}</strong>
                  </td>
                  <td>
                    <Badge bg={stockStatus.variant}>{stockStatus.label}</Badge>
                  </td>
                  <td>
                    <Link
                      to={`/inventory/products/${product._id}/variants`}
                      className="btn btn-soft-primary btn-sm"
                    >
                      <IconifyIcon icon="bx:show" className="me-1" />
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </div>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and adjacent pages
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
              })
              .map((page, index, array) => {
                // Add ellipsis
                const prevPage = array[index - 1]
                const showEllipsis = prevPage && page - prevPage > 1
                return (
                  <span key={page}>
                    {showEllipsis && <Pagination.Ellipsis />}
                    <Pagination.Item
                      active={page === pagination.page}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  </span>
                )
              })}
            <Pagination.Next
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            />
          </Pagination>
        </div>
      )}
    </>
  )
}

export default NewInventoryListTable

