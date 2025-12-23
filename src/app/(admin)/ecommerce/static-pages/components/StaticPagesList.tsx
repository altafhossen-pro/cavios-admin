import { Table, Badge, Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { StaticPage } from '@/features/admin/api/staticPageApi'
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface StaticPagesListProps {
  pages: StaticPage[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
  onEdit: (id: string) => void
  onDelete: (id: string, title: string) => void
  loading: boolean
}

const StaticPagesList = ({
  pages,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  loading,
}: StaticPagesListProps) => {
  const getPageTypeBadge = (pageType: string) => {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'> = {
      shipping: 'primary',
      'return-refund': 'secondary',
      'privacy-policy': 'success',
      'terms-conditions': 'warning',
      faqs: 'info',
      other: 'danger',
    }
    return variants[pageType] || 'secondary'
  }

  const formatPageType = (pageType: string) => {
    return pageType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div>
      {pages.length === 0 ? (
        <div className="text-center py-5">
          <IconifyIcon icon="bx:file-blank" className="text-muted" style={{ fontSize: '48px' }} />
          <p className="mt-3 text-muted">No static pages found</p>
        </div>
      ) : (
        <>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Page Type</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page._id}>
                  <td>
                    <div className="fw-semibold">{page.title}</div>
                  </td>
                  <td>
                    <code className="text-muted">{page.slug}</code>
                  </td>
                  <td>
                    <Badge bg={getPageTypeBadge(page.pageType)}>
                      {formatPageType(page.pageType)}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={page.isActive ? 'success' : 'secondary'}>
                      {page.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>{formatDate(page.createdAt)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(page._id)}
                      >
                        <IconifyIcon icon="bx:edit" className="me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(page._id, page.title)}
                      >
                        <IconifyIcon icon="bx:trash" className="me-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} pages
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                >
                  <IconifyIcon icon="bx:chevron-left" />
                  Previous
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                >
                  Next
                  <IconifyIcon icon="bx:chevron-right" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StaticPagesList

