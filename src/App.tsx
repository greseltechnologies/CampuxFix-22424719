import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { AdminUserManager } from './components/AdminUserManager'
import { Brand } from './components/Brand'
import { IssueDetail, PriorityBadge, StatusBadge } from './components/IssueDetail'
import { IssueReportWizard } from './components/IssueReportWizard'
import { answerCampusQuestion, generateTrendInsights } from './lib/ai'
import { repository } from './lib/repository'
import { formatLocation, humanize } from './lib/validation'
import { CATEGORIES, PRIORITIES, STATUSES, type AppUser, type AuditEvent, type Issue, type Notification, type PageKey, type Role } from './types'

const navigation: { key: PageKey; label: string; icon: string; roles?: Role[] }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'report', label: 'Report Issue', icon: '⊕', roles: ['student', 'lecturer'] },
  { key: 'issues', label: 'Campus Issues', icon: '☷' },
  { key: 'map', label: 'Campus Map', icon: '⌖' },
  { key: 'notifications', label: 'Notifications', icon: '◉' },
  { key: 'assistant', label: 'AI Assistant', icon: '✦' },
  { key: 'analytics', label: 'Analytics', icon: '▥', roles: ['manager', 'admin', 'super_admin'] },
  { key: 'maintenance', label: 'Maintenance', icon: '⚒', roles: ['maintenance', 'manager', 'admin', 'super_admin'] },
  { key: 'administration', label: 'Administration', icon: '⚙', roles: ['admin', 'super_admin'] },
  { key: 'audit', label: 'Audit Trail', icon: '↺', roles: ['manager', 'admin', 'super_admin'] },
  { key: 'profile', label: 'My Profile', icon: '◎' },
]

function pageTitle(page: PageKey) {
  return navigation.find((item) => item.key === page)?.label ?? humanize(page)
}

function visibleTo(item: (typeof navigation)[number], user: AppUser) {
  return !item.roles || item.roles.includes(user.role)
}

function StatCard({ label, value, detail, tone = 'green' }: { label: string; value: string | number; detail: string; tone?: string }) {
  return <article className="stat-card"><span className={`stat-mark ${tone}`} /> <div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}

function IssueCard({ issue, user, onOpen, onJoin }: { issue: Issue; user: AppUser; onOpen: () => void; onJoin: () => void }) {
  const canJoin = ['student', 'lecturer'].includes(user.role) && !issue.followerIds.includes(user.id) && !['closed', 'cancelled', 'rejected'].includes(issue.status)
  return <article className="issue-card">
    <button className="issue-open" onClick={onOpen} aria-label={`Open ${issue.reference}`}>
      <div className="issue-card-top"><span className="ticket">{issue.reference}</span><div><StatusBadge status={issue.status} /><PriorityBadge priority={issue.priority} /></div></div>
      <h3>{issue.title}</h3><p>{issue.aiSummary}</p>
      <div className="issue-location"><span>{formatLocation(issue.location)}</span><span>{issue.department}</span></div>
      <div className="issue-footer"><span>{issue.affectedUsers} affected</span><span>{new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(new Date(issue.createdAt))}</span><span className={issue.slaBreached ? 'danger-text' : ''}>{issue.slaBreached ? 'SLA overdue' : 'Within SLA'}</span></div>
    </button>
    {canJoin && <button className="join-button" onClick={onJoin}>I am affected</button>}
  </article>
}

