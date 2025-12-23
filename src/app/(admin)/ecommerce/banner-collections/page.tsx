import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Form, InputGroup } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getBannerCollections, BannerCollection } from '@/features/admin/api/bannerCollectionApi'
import BannerCollectionsList from './components/BannerCollectionsList'
import BannerCollectionModal from './components/BannerCollectionModal'

const BannerCollectionsPage = () => {
  const [bannerCollections, setBannerCollections] = useState<BannerCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBannerCollection, setEditingBannerCollection] = useState<BannerCollection | null>(null)
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
      const response = await getBannerCollections({
        page,
        limit: 50,
        sort: 'order',
        search: search || undefined,
      })
      if (response.success) {
        setBannerCollections(response.data.bannerCollections || [])
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 50,
          }
        )
      } else {
        setError(response.message)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch banner collections')
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
    setEditingBannerCollection(null)
    setShowModal(true)
  }

  const handleEdit = (bannerCollection: BannerCollection) => {
    setEditingBannerCollection(bannerCollection)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingBannerCollection(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    fetchData(currentPage, searchQuery)
  }

  return (
    <>
      <PageMetaData title="Banner Collections" />
      <PageBreadcrumb
        title="Banner Collections"
        subName="Ecommerce"
        pageTitle="Banner Collections Management"
      />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <Form onSubmit={handleSearch} className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search banner collections by title..."
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
              Create Banner Collection
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading && bannerCollections.length === 0 ? (
            <div className="text-center py-5">
              <Preloader />
              <p className="mt-3 text-muted">Loading banner collections...</p>
            </div>
          ) : (
            <BannerCollectionsList
              bannerCollections={bannerCollections}
              pagination={pagination}
              onPageChange={setCurrentPage}
              onRefresh={handleRefresh}
              onEdit={handleEdit}
              loading={loading}
            />
          )}
        </CardBody>
      </Card>

      <BannerCollectionModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        bannerCollection={editingBannerCollection}
      />
    </>
  )
}

export default BannerCollectionsPage

