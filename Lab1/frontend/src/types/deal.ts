export interface Deal {
  id: number
  title: string
  amount: number
  stage: string
  status: string
  customerId: number
  propertyId?: number | null
  employeeId?: number | null
  expectedCloseDate?: string | null
  closedDate?: string | null
  notes?: string | null
  createdDate: string
  updatedDate?: string | null
}

export interface CreateDealRequest {
  title: string
  amount: number
  stage: string
  status: string
  customerId: number
  propertyId?: number | null
  employeeId?: number | null
  expectedCloseDate?: string | null
  closedDate?: string | null
  notes?: string | null
}
