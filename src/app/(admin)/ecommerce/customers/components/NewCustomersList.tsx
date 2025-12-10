import { useState } from 'react'
import { Card, CardBody, Button, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { User } from '@/features/admin/api/userApi'
import Preloader from '@/components/Preloader'
import EditUserModal from './EditUserModal'
import DeleteUserModal from './DeleteUserModal'

interface NewCustomersListProps {
  users: User[]
  loading: boolean
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
  type: 'customers' | 'staff'
}

const NewCustomersList = ({ users, loading, pagination, onPageChange, onRefresh, type }: NewCustomersListProps) => {
  const [editModalShow, setEditModalShow] = useState(false)
  const [deleteModalShow, setDeleteModalShow] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'secondary'
      case 'suspended':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditModalShow(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteModalShow(true)
  }

  const handleEditSuccess = () => {
    onRefresh()
  }

  const handleDeleteSuccess = () => {
    onRefresh()
  }

  if (users.length === 0 && !loading) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-4 text-muted">
            No {type === 'customers' ? 'customers' : 'staff'} found
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="table-responsive table-centered">
        <table className="table text-nowrap mb-0">
          <thead className="bg-light bg-opacity-50">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <Preloader />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="img-fluid avatar-xs rounded-circle avatar-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/users/avatar-1.jpg'
                          }}
                        />
                      ) : (
                        <div className="avatar-xs rounded-circle bg-primary d-flex align-items-center justify-content-center text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="fw-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <Badge bg="info">{user.role || 'customer'}</Badge>
                  </td>
                  <td>
                    <Badge bg={getStatusColor(user.status)}>
                      {user.status || 'active'}
                    </Badge>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="soft-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      <IconifyIcon icon="bx:edit" />
                    </Button>
                    <Button
                      variant="soft-danger"
                      size="sm"
                      onClick={() => handleDelete(user)}
                    >
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-between p-3 border-top">
          <div className="text-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="light"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <EditUserModal
        show={editModalShow}
        onHide={() => {
          setEditModalShow(false)
          setSelectedUser(null)
        }}
        userId={selectedUser?._id || null}
        onSuccess={handleEditSuccess}
      />

      <DeleteUserModal
        show={deleteModalShow}
        onHide={() => {
          setDeleteModalShow(false)
          setSelectedUser(null)
        }}
        userId={selectedUser?._id || null}
        userName={selectedUser?.name || ''}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  )
}

export default NewCustomersList

