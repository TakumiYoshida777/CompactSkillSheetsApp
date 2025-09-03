/**
 * テンプレート関連の型定義
 */

export interface OfferTemplate {
  id: string
  name: string
  subject: string
  body: string
  category?: string
  tags?: string[]
  isActive: boolean
  usageCount?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface CreateOfferTemplateDto {
  name: string
  subject: string
  body: string
  category?: string
  tags?: string[]
  isActive?: boolean
}

export interface UpdateOfferTemplateDto extends Partial<CreateOfferTemplateDto> {}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  type: 'offer' | 'reminder' | 'notification' | 'welcome'
  variables?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MessageTemplate {
  id: string
  name: string
  content: string
  type: 'sms' | 'push' | 'in-app'
  isActive: boolean
  createdAt: string
  updatedAt: string
}