'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Form, Table, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Preloader from '@/components/Preloader';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getFooterConfig, updateFooterConfig, FooterConfig, DynamicColumn, FooterColumnItem, SocialLink } from '@/features/admin/api/footerApi';
import { toast } from 'react-toastify';

const FooterPage = () => {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dynamic');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<DynamicColumn | null>(null);
  const [editingItem, setEditingItem] = useState<{ columnIndex?: number; itemIndex?: number; type: 'dynamic' | 'support' | 'company' } | null>(null);
  const [editingSocial, setEditingSocial] = useState<{ index?: number } | null>(null);
  const [columnForm, setColumnForm] = useState({ heading: '' });
  const [itemForm, setItemForm] = useState({ label: '', href: '', target: '_self' as '_self' | '_blank' });
  const [socialForm, setSocialForm] = useState({ platform: '', href: '', iconClass: '' });

  // Predefined social media platforms with icons
  const socialMediaOptions = [
    { platform: 'Facebook', iconClass: 'icon-fb', defaultUrl: 'https://facebook.com/' },
    { platform: 'Instagram', iconClass: 'icon-instagram', defaultUrl: 'https://instagram.com/' },
    { platform: 'Twitter/X', iconClass: 'icon-x', defaultUrl: 'https://x.com/' },
    { platform: 'TikTok', iconClass: 'icon-tiktok', defaultUrl: 'https://tiktok.com/' },
    { platform: 'Pinterest', iconClass: 'icon-pinterest', defaultUrl: 'https://pinterest.com/' },
    { platform: 'YouTube', iconClass: 'icon-youtube', defaultUrl: 'https://youtube.com/' },
    { platform: 'LinkedIn', iconClass: 'icon-linkedin', defaultUrl: 'https://linkedin.com/' },
    { platform: 'WhatsApp', iconClass: 'icon-whatsapp', defaultUrl: 'https://wa.me/' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFooterConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error fetching footer config:', error);
      toast.error('Failed to load footer configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = () => {
    setEditingColumn(null);
    setColumnForm({ heading: '' });
    setShowColumnModal(true);
  };

  const handleEditColumn = (column: DynamicColumn, index: number) => {
    setEditingColumn({ ...column, order: index });
    setColumnForm({ heading: column.heading });
    setShowColumnModal(true);
  };

  const handleDeleteColumn = (index: number) => {
    if (config) {
      const newColumns = config.dynamicColumns.filter((_, i) => i !== index);
      setConfig({ ...config, dynamicColumns: newColumns });
    }
  };

  const handleSaveColumn = () => {
    if (!columnForm.heading.trim()) {
      toast.error('Column heading is required');
      return;
    }

    if (config) {
      if (editingColumn !== null) {
        const index = editingColumn.order;
        const updatedColumns = [...config.dynamicColumns];
        updatedColumns[index] = {
          ...updatedColumns[index],
          heading: columnForm.heading
        };
        setConfig({ ...config, dynamicColumns: updatedColumns });
      } else {
        const newColumn: DynamicColumn = {
          heading: columnForm.heading,
          items: [],
          order: config.dynamicColumns.length,
          isActive: true
        };
        setConfig({
          ...config,
          dynamicColumns: [...config.dynamicColumns, newColumn]
        });
      }
      setShowColumnModal(false);
      setEditingColumn(null);
      setColumnForm({ heading: '' });
    }
  };

  const handleAddItem = (type: 'dynamic' | 'support' | 'company', columnIndex?: number) => {
    setEditingItem({ type, columnIndex });
    setItemForm({ label: '', href: '', target: '_self' });
    setShowItemModal(true);
  };

  const handleEditItem = (item: FooterColumnItem, type: 'dynamic' | 'support' | 'company', columnIndex?: number, itemIndex?: number) => {
    setEditingItem({ type, columnIndex, itemIndex });
    setItemForm({ label: item.label, href: item.href, target: item.target || '_self' });
    setShowItemModal(true);
  };

  const handleDeleteItem = (type: 'dynamic' | 'support' | 'company', columnIndex?: number, itemIndex?: number) => {
    if (!config) return;

    if (type === 'dynamic' && columnIndex !== undefined && itemIndex !== undefined) {
      const updatedColumns = [...config.dynamicColumns];
      updatedColumns[columnIndex].items = updatedColumns[columnIndex].items.filter((_, i) => i !== itemIndex);
      setConfig({ ...config, dynamicColumns: updatedColumns });
    } else if (type === 'support' && itemIndex !== undefined) {
      const updatedItems = config.supportColumn.items.filter((_, i) => i !== itemIndex);
      setConfig({ ...config, supportColumn: { ...config.supportColumn, items: updatedItems } });
    } else if (type === 'company' && itemIndex !== undefined) {
      const updatedItems = config.companyInfoColumn.items.filter((_, i) => i !== itemIndex);
      setConfig({ ...config, companyInfoColumn: { ...config.companyInfoColumn, items: updatedItems } });
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.label.trim() || !itemForm.href.trim()) {
      toast.error('Label and URL are required');
      return;
    }

    if (!config || !editingItem) return;

    const newItem: FooterColumnItem = {
      label: itemForm.label,
      href: itemForm.href,
      target: itemForm.target,
      order: 0,
      isActive: true
    };

    if (editingItem.type === 'dynamic' && editingItem.columnIndex !== undefined) {
      const updatedColumns = [...config.dynamicColumns];
      if (editingItem.itemIndex !== undefined) {
        updatedColumns[editingItem.columnIndex].items[editingItem.itemIndex] = {
          ...newItem,
          order: updatedColumns[editingItem.columnIndex].items[editingItem.itemIndex].order
        };
      } else {
        newItem.order = updatedColumns[editingItem.columnIndex].items.length;
        updatedColumns[editingItem.columnIndex].items.push(newItem);
      }
      setConfig({ ...config, dynamicColumns: updatedColumns });
    } else if (editingItem.type === 'support') {
      const updatedItems = [...config.supportColumn.items];
      if (editingItem.itemIndex !== undefined) {
        updatedItems[editingItem.itemIndex] = {
          ...newItem,
          order: updatedItems[editingItem.itemIndex].order
        };
      } else {
        newItem.order = updatedItems.length;
        updatedItems.push(newItem);
      }
      setConfig({ ...config, supportColumn: { ...config.supportColumn, items: updatedItems } });
    } else if (editingItem.type === 'company') {
      const updatedItems = [...config.companyInfoColumn.items];
      if (editingItem.itemIndex !== undefined) {
        updatedItems[editingItem.itemIndex] = {
          ...newItem,
          order: updatedItems[editingItem.itemIndex].order
        };
      } else {
        newItem.order = updatedItems.length;
        updatedItems.push(newItem);
      }
      setConfig({ ...config, companyInfoColumn: { ...config.companyInfoColumn, items: updatedItems } });
    }

    setShowItemModal(false);
    setEditingItem(null);
    setItemForm({ label: '', href: '', target: '_self' });
  };

  const handleAddSocial = () => {
    setEditingSocial(null);
    setSocialForm({ platform: '', href: '', iconClass: '' });
    setShowSocialModal(true);
  };

  const handleSocialPlatformChange = (platform: string) => {
    const selected = socialMediaOptions.find(opt => opt.platform === platform);
    if (selected) {
      setSocialForm({
        platform: selected.platform,
        iconClass: selected.iconClass,
        href: selected.defaultUrl
      });
    }
  };

  const handleEditSocial = (social: SocialLink, index: number) => {
    setEditingSocial({ index });
    setSocialForm({ platform: social.platform, href: social.href, iconClass: social.iconClass });
    setShowSocialModal(true);
  };

  const handleDeleteSocial = (index: number) => {
    if (config) {
      const updatedLinks = config.followUsColumn.socialLinks.filter((_, i) => i !== index);
      setConfig({ ...config, followUsColumn: { ...config.followUsColumn, socialLinks: updatedLinks } });
    }
  };

  const handleSaveSocial = () => {
    if (!socialForm.platform.trim() || !socialForm.href.trim() || !socialForm.iconClass.trim()) {
      toast.error('Platform, URL, and Icon Class are required');
      return;
    }

    if (!config) return;

    const newSocial: SocialLink = {
      platform: socialForm.platform,
      href: socialForm.href,
      iconClass: socialForm.iconClass,
      order: 0,
      isActive: true
    };

    const updatedLinks = [...config.followUsColumn.socialLinks];
    if (editingSocial?.index !== undefined) {
      updatedLinks[editingSocial.index] = {
        ...newSocial,
        order: updatedLinks[editingSocial.index].order
      };
    } else {
      newSocial.order = updatedLinks.length;
      updatedLinks.push(newSocial);
    }

    setConfig({ ...config, followUsColumn: { ...config.followUsColumn, socialLinks: updatedLinks } });
    setShowSocialModal(false);
    setEditingSocial(null);
    setSocialForm({ platform: '', href: '', iconClass: '' });
  };

  const handleMoveItem = (type: 'dynamic' | 'support' | 'company', columnIndex: number | undefined, itemIndex: number, direction: 'up' | 'down') => {
    if (!config) return;

    if (type === 'dynamic' && columnIndex !== undefined) {
      const updatedColumns = [...config.dynamicColumns];
      const items = [...updatedColumns[columnIndex].items];
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      if (newIndex >= 0 && newIndex < items.length) {
        [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
        items[itemIndex].order = itemIndex;
        items[newIndex].order = newIndex;
        updatedColumns[columnIndex].items = items;
        setConfig({ ...config, dynamicColumns: updatedColumns });
      }
    } else if (type === 'support') {
      const items = [...config.supportColumn.items];
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      if (newIndex >= 0 && newIndex < items.length) {
        [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
        items[itemIndex].order = itemIndex;
        items[newIndex].order = newIndex;
        setConfig({ ...config, supportColumn: { ...config.supportColumn, items } });
      }
    } else if (type === 'company') {
      const items = [...config.companyInfoColumn.items];
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      if (newIndex >= 0 && newIndex < items.length) {
        [items[itemIndex], items[newIndex]] = [items[newIndex], items[itemIndex]];
        items[itemIndex].order = itemIndex;
        items[newIndex].order = newIndex;
        setConfig({ ...config, companyInfoColumn: { ...config.companyInfoColumn, items } });
      }
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const response = await updateFooterConfig(config);
      if (response.success) {
        toast.success('Footer configuration updated successfully');
        setConfig(response.data);
      } else {
        toast.error(response.message || 'Failed to update footer configuration');
      }
    } catch (error) {
      console.error('Error saving footer config:', error);
      toast.error('Failed to save footer configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadcrumb title="Footer" subName="Ecommerce" />
        <PageMetaData title="Footer" />
        <Card>
          <CardBody>
            <div className="text-center py-4">
              <Preloader />
            </div>
          </CardBody>
        </Card>
      </>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <>
      <PageBreadcrumb title="Footer" subName="Ecommerce" />
      <PageMetaData title="Footer" />

      <Card className="mb-4">
        <CardBody>
          <Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} className="mb-3">
            <Tab eventKey="dynamic" title="Dynamic Columns">
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Dynamic Columns (First 3 columns)</h5>
                  <Button variant="primary" size="sm" onClick={handleAddColumn}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Column
                  </Button>
                </div>
                {config.dynamicColumns.length === 0 ? (
                  <p className="text-muted">No dynamic columns. Add columns to create custom footer sections.</p>
                ) : (
                  config.dynamicColumns.map((column, colIndex) => (
                    <Card key={colIndex} className="mb-3">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6>{column.heading}</h6>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditColumn(column, colIndex)}
                            >
                              <IconifyIcon icon="bx:edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteColumn(colIndex)}
                            >
                              <IconifyIcon icon="bx:trash" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mb-3"
                          onClick={() => handleAddItem('dynamic', colIndex)}
                        >
                          <IconifyIcon icon="bx:plus" className="me-1" />
                          Add Item
                        </Button>
                        {column.items.length > 0 && (
                          <Table responsive>
                            <thead>
                              <tr>
                                <th>Label</th>
                                <th>URL</th>
                                <th>Target</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {column.items.map((item, itemIndex) => (
                                <tr key={itemIndex}>
                                  <td>{item.label}</td>
                                  <td><code>{item.href}</code></td>
                                  <td><Badge bg={item.target === '_blank' ? 'info' : 'secondary'}>{item.target || '_self'}</Badge></td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleMoveItem('dynamic', colIndex, itemIndex, 'up')}
                                        disabled={itemIndex === 0}
                                      >
                                        <IconifyIcon icon="bx:up-arrow" />
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleMoveItem('dynamic', colIndex, itemIndex, 'down')}
                                        disabled={itemIndex === column.items.length - 1}
                                      >
                                        <IconifyIcon icon="bx:down-arrow" />
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleEditItem(item, 'dynamic', colIndex, itemIndex)}
                                      >
                                        <IconifyIcon icon="bx:edit" />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteItem('dynamic', colIndex, itemIndex)}
                                      >
                                        <IconifyIcon icon="bx:trash" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </Tab>
            <Tab eventKey="support" title="Support Column">
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Support Column</h5>
                  <Button variant="primary" size="sm" onClick={() => handleAddItem('support')}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Item
                  </Button>
                </div>
                {config.supportColumn.items.length === 0 ? (
                  <p className="text-muted">No items. Add items to the Support column.</p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Label</th>
                        <th>URL</th>
                        <th>Target</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.supportColumn.items.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          <td>{item.label}</td>
                          <td><code>{item.href}</code></td>
                          <td><Badge bg={item.target === '_blank' ? 'info' : 'secondary'}>{item.target || '_self'}</Badge></td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleMoveItem('support', undefined, itemIndex, 'up')}
                                disabled={itemIndex === 0}
                              >
                                <IconifyIcon icon="bx:up-arrow" />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleMoveItem('support', undefined, itemIndex, 'down')}
                                disabled={itemIndex === config.supportColumn.items.length - 1}
                              >
                                <IconifyIcon icon="bx:down-arrow" />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditItem(item, 'support', undefined, itemIndex)}
                              >
                                <IconifyIcon icon="bx:edit" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteItem('support', undefined, itemIndex)}
                              >
                                <IconifyIcon icon="bx:trash" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>
            <Tab eventKey="company" title="Company Info Column">
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Company Info Column</h5>
                  <Button variant="primary" size="sm" onClick={() => handleAddItem('company')}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Item
                  </Button>
                </div>
                {config.companyInfoColumn.items.length === 0 ? (
                  <p className="text-muted">No items. Add items to the Company Info column.</p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Label</th>
                        <th>URL</th>
                        <th>Target</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.companyInfoColumn.items.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          <td>{item.label}</td>
                          <td><code>{item.href}</code></td>
                          <td><Badge bg={item.target === '_blank' ? 'info' : 'secondary'}>{item.target || '_self'}</Badge></td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleMoveItem('company', undefined, itemIndex, 'up')}
                                disabled={itemIndex === 0}
                              >
                                <IconifyIcon icon="bx:up-arrow" />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleMoveItem('company', undefined, itemIndex, 'down')}
                                disabled={itemIndex === config.companyInfoColumn.items.length - 1}
                              >
                                <IconifyIcon icon="bx:down-arrow" />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditItem(item, 'company', undefined, itemIndex)}
                              >
                                <IconifyIcon icon="bx:edit" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteItem('company', undefined, itemIndex)}
                              >
                                <IconifyIcon icon="bx:trash" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>
            <Tab eventKey="social" title="Follow Us Column">
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Follow Us Column (Social Links)</h5>
                  <Button variant="primary" size="sm" onClick={handleAddSocial}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Social Link
                  </Button>
                </div>
                {config.followUsColumn.socialLinks.length === 0 ? (
                  <p className="text-muted">No social links. Add social media links.</p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Platform</th>
                        <th>URL</th>
                        <th>Icon Class</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.followUsColumn.socialLinks.map((link, linkIndex) => (
                        <tr key={linkIndex}>
                          <td>{link.platform}</td>
                          <td><code>{link.href}</code></td>
                          <td><code>{link.iconClass}</code></td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditSocial(link, linkIndex)}
                            >
                              <IconifyIcon icon="bx:edit" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteSocial(linkIndex)}
                            >
                              <IconifyIcon icon="bx:trash" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Column Modal */}
      <Modal show={showColumnModal} onHide={() => setShowColumnModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingColumn ? 'Edit Column' : 'Add Column'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Column Heading *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter column heading"
                value={columnForm.heading}
                onChange={(e) => setColumnForm({ ...columnForm, heading: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowColumnModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveColumn}>
            {editingColumn ? 'Update' : 'Add'} Column
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Item Modal */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem?.itemIndex !== undefined ? 'Edit Item' : 'Add Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Label *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter label"
                value={itemForm.label}
                onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter URL"
                value={itemForm.href}
                onChange={(e) => setItemForm({ ...itemForm, href: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Open In</Form.Label>
              <Form.Select
                value={itemForm.target}
                onChange={(e) => setItemForm({ ...itemForm, target: e.target.value as '_self' | '_blank' })}
              >
                <option value="_self">Same Page</option>
                <option value="_blank">New Tab</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowItemModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveItem}>
            {editingItem?.itemIndex !== undefined ? 'Update' : 'Add'} Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Social Modal */}
      <Modal show={showSocialModal} onHide={() => setShowSocialModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSocial ? 'Edit Social Link' : 'Add Social Link'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Platform *</Form.Label>
              <Form.Select
                value={socialForm.platform}
                onChange={(e) => handleSocialPlatformChange(e.target.value)}
              >
                <option value="">Select Platform</option>
                {socialMediaOptions.map((option) => (
                  <option key={option.platform} value={option.platform}>
                    {option.platform}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select a platform to auto-fill icon class
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter social media URL"
                value={socialForm.href}
                onChange={(e) => setSocialForm({ ...socialForm, href: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Icon Class *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., icon-fb, icon-instagram"
                value={socialForm.iconClass}
                onChange={(e) => setSocialForm({ ...socialForm, iconClass: e.target.value })}
                readOnly={!!socialForm.platform}
              />
              <Form.Text className="text-muted">
                {socialForm.platform ? 'Icon class auto-filled from selected platform' : 'Enter icon class manually or select a platform'}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSocialModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSocial}>
            {editingSocial ? 'Update' : 'Add'} Social Link
          </Button>
        </Modal.Footer>
      </Modal>

      <Card>
        <CardBody>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={fetchData} disabled={saving}>
              <IconifyIcon icon="bx:refresh" className="me-1" />
              Reset
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  Saving...
                </>
              ) : (
                <>
                  <IconifyIcon icon="bx:save" className="me-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default FooterPage;
