import type { AppUser, AuditEvent, Comment, Issue, IssueInput, IssueStatus, ManagedUserInput, Notification, Role } from '../types'
import { slaHours } from './validation'

export interface Repository {
  readonly mode: 'demo'
  getCurrentUser(): Promise<AppUser | null>
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void
  signIn(email: string, password: string): Promise<AppUser>
  signOut(): Promise<void>
  listUsers(actor: AppUser): Promise<AppUser[]>
  createUser(input: ManagedUserInput, actor: AppUser): Promise<AppUser>
  updateUser(userId: string, input: ManagedUserInput, actor: AppUser): Promise<AppUser>
  deleteUser(userId: string, actor: AppUser): Promise<void>
  listIssues(user: AppUser): Promise<Issue[]>
  createIssue(input: IssueInput, user: AppUser): Promise<Issue>
  updateIssueStatus(issueId: string, status: IssueStatus, actor: AppUser, note?: string): Promise<Issue>
  joinIssue(issueId: string, user: AppUser): Promise<Issue>
  addComment(issueId: string, user: AppUser, message: string): Promise<Issue>
  verifyResolution(issueId: string, user: AppUser, fixed: boolean, rating?: number, feedback?: string): Promise<Issue>
  listNotifications(user: AppUser): Promise<Notification[]>
  markNotificationsRead(user: AppUser): Promise<void>
  listAuditEvents(user: AppUser, issueId?: string): Promise<AuditEvent[]>
  resetDemo(): Promise<void>
}

const STORAGE_VERSION = '3'
const USERS_KEY = `campusfix_demo_users_v${STORAGE_VERSION}`
const SESSION_KEY = `campusfix_demo_session_v${STORAGE_VERSION}`
const ISSUES_KEY = `campusfix_demo_issues_v${STORAGE_VERSION}`
const NOTIFICATIONS_KEY = `campusfix_demo_notifications_v${STORAGE_VERSION}`
const AUDIT_KEY = `campusfix_demo_audit_v${STORAGE_VERSION}`
const DEMO_PASSWORD = 'Demo123!'

type DemoUser = AppUser & { password: string }

const defaultUsers: DemoUser[] = [
  { id: 'student-ama', email: 'student@campusfix.test', fullName: 'Ama Owusu', role: 'student', active: true, password: DEMO_PASSWORD },
  { id: 'lecturer-kwame', email: 'lecturer@campusfix.test', fullName: 'Dr Kwame Asare', role: 'lecturer', active: true, password: DEMO_PASSWORD },
  { id: 'maintenance-esi', email: 'maintenance@campusfix.test', fullName: 'Esi Mensah', role: 'maintenance', department: 'Electrical Unit', active: true, password: DEMO_PASSWORD },
  { id: 'manager-kojo', email: 'manager@campusfix.test', fullName: 'Kojo Antwi', role: 'manager', department: 'Facilities & Maintenance', active: true, password: DEMO_PASSWORD },
  { id: 'admin-akua', email: 'admin@campusfix.test', fullName: 'Akua Boateng', role: 'admin', active: true, password: DEMO_PASSWORD },
  { id: 'superadmin-yaw', email: 'superadmin@campusfix.test', fullName: 'Yaw Ofori', role: 'super_admin', active: true, password: DEMO_PASSWORD },
]

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()
const ahead = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString()

function makeAnalysis(overrides: Partial<Issue['aiAnalysis']>): Issue['aiAnalysis'] {
  return {
    category: 'Other',
    issueType: 'Campus service request',
    severity: 'medium',
    recommendedPriority: 'medium',
    department: 'Facilities & Maintenance',
    suggestedAction: 'Verify the issue and route it to the responsible campus unit.',
    summary: 'Campus issue requires review.',
    safetyRisk: false,
    confidence: 78,
    reasons: ['Seeded demonstration analysis'],
    provider: 'CampusFix local model',
    analyzedAt: ago(12),
    ...overrides,
  }
}

