interface BackendProduct {
  title?: string
  featuredImage?: string
  gallery?: Array<{ url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>
  [key: string]: unknown
}

const ProductImages = ({ product }: { product: BackendProduct }) => {
  const featuredImage = product.featuredImage
  const galleryImages = product.gallery || []
  const productName = product.title || 'Product'

  return (
    <div>
      {/* Main Featured Image */}
      {featuredImage && (
        <div className="mb-3">
          <h6 className="mb-2">Featured Image</h6>
          <img 
            src={featuredImage} 
            alt={`${productName} - Featured`} 
            className="img-fluid w-100 rounded border" 
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Gallery Images - Simple Grid Display */}
      {galleryImages.length > 0 && (
        <div>
          <h6 className="mb-2">Gallery Images ({galleryImages.length})</h6>
          <div className="row g-3">
            {galleryImages.map((galleryImg, idx) => (
              <div key={idx} className="col-12 col-md-6">
                <div className="position-relative" style={{ paddingBottom: '100%' }}>
                  <img 
                    src={galleryImg.url} 
                    alt={galleryImg.altText || `${productName} Gallery ${idx + 1}`} 
                    className="position-absolute top-0 start-0 w-100 h-100 rounded border" 
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
        ))}
          </div>
        </div>
      )}

      {!featuredImage && galleryImages.length === 0 && (
        <div className="text-center p-4 border rounded">
          <p className="text-muted">No images available</p>
        </div>
      )}
    </div>
  )
}

export default ProductImages
