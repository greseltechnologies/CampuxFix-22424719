import type { AIAnalysis, Category, Department, DuplicateMatch, ImageAnalysis, Issue, Priority, TrendInsight } from '../types'
import { formatLocation } from './validation'

type CategoryRule = { category: Category; department: Department; issueType: string; words: string[]; action: string }

const RULES: CategoryRule[] = [
  { category: 'Electrical', department: 'Electrical Unit', issueType: 'Electrical fault', words: ['wire', 'wiring', 'spark', 'socket', 'electrical', 'electricity', 'shock', 'power'], action: 'Isolate the area where safe and arrange an electrical inspection.' },
  { category: 'Plumbing', department: 'Facilities & Maintenance', issueType: 'Water or plumbing fault', words: ['leak', 'water', 'pipe', 'tap', 'toilet', 'drain', 'flood'], action: 'Inspect the water source, isolate the supply if required, and repair the fault.' },
  { category: 'ICT/Internet', department: 'ICT Support', issueType: 'ICT equipment or connectivity fault', words: ['projector', 'internet', 'wifi', 'wi-fi', 'computer', 'network', 'display', 'printer', 'router'], action: 'Check power, cabling and configuration before escalating for hardware repair.' },
  { category: 'Security', department: 'Campus Security', issueType: 'Security or access risk', words: ['security', 'theft', 'intruder', 'fight', 'gate', 'unsafe', 'fire', 'smoke'], action: 'Secure the area and notify Campus Security for immediate assessment.' },
  { category: 'Lighting', department: 'Electrical Unit', issueType: 'Lighting fault', words: ['light', 'lamp', 'dark', 'bulb'], action: 'Inspect the fitting and supply, then replace or repair the failed component.' },
  { category: 'Cleaning', department: 'Environmental Health', issueType: 'Cleaning request', words: ['dirty', 'clean', 'spill', 'toilet', 'washroom'], action: 'Cordon the affected area if slippery and schedule cleaning.' },
  { category: 'Waste Management', department: 'Environmental Health', issueType: 'Waste management issue', words: ['waste', 'rubbish', 'bin', 'garbage', 'refuse'], action: 'Remove the waste and inspect whether collection frequency needs adjustment.' },
  { category: 'Furniture', department: 'Facilities & Maintenance', issueType: 'Damaged furniture', words: ['chair', 'desk', 'table', 'furniture', 'bench'], action: 'Remove unsafe furniture from use and inspect it for repair or replacement.' },
  { category: 'Air Conditioning', department: 'Facilities & Maintenance', issueType: 'Air-conditioning fault', words: ['air conditioner', 'air-conditioning', 'air conditioning', 'ac ', 'hot room'], action: 'Check power, filters and thermostat before arranging specialist service.' },
  { category: 'Roads/Walkways', department: 'Facilities & Maintenance', issueType: 'Road or walkway damage', words: ['pothole', 'walkway', 'road', 'pavement', 'trip'], action: 'Mark the hazard and schedule surface repair.' },
  { category: 'Laboratory Equipment', department: 'Laboratory Services', issueType: 'Laboratory equipment fault', words: ['microscope', 'centrifuge', 'laboratory equipment', 'lab equipment'], action: 'Stop using the equipment and request an authorised laboratory inspection.' },
  { category: 'Building/Infrastructure', department: 'Facilities & Maintenance', issueType: 'Building defect', words: ['ceiling', 'roof', 'wall', 'door', 'window', 'crack', 'stairs'], action: 'Inspect the structure, restrict access if unsafe, and schedule repair.' },
]

const HIGH_RISK = ['exposed', 'exposes', 'shock', 'spark', 'smoke', 'fire', 'collapse', 'weapon', 'gas', 'electrocution']
const URGENT = ['fire', 'major electrical', 'electrocution', 'gas leak', 'active attacker']
const ESSENTIAL = ['no water', 'power outage', 'internet down', 'blocked emergency exit']
const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'is', 'are', 'in', 'at', 'of', 'to', 'for', 'with', 'not', 'working', 'there', 'has', 'have'])

