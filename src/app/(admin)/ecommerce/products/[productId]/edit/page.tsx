import { Col, Row } from 'react-bootstrap'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import EditProductForm from './components/EditProductForm'
import PageMetaData from '@/components/PageTitle'

const EditProduct = () => {
  return (
    <>
      <PageBreadcrumb title="Edit Product" subName="Ecommerce" />
      <PageMetaData title="Edit Product" />

      <Row>
        <Col>
          <EditProductForm />
        </Col>
      </Row>
    </>
  )
}

export default EditProduct

