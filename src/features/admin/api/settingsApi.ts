import httpClient from '@/helpers/httpClient';

/**
 * Settings API Service
 * Handles settings-related API calls for admin
 */

export interface DeliveryChargeSettings {
  outsideDhaka: number;
  insideDhaka: number;
  subDhaka: number;
  shippingFreeRequiredAmount: number;
}

export interface DeliveryChargeSettingsResponse {
  success: boolean;
  data: DeliveryChargeSettings;
  message: string;
}

/**
 * Get delivery charge settings
 */
export const getDeliveryChargeSettings = async (): Promise<DeliveryChargeSettingsResponse> => {
  try {
    const response = await httpClient.get('/settings/delivery-charge');
    return {
      success: response.data.success,
      data: response.data.data || {
        outsideDhaka: 150,
        insideDhaka: 80,
        subDhaka: 120,
        shippingFreeRequiredAmount: 1500,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error fetching delivery charge settings:', error);
    return {
      success: false,
      data: {
        outsideDhaka: 150,
        insideDhaka: 80,
        subDhaka: 120,
        shippingFreeRequiredAmount: 1500,
      },
      message: error.response?.data?.message || error.message || 'Failed to fetch delivery charge settings',
    };
  }
};

/**
 * Update delivery charge settings
 */
export interface UpdateDeliveryChargeSettingsRequest {
  outsideDhaka?: number;
  insideDhaka?: number;
  subDhaka?: number;
  shippingFreeRequiredAmount?: number;
}

export const updateDeliveryChargeSettings = async (
  settingsData: UpdateDeliveryChargeSettingsRequest
): Promise<DeliveryChargeSettingsResponse> => {
  try {
    const response = await httpClient.put('/settings/delivery-charge', settingsData);
    return {
      success: response.data.success,
      data: response.data.data || {
        outsideDhaka: 150,
        insideDhaka: 80,
        subDhaka: 120,
        shippingFreeRequiredAmount: 1500,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating delivery charge settings:', error);
    throw {
      success: false,
      data: {
        outsideDhaka: 150,
        insideDhaka: 80,
        subDhaka: 120,
        shippingFreeRequiredAmount: 1500,
      },
      message: error.response?.data?.message || error.message || 'Failed to update delivery charge settings',
    };
  }
};