function seedIssues(): Issue[] {
  const existing = localStorage.getItem(ISSUES_KEY)
  if (existing) return JSON.parse(existing) as Issue[]
  const issues: Issue[] = [
    {
      id: 'issue-1048', reference: 'CF-1048', title: 'Exposed electrical wiring beside LT4 entrance',
      description: 'There is exposed electrical wiring beside the entrance of Lecture Theatre 4. Students pass close to it between lectures.',
      aiSummary: 'Exposed wiring beside Lecture Theatre 4 creates an electrical safety risk.', category: 'Electrical', subcategory: 'Exposed wiring',
      location: { campus: 'Main Campus', building: 'Lecture Theatre Complex', floor: 'Ground Floor', room: 'Lecture Theatre 4', gps: '5.6506,-0.1962' },
      priority: 'critical', status: 'assigned', department: 'Electrical Unit', assignee: 'Esi Mensah', reporterId: 'student-ama', reporterName: 'Ama Owusu', affectedUsers: 18, followerIds: ['student-ama', 'lecturer-kwame'],
      createdAt: ago(5), updatedAt: ago(2), slaDueAt: ahead(1), slaBreached: false,
      aiAnalysis: makeAnalysis({ category: 'Electrical', issueType: 'Exposed electrical wiring', severity: 'critical', recommendedPriority: 'critical', department: 'Electrical Unit', safetyRisk: true, confidence: 94, summary: 'Exposed wiring beside Lecture Theatre 4 creates an electrical safety risk.', suggestedAction: 'Restrict access and arrange an urgent inspection by the Electrical Unit.', reasons: ['Matched exposed, wiring, electrical', 'Safety indicator detected', 'Busy lecture entrance increases exposure'] }),
      attachments: [{ id: 'att-1', name: 'lt4-exposed-wire.jpg', mediaType: 'image/jpeg', size: 482000, purpose: 'evidence' }], comments: [],
    },
    {
      id: 'issue-1042', reference: 'CF-1042', title: 'Projector failure in Lecture Theatre 2',
      description: 'The projector in Lecture Theatre 2 is not displaying from any laptop even after changing the HDMI cable.',
      aiSummary: 'Lecture Theatre 2 projector has no display after cable and laptop checks.', category: 'ICT/Internet', subcategory: 'Projector',
      location: { campus: 'Main Campus', building: 'Lecture Theatre Complex', floor: 'First Floor', room: 'Lecture Theatre 2' },
      priority: 'medium', status: 'in_progress', department: 'ICT Support', assignee: 'Nana Kusi', reporterId: 'lecturer-kwame', reporterName: 'Dr Kwame Asare', affectedUsers: 23, followerIds: ['lecturer-kwame', 'student-ama'],
      createdAt: ago(26), updatedAt: ago(4), slaDueAt: ago(2), slaBreached: true,
      aiAnalysis: makeAnalysis({ category: 'ICT/Internet', issueType: 'Projector/display fault', department: 'ICT Support', summary: 'Lecture Theatre 2 projector has no display after cable and laptop checks.', suggestedAction: 'Check power, input source and display module, then escalate for hardware repair.', confidence: 91 }),
      attachments: [], comments: [{ id: 'com-1', userId: 'lecturer-kwame', userName: 'Dr Kwame Asare', role: 'lecturer', message: 'This affects the 10 a.m. Software Engineering class.', createdAt: ago(20) }],
    },
    {
      id: 'issue-1039', reference: 'CF-1039', title: 'Leaking ceiling in North Hostel washroom',
      description: 'Water is leaking from the ceiling near the washroom entrance and the floor is becoming slippery.',
      aiSummary: 'Ceiling leak near the hostel washroom is creating a slip hazard.', category: 'Plumbing', subcategory: 'Water leakage',
      location: { campus: 'North Campus', building: 'Unity Hostel', floor: 'Second Floor', room: 'Washroom 2B' },
      priority: 'high', status: 'awaiting_parts', department: 'Facilities & Maintenance', assignee: 'Kofi Adjei', reporterId: 'student-ama', reporterName: 'Ama Owusu', affectedUsers: 41, followerIds: ['student-ama'],
      createdAt: ago(38), updatedAt: ago(8), slaDueAt: ago(30), slaBreached: true,
      aiAnalysis: makeAnalysis({ category: 'Plumbing', issueType: 'Water leakage', severity: 'high', recommendedPriority: 'high', department: 'Facilities & Maintenance', safetyRisk: true, confidence: 92, summary: 'Ceiling leak near the hostel washroom is creating a slip hazard.', suggestedAction: 'Isolate the wet area, locate the source and replace the damaged pipe fitting.' }),
      attachments: [{ id: 'att-2', name: 'hostel-leak-before.jpg', mediaType: 'image/jpeg', size: 614000, purpose: 'before' }], comments: [],
    },
    {
      id: 'issue-1035', reference: 'CF-1035', title: 'Broken chair in Library reading room',
      description: 'A chair beside the east study desk has a loose backrest and should be removed before somebody is hurt.',
      aiSummary: 'Library chair has a loose backrest and needs repair or removal.', category: 'Furniture', subcategory: 'Chair',
      location: { campus: 'Main Campus', building: 'Balme Library', floor: 'First Floor', room: 'Reading Room East' },
      priority: 'low', status: 'user_verification', department: 'Facilities & Maintenance', assignee: 'Kofi Adjei', reporterId: 'student-ama', reporterName: 'Ama Owusu', affectedUsers: 4, followerIds: ['student-ama'],
      createdAt: ago(55), updatedAt: ago(3), slaDueAt: ahead(17), slaBreached: false,
      aiAnalysis: makeAnalysis({ category: 'Furniture', issueType: 'Damaged chair', severity: 'low', recommendedPriority: 'low', department: 'Facilities & Maintenance', summary: 'Library chair has a loose backrest and needs repair or removal.', suggestedAction: 'Remove the chair from use and tighten or replace the backrest.', confidence: 88 }),
      attachments: [{ id: 'att-3', name: 'chair-before.jpg', mediaType: 'image/jpeg', size: 260000, purpose: 'before' }, { id: 'att-4', name: 'chair-after.jpg', mediaType: 'image/jpeg', size: 284000, purpose: 'after' }], comments: [], resolutionNote: 'Backrest bolts replaced and chair load-tested.',
    },
    {
      id: 'issue-1027', reference: 'CF-1027', title: 'Wi-Fi unavailable in Computer Science Lab',
      description: 'The wireless network is unavailable on all computers in the undergraduate laboratory.',
      aiSummary: 'Computer Science laboratory has a complete Wi-Fi outage.', category: 'ICT/Internet', subcategory: 'Wi-Fi outage',
      location: { campus: 'Main Campus', building: 'Computer Science Department', floor: 'Ground Floor', room: 'Undergraduate Lab' },
      priority: 'high', status: 'closed', department: 'ICT Support', assignee: 'Nana Kusi', reporterId: 'student-ama', reporterName: 'Ama Owusu', affectedUsers: 87, followerIds: ['student-ama', 'lecturer-kwame'],
      createdAt: ago(180), updatedAt: ago(121), slaDueAt: ago(172), slaBreached: false,
      aiAnalysis: makeAnalysis({ category: 'ICT/Internet', issueType: 'Network outage', severity: 'high', recommendedPriority: 'high', department: 'ICT Support', summary: 'Computer Science laboratory has a complete Wi-Fi outage.', confidence: 95 }),
      attachments: [], comments: [], rating: 5, feedback: 'The network was restored before our afternoon practical.', resolutionNote: 'Failed access point replaced and connectivity verified.',
    },
    {
      id: 'issue-1019', reference: 'CF-1019', title: 'Waste bins overflowing behind Unity Hostel',
      description: 'Three bins behind the hostel are full and waste is spreading onto the walkway.',
      aiSummary: 'Overflowing hostel bins are obstructing the rear walkway.', category: 'Waste Management', subcategory: 'Overflowing bins',
      location: { campus: 'North Campus', building: 'Unity Hostel', floor: 'Ground Floor', room: 'Rear Walkway' },
      priority: 'medium', status: 'closed', department: 'Environmental Health', assignee: 'Abena Sarpong', reporterId: 'student-ama', reporterName: 'Ama Owusu', affectedUsers: 16, followerIds: ['student-ama'],
      createdAt: ago(360), updatedAt: ago(330), slaDueAt: ago(336), slaBreached: true,
      aiAnalysis: makeAnalysis({ category: 'Waste Management', issueType: 'Overflowing waste bins', department: 'Environmental Health', summary: 'Overflowing hostel bins are obstructing the rear walkway.', confidence: 90 }),
      attachments: [], comments: [], rating: 3, feedback: 'Resolved, but the response took longer than expected.', resolutionNote: 'Waste removed and an additional collection scheduled.',
    },
  ]
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues))
  return issues
}

