import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Form, InputGroup } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getAllHeroBanners, HeroBanner } from '@/features/admin/api/heroBannerApi'
import HeroBannersList from './components/HeroBannersList'
import HeroBannerModal from './components/HeroBannerModal'

const HeroSectionPage = () => {
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getAllHeroBanners()
      if (response.success) {
        let filteredBanners = response.data || []
        
        // Filter by search query if provided
        if (searchQuery.trim()) {
          filteredBanners = filteredBanners.filter(
            (banner) =>
              banner.heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              banner.subheading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              banner.btnText?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        // Sort by order
        filteredBanners.sort((a, b) => (a.order || 0) - (b.order || 0))
        
        setHeroBanners(filteredBanners)
      } else {
        setError(response.message)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch hero banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handleCreate = () => {
    setEditingBanner(null)
    setShowModal(true)
  }

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingBanner(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    fetchData()
  }

  return (
    <>
      <PageMetaData title="Hero Section" />
      <PageBreadcrumb title="Hero Section" subName="Ecommerce" />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3 flex-grow-1">
              <Form onSubmit={handleSearch} className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search hero banners by heading, subheading..."
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
              Create Hero Banner
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading && heroBanners.length === 0 ? (
            <div className="text-center py-5">
              <Preloader />
              <p className="mt-3 text-muted">Loading hero banners...</p>
            </div>
          ) : (
            <HeroBannersList
              heroBanners={heroBanners}
              onRefresh={handleRefresh}
              onEdit={handleEdit}
              loading={loading}
            />
          )}
        </CardBody>
      </Card>

      <HeroBannerModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        heroBanner={editingBanner}
      />
    </>
  )
}

export default HeroSectionPage
