import httpClient from '@/helpers/httpClient';

export interface FooterColumnItem {
  label: string;
  href: string;
  target?: '_self' | '_blank';
  order: number;
  isActive: boolean;
}

export interface DynamicColumn {
  heading: string;
  items: FooterColumnItem[];
  order: number;
  isActive: boolean;
}

export interface SupportColumn {
  heading: string;
  items: FooterColumnItem[];
  isActive: boolean;
}

export interface CompanyInfoColumn {
  heading: string;
  items: FooterColumnItem[];
  isActive: boolean;
}

export interface SocialLink {
  platform: string;
  href: string;
  iconClass: string;
  order: number;
  isActive: boolean;
}

export interface FollowUsColumn {
  heading: string;
  socialLinks: SocialLink[];
  isActive: boolean;
}

export interface FooterConfig {
  _id?: string;
  dynamicColumns: DynamicColumn[];
  supportColumn: SupportColumn;
  companyInfoColumn: CompanyInfoColumn;
  followUsColumn: FollowUsColumn;
  createdAt?: string;
  updatedAt?: string;
}

export interface FooterConfigResponse {
  success: boolean;
  data: FooterConfig;
  message: string;
}

export const getFooterConfig = async (): Promise<FooterConfigResponse> => {
  try {
    const response = await httpClient.get('/footer/admin');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error fetching footer config:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      data: {
        dynamicColumns: [],
        supportColumn: {
          heading: 'SUPPORT',
          items: [],
          isActive: true
        },
        companyInfoColumn: {
          heading: 'COMPANY INFO',
          items: [],
          isActive: true
        },
        followUsColumn: {
          heading: 'FOLLOW US',
          socialLinks: [],
          isActive: true
        }
      },
      message: err.response?.data?.message || err.message || 'Failed to fetch footer config',
    };
  }
};

export const updateFooterConfig = async (
  config: Partial<FooterConfig>
): Promise<FooterConfigResponse> => {
  try {
    const response = await httpClient.put('/footer/admin', config);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error('Error updating footer config:', error);
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      data: {
        dynamicColumns: [],
        supportColumn: {
          heading: 'SUPPORT',
          items: [],
          isActive: true
        },
        companyInfoColumn: {
          heading: 'COMPANY INFO',
          items: [],
          isActive: true
        },
        followUsColumn: {
          heading: 'FOLLOW US',
          socialLinks: [],
          isActive: true
        }
      },
      message: err.response?.data?.message || err.message || 'Failed to update footer config',
    };
  }
};
