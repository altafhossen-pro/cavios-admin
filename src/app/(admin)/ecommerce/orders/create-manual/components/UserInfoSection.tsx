import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardBody, CardTitle, FormControl, FormGroup, FormLabel, Button, ListGroup, Tabs, Tab } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { searchUsers, type User } from '@/features/admin/api/userApi'
import { getCustomerInfoByPhone } from '@/features/admin/api/orderApi'

type GuestInfo = {
  name: string
  phone: string
  email: string
  address: string
}

interface UserInfoSectionProps {
  orderType: 'existing' | 'guest'
  onOrderTypeChange: (type: 'existing' | 'guest') => void
  selectedUserId: string
  onUserIdChange: (id: string) => void
  guestInfo: GuestInfo
  onGuestInfoChange: (info: GuestInfo) => void
  deliveryAddress: string
  onDeliveryAddressChange: (address: string) => void
}

const UserInfoSection = ({
  orderType,
  onOrderTypeChange,
  selectedUserId: _selectedUserId,
  onUserIdChange,
  guestInfo,
  onGuestInfoChange,
  deliveryAddress,
  onDeliveryAddressChange,
}: UserInfoSectionProps) => {
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [showUserSuggestions, setShowUserSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowUserSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (userSearchQuery.trim().length < 2) {
      setUsers([])
      setShowUserSuggestions(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await searchUsers(userSearchQuery)
        if (response.success) {
          setUsers(response.data)
          setShowUserSuggestions(true)
        }
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [userSearchQuery])

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    onUserIdChange(user._id)
    setUserSearchQuery(user.email || user.phone || user.name)
    setShowUserSuggestions(false)
  }

  const handlePhoneSearch = useCallback(async (phone: string) => {
    if (!phone || phone.length < 10) {
      return
    }

    setLoading(true)
    try {
      const response = await getCustomerInfoByPhone(phone)
      if (response.success && response.data) {
        const customerData = response.data as any
        // Backend returns name and address from latest order
        // Address comes as combined string (street, city, state, division, district, etc.)
        // But we only need the street part (first part) which is what user typed in checkout
        let addressValue = customerData.address || ''
        
        // Extract only the street part (first part before first comma)
        // This matches what user typed in the checkout "Shipping Address" textarea
        if (addressValue && addressValue.includes(',')) {
          // Take only the first part (street) - this is what user input in checkout
          const parts = addressValue.split(',')
          addressValue = parts[0].trim()
        }
        
        if (customerData.name || addressValue) {
          onGuestInfoChange({
            name: customerData.name || '',
            phone: phone,
            email: customerData.email || '',
            address: addressValue,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching customer info:', error)
    } finally {
      setLoading(false)
    }
  }, [onGuestInfoChange])

  // Auto-search when phone number is entered (debounced)
  useEffect(() => {
    if (orderType === 'guest' && guestInfo.phone && guestInfo.phone.length >= 10) {
      const timeoutId = setTimeout(() => {
        handlePhoneSearch(guestInfo.phone)
      }, 500) // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId)
    }
  }, [guestInfo.phone, orderType, handlePhoneSearch])

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle className="mb-3">
          <IconifyIcon icon="bx:user" className="me-2" />
          Customer Information
        </CardTitle>

        <Tabs
          activeKey={orderType}
          onSelect={(k) => onOrderTypeChange(k as 'existing' | 'guest')}
          className="mb-3"
        >
          <Tab eventKey="existing" title="Existing Customer">
            <FormGroup className="mb-3 position-relative">
              <FormLabel>Search Customer by Email or Phone</FormLabel>
              <FormControl
                type="text"
                placeholder="Type email or phone number..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                onFocus={() => users.length > 0 && setShowUserSuggestions(true)}
              />
              {loading && (
                <div className="position-absolute" style={{ right: '10px', top: '40px' }}>
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {showUserSuggestions && users.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="position-absolute w-100 bg-white border rounded shadow-lg"
                  style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', top: '100%', marginTop: '4px' }}
                >
                  <ListGroup variant="flush">
                    {users.map((user) => (
                      <ListGroup.Item
                        key={user._id}
                        action
                        onClick={() => handleUserSelect(user)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <small className="text-muted">
                            {user.email} {user.phone && `| ${user.phone}`}
                          </small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              )}
            </FormGroup>

            {selectedUser && (
              <div className="border rounded p-3 mb-3 bg-light">
                <h6 className="mb-2">Selected Customer</h6>
                <div>
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  {selectedUser.email && <div><strong>Email:</strong> {selectedUser.email}</div>}
                  {selectedUser.phone && <div><strong>Phone:</strong> {selectedUser.phone}</div>}
                </div>
              </div>
            )}

            <FormGroup>
              <FormLabel>Delivery Address</FormLabel>
              <FormControl
                as="textarea"
                rows={3}
                placeholder="Enter delivery address..."
                value={deliveryAddress}
                onChange={(e) => onDeliveryAddressChange(e.target.value)}
              />
            </FormGroup>
          </Tab>

          <Tab eventKey="guest" title="Guest Customer">
            <FormGroup className="mb-3">
              <FormLabel>Phone Number *</FormLabel>
              <div className="d-flex gap-2">
                <FormControl
                  type="text"
                  placeholder="Enter phone number..."
                  value={guestInfo.phone}
                  onChange={(e) =>
                    onGuestInfoChange({ ...guestInfo, phone: e.target.value })
                  }
                />
                <Button
                  variant="outline-primary"
                  onClick={() => handlePhoneSearch(guestInfo.phone)}
                  disabled={loading || !guestInfo.phone || guestInfo.phone.length < 10}
                >
                  <IconifyIcon icon="bx:search" />
                </Button>
              </div>
              {loading && (
                <small className="text-muted">Searching order history...</small>
              )}
            </FormGroup>

            <FormGroup className="mb-3">
              <FormLabel>Name *</FormLabel>
              <FormControl
                type="text"
                placeholder="Enter customer name..."
                value={guestInfo.name}
                onChange={(e) =>
                  onGuestInfoChange({ ...guestInfo, name: e.target.value })
                }
              />
            </FormGroup>

            <FormGroup className="mb-3">
              <FormLabel>Email</FormLabel>
              <FormControl
                type="email"
                placeholder="Enter email (optional)..."
                value={guestInfo.email}
                onChange={(e) =>
                  onGuestInfoChange({ ...guestInfo, email: e.target.value })
                }
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Delivery Address *</FormLabel>
              <FormControl
                as="textarea"
                rows={3}
                placeholder="Enter delivery address..."
                value={guestInfo.address}
                onChange={(e) =>
                  onGuestInfoChange({ ...guestInfo, address: e.target.value })
                }
              />
            </FormGroup>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  )
}

export default UserInfoSection
