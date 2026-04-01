import React, { useState, useEffect } from 'react';
import { Card, CardBody, Table, Badge, Form, Pagination as BSPagination, Row, Col, Button, Dropdown } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getSubscribers, exportSubscribers, Subscriber } from '@/features/admin/api/newsletterApi';

const NewsletterSubscribersPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters.startDate, filters.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getSubscribers(pagination.page, pagination.limit, filters);
      if (response.success) {
        setSubscribers(response.data);
        if (response.pagination) {
          setPagination({ ...pagination, ...response.pagination });
        }
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchData();
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleExport = async (lastDays?: string) => {
    try {
      setExporting(true);
      const exportFilters = lastDays ? { lastDays } : filters;
      const blob = await exportSubscribers(exportFilters);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <>
      <PageMetaData title="Newsletter Subscribers" />
      <PageBreadcrumb title="Newsletter" subName="Subscribers" />
      
      <Card className="mb-3">
        <CardBody>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Label>Search Email</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Search by email..." 
                  value={filters.search} 
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Form.Label>Start Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filters.startDate} 
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Form.Label>End Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filters.endDate} 
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100">
                  <IconifyIcon icon="solar:magnifer-linear" className="me-1" /> Filter
                </Button>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">All Subscribers ({pagination.total})</h5>
            
            <Dropdown>
              <Dropdown.Toggle variant="outline-success" id="dropdown-export" disabled={exporting}>
                <IconifyIcon icon="solar:download-linear" className="me-1" /> {exporting ? 'Exporting...' : 'Export Data'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport()}>Based on Filters</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => handleExport('7')}>Last 7 Days</Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('30')}>Last 30 Days</Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('90')}>Last 90 Days</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <Table responsive hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Email Address</th>
                <th>Status</th>
                <th>Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {loading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((item, index) => (
                  <tr key={item._id}>
                    <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="fw-medium text-dark">{item.email}</td>
                    <td>
                      <Badge bg={item.isActive ? 'success' : 'danger'} pill className="px-2">
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {formatDateTime(item.createdAt)}
                    </td>
                  </tr>
                ))
              )}
              {!loading && subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">
                    <IconifyIcon icon="solar:document-outline" className="fs-1 d-block mx-auto mb-2 opacity-25" />
                    No subscribers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted small">
                Showing page {pagination.page} of {pagination.pages}
              </span>
              <BSPagination className="mb-0">
                <BSPagination.Prev disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)} />
                {[...Array(pagination.pages)].map((_, i) => (
                  <BSPagination.Item key={i + 1} active={i + 1 === pagination.page} onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </BSPagination.Item>
                ))}
                <BSPagination.Next disabled={pagination.page === pagination.pages} onClick={() => handlePageChange(pagination.page + 1)} />
              </BSPagination>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default NewsletterSubscribersPage;
