import { describe, expect, it } from 'vitest'
import { analyzeIssue } from '../src/lib/ai'
import { allowedTransitions, canTransition, humanize, slaHours, validateIssue } from '../src/lib/validation'
import type { IssueInput } from '../src/types'

function completeInput(): IssueInput {
  const analysis = analyzeIssue('Leaking tap in washroom', 'The tap beside the entrance has leaked continuously since this morning.')
  return {
    title: 'Leaking tap in washroom',
    description: 'The tap beside the entrance has leaked continuously since this morning.',
    category: analysis.category,
    subcategory: analysis.issueType,
    location: { campus: 'Main Campus', building: 'Science Block', floor: 'Ground Floor', room: 'Washroom G1', gps: '' },
    priority: analysis.recommendedPriority,
    department: analysis.department,
    aiAnalysis: analysis,
    attachments: [],
  }
}

describe('issue validation', () => {
  it('rejects missing and too-short actionable information', () => {
    const input = { ...completeInput(), title: 'Tap', description: 'It leaks', location: { campus: '', building: 'A', floor: '', room: '', gps: '' } }
    const errors = validateIssue(input)
    expect(errors.title).toBeDefined()
    expect(errors.description).toBeDefined()
    expect(errors.campus).toBeDefined()
    expect(errors.building).toBeDefined()
    expect(errors.room).toBeDefined()
  })

  it('accepts a complete AI-assisted report', () => expect(validateIssue(completeInput())).toEqual({}))
})

describe('controlled lifecycle', () => {
  it('allows only approved operational transitions', () => {
    expect(allowedTransitions('reported')).toEqual(['ai_analysis', 'cancelled'])
    expect(canTransition('assigned', 'acknowledged', 'maintenance')).toBe(true)
    expect(canTransition('assigned', 'resolved', 'maintenance')).toBe(false)
    expect(allowedTransitions('user_verification', 'student')).toEqual(['closed', 'reopened'])
    expect(allowedTransitions('closed')).toEqual([])
  })

  it('maps priorities to configured resolution targets', () => {
    expect(slaHours('emergency')).toBe(2)
    expect(slaHours('critical')).toBe(4)
    expect(slaHours('low')).toBe(72)
  })

  it('creates readable labels', () => expect(humanize('user_verification')).toBe('User Verification'))
})
