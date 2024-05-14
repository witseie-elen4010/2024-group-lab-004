import { test, expect } from '@playwright/test'

test('admin hsitory', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill('admin')
  await page.getByLabel('Password:').click()
  await page.getByLabel('Password:').fill(`3l3n4010`)
  await page
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page.getByRole('button', { name: 'View History' }).click()
  await page.locator('li').first().click()
  await expect(
    await page.getByRole('button', { name: 'Back to game list' }).isVisible()
  ).toBeTruthy()
})
