import { test, expect } from '@playwright/test'

test('logout button destroys session', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill('test')
  await page.getByLabel('Password:').click()
  await page.getByLabel('Password:').fill('test')
  await page
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page.getByRole('button', { name: 'History' }).click()
  await page.getByRole('button', { name: 'Back to Home' }).click()
  await page.getByRole('button', { name: 'Logout' }).click()
  await page.goto('http://localhost:4000/history')
  expect(await page.getByRole('button', { name: 'Sign In' })).toBeVisible()
})

