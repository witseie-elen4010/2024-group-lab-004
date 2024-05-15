import { test, expect } from '@playwright/test'
import { env } from 'process'
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

test('user sees past games', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Continue as Guest' }).click()
  await page.getByPlaceholder('Enter your nickname').fill('test')
  await page.getByRole('button', { name: 'Join' }).click()
  await page.getByRole('button', { name: 'History' }).click()

  let numGames = await page.locator('li').count()
  while (numGames === 0) {
    numGames = await page.locator('li').count()
  }

  expect(numGames).toBeGreaterThan(0)
})

test('next page button works', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill(env.ADMIN_NAME)
  await page.getByLabel('Password:').click()
  await page.getByLabel('Password:').fill(env.ADMIN_PASSWORD)
  await page
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page.getByRole('button', { name: 'History' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.locator('li').first().click()
  expect(
    await page.getByRole('button', { name: 'Back to game list' }).isVisible()
  ).toBeTruthy()
})

test('previous page button works', async ({ page }) => {
  await page.goto('http://localhost:4000/')

  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill(env.ADMIN_NAME)
  await page.getByLabel('Password:').click()
  await page.getByLabel('Password:').fill(env.ADMIN_PASSWORD)
  await page
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page.getByRole('button', { name: 'View History' }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Previous' }).click()
  await page.locator('li').first().click()
  expect(
    await page.getByRole('button', { name: 'Back to game list' }).isVisible()
  ).toBeTruthy()
})
