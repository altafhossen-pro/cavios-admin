import type { MenuItemType } from '@/types/menu'

/**
 * Ecommerce Dashboard Menu Items
 * Custom menu structure for ecommerce admin panel
 */
export const getNewMenuItems = (): MenuItemType[] => {
  return [
    {
      key: 'dashboard',
      icon: 'iconamoon:home-duotone',
      label: 'Dashboard',
      children: [
        // {
        //   key: 'dashboard-analytics',
        //   label: 'Analytics',
        //   url: '/dashboard/analytics',
        //   parentKey: 'dashboard',
        // },
        {
          key: 'dashboard-finance',
          label: 'Finance',
          url: '/dashboard/finance',
          parentKey: 'dashboard',
        },
        {
          key: 'dashboard-sales',
          label: 'Sales',
          url: '/dashboard/sales',
          parentKey: 'dashboard',
        },
      ],
    },
    {
      key: 'products',
      icon: 'iconamoon:shopping-bag-duotone',
      label: 'Products',
      children: [
        {
          key: 'products-list',
          label: 'All Products',
          url: '/products',
          parentKey: 'products',
        },
        {
          key: 'products-create',
          label: 'Create Product',
          url: '/products/create',
          parentKey: 'products',
        },
      ],
    },
    {
      key: 'categories',
      icon: 'iconamoon:folder-duotone',
      label: 'Categories',
      url: '/categories',
    },
    {
      key: 'orders',
      icon: 'bx:cart',
      label: 'Orders',
      children: [
        {
          key: 'orders-list',
          label: 'All Orders',
          url: '/ecommerce/orders',
          parentKey: 'orders',
        },
      ],
    },
    {
      key: 'inventory',
      icon: 'iconamoon:box-duotone',
      label: 'Inventory',
      url: '/inventory',
    },
    {
      key: 'homepage',
      icon: 'bx:home',
      label: 'Homepage',
      children: [
        {
          key: 'hero-section',
          label: 'Hero Section',
          url: '/ecommerce/hero-section',
          parentKey: 'homepage',
        },
        {
          key: 'testimonials',
          label: 'Testimonials',
          url: '/ecommerce/testimonials',
          parentKey: 'homepage',
        },
        {
          key: 'banner-collections',
          label: 'Banner Collections',
          url: '/ecommerce/banner-collections',
          parentKey: 'homepage',
        },
        {
          key: 'banner-countdowns',
          label: 'Banner Countdowns',
          url: '/ecommerce/banner-countdowns',
          parentKey: 'homepage',
        },
      ],
    },
    {
      key: 'contents',
      icon: 'bx:file',
      label: 'Contents',
      children: [
        {
          key: 'blogs',
          label: 'Blogs',
          url: '/ecommerce/blogs',
          parentKey: 'contents',
        },
          {
            key: 'comments',
            label: 'Comments',
            url: '/ecommerce/comments',
            parentKey: 'contents',
          },
          {
            key: 'static-pages',
            icon: 'bx:file',
            label: 'Static Pages',
            url: '/ecommerce/static-pages',
            parentKey: 'contents',
          },
        ],
      },
    {
      key: 'users',
      icon: 'iconamoon:profile-circle-duotone',
      label: 'Users',
      children: [
        {
          key: 'users-customers',
          label: 'All Customers',
          url: '/customers',
          parentKey: 'users',
        },
        {
          key: 'users-staff',
          label: 'All Staff',
          url: '/staff',
          parentKey: 'users',
        },
      ],
    },
  ]
}

