import { Row, Col, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface NewInventoryFiltersProps {
  search: string
  stockFilter: 'all' | 'low' | 'out' | 'in'
  onSearch: (value: string) => void
  onStockFilter: (filter: 'all' | 'low' | 'out' | 'in') => void
}

const NewInventoryFilters = ({ search, stockFilter, onSearch, onStockFilter }: NewInventoryFiltersProps) => {
  return (
    <Row className="mb-3">
      <Col md={6}>
        <div className="search-bar">
          <span>
            <IconifyIcon icon="bx:search-alt" className="mb-1" />
          </span>
          <input
            type="search"
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </Col>
      <Col md={6}>
        <Form.Select
          value={stockFilter}
          onChange={(e) => onStockFilter(e.target.value as 'all' | 'low' | 'out' | 'in')}
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </Form.Select>
      </Col>
    </Row>
  )
}

export default NewInventoryFilters

