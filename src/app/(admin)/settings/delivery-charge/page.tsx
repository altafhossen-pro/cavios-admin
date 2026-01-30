'use client'
import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Preloader from '@/components/Preloader'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { getDeliveryChargeSettings, updateDeliveryChargeSettings, type DeliveryChargeSettings } from '@/features/admin/api/settingsApi'
import { useNotificationContext } from '@/context/useNotificationContext'

const DeliveryChargeSettingsPage = () => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [settings, setSettings] = useState<DeliveryChargeSettings>({
    outsideDhaka: 150,
    insideDhaka: 80,
    subDhaka: 120,
    shippingFreeRequiredAmount: 1500,
  })
  const [formData, setFormData] = useState<DeliveryChargeSettings>({
    outsideDhaka: 150,
    insideDhaka: 80,
    subDhaka: 120,
    shippingFreeRequiredAmount: 1500,
  })

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getDeliveryChargeSettings()
      if (response.success) {
        setSettings(response.data)
        setFormData(response.data)
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch delivery charge settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleInputChange = (field: keyof DeliveryChargeSettings, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value >= 0 ? value : 0,
    }))
    setSuccess(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await updateDeliveryChargeSettings(formData)
      if (response.success) {
        setSettings(response.data)
        setSuccess('Delivery charge settings updated successfully!')
        showNotification({
          message: 'Delivery charge settings updated successfully!',
          variant: 'success',
        })
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update delivery charge settings')
      showNotification({
        message: err.message || 'Failed to update delivery charge settings',
        variant: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData(settings)
    setSuccess(null)
    setError(null)
  }

  return (
    <>
      <PageMetaData title="Delivery Charge Settings" />
      <PageBreadcrumb title="Delivery Charge Settings" subName="Settings" />
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Delivery Charge Configuration</h4>
            <Button variant="secondary" onClick={fetchSettings} disabled={loading || saving}>
              <IconifyIcon icon="bx:refresh" className="me-1" />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Preloader />
              <p className="mt-3 text-muted">Loading delivery charge settings...</p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Inside Dhaka Charge (৳) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="1"
                      value={formData.insideDhaka}
                      onChange={(e) => handleInputChange('insideDhaka', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="Enter delivery charge for inside Dhaka"
                    />
                    <Form.Text className="text-muted">
                      Delivery charge for orders within Dhaka city
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Sub Dhaka Charge (৳) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="1"
                      value={formData.subDhaka}
                      onChange={(e) => handleInputChange('subDhaka', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="Enter delivery charge for sub Dhaka"
                    />
                    <Form.Text className="text-muted">
                      Delivery charge for orders in Dhaka division (outside city)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Outside Dhaka Charge (৳) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="1"
                      value={formData.outsideDhaka}
                      onChange={(e) => handleInputChange('outsideDhaka', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="Enter delivery charge for outside Dhaka"
                    />
                    <Form.Text className="text-muted">
                      Delivery charge for orders outside Dhaka division
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Free Shipping Threshold (৳) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="1"
                      value={formData.shippingFreeRequiredAmount}
                      onChange={(e) => handleInputChange('shippingFreeRequiredAmount', parseFloat(e.target.value) || 0)}
                      required
                      placeholder="Enter minimum amount for free shipping"
                    />
                    <Form.Text className="text-muted">
                      Minimum order amount required for free shipping (when total price reaches this amount, shipping becomes free)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button variant="secondary" type="button" onClick={handleReset} disabled={saving}>
                  Reset
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconifyIcon icon="bx:save" className="me-1" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}

          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="mb-2">Current Settings Summary:</h6>
            <ul className="mb-0">
              <li>Inside Dhaka: ৳{settings.insideDhaka}</li>
              <li>Sub Dhaka: ৳{settings.subDhaka}</li>
              <li>Outside Dhaka: ৳{settings.outsideDhaka}</li>
              <li>Free Shipping Threshold: ৳{settings.shippingFreeRequiredAmount}</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </>
  )
}

export default DeliveryChargeSettingsPage
