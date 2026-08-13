// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from '../src/App'

beforeEach(() => localStorage.clear())
afterEach(() => cleanup())

async function signInAs(role: 'Student' | 'Maintenance' | 'Admin') {
  const accounts = {
    Student: 'student@campusfix.test',
    Maintenance: 'maintenance@campusfix.test',
    Admin: 'admin@campusfix.test',
  }
  render(<App />)
  fireEvent.change(await screen.findByLabelText('Email address'), { target: { value: accounts[role] } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Demo123!' } })
  fireEvent.click(screen.getByRole('button', { name: /^Sign in$/ }))
}

describe('functional user journeys', () => {
  it('uses one sign-in, routes by assigned role and places logout in the profile', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Sign in to continue' })).toBeInTheDocument()
    expect(screen.queryByText('Create account')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Student/ })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'lecturer@campusfix.test' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Demo123!' } })
    fireEvent.click(screen.getByRole('button', { name: /^Sign in$/ }))
    expect(await screen.findByText('Teaching support overview')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open profile for Dr Kwame Asare' }))
    expect(await screen.findByRole('heading', { name: 'My profile' })).toBeInTheDocument()
    expect(screen.getAllByText('lecturer@campusfix.test')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in to continue' })).toBeInTheDocument()
  })

  it('analyses and submits a natural-language campus report', async () => {
    await signInAs('Student')
    expect(await screen.findByText('Good day, Ama.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Report an issue/ }))
    fireEvent.change(screen.getByLabelText('Issue title'), { target: { value: 'Air conditioner leaking in tutorial room' } })
    fireEvent.change(screen.getByLabelText('What is the problem?'), { target: { value: 'The air conditioner is leaking water onto the floor during afternoon tutorials.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Analyse report with AI' }))
    expect((await screen.findAllByText('AI analysis')).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Category')).toHaveValue('Plumbing')
    fireEvent.change(screen.getByLabelText('Building or landmark'), { target: { value: 'Business School' } })
    fireEvent.change(screen.getByLabelText('Room or facility'), { target: { value: 'Tutorial Room 5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check similar reports' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Submit report' }))
    expect(await screen.findByText(/was created and routed/)).toBeInTheDocument()
  })

  it('shows field feedback before AI analysis', async () => {
    await signInAs('Student')
    await screen.findByText('Good day, Ama.')
    fireEvent.click(screen.getByRole('button', { name: /Report an issue/ }))
    fireEvent.change(screen.getByLabelText('Issue title'), { target: { value: 'Tap' } })
    fireEvent.click(screen.getByRole('button', { name: 'Analyse report with AI' }))
    expect(await screen.findByText('Use at least 5 characters.')).toBeInTheDocument()
    expect(screen.getByText('Add at least 20 characters so the response team can act.')).toBeInTheDocument()
  })

  it('shows role-protected maintenance navigation and assigned work', async () => {
    await signInAs('Maintenance')
    expect(await screen.findByText('Your maintenance workbench')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Maintenance/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Administration/ })).not.toBeInTheDocument()
  })

  it('lets an administrator open analytics and audit views', async () => {
    await signInAs('Admin')
    expect(await screen.findByText('Campus operations command centre')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Analytics/ }))
    expect(await screen.findByRole('heading', { name: 'Analytics and AI insights' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Audit Trail/ }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Audit trail' })).toBeInTheDocument())
  })

  it('lets an administrator add, update and delete a user', async () => {
    await signInAs('Admin')
    await screen.findByText('Campus operations command centre')
    fireEvent.click(screen.getByRole('button', { name: /Administration/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Add user/ }))
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Naa Dedei' } })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'naa.dedei@campusfix.test' } })
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'lecturer' } })
    fireEvent.change(screen.getByLabelText('Temporary password'), { target: { value: 'Secure123!' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add user$/ }))

    const createdEmail = await screen.findByText('naa.dedei@campusfix.test')
    const row = createdEmail.closest('article')!
    fireEvent.click(within(row).getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Dr Naa Dedei' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Dr Naa Dedei')).toBeInTheDocument()

    const updatedRow = screen.getByText('naa.dedei@campusfix.test').closest('article')!
    fireEvent.click(within(updatedRow).getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(updatedRow).getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(screen.queryByText('naa.dedei@campusfix.test')).not.toBeInTheDocument())
  })
})
