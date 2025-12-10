/**
 * Product Form Data Types
 * Shared types for product creation form
 */

export interface ProductFormData {
  // Basic Information
  title: string
  shortDescription: string
  description: string
  category: string
  subCategories: string[]
  brand: string
  tags: string[]
  slug: string
  productType: 'variable' // All products use variants
  
  // Images
  featuredImage: string
  gallery: Array<{ url: string; altText: string; isPrimary: boolean; sortOrder: number }>
  
  // Pricing (for simple products)
  basePrice: number
  originalPrice: number
  costPrice: number
  
  // Inventory (for simple products)
  totalStock: number
  lowStockThreshold: number
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock' | 'pre_order'
  
  // Variants (for variable products)
  variants: Array<{
    sku: string
    attributes: Array<{ name: string; value: string; displayValue: string; hexCode: string }>
    currentPrice: number
    originalPrice: number
    weight: number
    dimensions: { length: number; width: number; height: number }
    images: Array<{ url: string; altText: string; isPrimary: boolean; sortOrder: number }>
  }>
  
  // Status & Flags
  status: 'draft' | 'published' | 'archived' | 'out_of_stock'
  isActive: boolean
  isFeatured: boolean
  isBestselling: boolean
  isNewArrival: boolean
  
  // Shipping
  shippingWeight: number
  shippingLength: number
  shippingWidth: number
  shippingHeight: number
  shippingClass: string
  freeShippingEligible: boolean
  handlingTime: number
  
  // Additional Info
  additionalInfo: string
  deliveryInfo: string
  returnPolicy: string
  warrantyInfo: string
  
  // SEO
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  
  // Specifications
  specifications: Array<{ key: string; value: string; group: string }>
  
  // Available Attributes (for variable products)
  availableAttributes: Array<{ name: string; values: string[] }>
}

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'

export interface TabComponentProps {
  register: UseFormRegister<ProductFormData>
  watch: UseFormWatch<ProductFormData>
  setValue: UseFormSetValue<ProductFormData>
  errors: FieldErrors<ProductFormData>
  categories?: unknown[]
  uploading?: boolean
  onFeaturedImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGalleryUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveGalleryImage?: (index: number) => void
}

