import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { analyzeImage, analyzeIssue, findDuplicates } from '../lib/ai'
import { repository } from '../lib/repository'
import { formatLocation, humanize, validateIssue, type IssueErrors } from '../lib/validation'
import { CATEGORIES, DEPARTMENTS, PRIORITIES, type AIAnalysis, type AppUser, type Attachment, type Issue, type IssueInput } from '../types'

const initialAnalysis = analyzeIssue('', '')

function blankInput(): IssueInput {
  return {
    title: '', description: '', category: 'Other', subcategory: '', priority: 'medium', department: 'Facilities & Maintenance',
    location: { campus: 'Main Campus', building: '', floor: '', room: '', gps: '' }, aiAnalysis: initialAnalysis, attachments: [],
  }
}

export function IssueReportWizard({ user, issues, onClose, onCreated, onJoined }: { user: AppUser; issues: Issue[]; onClose: () => void; onCreated: (issue: Issue) => void; onJoined: (issue: Issue) => void }) {
  const [step, setStep] = useState(1)
  const [input, setInput] = useState<IssueInput>(() => blankInput())
  const [errors, setErrors] = useState<IssueErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [busy, setBusy] = useState(false)
  const [matches, setMatches] = useState<ReturnType<typeof findDuplicates>>([])

  const progress = `${Math.round((step / 3) * 100)}%`
  const selectedLocation = useMemo(() => formatLocation(input.location), [input.location])

  function update<K extends keyof IssueInput>(key: K, value: IssueInput[K]) {
    setInput((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key as keyof IssueErrors]: undefined }))
  }

  function updateLocation(key: keyof IssueInput['location'], value: string) {
    setInput((current) => ({ ...current, location: { ...current.location, [key]: value } }))
    setErrors((current) => ({ ...current, [key as keyof IssueErrors]: undefined }))
  }

  function runAnalysis() {
    const basicErrors: IssueErrors = {}
    if (input.title.trim().length < 5) basicErrors.title = 'Use at least 5 characters.'
    if (input.description.trim().length < 20) basicErrors.description = 'Add at least 20 characters so the response team can act.'
    if (Object.keys(basicErrors).length) return setErrors(basicErrors)
    const analysis = analyzeIssue(input.title, input.description, formatLocation(input.location))
    const attachments = input.attachments.map((attachment) => ({ ...attachment, imageAnalysis: analyzeImage(new File([], attachment.name, { type: attachment.mediaType }), analysis) }))
    setInput((current) => ({
      ...current, aiAnalysis: analysis, category: analysis.category, subcategory: analysis.issueType,
      priority: analysis.recommendedPriority, department: analysis.department,
      location: { ...current.location, room: current.location.room || analysis.detectedLocation || '' }, attachments,
    }))
    setStep(2)
  }

  function handleEvidence(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    const invalid = files.find((file) => file.size > 10_000_000 || !/^(image\/|video\/|application\/pdf)/.test(file.type))
    if (invalid) return setSubmitError('Evidence must be an image, video or PDF no larger than 10 MB.')
    const attachments: Attachment[] = files.map((file) => ({ id: crypto.randomUUID(), name: file.name, mediaType: file.type, size: file.size, purpose: 'evidence' }))
    setInput((current) => ({ ...current, attachments }))
    setSubmitError('')
  }

  function checkDuplicates() {
    const nextErrors = validateIssue(input)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setMatches(findDuplicates({ title: input.title, description: input.description, category: input.category, location: input.location }, issues))
    setStep(3)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateIssue(input)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return setStep(2)
    setBusy(true); setSubmitError('')
    try {
      onCreated(await repository.createIssue(input, user))
      onClose()
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Unable to submit report. Please try again.')
    } finally { setBusy(false) }
  }

  async function join(issue: Issue) {
    setBusy(true)
    try { onJoined(await repository.joinIssue(issue.id, user)); onClose() }
    catch (reason) { setSubmitError(reason instanceof Error ? reason.message : 'Unable to join the existing issue.') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal wizard" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <header><div><p className="eyebrow">Report a campus issue</p><h2 id="report-title">{step === 1 ? 'Describe what happened' : step === 2 ? 'Review AI suggestions' : 'Check and submit'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">x</button></header>
        <div className="stepper"><span style={{ width: progress }} /><div><b className={step >= 1 ? 'active' : ''}>1. Describe</b><b className={step >= 2 ? 'active' : ''}>2. AI review</b><b className={step >= 3 ? 'active' : ''}>3. Submit</b></div></div>

        {step === 1 && <div className="wizard-body">
          <div className="ai-intro"><span>AI</span><div><strong>Write naturally</strong><p>CampusFix will suggest the category, priority, department, summary and safety flag. You stay in control.</p></div></div>
          <label>Issue title<input autoFocus value={input.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Exposed wiring beside Lecture Theatre 4" /><small>{errors.title}</small></label>
          <label>What is the problem?<textarea rows={6} value={input.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe what you observed, where it is, who is affected, and any immediate danger." /><small>{errors.description}</small></label>
          <label className="upload-zone">Photograph, video or PDF (optional)<input type="file" multiple accept="image/*,video/*,.pdf" onChange={handleEvidence} /><span>{input.attachments.length ? `${input.attachments.length} file(s) selected` : 'Choose evidence - maximum 10 MB each'}</span></label>
          {submitError && <p className="alert error" role="alert">{submitError}</p>}
          <footer><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={runAnalysis}>Analyse report with AI</button></footer>
        </div>}

        {step === 2 && <div className="wizard-body">
          <div className={`ai-result ${input.aiAnalysis.safetyRisk ? 'risk' : ''}`}>
            <div className="ai-result-head"><span>AI analysis</span><b>{input.aiAnalysis.confidence}% confidence</b></div>
            <h3>{input.aiAnalysis.summary}</h3>
            <p>{input.aiAnalysis.suggestedAction}</p>
            <ul>{input.aiAnalysis.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            <small>AI suggestions assist triage and do not replace authorised safety decisions. Review every field before submission.</small>
          </div>
          <div className="form-grid three">
            <label>Category<select aria-label="Category" value={input.category} onChange={(event) => update('category', event.target.value as IssueInput['category'])}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><small>{errors.category}</small></label>
            <label>Priority<select aria-label="Priority" value={input.priority} onChange={(event) => update('priority', event.target.value as IssueInput['priority'])}>{PRIORITIES.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select><small>{errors.priority}</small></label>
            <label>Department<select aria-label="Department" value={input.department} onChange={(event) => update('department', event.target.value as IssueInput['department'])}>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select><small>{errors.department}</small></label>
          </div>
          <label>Issue type<input value={input.subcategory} onChange={(event) => update('subcategory', event.target.value)} /></label>
          <div className="form-grid">
            <label>Campus<select aria-label="Campus" value={input.location.campus} onChange={(event) => updateLocation('campus', event.target.value)}><option>Main Campus</option><option>North Campus</option><option>City Campus</option></select><small>{errors.campus}</small></label>
            <label>Building or landmark<input aria-label="Building or landmark" value={input.location.building} onChange={(event) => updateLocation('building', event.target.value)} placeholder="Lecture Theatre Complex" /><small>{errors.building}</small></label>
            <label>Floor<input value={input.location.floor} onChange={(event) => updateLocation('floor', event.target.value)} placeholder="Ground Floor" /></label>
            <label>Room or facility<input aria-label="Room or facility" value={input.location.room} onChange={(event) => updateLocation('room', event.target.value)} placeholder="Lecture Theatre 4" /><small>{errors.room}</small></label>
          </div>
          <label>GPS coordinates (optional)<input value={input.location.gps} onChange={(event) => updateLocation('gps', event.target.value)} placeholder="5.6506,-0.1962" /></label>
          {input.attachments.map((attachment) => attachment.imageAnalysis && <div className="image-analysis" key={attachment.id}><strong>{attachment.name}</strong><span>{attachment.imageAnalysis.detectedProblem} - {attachment.imageAnalysis.confidence}% confidence</span><small>{attachment.imageAnalysis.note}</small></div>)}
          <footer><button type="button" className="secondary" onClick={() => setStep(1)}>Back</button><button type="button" className="primary" onClick={checkDuplicates}>Check similar reports</button></footer>
        </div>}

        {step === 3 && <form className="wizard-body" onSubmit={submit}>
          {matches.length ? <section className="duplicate-box"><div className="duplicate-title"><span>Possible duplicate</span><p>Joining an existing issue prevents repeated reports and updates the affected-user count.</p></div>{matches.map((match) => <article key={match.issue.id}><div><strong>{match.issue.reference} - {match.issue.title}</strong><p>{formatLocation(match.issue.location)} - {match.issue.affectedUsers} affected - {humanize(match.issue.status)}</p><small>{Math.round(match.score * 100)}% match: {match.reasons.join(', ')}</small></div><button type="button" className="secondary" disabled={busy} onClick={() => join(match.issue)}>Join existing</button></article>)}</section> : <div className="alert success"><strong>No likely open duplicate found.</strong> A new issue can be created.</div>}
          <section className="review-card"><div><small>Report</small><strong>{input.title}</strong><p>{input.aiAnalysis.summary}</p></div><dl><div><dt>Category</dt><dd>{input.category}</dd></div><div><dt>Priority</dt><dd className={`priority-${input.priority}`}>{humanize(input.priority)}</dd></div><div><dt>Route</dt><dd>{input.department}</dd></div><div><dt>Location</dt><dd>{selectedLocation}</dd></div></dl></section>
          {submitError && <p className="alert error" role="alert">{submitError}</p>}
          <footer><button type="button" className="secondary" onClick={() => setStep(2)}>Back</button><button className="primary" disabled={busy}>{busy ? 'Submitting...' : matches.length ? 'Create separate issue' : 'Submit report'}</button></footer>
        </form>}
      </section>
    </div>
  )
}