function DashboardPage({ user, issues, onReport, onOpen }: { user: AppUser; issues: Issue[]; onReport: () => void; onOpen: (issue: Issue) => void }) {
  const isReporter = ['student', 'lecturer'].includes(user.role)
  const relevant = isReporter ? issues.filter((issue) => issue.reporterId === user.id || issue.followerIds.includes(user.id)) : issues
  const active = relevant.filter((issue) => !['closed', 'cancelled', 'rejected'].includes(issue.status))
  const overdue = active.filter((issue) => issue.slaBreached)
  const pending = relevant.filter((issue) => issue.status === 'user_verification')
  const resolved = relevant.filter((issue) => issue.status === 'closed')
  const satisfaction = resolved.filter((issue) => issue.rating).length ? (resolved.reduce((sum, issue) => sum + (issue.rating ?? 0), 0) / resolved.filter((issue) => issue.rating).length).toFixed(1) : 'N/A'
  const insights = generateTrendInsights(issues)

  const heading = user.role === 'student' ? `Good day, ${user.fullName.split(' ')[0]}.` : user.role === 'lecturer' ? 'Teaching support overview' : user.role === 'maintenance' ? 'Your maintenance workbench' : user.role === 'manager' ? `${user.department} overview` : 'Campus operations command centre'
  return <>
    <section className="welcome"><div><p className="eyebrow">{humanize(user.role)} dashboard</p><h1>{heading}</h1><p>{isReporter ? 'Report a problem, follow progress and confirm the outcome.' : 'Prioritise work, protect service targets and keep every action accountable.'}</p></div>{isReporter && <button className="primary" onClick={onReport}>+ Report an issue</button>}</section>
    <section className="stats-grid">
      <StatCard label={isReporter ? 'My active issues' : 'Active workload'} value={active.length} detail={`${relevant.length} visible reports`} tone="blue" />
      <StatCard label={isReporter ? 'Pending verification' : 'SLA breaches'} value={isReporter ? pending.length : overdue.length} detail={isReporter ? 'Awaiting your confirmation' : 'Require escalation'} tone={isReporter ? 'amber' : 'red'} />
      <StatCard label="Resolved" value={resolved.length} detail="Closed with evidence" tone="green" />
      <StatCard label="Satisfaction" value={satisfaction === 'N/A' ? satisfaction : `${satisfaction}/5`} detail="From completed ratings" tone="violet" />
    </section>

    <div className="dashboard-grid">
      <section className="panel"><div className="panel-head"><div><p className="eyebrow">Live queue</p><h2>{isReporter ? 'Issues you follow' : 'Priority attention'}</h2></div><span>{active.length} active</span></div><div className="compact-list">{active.slice(0, 4).map((issue) => <button key={issue.id} onClick={() => onOpen(issue)}><PriorityBadge priority={issue.priority} /><div><strong>{issue.reference} - {issue.title}</strong><span>{formatLocation(issue.location)} - {humanize(issue.status)}</span></div><b>{issue.affectedUsers}</b></button>)}</div></section>
      <section className="panel insight-panel"><div className="panel-head"><div><p className="eyebrow">AI management briefing</p><h2>Evidence-based insights</h2></div><span>Live data</span></div><div className="insight-list">{insights.map((insight) => <article className={insight.tone} key={insight.title}><i /><div><strong>{insight.title}</strong><p>{insight.detail}</p></div></article>)}</div><small>Generated only from the issue records currently visible in this demonstration database.</small></section>
    </div>
    <section className="panel process-panel"><div className="panel-head"><div><p className="eyebrow">Controlled lifecycle</p><h2>From report to verified closure</h2></div></div><div className="process-flow">{['Reported', 'AI analysis', 'Verified', 'Assigned', 'In progress', 'Resolved', 'User verification', 'Closed'].map((item, index) => <div key={item}><span>{index + 1}</span><b>{item}</b></div>)}</div></section>
  </>
}

