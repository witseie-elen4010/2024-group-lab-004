import { test, expect } from '@playwright/test'

test('login page is displayed', async ({ page }) => {
  await page.goto('http://localhost:4000/login')
  expect(await page.locator('body').isVisible()).toBeTruthy()
})

test('login button is displayed', async ({ page }) => {
  await page.goto('http://localhost:4000/login')
  expect(await page.locator('#loginButton').isVisible()).toBeTruthy()
})

test('register button is displayed', async ({ page }) => {
  await page.goto('http://localhost:4000/login')
  expect(
    await page.getByRole('button', { name: 'Register' }).isVisible()
  ).toBeTruthy()
})

test('login button is clickable and takes you to login option', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/login')
  await page.locator('#loginButton').click()
  expect(
    await page
      .getByRole('heading', { name: 'Login to Your Account' })
      .isVisible()
  ).toBeTruthy()
})

test('register button is clickable and takes you to register option', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/login')
  await page.getByRole('button', { name: 'Register' }).click()
  expect(
    await page
      .getByRole('heading', { name: 'Register New Account' })
      .isVisible()
  ).toBeTruthy()
})

test('submitting the login form with wrong input should display an error', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/login')
  await page.getByLabel('Username:').click()
  await page.getByLabel('Username:').fill('awd')
  await page.getByLabel('Password:').click()
  await page.getByLabel('Password:').fill('awd')
  await page.goto('http://localhost:4000/login/?loginError=true')
  expect(
    await page.getByText('Invalid username or password').isVisible()
  ).toBeTruthy()
})
