import { useState } from 'react'
import { Table, Badge, Button, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Testimonial } from '@/features/admin/api/testimonialApi'
import { deleteTestimonial } from '@/features/admin/api/testimonialApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface TestimonialsListProps {
  testimonials: Testimonial[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange: (page: number) => void
  onRefresh?: () => void
  onEdit: (testimonial: Testimonial) => void
  loading?: boolean
}

const TestimonialsList = ({
  testimonials,
  pagination,
  onPageChange,
  onEdit,
  onRefresh,
  loading = false,
}: TestimonialsListProps) => {
  const { showNotification } = useNotificationContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (testimonialId: string, testimonialName: string) => {
    if (!window.confirm(`Are you sure you want to delete testimonial from "${testimonialName}"?`)) {
      return
    }

    setDeletingId(testimonialId)
    try {
      await deleteTestimonial(testimonialId)
      showNotification({
        message: 'Testimonial deleted successfully',
        variant: 'success',
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete testimonial',
        variant: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <IconifyIcon
        key={index}
        icon={index < rating ? 'bx:bxs-star' : 'bx:bx-star'}
        className={`text-warning ${index < rating ? 'fill' : ''}`}
        style={{ fontSize: '14px' }}
      />
    ))
  }

  if (testimonials.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No testimonials found. Create your first testimonial!</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial) => (
              <tr key={testimonial._id}>
                <td>
                  {testimonial.profilePic ? (
                    <img
                      src={testimonial.profilePic}
                      alt={testimonial.name}
                      className="img-fluid rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
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
                  <strong>{testimonial.name}</strong>
                </td>
                <td>{testimonial.designation || '-'}</td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    {renderStars(testimonial.rating)}
                    <span className="text-muted ms-1">({testimonial.rating})</span>
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={testimonial.reviewText}
                  >
                    {testimonial.reviewText}
                  </div>
                </td>
                <td>
                  <Badge bg={testimonial.isActive ? 'success' : 'secondary'}>
                    {testimonial.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Badge bg="info">{testimonial.order || 0}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(testimonial)}
                      title="Edit testimonial"
                    >
                      <IconifyIcon icon="bx:edit" />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(testimonial._id, testimonial.name)}
                      disabled={deletingId === testimonial._id}
                      title="Delete testimonial"
                    >
                      {deletingId === testimonial._id ? (
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
            {pagination.totalItems} testimonials
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

export default TestimonialsList

