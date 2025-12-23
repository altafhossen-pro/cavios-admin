import { useState } from 'react'
import { Table, Badge, Button, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Blog, deleteBlog, toggleBlogStatus } from '@/features/admin/api/blogApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useNavigate } from 'react-router-dom'

interface BlogsListProps {
  blogs: Blog[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  onPageChange: (page: number) => void
  onRefresh?: () => void
  loading?: boolean
}

const BlogsList = ({
  blogs,
  pagination,
  onPageChange,
  onRefresh,
  loading = false,
}: BlogsListProps) => {
  const { showNotification } = useNotificationContext()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleDelete = async (blogId: string, blogTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete blog "${blogTitle}"?`)) {
      return
    }

    setDeletingId(blogId)
    try {
      await deleteBlog(blogId)
      showNotification({
        message: 'Blog deleted successfully',
        variant: 'success',
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete blog',
        variant: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (blogId: string) => {
    setTogglingId(blogId)
    try {
      await toggleBlogStatus(blogId)
      showNotification({
        message: 'Blog status updated successfully',
        variant: 'success',
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to update blog status',
        variant: 'danger',
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleEdit = (blogId: string) => {
    navigate(`/ecommerce/blogs/${blogId}/edit`)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (blogs.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No blogs found. Create your first blog!</p>
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
              <th>Author</th>
              <th>Published Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="img-fluid rounded"
                      style={{ width: '80px', height: '60px', objectFit: 'cover' }}
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
                  <strong>{blog.title}</strong>
                </td>
                <td>
                  <div
                    style={{
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={blog.description}
                  >
                    {blog.description}
                  </div>
                </td>
                <td>{blog.author || 'Admin'}</td>
                <td>{formatDate(blog.publishedAt)}</td>
                <td>
                  <Badge bg={blog.isActive ? 'success' : 'secondary'}>
                    {blog.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(blog._id)}
                      title="Edit"
                    >
                      <IconifyIcon icon="bx:edit" />
                    </Button>
                    <Button
                      variant={blog.isActive ? 'outline-warning' : 'outline-success'}
                      size="sm"
                      onClick={() => handleToggleStatus(blog._id)}
                      disabled={togglingId === blog._id}
                      title={blog.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {togglingId === blog._id ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <IconifyIcon icon={blog.isActive ? 'bx:hide' : 'bx:show'} />
                      )}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(blog._id, blog.title)}
                      disabled={deletingId === blog._id}
                      title="Delete"
                    >
                      {deletingId === blog._id ? (
                        <span className="spinner-border spinner-border-sm" />
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
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={pagination.currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item
                key={page}
                active={page === pagination.currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
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

export default BlogsList