export function tokenize(value: string): string[] {
  return [...new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((word) => word.length > 2 && !STOP_WORDS.has(word)))]
}

function includesAny(text: string, words: string[]) {
  return words.filter((word) => text.includes(word))
}

export function summarize(description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim()
  const first = clean.split(/(?<=[.!?])\s+/)[0] ?? clean
  const summary = first.length <= 150 ? first : `${first.slice(0, 147).trim()}...`
  return summary.replace(/^(i |we )/i, '').replace(/^there is /i, '')
}

export function analyzeIssue(title: string, description: string, locationText = ''): AIAnalysis {
  const text = `${title} ${description} ${locationText}`.toLowerCase()
  const scored = RULES.map((rule) => ({ rule, matches: includesAny(text, rule.words) }))
    .sort((a, b) => b.matches.length - a.matches.length)
  const best = scored[0]
  const fallback: CategoryRule = { category: 'Other', department: 'Facilities & Maintenance', issueType: 'General campus service request', words: [], action: 'Verify the report and route it to the appropriate campus unit.' }
  const selected = best?.matches.length ? best.rule : fallback
  const risks = includesAny(text, HIGH_RISK)
  const emergencies = includesAny(text, URGENT)
  const essentials = includesAny(text, ESSENTIAL)
  let priority: Priority = 'medium'
  if (emergencies.length) priority = 'emergency'
  else if (risks.length) priority = 'critical'
  else if (essentials.length || /many|whole|all students|hostel|lecture theatre/.test(text)) priority = 'high'
  else if (/chair|minor|single|one light|loose/.test(text)) priority = 'low'

  const room = text.match(/(?:room|lecture theatre|lab(?:oratory)?)\s*[a-z-]*\d+/i)?.[0]
  const matchedTerms = best?.matches ?? []
  const confidence = Math.min(96, 62 + matchedTerms.length * 8 + (risks.length ? 5 : 0))
  const reasons = [
    matchedTerms.length ? `Matched ${matchedTerms.slice(0, 3).join(', ')}` : 'No strong category keywords; manual review recommended',
    risks.length ? `Safety indicators: ${risks.join(', ')}` : 'No explicit immediate-safety phrase detected',
    essentials.length ? 'An essential campus service may be affected' : 'Scope appears localized from the description',
  ]

  return {
    category: selected.category,
    issueType: selected.issueType,
    severity: priority,
    recommendedPriority: priority,
    department: selected.department,
    suggestedAction: selected.action,
    summary: summarize(description || title),
    safetyRisk: risks.length > 0 || emergencies.length > 0,
    confidence,
    detectedLocation: room,
    reasons,
    provider: 'CampusFix local model',
    analyzedAt: new Date().toISOString(),
  }
}

function similarity(a: string, b: string): number {
  const first = new Set(tokenize(a))
  const second = new Set(tokenize(b))
  if (!first.size || !second.size) return 0
  const intersection = [...first].filter((word) => second.has(word)).length
  return intersection / (first.size + second.size - intersection)
}

