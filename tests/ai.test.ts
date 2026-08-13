import { describe, expect, it } from 'vitest'
import { analyzeIssue, answerCampusQuestion, findDuplicates, summarize } from '../src/lib/ai'
import type { Issue } from '../src/types'

describe('CampusFix AI services', () => {
  it('classifies exposed wiring as a critical electrical safety risk', () => {
    const result = analyzeIssue('Danger beside LT4', 'There is exposed electrical wiring beside the entrance of Lecture Theatre 4.')
    expect(result.category).toBe('Electrical')
    expect(result.recommendedPriority).toBe('critical')
    expect(result.department).toBe('Electrical Unit')
    expect(result.safetyRisk).toBe(true)
    expect(result.detectedLocation).toMatch(/Lecture Theatre 4/i)
  })

  it('routes projector faults to ICT Support', () => {
    const result = analyzeIssue('Projector has no display', 'The projector in Room B204 is not displaying after changing the HDMI cable.')
    expect(result.category).toBe('ICT/Internet')
    expect(result.department).toBe('ICT Support')
  })

  it('produces a concise extractive summary', () => {
    expect(summarize('I noticed the projector would not display. We replaced the cable but it still failed.')).toBe('noticed the projector would not display.')
  })

  it('finds a same-room duplicate using text and location similarity', () => {
    const analysis = analyzeIssue('Projector failure', 'The projector is not displaying in Lecture Theatre 2.')
    const existing = { id: '1', reference: 'CF-1042', title: 'Projector failure in Lecture Theatre 2', description: 'The projector does not display from any laptop.', category: 'ICT/Internet', location: { campus: 'Main Campus', building: 'Lecture Theatre Complex', floor: 'First Floor', room: 'Lecture Theatre 2' }, status: 'in_progress' } as Issue
    const matches = findDuplicates({ title: 'Projector not displaying', description: 'The projector in Lecture Theatre 2 is not showing an image.', category: analysis.category, location: existing.location }, [existing])
    expect(matches[0].issue.reference).toBe('CF-1042')
    expect(matches[0].reasons).toContain('same room')
  })

  it('grounds status answers in an issue record', () => {
    const issue = { reference: 'CF-1042', title: 'Projector failure', status: 'in_progress', priority: 'medium', department: 'ICT Support', location: { campus: 'Main Campus', building: 'LT Complex', floor: 'First Floor', room: 'LT2' }, updatedAt: new Date().toISOString() } as Issue
    const answer = answerCampusQuestion('Has CF-1042 been fixed?', [issue])
    expect(answer).toContain('currently in progress')
    expect(answer).toContain('ICT Support')
  })
})
