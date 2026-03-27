import { api } from './api'
import type { CreateDealRequest, Deal } from '../types/deal'

export async function getDeals(): Promise<Deal[]> {
  const { data } = await api.get<Deal[]>('/api/deals')
  return data
}

export async function createDeal(payload: CreateDealRequest): Promise<Deal> {
  const { data } = await api.post<Deal>('/api/deals', payload)
  return data
}
