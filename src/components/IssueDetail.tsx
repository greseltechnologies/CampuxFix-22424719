import { useEffect, useState, type FormEvent } from 'react'
import { repository } from '../lib/repository'
import { allowedTransitions, formatLocation, humanize } from '../lib/validation'
import type { AppUser, AuditEvent, Issue, IssueStatus } from '../types'

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <span className={`status status-${status}`}>{humanize(status)}</span>
}

export function PriorityBadge({ priority }: { priority: Issue['priority'] }) {
  return <span className={`priority-badge priority-${priority}`}>{humanize(priority)}</span>
}

export function IssueDetail({ issue, user, onClose, onUpdated }: { issue: Issue; user: AppUser; onClose: () => void; onUpdated: (issue: Issue) => void }) {
  const [comment, setComment] = useState('')
  const [note, setNote] = useState('')
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    repository.listAuditEvents(user, issue.id).then((items) => active && setEvents(items))
    return () => { active = false }
  }, [issue.id, user])

  async function transition(status: IssueStatus) {
    setBusy(true); setError('')
    try {
      const updated = await repository.updateIssueStatus(issue.id, status, user, note)
      onUpdated(updated)
      setEvents(await repository.listAuditEvents(user, issue.id))
      setNote('')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update the issue.') }
    finally { setBusy(false) }
  }

  async function addComment(event: FormEvent) {
    event.preventDefault()
    if (comment.trim().length < 2) return
    setBusy(true)
    try { onUpdated(await repository.addComment(issue.id, user, comment)); setComment('') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not add comment.') }
    finally { setBusy(false) }
  }

  async function verify(fixed: boolean) {
    setBusy(true)
    try { onUpdated(await repository.verifyResolution(issue.id, user, fixed, fixed ? rating : undefined, feedback)); onClose() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not record verification.') }
    finally { setBusy(false) }
  }

  const transitions = allowedTransitions(issue.status, user.role)
  const canVerify = issue.status === 'user_verification' && issue.reporterId === user.id

  return (
    <div className="modal-backdrop detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal issue-detail" role="dialog" aria-modal="true" aria-labelledby="issue-detail-title">
        <header><div><div className="badge-row"><span className="ticket">{issue.reference}</span><StatusBadge status={issue.status} /><PriorityBadge priority={issue.priority} /></div><h2 id="issue-detail-title">{issue.title}</h2><p>{formatLocation(issue.location)}</p></div><button className="icon-button" onClick={onClose} aria-label="Close">x</button></header>

        <div className="detail-grid">
          <div className="detail-main">
            <section><h3>Report</h3><p>{issue.description}</p></section>
            <section className="ai-detail"><div className="section-heading"><h3>AI triage summary</h3><span>{issue.aiAnalysis.confidence}% confidence</span></div><strong>{issue.aiSummary}</strong><p>{issue.aiAnalysis.suggestedAction}</p><div className="tag-row"><span>{issue.aiAnalysis.issueType}</span><span>{issue.aiAnalysis.safetyRisk ? 'Safety risk detected' : 'No explicit safety flag'}</span><span>{issue.aiAnalysis.provider}</span></div><small>AI output assists staff and remains subject to human review and campus safety procedures.</small></section>
            <section><div className="section-heading"><h3>Evidence</h3><span>{issue.attachments.length} file(s)</span></div>{issue.attachments.length ? <div className="evidence-grid">{issue.attachments.map((attachment) => <article key={attachment.id}><span>{attachment.purpose.toUpperCase()}</span><strong>{attachment.name}</strong><small>{Math.max(1, Math.round(attachment.size / 1000))} KB - {attachment.mediaType}</small></article>)}</div> : <p className="muted">No evidence attached.</p>}</section>
            <section><div className="section-heading"><h3>Comments and work notes</h3><span>{issue.comments.length}</span></div>{issue.comments.length ? <div className="comment-list">{issue.comments.map((item) => <article key={item.id}><div><strong>{item.userName}</strong><span>{humanize(item.role)}</span></div><p>{item.message}</p><small>{new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</small></article>)}</div> : <p className="muted">No comments yet.</p>}<form className="comment-form" onSubmit={addComment}><label><span className="sr-only">Add a comment</span><textarea aria-label="Add a comment" rows={2} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment or work note..." /></label><button className="secondary" disabled={busy}>Post note</button></form></section>
          </div>

          <aside className="detail-side">
            <section><h3>Service details</h3><dl className="data-list"><div><dt>Department</dt><dd>{issue.department}</dd></div><div><dt>Assigned to</dt><dd>{issue.assignee ?? 'Unassigned'}</dd></div><div><dt>Affected users</dt><dd>{issue.affectedUsers}</dd></div><div><dt>SLA target</dt><dd className={issue.slaBreached ? 'danger-text' : ''}>{issue.slaBreached ? 'Overdue' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(issue.slaDueAt))}</dd></div><div><dt>Reporter</dt><dd>{['admin', 'super_admin', 'manager'].includes(user.role) || user.id === issue.reporterId ? issue.reporterName : 'Protected'}</dd></div></dl></section>

            {transitions.length > 0 && !canVerify && <section className="workflow-actions"><h3>Update workflow</h3>{['maintenance', 'manager', 'admin', 'super_admin'].includes(user.role) && <label>Work note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional action note" /></label>}<div>{transitions.map((status) => <button key={status} disabled={busy} className={status === 'resolved' || status === 'closed' ? 'primary' : 'secondary'} onClick={() => transition(status)}>{humanize(status)}</button>)}</div></section>}

            {canVerify && <section className="verification-box"><h3>Is the issue fixed?</h3><p>Confirm the repair after checking the location.</p><label>Service rating<select aria-label="Service rating" value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? '' : 's'}</option>)}</select></label><label>Feedback<textarea rows={3} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Optional feedback or reason for reopening" /></label><div><button className="secondary" disabled={busy} onClick={() => verify(false)}>No - reopen</button><button className="primary" disabled={busy} onClick={() => verify(true)}>Yes - close issue</button></div></section>}

            <section><div className="section-heading"><h3>Audit history</h3><span>{events.length}</span></div><div className="timeline">{events.length ? events.map((event) => <article key={event.id}><i /><div><strong>{event.action}</strong><p>{event.actorName}{event.newValue ? ` - ${humanize(event.newValue)}` : ''}</p><small>{new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.createdAt))}</small></div></article>) : <p className="muted">Detailed audit history is available to operational roles.</p>}</div></section>
          </aside>
        </div>
        {error && <p className="alert error" role="alert">{error}</p>}
      </section>
    </div>
  )
}
