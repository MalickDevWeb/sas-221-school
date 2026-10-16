import { apiClient } from '@/shared/lib/apiClient';

export interface LoginPayload {
  email: string;
  password?: string;
  pin?: string;
}

export const loginWeb = async (payload: LoginPayload) => {
  const res = await apiClient.post('/auth/login', payload);
  return res.data;
};

export const loginToken = async (payload: LoginPayload) => {
  const res = await apiClient.post('/auth/login-token', payload);
  return res.data; // { token, role }
};

export const logout = async () => {
  const res = await apiClient.post('/auth/logout');
  return res.data;
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};
