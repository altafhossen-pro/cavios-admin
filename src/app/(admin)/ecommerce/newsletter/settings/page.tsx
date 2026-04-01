import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Form, Row, Col } from 'react-bootstrap';
import { useNotificationContext } from '@/context/useNotificationContext';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Preloader from '@/components/Preloader';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getNewsletterSettings, updateNewsletterSettings, NewsletterSettings } from '@/features/admin/api/newsletterApi';
import { uploadSingleImage } from '@/features/admin/api/uploadApi';

const NewsletterSettingsPage = () => {
  const { showNotification } = useNotificationContext();
  const [settings, setSettings] = useState<NewsletterSettings | null>(null);
  const [newIcon, setNewIcon] = useState({ platform: 'facebook', href: '#' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getNewsletterSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching newsletter settings:', error);
      showNotification({ message: 'Failed to load settings', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as any).checked : value
    });
  };

  const handleIconChange = (index: number, field: string, value: string) => {
    if (!settings || !settings.socialIcons) return;
    const updatedIcons = [...settings.socialIcons];
    updatedIcons[index] = { ...updatedIcons[index], [field]: value };
    setSettings({ ...settings, socialIcons: updatedIcons });
  };

  const removeIcon = (index: number) => {
    if (!settings || !settings.socialIcons) return;
    const updatedIcons = settings.socialIcons.filter((_: any, i: number) => i !== index);
    setSettings({ ...settings, socialIcons: updatedIcons });
  };

  const addIcon = () => {
    if (!settings) return;
    const updatedIcons = [...(settings.socialIcons || []), { ...newIcon }];
    setSettings({ ...settings, socialIcons: updatedIcons });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploading(true);
    try {
      const response = await uploadSingleImage(file);
      setSettings({ ...settings, image: response.data.url });
      showNotification({ message: 'Image uploaded successfully', variant: 'success' });
    } catch (error: any) {
      showNotification({ message: error.message || 'Upload failed', variant: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await updateNewsletterSettings(settings);
      if (response.success) {
        showNotification({ message: 'Settings updated successfully', variant: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Failed to save settings', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Preloader />;

  return (
    <>
      <PageMetaData title="Newsletter Settings" />
      <PageBreadcrumb title="Settings" subName="Newsletter" />
      <Card>
        <CardBody>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Newsletter Image</Form.Label>
                  <div className="mb-2">
                    {settings?.image && (
                      <img src={settings.image} alt="Newsletter" className="img-thumbnail mb-2" style={{ maxHeight: '200px' }} />
                    )}
                    <Form.Control type="file" onChange={handleImageUpload} disabled={uploading} />
                    {uploading && <small className="text-primary">Uploading...</small>}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control name="title" value={settings?.title} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subtitle</Form.Label>
                  <Form.Control as="textarea" name="subtitle" value={settings?.subtitle} onChange={handleChange} />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Button Text</Form.Label>
                  <Form.Control name="buttonText" value={settings?.buttonText} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Input Placeholder</Form.Label>
                  <Form.Control name="placeholder" value={settings?.placeholder} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Success Message</Form.Label>
                  <Form.Control name="successMessage" value={settings?.successMessage} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" name="isActive" label="Is Active (Master Switch)" checked={settings?.isActive} onChange={handleChange} />
                  <small className="text-muted d-block ms-4">When off, the newsletter popup will never show.</small>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" name="forceShow" label="Force Show (Forcefully display to users)" checked={settings?.forceShow} onChange={handleChange} />
                  <small className="text-muted d-block ms-4">If checked, it overrides user dismissal logic and shows immediatey.</small>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Show Interval History</Form.Label>
                  <Form.Select name="showInterval" value={settings?.showInterval} onChange={handleChange}>
                    <option value="once">Once (Per lifetime of user)</option>
                    <option value="every_session">Every Session (After browser closes and re-opens)</option>
                    <option value="every_reload">Every Reload (Show on every home page visit)</option>
                  </Form.Select>
                  <small className="text-muted d-block">Defines how often to track user's dismissal or subscription.</small>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" name="showSocialIcons" label="Show Social Icons" checked={settings?.showSocialIcons} onChange={handleChange} />
                </Form.Group>

                {settings?.showSocialIcons !== false && (
                  <div className="mt-4">
                    <h6>Social Icons</h6>
                    <hr />
                    {settings?.socialIcons?.map((social, index) => (
                      <Row key={index} className="mb-2 align-items-end g-2">
                        <Col md={4}>
                          <Form.Label>Platform</Form.Label>
                          <Form.Select value={social.platform} onChange={(e) => handleIconChange(index, 'platform', e.target.value)}>
                            {['facebook', 'youtube', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'tiktok', 'pinterest', 'amazon'].map(p => (
                              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={6}>
                          <Form.Label>Link (HREF)</Form.Label>
                          <Form.Control value={social.href} onChange={(e) => handleIconChange(index, 'href', e.target.value)} />
                        </Col>
                        <Col md={2}>
                          <Button variant="danger" className="w-100" onClick={() => removeIcon(index)}>
                            <IconifyIcon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        </Col>
                      </Row>
                    ))}

                    <div className="mt-3 p-2 border rounded bg-light">
                      <Row className="align-items-end g-2">
                        <Col md={4}>
                          <Form.Label>New Platform</Form.Label>
                          <Form.Select value={newIcon.platform} onChange={(e) => setNewIcon({ ...newIcon, platform: e.target.value })}>
                            {['facebook', 'youtube', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'tiktok', 'pinterest', 'amazon'].map(p => (
                              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={6}>
                          <Form.Label>Link (HREF)</Form.Label>
                          <Form.Control value={newIcon.href} onChange={(e) => setNewIcon({ ...newIcon, href: e.target.value })} />
                        </Col>
                        <Col md={2}>
                          <Button variant="success" className="w-100" onClick={addIcon}>
                            Add Icon
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            <div className="text-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default NewsletterSettingsPage;
