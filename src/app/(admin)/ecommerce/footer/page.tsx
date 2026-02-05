'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Form, Table, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Preloader from '@/components/Preloader';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getFooterConfig, updateFooterConfig, FooterConfig, DynamicColumn, FooterColumnItem } from '@/features/admin/api/footerApi';
import { getStaticPages } from '@/features/admin/api/staticPageApi';
import { toast } from 'react-toastify';

const FooterPage = () => {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dynamic');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<DynamicColumn | null>(null);
  const [editingItem, setEditingItem] = useState<{ columnIndex?: number; itemIndex?: number; type: 'dynamic' } | null>(null);
  const [columnForm, setColumnForm] = useState({ heading: '' });
  const [itemForm, setItemForm] = useState({ label: '', href: '', target: '_self' as '_self' | '_blank' });
  const [privacyPageExists, setPrivacyPageExists] = useState<boolean | null>(null);
  const [termsPageExists, setTermsPageExists] = useState<boolean | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const checkStaticPages = async () => {
      try {
        // Check Privacy Policy page
        const privacyResponse = await getStaticPages({ pageType: 'privacy-policy', isActive: true, limit: 1 });
        setPrivacyPageExists(privacyResponse.success && privacyResponse.data.pages.length > 0);

        // Check Terms & Conditions page
        const termsResponse = await getStaticPages({ pageType: 'terms-conditions', isActive: true, limit: 1 });
        setTermsPageExists(termsResponse.success && termsResponse.data.pages.length > 0);
      } catch (error) {
        console.error('Error checking static pages:', error);
      }
    };

    if (config) {
      checkStaticPages();
    }
  }, [config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getFooterConfig();
      if (response.success) {
        // Initialize bottomSection if not exists
        const configData = response.data;
        if (!configData.bottomSection) {
          const currentYear = new Date().getFullYear();
          configData.bottomSection = {
            privacyPolicy: {
              label: 'Privacy Policy',
              href: '',
              autoDetect: true
            },
            termsAndConditions: {
              label: 'Terms & Conditions',
              href: '',
              autoDetect: true
            },
            copyright: `© Cavios® ${currentYear}. Designed for performance. Built to last.`
          };
        }
        setConfig(configData);
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
        // Limit to 6 columns
        if (config.dynamicColumns.length >= 6) {
          toast.error('Maximum 6 columns allowed');
          return;
        }
        
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

  const handleAddItem = (type: 'dynamic', columnIndex?: number) => {
    setEditingItem({ type, columnIndex });
    setItemForm({ label: '', href: '', target: '_self' });
    setShowItemModal(true);
  };

  const handleEditItem = (item: FooterColumnItem, type: 'dynamic', columnIndex?: number, itemIndex?: number) => {
    setEditingItem({ type, columnIndex, itemIndex });
    setItemForm({ label: item.label, href: item.href, target: item.target || '_self' });
    setShowItemModal(true);
  };

  const handleDeleteItem = (type: 'dynamic', columnIndex?: number, itemIndex?: number) => {
    if (!config) return;

    if (type === 'dynamic' && columnIndex !== undefined && itemIndex !== undefined) {
      const updatedColumns = [...config.dynamicColumns];
      updatedColumns[columnIndex].items = updatedColumns[columnIndex].items.filter((_, i) => i !== itemIndex);
      setConfig({ ...config, dynamicColumns: updatedColumns });
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
    }

    setShowItemModal(false);
    setEditingItem(null);
    setItemForm({ label: '', href: '', target: '_self' });
  };


  const handleMoveItem = (type: 'dynamic', columnIndex: number | undefined, itemIndex: number, direction: 'up' | 'down') => {
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
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      // Replace {year} with actual year in copyright
      const bottomSectionToSave = config.bottomSection ? {
        ...config.bottomSection,
        copyright: config.bottomSection.copyright.replace('{year}', new Date().getFullYear().toString())
      } : config.bottomSection;
      
      // Only save dynamicColumns and bottomSection
      const response = await updateFooterConfig({
        dynamicColumns: config.dynamicColumns,
        bottomSection: bottomSectionToSave
      });
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
                  <h5>Dynamic Columns (Up to 6 columns)</h5>
                  <Button variant="primary" size="sm" onClick={handleAddColumn} disabled={config.dynamicColumns.length >= 6}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Column
                  </Button>
                </div>
                {config.dynamicColumns.length >= 6 && (
                  <div className="alert alert-info mb-3">
                    Maximum 6 columns allowed. Delete a column to add a new one.
                  </div>
                )}
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
            <Tab eventKey="bottom" title="Bottom Section">
              <div className="mt-3">
                <h5 className="mb-4">Bottom Section Configuration</h5>
                
                <Card className="mb-3">
                  <CardBody>
                    <h6 className="mb-3">Privacy Policy</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>Label</Form.Label>
                      <Form.Control
                        type="text"
                        value={config.bottomSection?.privacyPolicy?.label || 'Privacy Policy'}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            bottomSection: {
                              privacyPolicy: {
                                label: e.target.value,
                                href: config.bottomSection?.privacyPolicy?.href || '',
                                autoDetect: config.bottomSection?.privacyPolicy?.autoDetect ?? true
                              },
                              termsAndConditions: config.bottomSection?.termsAndConditions || {
                                label: 'Terms & Conditions',
                                href: '',
                                autoDetect: true
                              },
                              copyright: config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
                            }
                          });
                        }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Auto-detect from static pages"
                        checked={config.bottomSection?.privacyPolicy?.autoDetect ?? true}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            bottomSection: {
                              privacyPolicy: {
                                label: config.bottomSection?.privacyPolicy?.label || 'Privacy Policy',
                                href: config.bottomSection?.privacyPolicy?.href || '',
                                autoDetect: e.target.checked
                              },
                              termsAndConditions: config.bottomSection?.termsAndConditions || {
                                label: 'Terms & Conditions',
                                href: '',
                                autoDetect: true
                              },
                              copyright: config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
                            }
                          });
                        }}
                      />
                      {privacyPageExists !== null && (
                        <div className="mt-2">
                          {privacyPageExists ? (
                            <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                              <IconifyIcon icon="bx:check-circle" width={14} height={14} />
                              Already existing and connected
                            </Badge>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="warning" className="d-inline-flex align-items-center gap-1">
                                <IconifyIcon icon="bx:error-circle" width={14} height={14} />
                                Page not created. Please create it first.
                              </Badge>
                              <a 
                                href="/ecommerce/static-pages" 
                                target="_blank"
                                className="btn btn-sm btn-outline-primary"
                                style={{ textDecoration: 'none' }}
                              >
                                Go to Static Pages
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      {config.bottomSection?.privacyPolicy?.suggestedUrl && (
                        <Form.Text className="text-muted d-block mt-2">
                          Suggested URL: <code>{config.bottomSection.privacyPolicy.suggestedUrl}</code>
                        </Form.Text>
                      )}
                    </Form.Group>
                    {!config.bottomSection?.privacyPolicy?.autoDetect && (
                      <Form.Group className="mb-3">
                        <Form.Label>Manual URL</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="/page/privacy-policy"
                          value={config.bottomSection?.privacyPolicy?.href || ''}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              bottomSection: {
                                privacyPolicy: {
                                  label: config.bottomSection?.privacyPolicy?.label || 'Privacy Policy',
                                  href: e.target.value,
                                  autoDetect: false
                                },
                                termsAndConditions: config.bottomSection?.termsAndConditions || {
                                  label: 'Terms & Conditions',
                                  href: '',
                                  autoDetect: true
                                },
                                copyright: config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
                              }
                            });
                          }}
                        />
                        <Form.Text className="text-muted">
                          If auto-detect is off, enter the URL manually. Create a static page first if needed.
                        </Form.Text>
                      </Form.Group>
                    )}
                  </CardBody>
                </Card>

                <Card className="mb-3">
                  <CardBody>
                    <h6 className="mb-3">Terms & Conditions</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>Label</Form.Label>
                      <Form.Control
                        type="text"
                        value={config.bottomSection?.termsAndConditions?.label || 'Terms & Conditions'}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            bottomSection: {
                              privacyPolicy: config.bottomSection?.privacyPolicy || {
                                label: 'Privacy Policy',
                                href: '',
                                autoDetect: true
                              },
                              termsAndConditions: {
                                label: e.target.value,
                                href: config.bottomSection?.termsAndConditions?.href || '',
                                autoDetect: config.bottomSection?.termsAndConditions?.autoDetect ?? true
                              },
                              copyright: config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
                            }
                          });
                        }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Auto-detect from static pages"
                        checked={config.bottomSection?.termsAndConditions?.autoDetect ?? true}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            bottomSection: {
                              privacyPolicy: config.bottomSection?.privacyPolicy || {
                                label: 'Privacy Policy',
                                href: '',
                                autoDetect: true
                              },
                              termsAndConditions: {
                                label: config.bottomSection?.termsAndConditions?.label || 'Terms & Conditions',
                                href: config.bottomSection?.termsAndConditions?.href || '',
                                autoDetect: e.target.checked
                              },
                              copyright: config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
                            }
                          });
                        }}
                      />
                      {termsPageExists !== null && (
                        <div className="mt-2">
                          {termsPageExists ? (
                            <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                              <IconifyIcon icon="bx:check-circle" width={14} height={14} />
                              Already existing and connected
                            </Badge>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="warning" className="d-inline-flex align-items-center gap-1">
                                <IconifyIcon icon="bx:error-circle" width={14} height={14} />
                                Page not created. Please create it first.
                              </Badge>
                              <a 
                                href="/ecommerce/static-pages" 
                                target="_blank"
                                className="btn btn-sm btn-outline-primary"
                                style={{ textDecoration: 'none' }}
                              >
                                Go to Static Pages
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      {config.bottomSection?.termsAndConditions?.suggestedUrl && (
                        <Form.Text className="text-muted d-block mt-2">
                          Suggested URL: <code>{config.bottomSection.termsAndConditions.suggestedUrl}</code>
                        </Form.Text>
                      )}
                    </Form.Group>
                    {!config.bottomSection?.termsAndConditions?.autoDetect && (
                      <Form.Group className="mb-3">
                        <Form.Label>Manual URL</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="/page/terms-and-conditions"
                          value={config.bottomSection?.termsAndConditions?.href || ''}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              bottomSection: {
                                privacyPolicy: config.bottomSection?.privacyPolicy || {
                                  label: 'Privacy Policy',
                                  href: '',
                                  autoDetect: true
                                },
                                termsAndConditions: {
                                  label: config.bottomSection?.termsAndConditions?.label || 'Terms & Conditions',
                                  href: e.target.value,
                                  autoDetect: false
                                },
                                copyright: config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`
                              }
                            });
                          }}
                        />
                        <Form.Text className="text-muted">
                          If auto-detect is off, enter the URL manually. Create a static page first if needed.
                        </Form.Text>
                      </Form.Group>
                    )}
                  </CardBody>
                </Card>

                <Card className="mb-3">
                  <CardBody>
                    <h6 className="mb-3">Copyright Text</h6>
                    <Form.Group className="mb-3">
                      <Form.Label>Copyright</Form.Label>
                      <Form.Control
                        type="text"
                        value={config.bottomSection?.copyright || `© Cavios® ${new Date().getFullYear()}. Designed for performance. Built to last.`}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            bottomSection: {
                              ...config.bottomSection,
                              privacyPolicy: config.bottomSection?.privacyPolicy || {
                                label: 'Privacy Policy',
                                href: '',
                                autoDetect: true
                              },
                              termsAndConditions: config.bottomSection?.termsAndConditions || {
                                label: 'Terms & Conditions',
                                href: '',
                                autoDetect: true
                              },
                              copyright: e.target.value
                            }
                          });
                        }}
                      />
                      <Form.Text className="text-muted">
                        Use {`{year}`} to automatically insert current year
                      </Form.Text>
                    </Form.Group>
                  </CardBody>
                </Card>
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