function seedNotifications(): Notification[] {
  const existing = localStorage.getItem(NOTIFICATIONS_KEY)
  if (existing) return JSON.parse(existing) as Notification[]
  const items: Notification[] = [
    { id: 'note-1', userId: 'student-ama', title: 'Please verify the repair', body: 'CF-1035 was marked resolved. Confirm whether the chair is fixed.', issueId: 'issue-1035', read: false, createdAt: ago(3) },
    { id: 'note-2', userId: 'maintenance-esi', title: 'Critical assignment', body: 'CF-1048 exposed electrical wiring has been assigned to you.', issueId: 'issue-1048', read: false, createdAt: ago(2) },
    { id: 'note-3', userId: 'manager-kojo', title: 'SLA breach', body: 'CF-1039 has exceeded its high-priority resolution target.', issueId: 'issue-1039', read: false, createdAt: ago(1) },
    { id: 'note-4', userId: 'admin-akua', title: 'Daily queue summary', body: 'Two open issues require SLA attention.', read: true, createdAt: ago(8) },
  ]
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items))
  return items
}

function audit(action: string, issue: Issue, actor: AppUser, previousValue?: string, newValue?: string, note?: string): AuditEvent {
  return { id: crypto.randomUUID(), issueId: issue.id, actorId: actor.id, actorName: actor.fullName, action, previousValue, newValue, note, createdAt: new Date().toISOString() }
}