function IssuesPage({ user, issues, onOpen, onJoin }: { user: AppUser; issues: Issue[]; onOpen: (issue: Issue) => void; onJoin: (issue: Issue) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [category, setCategory] = useState('all')
  const [mine, setMine] = useState(false)
  const filtered = useMemo(() => issues.filter((issue) => {
    const text = `${issue.reference} ${issue.title} ${issue.description} ${formatLocation(issue.location)} ${issue.category} ${issue.department}`.toLowerCase()
    return text.includes(query.trim().toLowerCase()) && (status === 'all' || issue.status === status) && (priority === 'all' || issue.priority === priority) && (category === 'all' || issue.category === category) && (!mine || issue.reporterId === user.id || issue.followerIds.includes(user.id))
  }), [issues, query, status, priority, category, mine, user])
  return <section><div className="page-heading"><div><p className="eyebrow">Search and track</p><h1>Campus issues</h1><p>Search by ID, problem, location, category or department.</p></div>{['student', 'lecturer'].includes(user.role) && <label className="toggle"><input type="checkbox" checked={mine} onChange={(event) => setMine(event.target.checked)} /><span>Only my issues</span></label>}</div>
    <div className="filter-bar"><label className="search-field"><span>Search</span><input aria-label="Search campus issues" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CF-1048, projector, Unity Hostel..." /></label><label>Status<select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{STATUSES.map((item) => <option value={item} key={item}>{humanize(item)}</option>)}</select></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All priorities</option>{PRIORITIES.map((item) => <option value={item} key={item}>{humanize(item)}</option>)}</select></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    <p className="result-count">{filtered.length} issue{filtered.length === 1 ? '' : 's'} found</p><div className="cards-grid">{filtered.map((issue) => <IssueCard key={issue.id} issue={issue} user={user} onOpen={() => onOpen(issue)} onJoin={() => onJoin(issue)} />)}</div>{!filtered.length && <div className="empty"><strong>No matching issue</strong><span>Try changing the search or filters.</span></div>}
  </section>
}

function CampusMapPage({ issues, onOpen }: { issues: Issue[]; onOpen: (issue: Issue) => void }) {
  const pins = issues.filter((issue) => !['cancelled', 'rejected'].includes(issue.status)).slice(0, 6)
  return <section><div className="page-heading"><div><p className="eyebrow">Location intelligence</p><h1>Campus issue map</h1><p>Priorities are visible without revealing reporter identity.</p></div><div className="map-legend">{['critical', 'high', 'medium', 'low', 'resolved'].map((item) => <span key={item}><i className={`map-${item}`} />{humanize(item)}</span>)}</div></div><div className="map-shell"><div className="map-road road-one" /><div className="map-road road-two" /><span className="map-label label-library">Balme Library</span><span className="map-label label-lt">Lecture Theatres</span><span className="map-label label-hostel">Unity Hostel</span><span className="map-label label-cs">Computer Science</span>{pins.map((issue, index) => <button style={{ left: `${[29, 50, 74, 31, 56, 78][index]}%`, top: `${[34, 22, 66, 72, 50, 31][index]}%` }} key={issue.id} className={`map-pin map-${issue.status === 'closed' ? 'resolved' : issue.priority}`} onClick={() => onOpen(issue)} aria-label={`Open ${issue.reference}`}><span>{index + 1}</span><div><strong>{issue.reference}</strong><small>{issue.title}</small><em>{issue.affectedUsers} affected</em></div></button>)}</div></section>
}

function NotificationsPage({ notifications, onRead }: { notifications: Notification[]; onRead: () => void }) {
  return <section><div className="page-heading"><div><p className="eyebrow">Stay informed</p><h1>Notifications</h1><p>Assignments, status updates, SLA events and verification requests.</p></div><button className="secondary" onClick={onRead}>Mark all as read</button></div><div className="notification-list">{notifications.map((item) => <article className={item.read ? '' : 'unread'} key={item.id}><i /><div><strong>{item.title}</strong><p>{item.body}</p><small>{new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</small></div>{!item.read && <span>New</span>}</article>)}</div>{!notifications.length && <div className="empty"><strong>No notifications</strong><span>You are all caught up.</span></div>}</section>
}

function AssistantPage({ issues }: { issues: Issue[] }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ from: 'user' | 'assistant'; text: string }[]>([{ from: 'assistant', text: 'Hello. I answer from current CampusFix records. Ask about an issue ID, a location, or how to report a problem.' }])
  function ask(event: FormEvent) { event.preventDefault(); if (!question.trim()) return; const answer = answerCampusQuestion(question, issues); setMessages((current) => [...current, { from: 'user', text: question.trim() }, { from: 'assistant', text: answer }]); setQuestion('') }
  const suggestions = ['Has CF-1042 been fixed?', 'What is happening at Unity Hostel?', 'How do I report an issue?']
  return <section><div className="page-heading"><div><p className="eyebrow">Grounded campus support</p><h1>CampusFix AI Assistant</h1><p>Answers are retrieved from actual demonstration records and system guidance.</p></div><span className="grounded-pill">Database grounded</span></div><div className="assistant-shell"><aside><strong>Try asking</strong>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setQuestion(suggestion)}>{suggestion}</button>)}<div><span>Safety reminder</span><p>For immediate danger, contact campus security or emergency services first.</p></div></aside><div className="chat-panel"><div className="chat-messages" aria-live="polite">{messages.map((message, index) => <article className={message.from} key={`${message.from}-${index}`}><span>{message.from === 'assistant' ? 'AI' : 'You'}</span><p>{message.text}</p></article>)}</div><form onSubmit={ask}><label><span className="sr-only">Ask CampusFix AI</span><input aria-label="Ask CampusFix AI" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about CF-1042 or a campus location..." /></label><button className="primary">Ask</button></form><small>The assistant will say when it cannot find matching data; it does not invent issue status.</small></div></div></section>
}

