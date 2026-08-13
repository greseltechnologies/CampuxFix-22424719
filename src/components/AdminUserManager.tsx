import { useEffect, useState, type FormEvent } from 'react'
import { repository } from '../lib/repository'
import { humanize } from '../lib/validation'
import { DEPARTMENTS, ROLES, type AppUser, type ManagedUserInput, type Role } from '../types'

const blankUser: ManagedUserInput = {
  fullName: '', email: '', role: 'student', department: undefined, active: true, password: '',
}

export function AdminUserManager({ actor, onChanged }: { actor: AppUser; onChanged: (message: string) => void }) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [form, setForm] = useState<ManagedUserInput>(blankUser)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadUsers() {
    setUsers(await repository.listUsers(actor))
  }

  useEffect(() => { loadUsers().catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load users.')) }, [actor.id])

  const assignableRoles = ROLES.filter((role) => actor.role === 'super_admin' || role !== 'super_admin')

  function openCreate() {
    setEditingId(null)
    setForm(blankUser)
    setError('')
    setShowForm(true)
  }

  function openEdit(target: AppUser) {
    setEditingId(target.id)
    setForm({ fullName: target.fullName, email: target.email, role: target.role, department: target.department, active: target.active, password: '' })
    setError('')
    setShowForm(true)
  }

  function update<K extends keyof ManagedUserInput>(key: K, value: ManagedUserInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editingId) {
        await repository.updateUser(editingId, form, actor)
        onChanged(`${form.fullName.trim()} was updated.`)
      } else {
        await repository.createUser(form, actor)
        onChanged(`${form.fullName.trim()} was added.`)
      }
      await loadUsers()
      setShowForm(false)
      setForm(blankUser)
      setEditingId(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save this user.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(target: AppUser) {
    setBusy(true)
    setError('')
    try {
      await repository.updateUser(target.id, { ...target, active: !target.active, password: '' }, actor)
      await loadUsers()
      onChanged(`${target.fullName} was ${target.active ? 'deactivated' : 'activated'}.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to change this account.')
    } finally {
      setBusy(false)
    }
  }

  async function removeUser(target: AppUser) {
    setBusy(true)
    setError('')
    try {
      await repository.deleteUser(target.id, actor)
      await loadUsers()
      setDeleteTarget(null)
      onChanged(`${target.fullName} was deleted.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete this user.')
    } finally {
      setBusy(false)
    }
  }

  function canManage(target: AppUser) {
    return actor.role === 'super_admin' || target.role !== 'super_admin'
  }

  return <section className="panel user-manager">
    <div className="panel-head"><div><h2>User management</h2><p>Add accounts, change roles and account status, or remove users.</p></div><button className="primary" onClick={openCreate}>+ Add user</button></div>
    {error && !showForm && <p className="alert error" role="alert">{error}</p>}
    <div className="user-table">
      {users.map((target) => <article className={!target.active ? 'inactive-user' : ''} key={target.id}>
        <span className="avatar">{target.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
        <div><strong>{target.fullName}</strong><small>{target.email}{target.department ? ` · ${target.department}` : ''}</small></div>
        <b>{humanize(target.role)}</b>
        <span className={`account-state ${target.active ? 'active' : 'inactive'}`}>{target.active ? 'Active' : 'Inactive'}</span>
        <div className="user-actions">
          <button className="secondary compact" disabled={busy || !canManage(target)} onClick={() => openEdit(target)}>Edit</button>
          <button className="secondary compact" disabled={busy || target.id === actor.id || !canManage(target)} onClick={() => toggleActive(target)}>{target.active ? 'Deactivate' : 'Activate'}</button>
          {deleteTarget === target.id ? <><button className="danger-button compact" disabled={busy} onClick={() => removeUser(target)}>Confirm</button><button className="text-button compact" onClick={() => setDeleteTarget(null)}>Cancel</button></> : <button className="danger-button compact" disabled={busy || target.id === actor.id || !canManage(target)} onClick={() => setDeleteTarget(target.id)}>Delete</button>}
        </div>
      </article>)}
    </div>
    <small className="management-note">Changes are recorded in the audit trail. An administrator cannot remove or deactivate their own signed-in account.</small>

    {showForm && <div className="inline-user-form" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
      <form onSubmit={submit}>
        <div className="inline-form-head"><div><p className="eyebrow">Account details</p><h3 id="user-form-title">{editingId ? 'Update user' : 'Add user'}</h3></div><button type="button" className="icon-button" aria-label="Close user form" onClick={() => setShowForm(false)}>x</button></div>
        <div className="form-grid">
          <label>Full name<input autoFocus required value={form.fullName} onChange={(event) => update('fullName', event.target.value)} /></label>
          <label>Email address<input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label>Role<select value={form.role} onChange={(event) => update('role', event.target.value as Role)}>{assignableRoles.map((role) => <option key={role} value={role}>{humanize(role)}</option>)}</select></label>
          <label>Department<select value={form.department ?? ''} onChange={(event) => update('department', event.target.value ? event.target.value as ManagedUserInput['department'] : undefined)}><option value="">No department</option>{DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}</select></label>
          <label>{editingId ? 'New password (optional)' : 'Temporary password'}<input type="password" required={!editingId} minLength={8} value={form.password ?? ''} onChange={(event) => update('password', event.target.value)} placeholder={editingId ? 'Leave blank to keep current password' : 'At least 8 characters'} /></label>
          <label className="checkbox-field"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} /><span>Account active</span></label>
        </div>
        {error && <p className="alert error" role="alert">{error}</p>}
        <footer><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Saving...' : editingId ? 'Save changes' : 'Add user'}</button></footer>
      </form>
    </div>}
  </section>
}
