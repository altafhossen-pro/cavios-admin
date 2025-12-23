import { useState } from 'react'
import { Table, Button, Badge, Pagination, Modal, Form, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { toggleCommentApproval, deleteComment, BlogComment } from '@/features/admin/api/blogCommentApi'
import { Link } from 'react-router-dom'

interface CommentsListProps {
  comments: BlogComment[]
  onRefresh: () => void
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange: (page: number) => void
}

const CommentsList = ({ comments, onRefresh, pagination, onPageChange }: CommentsListProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<BlogComment | null>(null)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[date.getMonth()]
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month} ${day}, ${year} ${hours}:${minutes}`
    } catch {
      return dateString
    }
  }

  const handleToggleApproval = async (id: string) => {
    setLoading(id)
    try {
      const response = await toggleCommentApproval(id)
      if (response.success) {
        showNotification({
          message: response.message || 'Comment status updated successfully',
          variant: 'success',
        })
        onRefresh()
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to update comment status',
        variant: 'danger',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteClick = (comment: BlogComment) => {
    setCommentToDelete(comment)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return

    setLoading(commentToDelete._id)
    try {
      const response = await deleteComment(commentToDelete._id)
      if (response.success) {
        showNotification({
          message: response.message || 'Comment deleted successfully',
          variant: 'success',
        })
        setShowDeleteModal(false)
        setCommentToDelete(null)
        onRefresh()
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to delete comment',
        variant: 'danger',
      })
    } finally {
      setLoading(null)
    }
  }

  const renderPagination = () => {
    const items = []
    const { currentPage, totalPages } = pagination

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
    )

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Pagination.Item>
        )
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${i}`} />)
      }
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    )

    return <Pagination>{items}</Pagination>
  }

  return (
    <>
      {comments.length === 0 ? (
        <Alert variant="info" className="text-center">
          No comments found
        </Alert>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Blog</th>
                  <th>Comment</th>
                  <th>Author</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment._id}>
                    <td>
                      {comment.blogId ? (
                        <div>
                          <Link
                            to={`/ecommerce/blogs/${comment.blogId._id}/edit`}
                            className="text-primary"
                          >
                            {comment.blogId.title || 'Unknown Blog'}
                          </Link>
                          <br />
                          <small className="text-muted">Slug: {comment.blogId.slug}</small>
                        </div>
                      ) : (
                        <span className="text-muted">Unknown Blog</span>
                      )}
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px' }}>
                        <p className="mb-0" style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {comment.comment}
                        </p>
                      </div>
                    </td>
                    <td>{comment.name}</td>
                    <td>{comment.email}</td>
                    <td>{formatDate(comment.createdAt)}</td>
                    <td>
                      <Badge bg={comment.isApproved ? 'success' : 'warning'}>
                        {comment.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant={comment.isApproved ? 'warning' : 'success'}
                          size="sm"
                          onClick={() => handleToggleApproval(comment._id)}
                          disabled={loading === comment._id}
                        >
                          {loading === comment._id ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <>
                              <IconifyIcon
                                icon={comment.isApproved ? 'bx:x' : 'bx:check'}
                                className="me-1"
                              />
                              {comment.isApproved ? 'Unapprove' : 'Approve'}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(comment)}
                          disabled={loading === comment._id}
                        >
                          <IconifyIcon icon="bx:trash" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} comments
              </div>
              {renderPagination()}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this comment? This action cannot be undone.
          {commentToDelete && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong>Comment:</strong> {commentToDelete.comment.substring(0, 100)}
              {commentToDelete.comment.length > 100 && '...'}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={loading === commentToDelete?._id}
          >
            {loading === commentToDelete?._id ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CommentsList