export function findDuplicates(draft: { title: string; description: string; category: Category; location: Issue['location'] }, issues: Issue[]): DuplicateMatch[] {
  const draftText = `${draft.title} ${draft.description}`
  return issues
    .filter((issue) => !['closed', 'cancelled', 'rejected'].includes(issue.status))
    .map((issue) => {
      const textScore = similarity(draftText, `${issue.title} ${issue.description}`)
      const sameBuilding = issue.location.building.toLowerCase() === draft.location.building.toLowerCase()
      const sameRoom = issue.location.room.toLowerCase() === draft.location.room.toLowerCase()
      const sameCategory = issue.category === draft.category
      const score = Math.min(0.99, textScore * 0.62 + (sameCategory ? 0.13 : 0) + (sameBuilding ? 0.12 : 0) + (sameRoom ? 0.13 : 0))
      const reasons = [sameCategory && 'same category', sameBuilding && 'same building', sameRoom && 'same room', textScore > 0.25 && 'similar wording'].filter(Boolean) as string[]
      return { issue, score, reasons }
    })
    .filter((match) => match.score >= 0.42)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export function analyzeImage(file: File, analysis: AIAnalysis): ImageAnalysis {
  const filename = file.name.toLowerCase()
  const combined = analyzeIssue(filename, `${analysis.summary} ${analysis.issueType}`)
  return {
    detectedProblem: combined.issueType,
    category: combined.category === 'Other' ? analysis.category : combined.category,
    severity: analysis.recommendedPriority,
    department: combined.category === 'Other' ? analysis.department : combined.department,
    safetyRisk: analysis.safetyRisk,
    confidence: Math.max(55, analysis.confidence - 14),
    note: 'Assistance only. The offline model uses report context and attachment metadata; an authorised person must confirm the diagnosis.',
  }
}

export function answerCampusQuestion(question: string, issues: Issue[]): string {
  const text = question.toLowerCase().trim()
  if (!text) return 'Ask about a report ID, location, status, or how to use CampusFix.'
  if (/how.*report|submit|new issue/.test(text)) return 'Open Report Issue, describe the problem in plain language, run AI analysis, review the suggestions and duplicate matches, confirm the location, then submit.'
  if (/emergency|fire|danger|shock/.test(text)) return 'For immediate danger, move away from the area and contact Campus Security or emergency services first. CampusFix records and routes the maintenance report; it does not replace emergency response.'
  const reference = text.match(/cf-\d+/i)?.[0].toUpperCase()
  const ranked = issues.map((issue) => ({ issue, score: reference === issue.reference ? 1 : similarity(text, `${issue.reference} ${issue.title} ${formatLocation(issue.location)}`) }))
    .sort((a, b) => b.score - a.score)
  const match = ranked[0]
  if (match && match.score >= 0.12) {
    const issue = match.issue
    return `${issue.reference} - ${issue.title} is currently ${issue.status.replaceAll('_', ' ')}. Priority: ${issue.priority}. Responsible department: ${issue.department}. Last updated ${new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(new Date(issue.updatedAt))}.`
  }
  return `I could not find a matching issue in the current CampusFix records. Try an issue ID such as ${issues[0]?.reference ?? 'CF-1001'} or include the building and problem type.`
}

export function generateTrendInsights(issues: Issue[]): TrendInsight[] {
  const open = issues.filter((issue) => !['closed', 'cancelled', 'rejected'].includes(issue.status))
  const electrical = open.filter((issue) => ['Electrical', 'Lighting'].includes(issue.category)).length
  const overdue = open.filter((issue) => issue.slaBreached).length
  const grouped = new Map<string, number>()
  for (const issue of open) grouped.set(issue.location.building, (grouped.get(issue.location.building) ?? 0) + 1)
  const hotspot = [...grouped.entries()].sort((a, b) => b[1] - a[1])[0]
  return [
    { title: 'Electrical risk watch', detail: `${electrical} open electrical or lighting issue${electrical === 1 ? '' : 's'} require attention.`, tone: electrical > 1 ? 'warning' : 'neutral' },
    { title: 'SLA health', detail: overdue ? `${overdue} active issue${overdue === 1 ? ' has' : 's have'} exceeded the configured resolution target.` : 'All active issues are currently within their resolution targets.', tone: overdue ? 'warning' : 'positive' },
    { title: 'Location hotspot', detail: hotspot ? `${hotspot[0]} has the highest active workload with ${hotspot[1]} issue${hotspot[1] === 1 ? '' : 's'}.` : 'No active location hotspot is available.', tone: 'neutral' },
  ]
}
