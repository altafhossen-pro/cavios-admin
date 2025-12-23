import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Form, InputGroup } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getBlogs, Blog } from '@/features/admin/api/blogApi'
import BlogsList from './components/BlogsList'
import { useNavigate } from 'react-router-dom'

const BlogsPage = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
  })

  const fetchData = async (page: number = 1, search: string = '') => {
    setLoading(true)
    setError(null)

    try {
      const response = await getBlogs({
        page,
        limit: 10,
        sort: 'date',
        search: search || undefined,
      })
      if (response.success) {
        setBlogs(response.data.blogs || [])
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
          }
        )
      } else {
        setError(response.message)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage, searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchData(currentPage, searchQuery)
  }

  const handleCreate = () => {
    navigate('/ecommerce/blogs/create')
  }

  return (
    <>
      <PageMetaData title="Blogs" />
      <PageBreadcrumb
        title="Blogs"
        subName="Ecommerce"
      />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <Form onSubmit={handleSearch} className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search blogs by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="primary" type="submit" disabled={loading}>
                    <IconifyIcon icon="bx:search" />
                  </Button>
                </InputGroup>
              </Form>
              <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
                <IconifyIcon icon="bx:refresh" className="me-1" />
                Refresh
              </Button>
            </div>
            <Button variant="primary" onClick={handleCreate}>
              <IconifyIcon icon="bx:plus" className="me-1" />
              Create Blog
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading && blogs.length === 0 ? (
            <div className="text-center py-5">
              <Preloader />
              <p className="mt-3 text-muted">Loading blogs...</p>
            </div>
          ) : (
            <BlogsList
              blogs={blogs}
              pagination={pagination}
              onPageChange={setCurrentPage}
              onRefresh={handleRefresh}
              loading={loading}
            />
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default BlogsPage