function AnalyticsPage({ issues }: { issues: Issue[] }) {
  const categoryCounts = CATEGORIES.map((category) => ({ label: category, value: issues.filter((issue) => issue.category === category).length })).filter((item) => item.value).sort((a, b) => b.value - a.value)
  const priorityCounts = PRIORITIES.map((priority) => ({ label: humanize(priority), value: issues.filter((issue) => issue.priority === priority).length }))
  const max = Math.max(1, ...categoryCounts.map((item) => item.value))
  const closed = issues.filter((issue) => issue.status === 'closed')
  const satisfaction = closed.filter((issue) => issue.rating).reduce((sum, issue) => sum + (issue.rating ?? 0), 0) / Math.max(1, closed.filter((issue) => issue.rating).length)
  return <section><div className="page-heading"><div><p className="eyebrow">Operational evidence</p><h1>Analytics and AI insights</h1><p>Current issue distribution, service performance and management signals.</p></div><button className="secondary" onClick={() => window.print()}>Export view</button></div><section className="stats-grid analytics-stats"><StatCard label="SLA compliance" value={`${Math.round((issues.filter((issue) => !issue.slaBreached).length / issues.length) * 100)}%`} detail="Across demonstration records" tone="green" /><StatCard label="Average satisfaction" value={`${satisfaction.toFixed(1)}/5`} detail="From closed rated issues" tone="violet" /><StatCard label="Critical open" value={issues.filter((issue) => ['critical', 'emergency'].includes(issue.priority) && issue.status !== 'closed').length} detail="Human confirmation required" tone="red" /><StatCard label="Total affected" value={issues.reduce((sum, issue) => sum + issue.affectedUsers, 0)} detail="Community confirmations" tone="blue" /></section><div className="analytics-grid"><section className="panel"><div className="panel-head"><h2>Issues by category</h2><span>{issues.length} total</span></div><div className="bar-chart">{categoryCounts.map((item) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${(item.value / max) * 100}%` }} /></i><strong>{item.value}</strong></div>)}</div></section><section className="panel"><div className="panel-head"><h2>Priority distribution</h2></div><div className="priority-chart">{priorityCounts.map((item) => <article key={item.label}><span className={`priority-dot priority-${item.label.toLowerCase()}`} /><strong>{item.value}</strong><small>{item.label}</small></article>)}</div><div className="ai-brief">{generateTrendInsights(issues).map((item) => <p key={item.title}><strong>{item.title}:</strong> {item.detail}</p>)}</div></section></div></section>
}

function MaintenancePage({ issues, user, onOpen }: { issues: Issue[]; user: AppUser; onOpen: (issue: Issue) => void }) {
  const assigned = user.role === 'maintenance' ? issues.filter((issue) => issue.assignee === user.fullName || issue.department === user.department) : issues
  const actionable = assigned.filter((issue) => !['closed', 'cancelled', 'rejected'].includes(issue.status))
  return <section><div className="page-heading"><div><p className="eyebrow">Work management</p><h1>{user.role === 'maintenance' ? 'My assigned work' : 'Maintenance operations'}</h1><p>Accept tasks, record notes, attach evidence and move work through the controlled lifecycle.</p></div></div><section className="stats-grid"><StatCard label="Assigned open" value={actionable.length} detail="Current workload" tone="blue" /><StatCard label="High and above" value={actionable.filter((item) => ['high', 'critical', 'emergency'].includes(item.priority)).length} detail="Prioritise these tasks" tone="red" /><StatCard label="Awaiting parts" value={actionable.filter((item) => item.status === 'awaiting_parts').length} detail="Requires resources" tone="amber" /><StatCard label="Completed" value={assigned.filter((item) => item.status === 'closed').length} detail="Verified by reporters" tone="green" /></section><div className="work-board">{['assigned', 'in_progress', 'awaiting_parts', 'resolved'].map((status) => <section key={status}><div className="board-head"><h3>{humanize(status)}</h3><span>{assigned.filter((issue) => issue.status === status).length}</span></div>{assigned.filter((issue) => issue.status === status).map((issue) => <button key={issue.id} onClick={() => onOpen(issue)}><PriorityBadge priority={issue.priority} /><strong>{issue.reference}</strong><p>{issue.title}</p><small>{formatLocation(issue.location)}</small></button>)}</section>)}</div></section>
}

function ProfilePage({ user, onSignOut }: { user: AppUser; onSignOut: () => void }) {
  const initials = user.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)
  return <section className="profile-page"><div className="page-heading"><div><p className="eyebrow">Account and access</p><h1>My profile</h1><p>Review the identity and permissions attached to your CampusFix account.</p></div><span className="grounded-pill">Active account</span></div><div className="profile-layout"><section className="panel profile-card"><div className="profile-avatar" aria-hidden="true">{initials}</div><h2>{user.fullName}</h2><p>{user.email}</p><span>{humanize(user.role)}</span></section><section className="panel profile-details"><div className="panel-head"><h2>Account details</h2></div><dl><div><dt>Full name</dt><dd>{user.fullName}</dd></div><div><dt>Email address</dt><dd>{user.email}</dd></div><div><dt>Assigned role</dt><dd>{humanize(user.role)}</dd></div><div><dt>Department</dt><dd>{user.department ?? 'Not assigned'}</dd></div><div><dt>Account status</dt><dd>{user.active ? 'Active' : 'Inactive'}</dd></div></dl><div className="profile-security"><span className="font-icon" aria-hidden="true">✓</span><div><strong>Role-based access is active</strong><p>CampusFix automatically routes this account to the pages and actions allowed for its assigned role.</p></div></div><button className="danger-button profile-logout" onClick={onSignOut}><span className="font-icon" aria-hidden="true">↪</span>Log out</button></section></div></section>
}

function AdministrationPage({ user, onUserChanged }: { user: AppUser; onUserChanged: (message: string) => void }) {
  return <section><div className="page-heading"><div><p className="eyebrow">Configuration and access</p><h1>Administration</h1><p>{user.role === 'super_admin' ? 'Institution-wide control with user, role, campus and security settings.' : 'Add, update, activate, deactivate and delete operational user accounts.'}</p></div><span className="grounded-pill">Role protected</span></div><div className="admin-grid"><AdminUserManager actor={user} onChanged={onUserChanged} /><section className="panel config-panel"><div className="panel-head"><h2>System configuration</h2></div>{[{ title: 'Location hierarchy', value: '1 institution / 3 campuses / 4 seeded buildings' }, { title: 'Issue taxonomy', value: `${CATEGORIES.length} categories with administrator extension` }, { title: 'SLA policy', value: '5 priority levels with automatic breach detection' }, { title: 'AI provider', value: 'Modular local fallback active; external key not configured' }, { title: 'Audit retention', value: 'Issue and user-management actions recorded' }].map((item) => <article key={item.title}><div><strong>{item.title}</strong><p>{item.value}</p></div><span className="planned-pill">Production setting</span></article>)}</section></div></section>
}

function AuditPage({ events, issues }: { events: AuditEvent[]; issues: Issue[] }) {
  return <section><div className="page-heading"><div><p className="eyebrow">Accountability</p><h1>Audit trail</h1><p>Every important workflow action records the actor, time and value change.</p></div></div><div className="audit-table"><div className="audit-row audit-head"><span>Date and time</span><span>Issue</span><span>Actor</span><span>Action</span><span>Change</span></div>{events.map((event) => <div className="audit-row" key={event.id}><span>{new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.createdAt))}</span><span>{issues.find((issue) => issue.id === event.issueId)?.reference ?? event.issueId}</span><span>{event.actorName}</span><strong>{event.action}</strong><span>{event.previousValue ? `${humanize(event.previousValue)} -> ` : ''}{event.newValue ? humanize(event.newValue) : event.note ?? '-'}</span></div>)}</div></section>
}

function AppWorkspace({ initialUser }: { initialUser: AppUser }) {
  const [user, setUser] = useState(initialUser)
  const [page, setPage] = useState<PageKey>('dashboard')
  const [issues, setIssues] = useState<Issue[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function refresh(currentUser = user) {
    const [nextIssues, nextNotifications, nextAudit] = await Promise.all([repository.listIssues(currentUser), repository.listNotifications(currentUser), repository.listAuditEvents(currentUser)])
    setIssues(nextIssues); setNotifications(nextNotifications); setAuditEvents(nextAudit)
  }

  useEffect(() => repository.onAuthStateChange((next) => next && setUser(next)), [])
  useEffect(() => { let active = true; setLoading(true); refresh(user).catch(() => active && setNotice('Unable to load the latest campus records.')).finally(() => active && setLoading(false)); return () => { active = false } }, [user])

  function selectPage(key: PageKey) {
    if (key === 'report') { setShowReport(true); return }
    setPage(key); setMobileNav(false)
  }

  function updateIssue(issue: Issue) {
    setIssues((current) => current.map((item) => item.id === issue.id ? issue : item))
    setSelectedIssue(issue)
    refresh().catch(() => undefined)
  }

  async function joinIssue(issue: Issue) {
    try { const updated = await repository.joinIssue(issue.id, user); updateIssue(updated); setNotice(`You are now following ${issue.reference}.`) }
    catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Could not join this issue.') }
  }

  async function signOut() { await repository.signOut() }
  async function resetDemo() { await repository.resetDemo(); await repository.signIn('student@campusfix.test', 'Demo123!'); window.location.reload() }

  const visibleNavigation = navigation.filter((item) => visibleTo(item, user))
  const unread = notifications.filter((item) => !item.read).length

  let content
  if (loading) content = <div className="empty"><span className="spinner" />Loading CampusFix records...</div>
  else if (page === 'dashboard') content = <DashboardPage user={user} issues={issues} onReport={() => setShowReport(true)} onOpen={setSelectedIssue} />
  else if (page === 'issues') content = <IssuesPage user={user} issues={issues} onOpen={setSelectedIssue} onJoin={joinIssue} />
  else if (page === 'map') content = <CampusMapPage issues={issues} onOpen={setSelectedIssue} />
  else if (page === 'notifications') content = <NotificationsPage notifications={notifications} onRead={async () => { await repository.markNotificationsRead(user); setNotifications((current) => current.map((item) => ({ ...item, read: true }))) }} />
  else if (page === 'assistant') content = <AssistantPage issues={issues} />
  else if (page === 'analytics') content = <AnalyticsPage issues={issues} />
  else if (page === 'maintenance') content = <MaintenancePage issues={issues} user={user} onOpen={setSelectedIssue} />
  else if (page === 'administration') content = <AdministrationPage user={user} onUserChanged={(message) => { setNotice(message); refresh().catch(() => undefined) }} />
  else if (page === 'audit') content = <AuditPage events={auditEvents} issues={issues} />
  else if (page === 'profile') content = <ProfilePage user={user} onSignOut={signOut} />

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}><div className="sidebar-brand"><Brand /><button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><span className="font-icon" aria-hidden="true">×</span></button></div><nav aria-label="Main navigation">{visibleNavigation.map((item) => <button key={item.key} className={page === item.key ? 'active' : ''} onClick={() => selectPage(item.key)}><span className="font-icon" aria-hidden="true">{item.icon}</span>{item.label}{item.key === 'notifications' && unread > 0 && <b>{unread}</b>}</button>)}</nav><div className="sidebar-foot"><span>AI mode</span><strong>Explainable fallback</strong><small>Core workflows remain available if external AI is unavailable.</small><button onClick={resetDemo}>Reset demonstration data</button></div></aside>
    {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <div className="main-shell"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><span className="font-icon" aria-hidden="true">☰</span></button><div><span className="breadcrumb">CampusFix /</span><strong>{pageTitle(page)}</strong></div><div className="topbar-actions"><button className="profile-trigger" aria-label={`Open profile for ${user.fullName}`} onClick={() => setPage('profile')}><div className="identity"><span>{user.fullName}</span><small>{humanize(user.role)}</small></div><span className="avatar">{user.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="font-icon profile-chevron" aria-hidden="true">›</span></button></div></header><main className="workspace">{notice && <button className="toast" onClick={() => setNotice('')}>{notice}<span>x</span></button>}{content}</main><footer className="site-footer"><span>CampusFix v2.0 - Student ID 22424719</span><span>Report. Analyse. Resolve. Verify.</span></footer></div>
    {showReport && <IssueReportWizard user={user} issues={issues} onClose={() => setShowReport(false)} onCreated={(issue) => { setIssues((current) => [issue, ...current]); setNotice(`${issue.reference} was created and routed to ${issue.department}.`) }} onJoined={(issue) => { updateIssue(issue); setNotice(`Joined ${issue.reference}; ${issue.affectedUsers} users are now affected.`) }} />}
    {selectedIssue && <IssueDetail issue={selectedIssue} user={user} onClose={() => setSelectedIssue(null)} onUpdated={updateIssue} />}
  </div>
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { let active = true; repository.getCurrentUser().then((current) => active && setUser(current)).finally(() => active && setLoading(false)); const unsubscribe = repository.onAuthStateChange((current) => setUser(current)); return () => { active = false; unsubscribe() } }, [])
  if (loading) return <div className="splash"><Brand /><span className="spinner" /></div>
  return user ? <AppWorkspace initialUser={user} /> : <AuthScreen onAuthenticated={setUser} />
}
