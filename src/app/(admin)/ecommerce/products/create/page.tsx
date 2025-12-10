import { Col, Row } from 'react-bootstrap'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import NewCreateProductForm from './components/NewCreateProductForm'
import PageMetaData from '@/components/PageTitle'

const CreateProduct = () => {
  return (
    <>
      <PageBreadcrumb title="Create Product" subName="Ecommerce" />
      <PageMetaData title="Create Product" />

      <Row>
        <Col>
          <NewCreateProductForm />
        </Col>
      </Row>
    </>
  )
}

export default CreateProduct