function seedAudit(): AuditEvent[] {
  const existing = localStorage.getItem(AUDIT_KEY)
  if (existing) return JSON.parse(existing) as AuditEvent[]
  const items: AuditEvent[] = [
    { id: 'audit-1', issueId: 'issue-1048', actorId: 'student-ama', actorName: 'Ama Owusu', action: 'Issue created', newValue: 'reported', createdAt: ago(5) },
    { id: 'audit-2', issueId: 'issue-1048', actorId: 'system-ai', actorName: 'CampusFix AI', action: 'AI analysis completed', newValue: 'Electrical / critical / safety risk', createdAt: ago(4.9) },
    { id: 'audit-3', issueId: 'issue-1048', actorId: 'admin-akua', actorName: 'Akua Boateng', action: 'Issue assigned', previousValue: 'verified', newValue: 'Esi Mensah / Electrical Unit', createdAt: ago(2) },
    { id: 'audit-4', issueId: 'issue-1035', actorId: 'manager-kojo', actorName: 'Kojo Antwi', action: 'Work approved', previousValue: 'resolved', newValue: 'user_verification', note: 'Backrest repair inspected.', createdAt: ago(3) },
  ]
  localStorage.setItem(AUDIT_KEY, JSON.stringify(items))
  return items
}

function demoUsers(): DemoUser[] {
  const existing = localStorage.getItem(USERS_KEY)
  if (existing) return JSON.parse(existing) as DemoUser[]
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))
  return defaultUsers
}

