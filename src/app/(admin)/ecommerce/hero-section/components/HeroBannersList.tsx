import { useState } from 'react'
import { Table, Badge, Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { HeroBanner } from '@/features/admin/api/heroBannerApi'
import { deleteHeroBanner } from '@/features/admin/api/heroBannerApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface HeroBannersListProps {
  heroBanners: HeroBanner[]
  onRefresh?: () => void
  onEdit: (banner: HeroBanner) => void
  loading?: boolean
}

const HeroBannersList = ({
  heroBanners,
  onEdit,
  onRefresh,
  loading = false,
}: HeroBannersListProps) => {
  const { showNotification } = useNotificationContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (bannerId: string, bannerHeading: string) => {
    if (!window.confirm(`Are you sure you want to delete hero banner "${bannerHeading}"?`)) {
      return
    }

    setDeletingId(bannerId)
    try {
      await deleteHeroBanner(bannerId)
      showNotification({
        message: 'Hero banner deleted successfully',
        variant: 'success',
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      showNotification({
        message: error.message || 'Failed to delete hero banner',
        variant: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (heroBanners.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No hero banners found. Create your first hero banner!</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th>Image</th>
            <th>Subheading</th>
            <th>Heading</th>
            <th>Button Text</th>
            <th>Button Link</th>
            <th>Status</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {heroBanners.map((banner) => (
            <tr key={banner._id}>
              <td>
                {banner.imgSrc ? (
                  <img
                    src={banner.imgSrc}
                    alt={banner.alt || 'Hero banner'}
                    className="img-fluid"
                    style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
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
                <div
                  style={{
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={banner.subheading || '-'}
                >
                  {banner.subheading || '-'}
                </div>
              </td>
              <td>
                <div
                  style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={banner.heading}
                >
                  <strong>{banner.heading}</strong>
                </div>
              </td>
              <td>{banner.btnText || '-'}</td>
              <td>
                <div
                  style={{
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={banner.buttonLink || '-'}
                >
                  {banner.buttonLink || '-'}
                </div>
              </td>
              <td>
                <Badge bg={banner.isActive ? 'success' : 'secondary'}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>
                <Badge bg="info">{banner.order || 0}</Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(banner)}
                    title="Edit hero banner"
                  >
                    <IconifyIcon icon="bx:edit" />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(banner._id, banner.heading)}
                    disabled={deletingId === banner._id}
                    title="Delete hero banner"
                  >
                    {deletingId === banner._id ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
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
  )
}

export default HeroBannersList
