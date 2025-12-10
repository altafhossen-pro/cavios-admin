import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import { getStockStatus } from '@/utils/other'
import { Badge } from 'react-bootstrap'

interface BackendProduct {
  _id?: string
  title?: string
  shortDescription?: string
  description?: string
  category?: {
    _id: string
    name: string
    slug?: string
  }
  subCategories?: Array<{ _id: string; name: string }>
  brand?: string
  tags?: string[]
  productType?: string
  isBracelet?: boolean
  isRing?: boolean
  braceletSizes?: string[]
  ringSizes?: string[]
  basePrice?: number
  status?: string
  isActive?: boolean
  isFeatured?: boolean
  isBestselling?: boolean
  isNewArrival?: boolean
  availableAttributes?: Array<{ name: string; values: string[] }>
  shippingInfo?: {
    weight?: number
    dimensions?: {
      length?: number
      width?: number
      height?: number
    }
    shippingClass?: string
    freeShippingEligible?: boolean
    handlingTime?: number
  }
  additionalInfo?: string
  deliveryInfo?: string
  returnPolicy?: string
  warrantyInfo?: string
  productVideos?: string[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string[]
    canonicalUrl?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
  }
  createdBy?: string
  updatedBy?: string
  variants?: Array<{
    sku?: string
    barcode?: string
    attributes?: Array<{ name: string; value: string; displayValue?: string; hexCode?: string; image?: string }>
    currentPrice?: number
    originalPrice?: number
    costPrice?: number
    salePrice?: number
    stockQuantity?: number
    lowStockThreshold?: number
    stockStatus?: string
    weight?: number
    dimensions?: {
      length?: number
      width?: number
      height?: number
    }
    images?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>
    isActive?: boolean
    availableFrom?: string
    availableUntil?: string
    _id?: string
    createdAt?: string
    updatedAt?: string
  }>
  totalStock?: number
  averageRating?: number
  totalReviews?: number
  ratingBreakdown?: {
    five?: number
    four?: number
    three?: number
    two?: number
    one?: number
  }
  specifications?: Array<{ key: string; value: string; group?: string }>
  totalSold?: number
  slug?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

const ProductDetailView = ({ product }: { product: BackendProduct }) => {
  // Calculate total stock from variants
  const variants = product.variants || []
  const totalVariantStock = variants.reduce((sum: number, variant) => {
    return sum + (variant.stockQuantity || 0)
  }, 0)
  const calculatedStock = variants.length > 0 ? totalVariantStock : (product.totalStock || 0)
  const stockStatus = getStockStatus(calculatedStock)

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="ps-xl-3 mt-3 mt-xl-0">
      {/* Product Title */}
      <h4 className="mb-3">{product.title || 'N/A'}</h4>

      {/* Status Badges */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <Badge bg={product.status === 'published' ? 'success' : product.status === 'draft' ? 'warning' : 'secondary'}>
          {product.status || 'N/A'}
        </Badge>
        {product.isActive && <Badge bg="info">Active</Badge>}
        {product.isFeatured && <Badge bg="primary">Featured</Badge>}
        {product.isBestselling && <Badge bg="danger">Bestselling</Badge>}
        {product.isNewArrival && <Badge bg="success">New Arrival</Badge>}
      </div>

      {/* Rating */}
      {product.averageRating !== undefined && product.averageRating > 0 && (
        <div className="mb-3">
          <p className="text-muted gap-1 d-flex align-items-center mb-2">
            {Array.from(new Array(Math.floor(product.averageRating))).map((_val, idx) => (
              <IconifyIcon icon="fa6-solid:star" width={14} height={14} key={idx} className="text-warning" />
            ))}
            {!Number.isInteger(product.averageRating) && (
              <IconifyIcon icon="fa6-solid:star-half-stroke" width={14} height={14} className="text-warning" />
            )}
            {product.averageRating < 5 &&
              Array.from(new Array(5 - Math.ceil(product.averageRating))).map((_val, idx) => (
                <IconifyIcon icon="fa6-solid:star" key={idx} width={14} height={14} className="text-muted" />
              ))}
            <span className="ms-2">
              <strong>{product.averageRating.toFixed(1)}</strong> ({product.totalReviews || 0} reviews)
            </span>
          </p>
        </div>
      )}

      {/* Basic Information */}
      <div className="mb-3 pb-3 border-bottom">
        <h5 className="mb-3">Basic Information</h5>
        <div className="row g-2">
          <div className="col-md-6">
            <strong>Category:</strong> {product.category?.name || 'N/A'}
          </div>
          {product.subCategories && product.subCategories.length > 0 && (
            <div className="col-md-6">
              <strong>Sub Categories:</strong>
              <div className="mt-1">
                {product.subCategories.map((subCat, idx) => (
                  <Badge key={idx} bg="secondary" className="me-1">
                    {subCat.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="col-md-6">
            <strong>Brand:</strong> {product.brand || 'N/A'}
          </div>
          <div className="col-md-6">
            <strong>Product Type:</strong> {product.productType || 'N/A'}
          </div>
          {product.basePrice && (
            <div className="col-md-6">
              <strong>Base Price:</strong> {currency}{product.basePrice.toLocaleString('en-US')}
            </div>
          )}
          <div className="col-md-6">
            <strong>Slug:</strong> {product.slug || 'N/A'}
          </div>
          {(product.isBracelet || product.isRing) && (
            <div className="col-md-6">
              <strong>Jewelry Type:</strong>
              {product.isBracelet && <Badge bg="info" className="ms-1">Bracelet</Badge>}
              {product.isRing && <Badge bg="info" className="ms-1">Ring</Badge>}
            </div>
          )}
          {product.braceletSizes && product.braceletSizes.length > 0 && (
            <div className="col-md-6">
              <strong>Bracelet Sizes:</strong>
              <div className="mt-1">
                {product.braceletSizes.map((size, idx) => (
                  <Badge key={idx} bg="light" text="dark" className="me-1">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {product.ringSizes && product.ringSizes.length > 0 && (
            <div className="col-md-6">
              <strong>Ring Sizes:</strong>
              <div className="mt-1">
                {product.ringSizes.map((size, idx) => (
                  <Badge key={idx} bg="light" text="dark" className="me-1">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="col-md-6">
            <strong>Stock Status:</strong>{' '}
            <span className={`badge badge-soft-${stockStatus.variant}`}>{stockStatus.text}</span>
          </div>
          
        </div>
      </div>


      {/* Short Description */}
      {product.shortDescription && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Short Description</h5>
          <p className="text-muted">{product.shortDescription}</p>
        </div>
      )}

      {/* Full Description */}
      {product.description && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Description</h5>
          <p className="text-muted">{product.description}</p>
        </div>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Tags</h5>
          <div className="d-flex flex-wrap gap-2">
            {product.tags.map((tag, idx) => (
              <Badge key={idx} bg="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">Variants ({variants.length})</h5>
          <div className="row g-3">
            {variants.map((variant, idx) => {
              const variantStockStatus = getStockStatus(variant.stockQuantity || 0)
              return (
                <div key={variant._id || idx} className="col-12">
                  <div className="card border">
                    <div className="card-body">
                      <div className="row">
                        {/* Variant Images */}
                        {variant.images && variant.images.length > 0 && (
                          <div className="col-md-3 mb-3 mb-md-0">
                            <h6 className="small mb-2">Variant Images</h6>
                            <div className="d-flex flex-wrap gap-2">
                              {variant.images.map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img.url}
                                  alt={img.altText || `Variant ${idx + 1} Image ${imgIdx + 1}`}
                                  className="rounded border"
                                  style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                  onClick={() => window.open(img.url, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Variant Details */}
                        <div className={variant.images && variant.images.length > 0 ? 'col-md-9' : 'col-12'}>
                          <div className="row g-2">
                            <div className="col-md-6">
                              <strong>SKU:</strong> {variant.sku || 'N/A'}
                            </div>
                            {variant.barcode && (
                              <div className="col-md-6">
                                <strong>Barcode:</strong> {variant.barcode}
                              </div>
                            )}
                            
                            {/* Attributes */}
                            {variant.attributes && variant.attributes.length > 0 && (
                              <div className="col-12">
                                <strong>Attributes:</strong>
                                <div className="mt-1">
                                  {variant.attributes.map((attr, attrIdx) => (
                                    <span key={attrIdx} className="badge bg-light text-dark me-1 mb-1">
                                      {attr.name}: {attr.displayValue || attr.value}
                                      {attr.hexCode && (
                                        <span
                                          className="ms-1 d-inline-block"
                                          style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: attr.hexCode,
                                            border: '1px solid #ddd',
                                            borderRadius: '2px',
                                            verticalAlign: 'middle',
                                          }}
                                          title={attr.hexCode}
                                        />
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Price Information */}
                            <div className="col-md-6">
                              <strong>Price:</strong>
                              <div>
                                <strong className="text-primary">
                                  {currency}{variant.currentPrice?.toLocaleString('en-US') || '0'}
                                </strong>
                                {variant.originalPrice && variant.originalPrice > (variant.currentPrice || 0) && (
                                  <div>
                                    <small className="text-muted">
                                      <del>{currency}{variant.originalPrice.toLocaleString('en-US')}</del>
                                    </small>
                                    <span className="badge bg-danger ms-2">
                                      {Math.round(((variant.originalPrice - (variant.currentPrice || 0)) / variant.originalPrice) * 100)}% OFF
                                    </span>
                                  </div>
                                )}
                              </div>
                              {variant.costPrice && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    Cost: {currency}{variant.costPrice.toLocaleString('en-US')}
                                  </small>
                                </div>
                              )}
                              {variant.salePrice && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    Sale: {currency}{variant.salePrice.toLocaleString('en-US')}
                                  </small>
                                </div>
                              )}
                            </div>

                            {/* Stock Information */}
                            <div className="col-md-6">
                              <strong>Stock:</strong>
                              <div>
                                <span className={`badge badge-soft-${variantStockStatus.variant}`}>
                                  {variantStockStatus.text} ({variant.stockQuantity || 0})
                                </span>
                              </div>
                              {variant.lowStockThreshold !== undefined && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    Low Stock Threshold: {variant.lowStockThreshold}
                                  </small>
                                </div>
                              )}
                              {variant.stockStatus && (
                                <div className="mt-1">
                                  <Badge bg={variant.stockStatus === 'in_stock' ? 'success' : variant.stockStatus === 'out_of_stock' ? 'danger' : 'warning'}>
                                    {variant.stockStatus.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Dimensions & Weight */}
                            {(variant.weight || variant.dimensions) && (
                              <div className="col-12">
                                <strong>Physical Details:</strong>
                                <div className="mt-1">
                                  {variant.weight && (
                                    <span className="me-3">
                                      <small>Weight: {variant.weight} kg</small>
                                    </span>
                                  )}
                                  {variant.dimensions && (
                                    <span>
                                      <small>
                                        Dimensions: {variant.dimensions.length || 0} × {variant.dimensions.width || 0} × {variant.dimensions.height || 0} cm
                                      </small>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Availability Dates */}
                            {(variant.availableFrom || variant.availableUntil) && (
                              <div className="col-12">
                                <strong>Availability:</strong>
                                <div className="mt-1">
                                  {variant.availableFrom && (
                                    <div>
                                      <small>From: {formatDate(variant.availableFrom)}</small>
                                    </div>
                                  )}
                                  {variant.availableUntil && (
                                    <div>
                                      <small>Until: {formatDate(variant.availableUntil)}</small>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status */}
                            <div className="col-12">
                              <Badge bg={variant.isActive ? 'success' : 'secondary'}>
                                {variant.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">Specifications</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <tbody>
                {product.specifications.map((spec, idx) => (
                  <tr key={idx}>
                    <td style={{ width: '30%' }}>
                      <strong>{spec.key}</strong>
                    </td>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rating Breakdown */}
      {product.ratingBreakdown && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">Rating Breakdown</h5>
          <div>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = product.ratingBreakdown?.[rating === 5 ? 'five' : rating === 4 ? 'four' : rating === 3 ? 'three' : rating === 2 ? 'two' : 'one'] || 0
              return (
                <div key={rating} className="d-flex align-items-center mb-2">
                  <span className="me-2">{rating} Star:</span>
                  <div className="flex-grow-1">
                    <div className="progress" style={{ height: '20px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${product.totalReviews ? (count / product.totalReviews) * 100 : 0}%`,
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                  <span className="ms-2">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Attributes */}
      {product.availableAttributes && product.availableAttributes.length > 0 && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">Available Attributes</h5>
          <div className="row g-2">
            {product.availableAttributes.map((attr, idx) => (
              <div key={idx} className="col-md-6">
                <strong>{attr.name}:</strong>
                <div className="mt-1">
                  {attr.values.map((value, valIdx) => (
                    <Badge key={valIdx} bg="light" text="dark" className="me-1">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Information */}
      {product.shippingInfo && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">Shipping Information</h5>
          <div className="row g-2">
            {product.shippingInfo.weight && (
              <div className="col-md-6">
                <strong>Weight:</strong> {product.shippingInfo.weight} kg
              </div>
            )}
            {product.shippingInfo.dimensions && (
              <div className="col-md-6">
                <strong>Dimensions:</strong> {product.shippingInfo.dimensions.length || 0} × {product.shippingInfo.dimensions.width || 0} × {product.shippingInfo.dimensions.height || 0} cm
              </div>
            )}
            {product.shippingInfo.shippingClass && (
              <div className="col-md-6">
                <strong>Shipping Class:</strong> {product.shippingInfo.shippingClass}
              </div>
            )}
            {product.shippingInfo.freeShippingEligible !== undefined && (
              <div className="col-md-6">
                <strong>Free Shipping:</strong>{' '}
                <Badge bg={product.shippingInfo.freeShippingEligible ? 'success' : 'secondary'}>
                  {product.shippingInfo.freeShippingEligible ? 'Yes' : 'No'}
                </Badge>
              </div>
            )}
            {product.shippingInfo.handlingTime !== undefined && (
              <div className="col-md-6">
                <strong>Handling Time:</strong> {product.shippingInfo.handlingTime} day(s)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {product.additionalInfo && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Additional Information</h5>
          <p className="text-muted">{product.additionalInfo}</p>
        </div>
      )}

      {/* Delivery Information */}
      {product.deliveryInfo && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Delivery Information</h5>
          <p className="text-muted">{product.deliveryInfo}</p>
        </div>
      )}

      {/* Return Policy */}
      {product.returnPolicy && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Return Policy</h5>
          <p className="text-muted">{product.returnPolicy}</p>
        </div>
      )}

      {/* Warranty Information */}
      {product.warrantyInfo && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-2">Warranty Information</h5>
          <p className="text-muted">{product.warrantyInfo}</p>
        </div>
      )}

      {/* Product Videos */}
      {product.productVideos && product.productVideos.length > 0 && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">Product Videos ({product.productVideos.length})</h5>
          <div className="row g-2">
            {product.productVideos.map((video, idx) => (
              <div key={idx} className="col-md-6">
                <div className="border rounded p-2">
                  <a href={video} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <IconifyIcon icon="bx:play-circle" className="me-2" />
                    Video {idx + 1}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Information */}
      {product.seo && (
        <div className="mb-3 pb-3 border-bottom">
          <h5 className="mb-3">SEO Information</h5>
          <div className="row g-2">
            {product.seo.metaTitle && (
              <div className="col-12">
                <strong>Meta Title:</strong> {product.seo.metaTitle}
              </div>
            )}
            {product.seo.metaDescription && (
              <div className="col-12">
                <strong>Meta Description:</strong> {product.seo.metaDescription}
              </div>
            )}
            {product.seo.metaKeywords && product.seo.metaKeywords.length > 0 && (
              <div className="col-12">
                <strong>Meta Keywords:</strong>
                <div className="mt-1">
                  {product.seo.metaKeywords.map((keyword, idx) => (
                    <Badge key={idx} bg="secondary" className="me-1">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {product.seo.canonicalUrl && (
              <div className="col-12">
                <strong>Canonical URL:</strong>{' '}
                <a href={product.seo.canonicalUrl} target="_blank" rel="noopener noreferrer">
                  {product.seo.canonicalUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="mb-3">
        <h5 className="mb-3">Timestamps</h5>
        <div className="row g-2">
          <div className="col-md-6">
            <strong>Created At:</strong> {formatDate(product.createdAt)}
          </div>
          <div className="col-md-6">
            <strong>Updated At:</strong> {formatDate(product.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailView
