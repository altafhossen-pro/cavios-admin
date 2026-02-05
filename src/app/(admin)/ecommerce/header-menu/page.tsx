'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Form, Table, Badge, FormCheck, Nav, Modal } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Preloader from '@/components/Preloader';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getHeaderMenuConfig, updateHeaderMenuConfig, HeaderMenuConfig, MenuCategory, ManualMenuItem } from '@/features/admin/api/headerMenuApi';
import { getCategories, Category } from '@/features/admin/api/categoryApi';
import { toast } from 'react-toastify';

interface MenuItem {
  type: 'category' | 'manual';
  id: string;
  name: string;
  href?: string;
  target?: '_self' | '_blank';
  order: number;
}

const HeaderMenuPage = () => {
  const [config, setConfig] = useState<HeaderMenuConfig | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [manualMenuItems, setManualMenuItems] = useState<ManualMenuItem[]>([]);
  const [menuItemOrder, setMenuItemOrder] = useState<Array<{ type: 'category' | 'manual', id: string }>>([]);
  const [manualItemIdCounter, setManualItemIdCounter] = useState(0);
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default');
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingManualItem, setEditingManualItem] = useState<ManualMenuItem | null>(null);
  const [manualForm, setManualForm] = useState({ name: '', href: '', target: '_self' as '_self' | '_blank' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (config) {
      setActiveTab(config.menuType || 'default');
      if (config.menuType === 'custom') {
        const selected = config.menuCategories.map(
          (item) => typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id
        );
        setSelectedCategories(selected);
        setManualMenuItems(config.manualMenuItems || []);
        
        // Build order array
        const allItems: Array<{ type: 'category' | 'manual', id: string, order: number }> = [];
        config.menuCategories.forEach((cat) => {
          const catId = typeof cat.categoryId === 'string' ? cat.categoryId : cat.categoryId._id;
          allItems.push({ type: 'category', id: catId, order: cat.order });
        });
        (config.manualMenuItems || []).forEach((item, index) => {
          allItems.push({ type: 'manual', id: `manual-${item.order}-${index}`, order: item.order });
        });
        setManualItemIdCounter((config.manualMenuItems || []).length);
        allItems.sort((a, b) => a.order - b.order);
        setMenuItemOrder(allItems.map(item => ({ type: item.type, id: item.id })));
      }
    }
  }, [config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configResponse, categoriesResponse] = await Promise.all([
        getHeaderMenuConfig(),
        getCategories({ limit: 1000, isActive: true, parent: null })
      ]);

      if (configResponse.success) {
        setConfig(configResponse.data);
        if (configResponse.data.menuType === 'custom') {
          const selected = configResponse.data.menuCategories.map(
            (item) => typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id
          );
          setSelectedCategories(selected);
          setManualMenuItems(configResponse.data.manualMenuItems || []);
          
          // Build order array
          const allItems: Array<{ type: 'category' | 'manual', id: string, order: number }> = [];
          configResponse.data.menuCategories.forEach((cat) => {
            const catId = typeof cat.categoryId === 'string' ? cat.categoryId : cat.categoryId._id;
            allItems.push({ type: 'category', id: catId, order: cat.order });
          });
          (configResponse.data.manualMenuItems || []).forEach((item, index) => {
            allItems.push({ type: 'manual', id: `manual-${item.order}-${index}`, order: item.order });
          });
          // Set counter to max index + 1
          const maxManualIndex = (configResponse.data.manualMenuItems || []).length;
          setManualItemIdCounter(maxManualIndex);
          allItems.sort((a, b) => a.order - b.order);
          setMenuItemOrder(allItems.map(item => ({ type: item.type, id: item.id })));
        }
      }

      if (categoriesResponse.success) {
        setAllCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        // Remove from order array
        setMenuItemOrder((order) => order.filter(item => !(item.type === 'category' && item.id === categoryId)));
        return prev.filter((id) => id !== categoryId);
      } else {
        // Add to order array at the end
        setMenuItemOrder((order) => [...order, { type: 'category', id: categoryId }]);
        return [...prev, categoryId];
      }
    });
  };

  const handleAddManualItem = () => {
    setEditingManualItem(null);
    setManualForm({ name: '', href: '', target: '_self' });
    setShowManualModal(true);
  };

  const handleEditManualItem = (item: ManualMenuItem, index: number) => {
    setEditingManualItem({ ...item, order: index });
    setManualForm({ name: item.name, href: item.href, target: item.target || '_self' });
    setShowManualModal(true);
  };

  const handleDeleteManualItem = (index: number) => {
    // Count how many manual items come before this one in the order
    let manualCountBefore = 0;
    menuItemOrder.forEach((orderItem) => {
      if (orderItem.type === 'manual') {
        if (manualCountBefore === index) {
          // This is the item to remove
          setMenuItemOrder((order) => order.filter(o => o.id !== orderItem.id));
        }
        manualCountBefore++;
      }
    });
    setManualMenuItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveManualItem = () => {
    if (!manualForm.name || !manualForm.href) {
      toast.error('Name and URL are required');
      return;
    }

    if (editingManualItem !== null) {
      // Update existing
      const index = editingManualItem.order;
      setManualMenuItems((prev) => {
        const updated = [...prev];
        updated[index] = {
          name: manualForm.name,
          href: manualForm.href,
          target: manualForm.target,
          order: index,
          isActive: updated[index]?.isActive ?? true
        };
        return updated;
      });
    } else {
      // Add new
      const newItem: ManualMenuItem = {
        name: manualForm.name,
        href: manualForm.href,
        target: manualForm.target,
        order: menuItemOrder.length,
        isActive: true
      };
      const newId = `manual-${manualItemIdCounter}`;
      setManualMenuItems((prev) => [...prev, newItem]);
      setMenuItemOrder((order) => [...order, { type: 'manual', id: newId }]);
      setManualItemIdCounter((prev) => prev + 1);
    }

    setShowManualModal(false);
    setEditingManualItem(null);
    setManualForm({ name: '', href: '', target: '_self' });
  };

  const getCombinedMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];
    menuItemOrder.forEach((orderItem, index) => {
      if (orderItem.type === 'category') {
        const category = allCategories.find(cat => cat._id === orderItem.id);
        if (category) {
          items.push({
            type: 'category',
            id: orderItem.id,
            name: category.name,
            order: index
          });
        }
      } else {
        // Find manual item by position - count manual items before this one
        const manualItemsBefore = menuItemOrder.slice(0, index).filter(o => o.type === 'manual').length;
        const manualItem = manualMenuItems[manualItemsBefore];
        if (manualItem) {
          items.push({
            type: 'manual',
            id: orderItem.id,
            name: manualItem.name,
            href: manualItem.href,
            target: manualItem.target,
            order: index
          });
        }
      }
    });
    return items;
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setMenuItemOrder((order) => {
      const newOrder = [...order];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === menuItemOrder.length - 1) return;
    setMenuItemOrder((order) => {
      const newOrder = [...order];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  const handleTabChange = async (tab: 'default' | 'custom') => {
    if (saving) return;
    
    try {
      setSaving(true);
      const menuCategories: MenuCategory[] = tab === 'custom' 
        ? selectedCategories.map((categoryId, index) => ({
            categoryId,
            order: index
          }))
        : [];

      const response = await updateHeaderMenuConfig({
        menuType: tab,
        menuCategories,
        manualMenuItems: tab === 'custom' ? manualMenuItems : [],
        showShopMenu: config?.showShopMenu ?? true,
        staticMenuItems: config?.staticMenuItems ?? [
          { name: 'Home', href: '/', order: 0, isActive: true },
          { name: 'Shop', href: '/shop', order: 1, isActive: true },
          { name: 'Blog', href: '/blogs', order: 2, isActive: true },
          { name: 'Contact Us', href: '/contact', order: 3, isActive: true }
        ]
      });

      if (response.success) {
        setConfig(response.data);
        setActiveTab(tab);
        toast.success(`Switched to ${tab === 'default' ? 'default' : 'custom'} menu`);
      } else {
        toast.error(response.message || 'Failed to switch menu type');
      }
    } catch (error) {
      console.error('Error switching menu type:', error);
      toast.error('Failed to switch menu type');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Reorder items based on menuItemOrder
      const menuCategories: MenuCategory[] = [];
      const finalManualItems: ManualMenuItem[] = [];

      menuItemOrder.forEach((orderItem, index) => {
        // Ensure order is a number
        const orderValue = Number(index);
        
        if (orderItem.type === 'category') {
          menuCategories.push({
            categoryId: orderItem.id,
            order: orderValue
          });
        } else {
          // Find manual item by position - count manual items before this one
          let manualCount = 0;
          const currentIndex = menuItemOrder.indexOf(orderItem);
          for (let i = 0; i < currentIndex; i++) {
            if (menuItemOrder[i].type === 'manual') manualCount++;
          }
          const originalItem = manualMenuItems[manualCount];
          if (originalItem) {
            finalManualItems.push({
              name: originalItem.name,
              href: originalItem.href,
              target: originalItem.target || '_self',
              order: orderValue,  // Use the current index as order (0, 1, 2, etc.)
              isActive: originalItem.isActive !== false
            });
          }
        }
      });

      const response = await updateHeaderMenuConfig({
        menuType: activeTab,
        menuCategories: activeTab === 'custom' ? menuCategories : [],
        manualMenuItems: activeTab === 'custom' ? finalManualItems : [],
        showShopMenu: config?.showShopMenu ?? true,
        staticMenuItems: config?.staticMenuItems ?? [
          { name: 'Home', href: '/', order: 0, isActive: true },
          { name: 'Shop', href: '/shop', order: 1, isActive: true },
          { name: 'Blog', href: '/blogs', order: 2, isActive: true },
          { name: 'Contact Us', href: '/contact', order: 3, isActive: true }
        ]
      });

      if (response.success) {
        toast.success('Header menu updated successfully');
        setConfig(response.data);
      } else {
        toast.error(response.message || 'Failed to update header menu');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleShopMenuToggle = async (enabled: boolean) => {
    try {
      setSaving(true);
      const response = await updateHeaderMenuConfig({
        menuType: config?.menuType || 'default',
        menuCategories: config?.menuCategories ?? [],
        manualMenuItems: config?.manualMenuItems ?? [],
        showShopMenu: enabled,
        staticMenuItems: config?.staticMenuItems ?? []
      });

      if (response.success) {
        toast.success(`Shop menu ${enabled ? 'enabled' : 'disabled'}`);
        setConfig(response.data);
      } else {
        toast.error(response.message || 'Failed to update shop menu');
      }
    } catch (error) {
      console.error('Error updating shop menu:', error);
      toast.error('Failed to update shop menu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadcrumb title="Header Menu" subName="Ecommerce" />
        <PageMetaData title="Header Menu" />
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

  const defaultMenuItems = config?.staticMenuItems || [
    { name: 'Home', href: '/', order: 0, isActive: true },
    { name: 'Shop', href: '/shop', order: 1, isActive: true },
    { name: 'Blog', href: '/blogs', order: 2, isActive: true },
    { name: 'Contact Us', href: '/contact', order: 3, isActive: true }
  ];

  const combinedMenuItems = getCombinedMenuItems();

  return (
    <>
      <PageBreadcrumb title="Header Menu" subName="Ecommerce" />
      <PageMetaData title="Header Menu" />

      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Shop Menu</h5>
            <FormCheck
              type="switch"
              id="shop-menu-toggle"
              label={config?.showShopMenu ? 'Enabled' : 'Disabled'}
              checked={config?.showShopMenu ?? true}
              onChange={(e) => handleShopMenuToggle(e.target.checked)}
              disabled={saving}
            />
          </div>
          <p className="text-muted small mb-0">
            When enabled, the Shop menu will show all categories in a dropdown. This works for both Default and Custom menu types.
          </p>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardBody>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => k && handleTabChange(k as 'default' | 'custom')}>
            <Nav.Item>
              <Nav.Link eventKey="default" disabled={saving}>
                Default Menu
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="custom" disabled={saving}>
                Custom Menu
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <div className="mt-4">
            {activeTab === 'default' ? (
              <div>
                <h5 className="mb-3">Default Menu Items</h5>
                <p className="text-muted mb-4">
                  Default menu shows the standard menu items (Home, Shop, Blog, Contact Us). These items are always available.
                </p>
                <Table responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Order</th>
                      <th>Menu Item</th>
                      <th>URL</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultMenuItems
                      .sort((a, b) => a.order - b.order)
                      .map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Badge bg="secondary">{item.order + 1}</Badge>
                          </td>
                          <td>{item.name}</td>
                          <td><code>{item.href}</code></td>
                          <td>
                            <Badge bg={item.isActive ? 'success' : 'secondary'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Custom Menu Items</h5>
                  <Button variant="primary" size="sm" onClick={handleAddManualItem}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Manual Menu Item
                  </Button>
                </div>
                <p className="text-muted mb-4">
                  Select categories and add manual menu items. You can reorder them together.
                </p>

                <Card className="mb-4">
                  <CardBody>
                    <h6 className="mb-3">Select Categories</h6>
                    <div className="row">
                      {allCategories.map((category) => (
                        <div key={category._id} className="col-md-4 mb-3">
                          <FormCheck
                            type="checkbox"
                            id={`category-${category._id}`}
                            label={category.name}
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryToggle(category._id)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Menu Order</h5>
                  <Badge bg="primary">
                    {combinedMenuItems.length} items ({selectedCategories.length} categories, {manualMenuItems.length} manual)
                  </Badge>
                </div>
                
                {combinedMenuItems.length === 0 ? (
                  <p className="text-muted">No items selected. Select categories or add manual menu items above.</p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>Order</th>
                        <th>Type</th>
                        <th>Name</th>
                        <th>URL/Target</th>
                        <th style={{ width: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedMenuItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>
                            <Badge bg="secondary">{index + 1}</Badge>
                          </td>
                          <td>
                            <Badge bg={item.type === 'category' ? 'info' : 'warning'}>
                              {item.type === 'category' ? 'Category' : 'Manual'}
                            </Badge>
                          </td>
                          <td>{item.name}</td>
                          <td>
                            {item.type === 'manual' ? (
                              <>
                                <code>{item.href}</code>
                                {item.target === '_blank' && (
                                  <Badge bg="secondary" className="ms-2">New Tab</Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {item.type === 'manual' && (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEditManualItem(
                                      manualMenuItems[item.order - selectedCategories.length],
                                      item.order - selectedCategories.length
                                    )}
                                  >
                                    <IconifyIcon icon="bx:edit" />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteManualItem(item.order - selectedCategories.length)}
                                  >
                                    <IconifyIcon icon="bx:trash" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                              >
                                <IconifyIcon icon="bx:up-arrow" />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === combinedMenuItems.length - 1}
                              >
                                <IconifyIcon icon="bx:down-arrow" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Manual Menu Item Modal */}
      <Modal show={showManualModal} onHide={() => setShowManualModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingManualItem ? 'Edit Manual Menu Item' : 'Add Manual Menu Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Menu Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter menu name"
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter URL (e.g., /about or https://example.com)"
                value={manualForm.href}
                onChange={(e) => setManualForm({ ...manualForm, href: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Open In</Form.Label>
              <Form.Select
                value={manualForm.target}
                onChange={(e) => setManualForm({ ...manualForm, target: e.target.value as '_self' | '_blank' })}
              >
                <option value="_self">Same Page</option>
                <option value="_blank">New Tab</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowManualModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveManualItem}>
            {editingManualItem ? 'Update' : 'Add'} Menu Item
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

export default HeaderMenuPage;
