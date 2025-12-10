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
      url: '/dashboard/analytics',
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

