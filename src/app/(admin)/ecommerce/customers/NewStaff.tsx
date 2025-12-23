import { useState, useEffect } from 'react'
import { Card, CardBody, Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getStaff, User } from '@/features/admin/api/userApi'
import NewCustomersList from './components/NewCustomersList'
import CreateStaffModal from './components/CreateStaffModal'

const NewStaff = () => {
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  })

  const fetchData = async (page: number = 1, search: string = '') => {
    setLoading(true)
    setError(null)

    try {
      const response = await getStaff({
        page,
        limit: 50,
        search,
        sort: '-createdAt',
      })
      if (response.success) {
        setStaff(response.data)
        setPagination(response.pagination)
      } else {
        setError(response.message)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch data')
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
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchData(currentPage, searchQuery)
  }

  const handleCreateModalClose = () => {
    setShowCreateModal(false)
  }

  return (
    <>
      <PageBreadcrumb title="Staff" subName="Ecommerce" />
      <PageMetaData title="Staff" />

      <Card>
        <CardBody>
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <form onSubmit={handleSearch} className="search-bar grow me-3">
              <span>
                <IconifyIcon icon="bx:search-alt" />
              </span>
              <input
                type="search"
                className="form-control"
                id="search"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Button variant="primary" onClick={handleCreate}>
              <IconifyIcon icon="bx:user-plus" className="me-1" />
              Create Staff
            </Button>
          </div>
        </CardBody>
      </Card>

      {loading && staff.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-4">
              <Preloader />
            </div>
          </CardBody>
        </Card>
      ) : error ? (
        <Card>
          <CardBody>
            <div className="text-center py-4 text-danger">{error}</div>
          </CardBody>
        </Card>
      ) : (
        <NewCustomersList
          users={staff}
          loading={loading}
          pagination={pagination}
          onPageChange={setCurrentPage}
          onRefresh={handleRefresh}
          type="staff"
        />
      )}

      <CreateStaffModal
        show={showCreateModal}
        onHide={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}

NewStaff.displayName = 'NewStaff'

export default NewStaff

