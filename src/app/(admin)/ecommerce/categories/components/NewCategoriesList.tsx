import { Table, Badge, Button, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Category } from '@/features/admin/api/categoryApi'

interface NewCategoriesListProps {
  categories: Category[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onRefresh?: () => void
  onEdit: (category: Category) => void
  loading?: boolean
}

const NewCategoriesList = ({
  categories,
  pagination,
  onPageChange,
  onEdit,
  loading = false,
}: NewCategoriesListProps) => {
  const getParentName = (parent: string | Category | undefined): string => {
    if (!parent) return '-'
    if (typeof parent === 'string') return parent
    return parent.name || '-'
  }

  if (categories.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No categories found. Create your first category!</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Parent</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>
                  <div className="d-flex align-items-center">
                    {category.image && (
                      <div className="flex-shrink-0 me-3">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="img-fluid avatar-sm"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <h6 className="mt-0 mb-1">{category.name}</h6>
                    </div>
                  </div>
                </td>
                <td>
                  <code className="text-muted">{category.slug || '-'}</code>
                </td>
                <td>{getParentName(category.parent)}</td>
                <td>
                  <Badge bg={category.isActive !== false ? 'success' : 'secondary'}>
                    {category.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  {category.isFeatured ? (
                    <Badge bg="primary">Featured</Badge>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="soft-primary"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      <IconifyIcon icon="bx:edit" className="me-1" />
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} categories
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
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
              })
              .map((page, index, array) => {
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

export default NewCategoriesList

