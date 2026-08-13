export const ROLES = ['student', 'lecturer', 'maintenance', 'manager', 'admin', 'super_admin'] as const
export const PRIORITIES = ['low', 'medium', 'high', 'critical', 'emergency'] as const
export const STATUSES = [
  'reported',
  'ai_analysis',
  'verified',
  'assigned',
  'acknowledged',
  'in_progress',
  'awaiting_parts',
  'resolved',
  'user_verification',
  'closed',
  'rejected',
  'reopened',
  'escalated',
  'cancelled',
] as const

export const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'ICT/Internet',
  'Classroom',
  'Laboratory',
  'Furniture',
  'Building/Infrastructure',
  'Cleaning',
  'Waste Management',
  'Hostel',
  'Security',
  'Transportation',
  'Roads/Walkways',
  'Lighting',
  'Air Conditioning',
  'Library',
  'Laboratory Equipment',
  'Other',
] as const

export const DEPARTMENTS = [
  'Electrical Unit',
  'Facilities & Maintenance',
  'ICT Support',
  'Environmental Health',
  'Campus Security',
  'Transport Unit',
  'Library Services',
  'Laboratory Services',
] as const

export type Role = (typeof ROLES)[number]
export type Priority = (typeof PRIORITIES)[number]
export type IssueStatus = (typeof STATUSES)[number]
export type Category = (typeof CATEGORIES)[number]
export type Department = (typeof DEPARTMENTS)[number]
export type PageKey = 'dashboard' | 'report' | 'issues' | 'map' | 'notifications' | 'assistant' | 'analytics' | 'maintenance' | 'administration' | 'audit' | 'profile'

export interface AppUser {
  id: string
  email: string
  fullName: string
  role: Role
  department?: Department
  active: boolean
}

export interface ManagedUserInput {
  fullName: string
  email: string
  role: Role
  department?: Department
  active: boolean
  password?: string
}

export interface LocationInput {
  campus: string
  building: string
  floor: string
  room: string
  gps?: string
}

export interface AIAnalysis {
  category: Category
  issueType: string
  severity: Priority
  recommendedPriority: Priority
  department: Department
  suggestedAction: string
  summary: string
  safetyRisk: boolean
  confidence: number
  detectedLocation?: string
  reasons: string[]
  provider: 'CampusFix local model' | 'External AI provider'
  analyzedAt: string
}

export interface ImageAnalysis {
  detectedProblem: string
  category: Category
  severity: Priority
  department: Department
  safetyRisk: boolean
  confidence: number
  note: string
}

export interface Attachment {
  id: string
  name: string
  mediaType: string
  size: number
  purpose: 'evidence' | 'before' | 'after'
  imageAnalysis?: ImageAnalysis
}

export interface Comment {
  id: string
  userId: string
  userName: string
  role: Role
  message: string
  createdAt: string
}

export interface AuditEvent {
  id: string
  issueId: string
  actorId: string
  actorName: string
  action: string
  previousValue?: string
  newValue?: string
  note?: string
  createdAt: string
}

export interface Issue {
  id: string
  reference: string
  title: string
  description: string
  aiSummary: string
  category: Category
  subcategory: string
  location: LocationInput
  priority: Priority
  status: IssueStatus
  department: Department
  assignee?: string
  reporterId: string
  reporterName: string
  affectedUsers: number
  followerIds: string[]
  createdAt: string
  updatedAt: string
  slaDueAt: string
  slaBreached: boolean
  aiAnalysis: AIAnalysis
  attachments: Attachment[]
  comments: Comment[]
  rating?: number
  feedback?: string
  resolutionNote?: string
}

export interface IssueInput {
  title: string
  description: string
  category: Category
  subcategory: string
  location: LocationInput
  priority: Priority
  department: Department
  aiAnalysis: AIAnalysis
  attachments: Attachment[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  issueId?: string
  read: boolean
  createdAt: string
}

export interface DuplicateMatch {
  issue: Issue
  score: number
  reasons: string[]
}

export interface TrendInsight {
  title: string
  detail: string
  tone: 'positive' | 'warning' | 'neutral'
}
