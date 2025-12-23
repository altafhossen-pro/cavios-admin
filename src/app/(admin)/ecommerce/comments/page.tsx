import { useState, useEffect } from 'react'
import { Card, CardBody, Row, Col, Form, InputGroup, Button } from 'react-bootstrap'
import PageMetaData from '@/components/PageTitle'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import Preloader from '@/components/Preloader'
import { useNotificationContext } from '@/context/useNotificationContext'
import { getAllBlogComments, BlogComment, BlogCommentsParams } from '@/features/admin/api/blogCommentApi'
import CommentsList from './components/CommentsList'

const CommentsPage = () => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })
  const [search, setSearch] = useState('')
  const [filterApproved, setFilterApproved] = useState<string>('all') // 'all', 'approved', 'pending'

  const fetchComments = async (params: BlogCommentsParams = {}) => {
    setLoading(true)
    try {
      const queryParams: BlogCommentsParams = {
        page: params.page || pagination.currentPage,
        limit: params.limit || pagination.itemsPerPage,
      }

      if (filterApproved === 'approved') {
        queryParams.isApproved = true
      } else if (filterApproved === 'pending') {
        queryParams.isApproved = false
      }

      if (search.trim()) {
        queryParams.blogId = search.trim()
      }

      const response = await getAllBlogComments(queryParams)
      if (response.success) {
        setComments(response.data.comments)
        setPagination(response.data.pagination)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      showNotification({
        message: err.message || 'Failed to fetch comments',
        variant: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments({ page: 1 })
  }, [filterApproved])

  const handlePageChange = (page: number) => {
    fetchComments({ page })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchComments({ page: 1 })
  }

  const handleRefresh = () => {
    fetchComments({ page: pagination.currentPage })
  }

  if (loading && comments.length === 0) {
    return <Preloader />
  }

  return (
    <>
      <PageMetaData title="Blog Comments" />
      <PageBreadcrumb title="Blog Comments" subName="Ecommerce" />
      
      <Card>
        <CardBody>
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by Blog ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterApproved}
                onChange={(e) => setFilterApproved(e.target.value)}
              >
                <option value="all">All Comments</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button variant="outline-primary" onClick={handleRefresh}>
                Refresh
              </Button>
            </Col>
          </Row>

          <CommentsList
            comments={comments}
            onRefresh={handleRefresh}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default CommentsPage

