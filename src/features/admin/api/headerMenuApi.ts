import httpClient from '@/helpers/httpClient';
import { Category } from './categoryApi';

/**
 * Header Menu API Service
 * Handles header menu configuration API calls
 */

export interface MenuCategory {
  categoryId: string | Category;
  order: number;
}

export interface StaticMenuItem {
  name: string;
  href: string;
  order: number;
  isActive: boolean;
}

export interface ManualSubmenuItem {
  name: string;
  href: string;
  target?: '_self' | '_blank';
  order: number;
  isActive: boolean;
}

export interface ManualMenuItem {
  name: string;
  href: string;
  target?: '_self' | '_blank';
  order: number;
  isActive: boolean;
  submenus?: ManualSubmenuItem[];
}

export interface HeaderMenuConfig {
  _id?: string;
  menuType?: 'default' | 'custom';
  menuCategories: MenuCategory[];
  manualMenuItems?: ManualMenuItem[];
  showShopMenu: boolean;
  staticMenuItems: StaticMenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HeaderMenuConfigResponse {
  success: boolean;
  data: HeaderMenuConfig;
  message: string;
}

export interface HeaderMenuPublicResponse {
  success: boolean;
  data: {
    menuItems: Array<{
      type: 'static' | 'category';
      name: string;
      href: string;
      order: number;
      slug?: string;
      categoryId?: string;
      children?: Category[];
    }>;
    showShopMenu: boolean;
    menuType: string;
  };
  message: string;
}

/**
 * Get header menu configuration (admin)
 */
export const getHeaderMenuConfig = async (): Promise<HeaderMenuConfigResponse> => {
  try {
    const response = await httpClient.get('/header-menu/admin');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error fetching header menu config:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      data: {
        menuType: 'default',
        menuCategories: [],
        manualMenuItems: [],
        showShopMenu: true,
        staticMenuItems: []
      },
      message: err.response?.data?.message || err.message || 'Failed to fetch header menu config',
    };
  }
};

/**
 * Update header menu configuration
 */
export const updateHeaderMenuConfig = async (
  config: Partial<HeaderMenuConfig>
): Promise<HeaderMenuConfigResponse> => {
  try {
    const response = await httpClient.put('/header-menu/admin', config);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error updating header menu config:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      data: {
        menuType: 'default',
        menuCategories: [],
        manualMenuItems: [],
        showShopMenu: true,
        staticMenuItems: []
      },
      message: err.response?.data?.message || err.message || 'Failed to update header menu config',
    };
  }
};

/**
 * Update menu order
 */
export const updateMenuOrder = async (
  menuCategories: MenuCategory[]
): Promise<HeaderMenuConfigResponse> => {
  try {
    const response = await httpClient.put('/header-menu/admin/order', { menuCategories });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error updating menu order:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      data: {
        menuType: 'default',
        menuCategories: [],
        manualMenuItems: [],
        showShopMenu: true,
        staticMenuItems: []
      },
      message: err.response?.data?.message || err.message || 'Failed to update menu order',
    };
  }
};
