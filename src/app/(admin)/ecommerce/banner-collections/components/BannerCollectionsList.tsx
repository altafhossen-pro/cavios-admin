import { useState } from 'react'
import { Table, Badge, Button, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { BannerCollection } from '@/features/admin/api/bannerCollectionApi'
import { deleteBannerCollection } from '@/features/admin/api/bannerCollectionApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface BannerCollectionsListProps {
  bannerCollections: BannerCollection[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange: (page: number) => void
  onRefresh?: () => void
  onEdit: (bannerCollection: BannerCollection) => void
  loading?: boolean
}

const BannerCollectionsList = ({
  bannerCollections,
  pagination,
  onPageChange,
  onEdit,
  onRefresh,
  loading = false,
}: BannerCollectionsListProps) => {
  const { showNotification } = useNotificationContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (bannerCollectionId: string, bannerCollectionTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete banner collection "${bannerCollectionTitle}"?`)) {
      return
    }

    setDeletingId(bannerCollectionId)
    try {
      await deleteBannerCollection(bannerCollectionId)
      showNotification({
        message: 'Banner collection deleted successfully',
        variant: 'success',
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete banner collection',
        variant: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (bannerCollections.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No banner collections found. Create your first banner collection!</p>
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
              <th>Button Text</th>
              <th>Button Link</th>
              <th>Style</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannerCollections.map((bannerCollection) => (
              <tr key={bannerCollection._id}>
                <td>
                  {bannerCollection.image ? (
                    <img
                      src={bannerCollection.image}
                      alt={bannerCollection.title}
                      className="img-fluid"
                      style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
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
                  <strong>{bannerCollection.title}</strong>
                </td>
                <td>
                  <div
                    style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={bannerCollection.description || '-'}
                  >
                    {bannerCollection.description || '-'}
                  </div>
                </td>
                <td>{bannerCollection.buttonText || 'Shop Now'}</td>
                <td>
                  <code className="text-muted" style={{ fontSize: '12px' }}>
                    {bannerCollection.buttonLink || '/'}
                  </code>
                </td>
                <td>
                  <Badge bg={bannerCollection.style === 'position' ? 'info' : 'secondary'}>
                    {bannerCollection.style === 'position' ? 'Position' : 'Default'}
                  </Badge>
                </td>
                <td>
                  <Badge bg={bannerCollection.isActive ? 'success' : 'secondary'}>
                    {bannerCollection.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Badge bg="info">{bannerCollection.order || 0}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(bannerCollection)}
                      title="Edit banner collection"
                    >
                      <IconifyIcon icon="bx:edit" />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(bannerCollection._id, bannerCollection.title)}
                      disabled={deletingId === bannerCollection._id}
                      title="Delete banner collection"
                    >
                      {deletingId === bannerCollection._id ? (
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
            {pagination.totalItems} banner collections
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

export default BannerCollectionsList

