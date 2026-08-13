import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

async function signInAs(page: Page, role: 'student' | 'admin') {
  const accounts = { student: 'student@campusfix.test', admin: 'admin@campusfix.test' }
  await page.getByLabel('Email address').fill(accounts[role])
  await page.getByLabel('Password').fill('Demo123!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}

async function openNavigationPage(page: Page, name: string) {
  const menu = page.getByRole('button', { name: 'Open navigation' })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name }).click()
}

test('student reviews AI suggestions and submits a safety report', async ({ page }) => {
  await signInAs(page, 'student')
  await expect(page.getByText('Good day, Ama.')).toBeVisible()

  await page.getByRole('button', { name: 'Report an issue' }).click()
  await page.getByLabel('Issue title').fill('Exposed wiring beside Lecture Theatre 4')
  await page.getByLabel('What is the problem?').fill('There is exposed electrical wiring beside the entrance of Lecture Theatre 4 and students could touch it.')
  await page.getByRole('button', { name: 'Analyse report with AI' }).click()

  await expect(page.getByRole('heading', { name: 'Review AI suggestions' })).toBeVisible()
  await expect(page.getByLabel('Category')).toHaveValue('Electrical')
  await expect(page.getByLabel('Priority')).toHaveValue('critical')
  await expect(page.getByLabel('Department')).toHaveValue('Electrical Unit')
  await page.getByLabel('Building or landmark').fill('Lecture Theatre Complex')
  await page.getByRole('button', { name: 'Check similar reports' }).click()
  await expect(page.getByRole('heading', { name: 'Check and submit' })).toBeVisible()
  await page.getByRole('button', { name: /Submit report|Create separate issue/ }).click()

  await expect(page.getByText(/was created and routed to Electrical Unit/)).toBeVisible()
})

test('reporting validation prevents incomplete analysis', async ({ page }) => {
  await signInAs(page, 'student')
  await page.getByRole('button', { name: 'Report an issue' }).click()
  await page.getByLabel('Issue title').fill('Tap')
  await page.getByRole('button', { name: 'Analyse report with AI' }).click()
  await expect(page.getByText('Use at least 5 characters.')).toBeVisible()
  await expect(page.getByText('Add at least 20 characters so the response team can act.')).toBeVisible()
})

test('assistant answers from an actual issue record', async ({ page }) => {
  await signInAs(page, 'student')
  await openNavigationPage(page, 'AI Assistant')
  await page.getByLabel('Ask CampusFix AI').fill('What is the status of CF-1042?')
  await page.getByRole('button', { name: 'Ask', exact: true }).click()
  await expect(page.getByText(/CF-1042 .* is currently in progress/)).toBeVisible()
})

test('administrator can open analytics and the audit trail', async ({ page }) => {
  await signInAs(page, 'admin')
  await expect(page.getByText('Campus operations command centre')).toBeVisible()
  await openNavigationPage(page, 'Analytics')
  await expect(page.getByRole('heading', { name: 'Analytics and AI insights' })).toBeVisible()
  await openNavigationPage(page, 'Audit Trail')
  await expect(page.getByRole('heading', { name: 'Audit trail' })).toBeVisible()
})
