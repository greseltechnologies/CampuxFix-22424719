// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { analyzeIssue } from '../src/lib/ai'
import { demoCredentials, repository } from '../src/lib/repository'

beforeEach(() => localStorage.clear())

function reportInput() {
  const title = 'Loose electrical socket in seminar room'
  const description = 'The wall socket is loose and exposes a visible gap around the electrical fitting.'
  const analysis = analyzeIssue(title, description, 'Business School Room 12')
  return {
    title, description, category: analysis.category, subcategory: analysis.issueType,
    location: { campus: 'Main Campus', building: 'Business School', floor: 'First Floor', room: 'Room 12', gps: '' },
    priority: analysis.recommendedPriority, department: analysis.department, aiAnalysis: analysis, attachments: [],
  }
}

describe('demo repository integration', () => {
  it('authenticates a student and persists an AI-assisted issue', async () => {
    const student = await repository.signIn(demoCredentials.student.email, demoCredentials.student.password)
    const issue = await repository.createIssue(reportInput(), student)
    const issues = await repository.listIssues(student)
    expect(issue.status).toBe('verified')
    expect(issue.priority).toBe('critical')
    expect(issue.department).toBe('Electrical Unit')
    expect(issues.some((item) => item.id === issue.id)).toBe(true)
  })

  it('shows maintenance staff their relevant queue and records workflow changes', async () => {
    const staff = await repository.signIn(demoCredentials.maintenance.email, demoCredentials.maintenance.password)
    const issues = await repository.listIssues(staff)
    expect(issues.every((issue) => issue.department === staff.department || issue.assignee === staff.fullName)).toBe(true)
    const assigned = issues.find((issue) => issue.status === 'assigned')
    const updated = await repository.updateIssueStatus(assigned!.id, 'acknowledged', staff, 'Accepted safety assignment.')
    expect(updated.status).toBe('acknowledged')
    expect((await repository.listAuditEvents(staff, assigned!.id))[0].action).toBe('Status changed')
  })

  it('joins an existing issue only once', async () => {
    const lecturer = await repository.signIn(demoCredentials.lecturer.email, demoCredentials.lecturer.password)
    const issue = (await repository.listIssues(lecturer)).find((item) => item.reference === 'CF-1039')!
    const joined = await repository.joinIssue(issue.id, lecturer)
    const joinedAgain = await repository.joinIssue(issue.id, lecturer)
    expect(joined.affectedUsers).toBe(issue.affectedUsers + 1)
    expect(joinedAgain.affectedUsers).toBe(joined.affectedUsers)
  })

  it('lets the original reporter verify and rate a completed repair', async () => {
    const student = await repository.signIn(demoCredentials.student.email, demoCredentials.student.password)
    const issue = (await repository.listIssues(student)).find((item) => item.reference === 'CF-1035')!
    const closed = await repository.verifyResolution(issue.id, student, true, 5, 'Repair checked and safe.')
    expect(closed.status).toBe('closed')
    expect(closed.rating).toBe(5)
  })

  it('rejects an incorrect password', async () => {
    await expect(repository.signIn(demoCredentials.student.email, 'wrong-password')).rejects.toThrow('Incorrect email or password.')
  })

  it('lets an administrator create, update, deactivate and delete a user with audit records', async () => {
    const admin = await repository.signIn(demoCredentials.admin.email, demoCredentials.admin.password)
    const created = await repository.createUser({ fullName: 'Naa Dedei', email: 'naa.dedei@campusfix.test', role: 'lecturer', active: true, password: 'Secure123!' }, admin)
    expect((await repository.listUsers(admin)).some((user) => user.id === created.id)).toBe(true)

    await repository.signOut()
    const roleRoutedUser = await repository.signIn('naa.dedei@campusfix.test', 'Secure123!')
    expect(roleRoutedUser.role).toBe('lecturer')
    const signedInAdmin = await repository.signIn(demoCredentials.admin.email, demoCredentials.admin.password)

    const updated = await repository.updateUser(created.id, { ...created, fullName: 'Dr Naa Dedei', active: false, password: '' }, signedInAdmin)
    expect(updated.fullName).toBe('Dr Naa Dedei')
    expect(updated.active).toBe(false)

    await repository.deleteUser(created.id, signedInAdmin)
    expect((await repository.listUsers(signedInAdmin)).some((user) => user.id === created.id)).toBe(false)
    const actions = (await repository.listAuditEvents(signedInAdmin)).map((event) => event.action)
    expect(actions).toEqual(expect.arrayContaining(['User created', 'User updated', 'User deleted']))
  })
})
