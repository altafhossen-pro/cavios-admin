import httpClient from '@/helpers/httpClient';

export interface NewsletterSocialIcon {
  platform: string;
  href: string;
}

export interface NewsletterSettings {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  successMessage: string;
  errorMessage: string;
  placeholder: string;
  showSocialIcons: boolean;
  socialIcons?: NewsletterSocialIcon[];
  isActive: boolean;
  forceShow: boolean;
  showInterval: 'once' | 'every_session' | 'every_reload';
}

export interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export const getNewsletterSettings = async () => {
  const response = await httpClient.get('/newsletter/settings');
  return response.data;
};

export const updateNewsletterSettings = async (data: Partial<NewsletterSettings>) => {
  const response = await httpClient.put('/newsletter/settings', data);
  return response.data;
};

export const getSubscribers = async (page = 1, limit = 10, filters: any = {}) => {
  const { search = '', startDate = '', endDate = '' } = filters;
  const response = await httpClient.get(`/newsletter/subscribers?page=${page}&limit=${limit}&search=${search}&startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const exportSubscribers = async (filters: any = {}) => {
  const { startDate = '', endDate = '', lastDays = '' } = filters;
  const response = await httpClient.get(`/newsletter/subscribers/export?startDate=${startDate}&endDate=${endDate}&lastDays=${lastDays}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const deleteSubscriber = async (id: string) => {
  const response = await httpClient.delete(`/newsletter/subscribers/${id}`);
  return response.data;
};
