import { CATEGORIES, DEPARTMENTS, PRIORITIES, type IssueInput, type IssueStatus } from '../types'

export type IssueErrors = Partial<Record<'title' | 'description' | 'campus' | 'building' | 'room' | 'category' | 'priority' | 'department', string>>

export function validateIssue(input: IssueInput): IssueErrors {
  const errors: IssueErrors = {}
  const title = input.title.trim()
  const description = input.description.trim()

  if (title.length < 5) errors.title = 'Use at least 5 characters.'
  if (title.length > 120) errors.title = 'Use no more than 120 characters.'
  if (description.length < 20) errors.description = 'Add at least 20 characters so the response team can act.'
  if (description.length > 2000) errors.description = 'Use no more than 2,000 characters.'
  if (input.location.campus.trim().length < 2) errors.campus = 'Select a campus.'
  if (input.location.building.trim().length < 2) errors.building = 'Enter a building or landmark.'
  if (input.location.room.trim().length < 1) errors.room = 'Enter a room or facility.'
  if (!CATEGORIES.includes(input.category)) errors.category = 'Select a valid category.'
  if (!PRIORITIES.includes(input.priority)) errors.priority = 'Select a valid priority.'
  if (!DEPARTMENTS.includes(input.department)) errors.department = 'Select a responsible department.'

  return errors
}

const transitions: Record<IssueStatus, IssueStatus[]> = {
  reported: ['ai_analysis', 'cancelled'],
  ai_analysis: ['verified', 'rejected', 'cancelled'],
  verified: ['assigned', 'rejected', 'escalated'],
  assigned: ['acknowledged', 'rejected', 'escalated'],
  acknowledged: ['in_progress', 'rejected', 'escalated'],
  in_progress: ['awaiting_parts', 'resolved', 'escalated'],
  awaiting_parts: ['in_progress', 'resolved', 'escalated'],
  resolved: ['user_verification', 'reopened'],
  user_verification: ['closed', 'reopened'],
  reopened: ['assigned', 'in_progress', 'escalated'],
  escalated: ['assigned', 'in_progress', 'resolved'],
  closed: [],
  rejected: ['reopened'],
  cancelled: [],
}

export function allowedTransitions(status: IssueStatus, role?: string): IssueStatus[] {
  const allowed = transitions[status]
  if (role === 'student' || role === 'lecturer') {
    if (status === 'user_verification') return ['closed', 'reopened']
    if (status === 'reported' || status === 'ai_analysis') return allowed.filter((next) => next === 'cancelled')
    return []
  }
  if (role === 'maintenance') {
    return allowed.filter((next) => ['acknowledged', 'in_progress', 'awaiting_parts', 'resolved', 'escalated'].includes(next))
  }
  return allowed
}

export function canTransition(from: IssueStatus, to: IssueStatus, role?: string): boolean {
  return allowedTransitions(from, role).includes(to)
}

export function humanize(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatLocation(location: IssueInput['location']): string {
  return [location.room, location.floor, location.building, location.campus].filter(Boolean).join(', ')
}

export function slaHours(priority: IssueInput['priority']): number {
  return { emergency: 2, critical: 4, high: 8, medium: 24, low: 72 }[priority]
}
