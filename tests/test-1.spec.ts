import { test, expect } from '@playwright/test'
import exp from 'constants'

test('guest sees no past games', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Continue as Guest' }).click()
  await page.getByPlaceholder('Enter your nickname').click()
  await page.getByPlaceholder('Enter your nickname').fill('test')
  await page.getByRole('button', { name: 'Join' }).click()
  await page.getByRole('button', { name: 'History' }).click()
  expect(await page.locator('#gameList').innerText()).toBe('')
})

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
  await page.waitForTimeout(5000)
  expect(await page.locator('#gameList').innerText()).not.toBe('')
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
  await page.waitForTimeout(5000)
  expect(await page.getByRole('button', { name: 'Next' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()
  expect(await page.locator('#gameList').innerText()).not.toBe('')
  expect(await page.getByRole('button', { name: 'Next' })).not.toBeVisible()
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
  await page.waitForTimeout(5000)
  expect(await page.getByRole('button', { name: 'Previous' })).not.toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()
  expect(await page.getByRole('button', { name: 'Previous' })).toBeVisible()
  await page.getByRole('button', { name: 'Previous' }).click()
  expect(await page.getByRole('button', { name: 'Previous' })).not.toBeVisible()
})

test('user with no past games sees nothing', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill('rudi')
  await page.getByLabel('Password:').click()
  await page.getByLabel('Password:').fill('me')
  await page
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page.getByRole('button', { name: 'History' }).click()
  await page.waitForTimeout(5000)
  expect(await page.locator('#gameList').innerText()).toBe('')
})

test('button returns to draw screen', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill('rudi')
  await page.getByLabel('Username:').press('Tab')
  await page.getByLabel('Password:').fill('me')
  await page
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page.getByRole('button', { name: 'History' }).click()
  await page.getByRole('button', { name: 'Back to Home' }).click()
  await page.getByRole('button', { name: 'History' }).click()
})

