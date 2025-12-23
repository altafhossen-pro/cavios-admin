import { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { updateUser, getUserById } from '@/features/admin/api/userApi'
import { getAllRoles, Role } from '@/features/admin/api/roleApi'
import { useAuthContext } from '@/context/useAuthContext'

interface EditUserModalProps {
  show: boolean
  onHide: () => void
  userId: string | null
  onSuccess: () => void
}

const EditUserModal = ({ show, onHide, userId, onSuccess }: EditUserModalProps) => {
  const { user: currentUser } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchingRoles, setFetchingRoles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    roleId: '',
  })

  // Check if user is editing their own profile
  const isEditingSelf = Boolean(currentUser?.id && userId && currentUser.id === userId)

  const fetchRoles = async () => {
    setFetchingRoles(true)
    try {
      const allRoles = await getAllRoles()
      if (Array.isArray(allRoles)) {
        setRoles(allRoles)
      } else {
        setRoles([])
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error('Error fetching roles:', error)
      setRoles([])
    } finally {
      setFetchingRoles(false)
    }
  }

  const fetchUserData = useCallback(async () => {
    if (!userId) return

    setFetching(true)
    setError(null)
    try {
      const response = await getUserById(userId)
      if (response.success && response.data) {
        const userData = response.data
        // Extract roleId - it might be a string or an object with _id
        let roleId = ''
        if (userData.roleId) {
          if (typeof userData.roleId === 'string') {
            roleId = userData.roleId
          } else if (typeof userData.roleId === 'object' && userData.roleId !== null && '_id' in userData.roleId) {
            roleId = (userData.roleId as { _id: string })._id
          }
        }
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          status: userData.status || 'active',
          roleId: roleId,
        })
      } else {
        setError(response.message || 'Failed to fetch user data')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to fetch user data')
    } finally {
      setFetching(false)
    }
  }, [userId])

  useEffect(() => {
    if (show && userId) {
      fetchRoles()
      fetchUserData()
    } else {
      // Reset form when modal closes
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        roleId: '',
      })
      setError(null)
      setRoles([])
    }
  }, [show, userId, fetchUserData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    // Prevent updating email, status, and roleId if editing self
    const updateData: { [key: string]: string | null | undefined } = { ...formData }
    if (isEditingSelf) {
      // Don't send email, status, and roleId changes for self
      delete updateData.email
      delete updateData.status
      delete updateData.roleId
    }
    
    // Convert empty string roleId to null
    if (updateData.roleId === '') {
      updateData.roleId = null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await updateUser(userId, updateData)
      if (response.success) {
        onSuccess()
        onHide()
      } else {
        setError(response.message || 'Failed to update user')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="bx:edit" className="me-2" />
          Edit User
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {fetching ? (
            <div className="text-center py-4">
              <Preloader />
            </div>
          ) : (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    placeholder="Enter name"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    placeholder="Enter email"
                    disabled={isEditingSelf}
                  />
                  {isEditingSelf && (
                    <Form.Text className="text-muted">
                      You cannot update your own email address.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={formData.roleId}
                    onChange={(e) => handleChange('roleId', e.target.value)}
                    disabled={isEditingSelf || fetchingRoles}
                  >
                    <option value="">No Role (Customer)</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </Form.Select>
                  {fetchingRoles && (
                    <Form.Text className="text-muted">
                      Loading roles...
                    </Form.Text>
                  )}
                  {isEditingSelf && (
                    <Form.Text className="text-muted">
                      You cannot update your own role.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={isEditingSelf}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Form.Select>
                  {isEditingSelf && (
                    <Form.Text className="text-muted">
                      You cannot update your own status.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || fetching}>
            {loading ? (
              <>
                <span className="me-2">
                  <Preloader />
                </span>
                Updating...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:save" className="me-2" />
                Update User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default EditUserModal

