import { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import { createStaff, CreateStaffRequest } from '@/features/admin/api/userApi'
import { getAllRoles, Role } from '@/features/admin/api/roleApi'
import { useNotificationContext } from '@/context/useNotificationContext'

interface CreateStaffModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

const CreateStaffModal = ({ show, onHide, onSuccess }: CreateStaffModalProps) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [fetchingRoles, setFetchingRoles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState<CreateStaffRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    roleId: '',
    status: 'active',
  })

  useEffect(() => {
    if (show) {
      fetchRoles()
      // Reset form when modal opens
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        roleId: '',
        status: 'active',
      })
      setError(null)
    }
  }, [show])

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

  const handleChange = (field: keyof CreateStaffRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const staffData: CreateStaffRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        roleId: formData.roleId || undefined,
        status: formData.status || 'active',
      }

      const response = await createStaff(staffData)
      if (response.success) {
        showNotification({
          message: 'Staff member created successfully',
          variant: 'success',
        })
        onSuccess()
        onHide()
      } else {
        setError(response.message || 'Failed to create staff member')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to create staff member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="bx:user-plus" className="me-2" />
          Create Staff Member
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="Enter email address"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Password <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter password (min 6 characters)"
                />
                <Form.Text className="text-muted">
                  Minimum 6 characters required
                </Form.Text>
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
                  disabled={fetchingRoles}
                >
                  <option value="">Select a role (optional)</option>
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
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || fetchingRoles}>
            {loading ? (
              <>
                <span className="me-2">
                  <Preloader />
                </span>
                Creating...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:user-plus" className="me-2" />
                Create Staff
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreateStaffModal.displayName = 'CreateStaffModal'

export default CreateStaffModal

