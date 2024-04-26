import { test, expect } from '@playwright/test'

test('welcome page is displayed', async ({ page }) => {
  await page.goto('http://localhost:4000')
  expect(await page.locator('body').isVisible()).toBeTruthy()
})

test('sign in button is displayed', async ({ page }) => {
  await page.goto('http://localhost:4000')
  expect(await page.locator('#signin-btn').isVisible()).toBeTruthy()
})

test('continue as guest button is displayed', async ({ page }) => {
  await page.goto('http://localhost:4000')
  expect(await page.locator('#guest-btn').isVisible()).toBeTruthy()
})

test('sign in button is clickable and takes you to login page', async ({
  page,
}) => {
  await page.goto('http://localhost:4000')
  await page.locator('#signin-btn').click()

  const currentUrl = page.url()

  // Check if the current URL is the expected URL
  expect(currentUrl).toBe('http://localhost:4000/login')
})

test('Textbox appears once "Continue as Guest" is clicked', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Continue as Guest' }).click()
  expect(
    await page.getByPlaceholder('Enter your nickname').isVisible()
  ).toBeTruthy()
})

test('join button appears once "Continue as Guest" is clicked', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Continue as Guest' }).click()
  expect(
    await page.getByRole('button', { name: 'Join' }).isVisible()
  ).toBeTruthy()
})

test('Sign in button changes once "Continue as Guest" is clicked', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Continue as Guest' }).click()
  expect(
    await page.getByRole('button', { name: 'Sign In Instead' }).isVisible()
  ).toBeTruthy()
})

test('Join button takes you to draw page', async ({ page }) => {
  await page.goto('http://localhost:4000/')
  await page.getByRole('button', { name: 'Continue as Guest' }).click()
  await page.getByPlaceholder('Enter your nickname').click()
  await page.getByPlaceholder('Enter your nickname').fill('Bob')
  await page.getByRole('button', { name: 'Join' }).click()

  // Get the current URL
  const currentUrl = page.url()

  // Check if the current URL is the expected URL
  expect(currentUrl).toBe('http://localhost:4000/draw')
  page.close()
})
