'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Form, InputGroup, Modal } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getStaticPages, deleteStaticPage, StaticPage } from '@/features/admin/api/staticPageApi'
import StaticPagesList from './components/StaticPagesList'
import { useNavigate } from 'react-router-dom'
import { useNotificationContext } from '@/context/useNotificationContext'

const StaticPagesPage = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [pages, setPages] = useState<StaticPage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; pageId: string | null; pageTitle: string }>({
    show: false,
    pageId: null,
    pageTitle: '',
  })
  const [deleting, setDeleting] = useState(false)
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
      const response = await getStaticPages({
        page,
        limit: 10,
        search: search || undefined,
      })
      if (response.success) {
        setPages(response.data.pages || [])
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
      setError(error.message || 'Failed to fetch static pages')
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
    navigate('/ecommerce/static-pages/create')
  }

  const handleEdit = (id: string) => {
    navigate(`/ecommerce/static-pages/${id}/edit`)
  }

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({ show: true, pageId: id, pageTitle: title })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.pageId) return

    setDeleting(true)
    try {
      await deleteStaticPage(deleteModal.pageId)
      showNotification({
        message: 'Static page deleted successfully',
        variant: 'success',
      })
      setDeleteModal({ show: false, pageId: null, pageTitle: '' })
      fetchData(currentPage, searchQuery)
    } catch (err: any) {
      showNotification({
        message: err.message || 'Failed to delete static page',
        variant: 'danger',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageMetaData title="Static Pages" />
      <PageBreadcrumb title="Static Pages" subName="Ecommerce" />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <Form onSubmit={handleSearch} className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search pages by title or slug..."
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
              Create Page
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading && pages.length === 0 ? (
            <div className="text-center py-5">
              <Preloader />
              <p className="mt-3 text-muted">Loading static pages...</p>
            </div>
          ) : (
            <StaticPagesList
              pages={pages}
              pagination={pagination}
              onPageChange={setCurrentPage}
              onRefresh={handleRefresh}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              loading={loading}
            />
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, pageId: null, pageTitle: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the page &quot;{deleteModal.pageTitle}&quot;? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, pageId: null, pageTitle: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default StaticPagesPage

