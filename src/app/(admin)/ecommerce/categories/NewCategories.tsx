import { useState, useEffect } from 'react'
import { Card, CardBody, Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getCategories, Category } from '@/features/admin/api/categoryApi'
import NewCategoriesList from './components/NewCategoriesList'
import CategoryModal from './components/CategoryModal'

const NewCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
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
      const response = await getCategories({
        page,
        limit: 50,
        sort: '-createdAt',
      })
      if (response.success) {
        // Filter by search query if provided
        let filteredData = response.data
        if (search) {
          filteredData = response.data.filter(
            (cat) =>
              cat.name.toLowerCase().includes(search.toLowerCase()) ||
              cat.slug?.toLowerCase().includes(search.toLowerCase())
          )
        }
        setCategories(filteredData)
        setPagination(response.pagination || {
          total: filteredData.length,
          page: 1,
          limit: 50,
          totalPages: 1,
        })
      } else {
        setError(response.message)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch categories')
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
    setEditingCategory(null)
    setShowModal(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    fetchData(currentPage, searchQuery)
  }

  return (
    <>
      <PageBreadcrumb title="Categories" subName="Ecommerce" />
      <PageMetaData title="Categories" />

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
                placeholder="Search by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Button variant="primary" onClick={handleCreate}>
              <IconifyIcon icon="bx:plus" className="me-1" />
              Create Category
            </Button>
          </div>
        </CardBody>
      </Card>

      {loading && categories.length === 0 ? (
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
        <NewCategoriesList
          categories={categories}
          loading={loading}
          pagination={pagination}
          onPageChange={setCurrentPage}
          onRefresh={handleRefresh}
          onEdit={handleEdit}
        />
      )}

      <CategoryModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        category={editingCategory}
      />
    </>
  )
}

export default NewCategories

