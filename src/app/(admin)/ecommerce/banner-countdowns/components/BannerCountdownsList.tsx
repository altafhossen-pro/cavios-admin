import { useState } from 'react'
import { Table, Badge, Button, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { BannerCountdown } from '@/features/admin/api/bannerCountdownApi'
import { deleteBannerCountdown } from '@/features/admin/api/bannerCountdownApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface BannerCountdownsListProps {
  bannerCountdowns: BannerCountdown[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange: (page: number) => void
  onRefresh?: () => void
  onEdit: (bannerCountdown: BannerCountdown) => void
  loading?: boolean
}

const BannerCountdownsList = ({
  bannerCountdowns,
  pagination,
  onPageChange,
  onEdit,
  onRefresh,
  loading = false,
}: BannerCountdownsListProps) => {
  const { showNotification } = useNotificationContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (bannerCountdownId: string, bannerCountdownTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete banner countdown "${bannerCountdownTitle}"?`)) {
      return
    }

    setDeletingId(bannerCountdownId)
    try {
      await deleteBannerCountdown(bannerCountdownId)
      showNotification({
        message: 'Banner countdown deleted successfully',
        variant: 'success',
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete banner countdown',
        variant: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) <= new Date()
  }

  if (bannerCountdowns.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No banner countdowns found. Create your first banner countdown!</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannerCountdowns.map((bannerCountdown) => (
              <tr key={bannerCountdown._id}>
                <td>
                  {bannerCountdown.image ? (
                    <img
                      src={bannerCountdown.image}
                      alt={bannerCountdown.title}
                      className="img-fluid"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = '<span class="badge bg-secondary">No Image</span>'
                        }
                      }}
                    />
                  ) : (
                    <span className="badge bg-secondary">No Image</span>
                  )}
                </td>
                <td>
                  <strong>{bannerCountdown.title}</strong>
                </td>
                <td>
                  <div
                    style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={bannerCountdown.description || '-'}
                  >
                    {bannerCountdown.description || '-'}
                  </div>
                </td>
                <td>
                  <div>
                    <div>{formatDate(bannerCountdown.endDate)}</div>
                    {isExpired(bannerCountdown.endDate) && (
                      <Badge bg="danger" className="mt-1">Expired</Badge>
                    )}
                  </div>
                </td>
                <td>
                  <Badge bg={bannerCountdown.isActive ? 'success' : 'secondary'}>
                    {bannerCountdown.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Badge bg="info">{bannerCountdown.order || 0}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(bannerCountdown)}
                      title="Edit banner countdown"
                    >
                      <IconifyIcon icon="bx:edit" />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(bannerCountdown._id, bannerCountdown.title)}
                      disabled={deletingId === bannerCountdown._id}
                      title="Delete banner countdown"
                    >
                      {deletingId === bannerCountdown._id ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      ) : (
                        <IconifyIcon icon="bx:trash" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} banner countdowns
          </div>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={pagination.currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
              ) {
                return (
                  <Pagination.Item
                    key={page}
                    active={page === pagination.currentPage}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                )
              } else if (
                page === pagination.currentPage - 3 ||
                page === pagination.currentPage + 3
              ) {
                return <Pagination.Ellipsis key={page} />
              }
              return null
            })}
            <Pagination.Next
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            />
          </Pagination>
        </div>
      )}
    </>
  )
}

export default BannerCountdownsList

