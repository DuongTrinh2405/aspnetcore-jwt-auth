import { api } from './api'
import type { LoginRequest, LoginResponse } from '../types/auth'

const TOKEN_KEY = 'auth_token'
const EXPIRED_KEY = 'auth_expired'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/account/login', payload)
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(EXPIRED_KEY, data.expired)
  return data
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRED_KEY)
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem(TOKEN_KEY)
  return Boolean(token)
}