function publicUser(user: DemoUser): AppUser {
  const { password: _password, ...safe } = user
  return safe
}

function saveIssue(updated: Issue): Issue {
  const issues = seedIssues()
  const index = issues.findIndex((issue) => issue.id === updated.id)
  if (index < 0) throw new Error('Issue not found.')
  issues[index] = updated
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues))
  return updated
}

function emitAuth() {
  window.dispatchEvent(new Event('campusfix-auth'))
}

function requireAdministrator(actor: AppUser) {
  if (!['admin', 'super_admin'].includes(actor.role)) throw new Error('Administrator access is required.')
}

function validateManagedUser(input: ManagedUserInput, users: DemoUser[], currentId?: string) {
  if (input.fullName.trim().length < 2) throw new Error("Enter the user's full name.")
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) throw new Error('Enter a valid email address.')
  if (users.some((item) => item.id !== currentId && item.email.toLowerCase() === input.email.trim().toLowerCase())) throw new Error('An account with that email already exists.')
  if (!currentId && (!input.password || input.password.length < 8)) throw new Error('A new password must contain at least 8 characters.')
  if (input.password && input.password.length < 8) throw new Error('A new password must contain at least 8 characters.')
}

function recordUserAudit(action: string, target: AppUser, actor: AppUser, previousValue?: string, newValue?: string) {
  const events = seedAudit()
  events.unshift({
    id: crypto.randomUUID(), issueId: `user:${target.id}`, actorId: actor.id, actorName: actor.fullName,
    action, previousValue, newValue, note: `${target.fullName} (${target.email})`, createdAt: new Date().toISOString(),
  })
  localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
}

class DemoRepository implements Repository {
  readonly mode = 'demo' as const

  async getCurrentUser() {
    const id = localStorage.getItem(SESSION_KEY)
    const user = demoUsers().find((item) => item.id === id && item.active)
    return user ? publicUser(user) : null
  }

  onAuthStateChange(callback: (user: AppUser | null) => void) {
    const handler = async () => callback(await this.getCurrentUser())
    window.addEventListener('campusfix-auth', handler)
    return () => window.removeEventListener('campusfix-auth', handler)
  }

  async signIn(email: string, password: string) {
    const user = demoUsers().find((item) => item.email.toLowerCase() === email.trim().toLowerCase())
    if (!user || user.password !== password) throw new Error('Incorrect email or password.')
    if (!user.active) throw new Error('This account has been deactivated.')
    localStorage.setItem(SESSION_KEY, user.id)
    seedIssues(); seedNotifications(); seedAudit(); emitAuth()
    return publicUser(user)
  }

  async signOut() {
    localStorage.removeItem(SESSION_KEY)
    emitAuth()
  }

  async listUsers(actor: AppUser) {
    requireAdministrator(actor)
    return demoUsers().map(publicUser).sort((a, b) => a.fullName.localeCompare(b.fullName))
  }

  async createUser(input: ManagedUserInput, actor: AppUser) {
    requireAdministrator(actor)
    if (actor.role !== 'super_admin' && input.role === 'super_admin') throw new Error('Only a super administrator can create another super administrator.')
    const users = demoUsers()
    validateManagedUser(input, users)
    const user: DemoUser = {
      id: crypto.randomUUID(), fullName: input.fullName.trim(), email: input.email.trim().toLowerCase(),
      role: input.role, department: input.department, active: input.active, password: input.password!,
    }
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const safe = publicUser(user)
    recordUserAudit('User created', safe, actor, undefined, `${safe.role} / ${safe.active ? 'active' : 'inactive'}`)
    return safe
  }

