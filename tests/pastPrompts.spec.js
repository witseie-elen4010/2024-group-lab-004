import { test, expect } from '@playwright/test'
import exp from 'constants'

test('user sees past games', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Previous' }).click()
  expect(await page.getByText('test1 - 4/30/').isVisible())
})

test('next page button works', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Next' }).click()
  expect(await page.getByText('test11 - 4/30/').isVisible())
})

test('previous page button works', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Previous' }).click()
  expect(await page.getByText('test1 - 4/30/').isVisible())
})
