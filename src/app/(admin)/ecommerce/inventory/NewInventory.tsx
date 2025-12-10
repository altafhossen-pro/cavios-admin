import { useState, useEffect, useCallback } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import NewInventoryFilters from './components/NewInventoryFilters'
import NewInventoryListTable from './components/NewInventoryListTable'
import { getInventory, type InventoryProduct } from '@/features/admin/api/inventoryApi'
import Preloader from '@/components/Preloader'
import { Alert } from 'react-bootstrap'

const NewInventory = () => {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // Filter states
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'in'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getInventory({
        page: currentPage,
        limit: pagination.limit,
        search: search || undefined,
        stockFilter: stockFilter !== 'all' ? stockFilter : undefined,
        sort: '-createdAt',
      })
      if (response.success) {
        setProducts(response.data)
        setPagination(response.pagination)
      } else {
        setError(response.message || 'Failed to fetch inventory')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pagination.limit, search, stockFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue)
    setCurrentPage(1)
  }

  const handleStockFilter = (filter: 'all' | 'low' | 'out' | 'in') => {
    setStockFilter(filter)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = () => {
    fetchData()
  }

  return (
    <>
      <PageBreadcrumb subName="Ecommerce" title="Inventory" />
      <PageMetaData title="Inventory" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {/* Filters at top */}
              <NewInventoryFilters
                search={search}
                stockFilter={stockFilter}
                onSearch={handleSearch}
                onStockFilter={handleStockFilter}
              />

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <Preloader />
                </div>
              ) : (
                <NewInventoryListTable
                  products={products}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onRefresh={handleRefresh}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default NewInventory