  async updateUser(userId: string, input: ManagedUserInput, actor: AppUser) {
    requireAdministrator(actor)
    const users = demoUsers()
    const index = users.findIndex((item) => item.id === userId)
    if (index < 0) throw new Error('User not found.')
    const existing = users[index]
    if (existing.role === 'super_admin' && actor.role !== 'super_admin') throw new Error('Only a super administrator can update a super administrator.')
    if (input.role === 'super_admin' && actor.role !== 'super_admin') throw new Error('Only a super administrator can grant that role.')
    if (existing.id === actor.id && !input.active) throw new Error('You cannot deactivate your own account.')
    validateManagedUser(input, users, userId)
    const updated: DemoUser = {
      ...existing, fullName: input.fullName.trim(), email: input.email.trim().toLowerCase(), role: input.role,
      department: input.department, active: input.active, password: input.password || existing.password,
    }
    users[index] = updated
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const safe = publicUser(updated)
    recordUserAudit('User updated', safe, actor, `${existing.role} / ${existing.active ? 'active' : 'inactive'}`, `${safe.role} / ${safe.active ? 'active' : 'inactive'}`)
    if (existing.id === actor.id) emitAuth()
    return safe
  }

  async deleteUser(userId: string, actor: AppUser) {
    requireAdministrator(actor)
    const users = demoUsers()
    const target = users.find((item) => item.id === userId)
    if (!target) throw new Error('User not found.')
    if (target.id === actor.id) throw new Error('You cannot delete your own account.')
    if (target.role === 'super_admin' && actor.role !== 'super_admin') throw new Error('Only a super administrator can delete a super administrator.')
    localStorage.setItem(USERS_KEY, JSON.stringify(users.filter((item) => item.id !== userId)))
    recordUserAudit('User deleted', publicUser(target), actor, `${target.role} / ${target.active ? 'active' : 'inactive'}`, 'deleted')
  }

  async listIssues(user: AppUser) {
    const issues = seedIssues()
    if (user.role === 'maintenance') return issues.filter((issue) => issue.assignee === user.fullName || issue.department === user.department)
    if (user.role === 'manager') return issues.filter((issue) => issue.department === user.department)
    return issues
  }

  async createIssue(input: IssueInput, user: AppUser) {
    const issues = seedIssues()
    const now = new Date().toISOString()
    const issue: Issue = {
      id: crypto.randomUUID(),
      reference: `CF-${1050 + issues.length}`,
      title: input.title.trim(), description: input.description.trim(), aiSummary: input.aiAnalysis.summary,
      category: input.category, subcategory: input.subcategory.trim() || input.aiAnalysis.issueType,
      location: input.location, priority: input.priority, status: 'verified', department: input.department,
      reporterId: user.id, reporterName: user.fullName, affectedUsers: 1, followerIds: [user.id],
      createdAt: now, updatedAt: now, slaDueAt: new Date(Date.now() + slaHours(input.priority) * 3_600_000).toISOString(), slaBreached: false,
      aiAnalysis: input.aiAnalysis, attachments: input.attachments, comments: [],
    }
    issues.unshift(issue)
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues))
    const events = seedAudit(); events.unshift(audit('Issue created and AI suggestions confirmed', issue, user, undefined, `${issue.category} / ${issue.priority} / ${issue.department}`)); localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
    const notes = seedNotifications(); notes.unshift({ id: crypto.randomUUID(), userId: 'admin-akua', title: `${issue.priority.toUpperCase()} issue reported`, body: `${issue.reference}: ${issue.title}`, issueId: issue.id, read: false, createdAt: now }); localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes))
    return issue
  }

  async updateIssueStatus(issueId: string, status: IssueStatus, actor: AppUser, note?: string) {
    const issue = seedIssues().find((item) => item.id === issueId)
    if (!issue) throw new Error('Issue not found.')
    const previous = issue.status
    const updated: Issue = { ...issue, status, updatedAt: new Date().toISOString(), resolutionNote: status === 'resolved' && note ? note : issue.resolutionNote }
    saveIssue(updated)
    const events = seedAudit(); events.unshift(audit('Status changed', updated, actor, previous, status, note)); localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
    const notes = seedNotifications(); notes.unshift({ id: crypto.randomUUID(), userId: issue.reporterId, title: `${issue.reference} status updated`, body: `${issue.title} is now ${status.replaceAll('_', ' ')}.`, issueId, read: false, createdAt: updated.updatedAt }); localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes))
    return updated
  }

  async joinIssue(issueId: string, user: AppUser) {
    const issue = seedIssues().find((item) => item.id === issueId)
    if (!issue) throw new Error('Issue not found.')
    if (issue.followerIds.includes(user.id)) return issue
    const updated = { ...issue, followerIds: [...issue.followerIds, user.id], affectedUsers: issue.affectedUsers + 1, updatedAt: new Date().toISOString() }
    saveIssue(updated)
    const events = seedAudit(); events.unshift(audit('Affected user joined issue', updated, user, String(issue.affectedUsers), String(updated.affectedUsers))); localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
    return updated
  }

  async addComment(issueId: string, user: AppUser, message: string) {
    const issue = seedIssues().find((item) => item.id === issueId)
    if (!issue) throw new Error('Issue not found.')
    const comment: Comment = { id: crypto.randomUUID(), userId: user.id, userName: user.fullName, role: user.role, message: message.trim(), createdAt: new Date().toISOString() }
    const updated = { ...issue, comments: [...issue.comments, comment], updatedAt: comment.createdAt }
    saveIssue(updated)
    const events = seedAudit(); events.unshift(audit('Comment added', updated, user, undefined, undefined, message.trim())); localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
    return updated
  }

  async verifyResolution(issueId: string, user: AppUser, fixed: boolean, rating?: number, feedback?: string) {
    const issue = seedIssues().find((item) => item.id === issueId)
    if (!issue) throw new Error('Issue not found.')
    if (issue.reporterId !== user.id) throw new Error('Only the original reporter can verify this repair.')
    const status: IssueStatus = fixed ? 'closed' : 'reopened'
    const updated = { ...issue, status, rating: fixed ? rating : undefined, feedback: feedback?.trim(), updatedAt: new Date().toISOString() }
    saveIssue(updated)
    const events = seedAudit(); events.unshift(audit(fixed ? 'Resolution confirmed and rated' : 'Issue reopened by reporter', updated, user, issue.status, status, feedback)); localStorage.setItem(AUDIT_KEY, JSON.stringify(events))
    return updated
  }

  async listNotifications(user: AppUser) {
    const notes = seedNotifications()
    return ['admin', 'super_admin'].includes(user.role) ? notes : notes.filter((note) => note.userId === user.id)
  }

  async markNotificationsRead(user: AppUser) {
    const notes = seedNotifications().map((note) => note.userId === user.id ? { ...note, read: true } : note)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes))
  }

  async listAuditEvents(user: AppUser, issueId?: string) {
    if (!['manager', 'admin', 'super_admin', 'maintenance'].includes(user.role) && !issueId) return []
    return seedAudit().filter((event) => !issueId || event.issueId === issueId)
  }

  async resetDemo() {
    for (const key of [USERS_KEY, SESSION_KEY, ISSUES_KEY, NOTIFICATIONS_KEY, AUDIT_KEY]) localStorage.removeItem(key)
    demoUsers(); seedIssues(); seedNotifications(); seedAudit(); emitAuth()
  }
}

export const repository: Repository = new DemoRepository()

export const demoCredentials: Record<Role, { email: string; password: string }> = {
  student: { email: 'student@campusfix.test', password: DEMO_PASSWORD },
  lecturer: { email: 'lecturer@campusfix.test', password: DEMO_PASSWORD },
  maintenance: { email: 'maintenance@campusfix.test', password: DEMO_PASSWORD },
  manager: { email: 'manager@campusfix.test', password: DEMO_PASSWORD },
  admin: { email: 'admin@campusfix.test', password: DEMO_PASSWORD },
  super_admin: { email: 'superadmin@campusfix.test', password: DEMO_PASSWORD },
}
