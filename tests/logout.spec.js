import { test, expect } from '@playwright/test'

test('logout button destroys session', async ({ context }) => {
  const page1 = await context.newPage()
  await page1.goto('http://localhost:4000/')
  await page1.getByRole('button', { name: 'Continue as Guest' }).click()
  await page1.getByPlaceholder('Enter your nickname').fill('test name 1')
  await page1.getByRole('button', { name: 'Join' }).click()
  await page1.waitForSelector('#createPublicRoom')
  await page1.getByRole('button', { name: 'Create Public Game' }).click()

  const page2 = await context.newPage()
  await page2.goto('http://localhost:4000/')
  await page2.getByRole('button', { name: 'Continue as Guest' }).click()
  await page2.getByPlaceholder('Enter your nickname').fill('test name 2')
  await page2.getByRole('button', { name: 'Join' }).click()
  await page2.waitForSelector('#joinPublicRoom')
  await page2.getByRole('button', { name: 'Join Public Game' }).click()
  await page2.getByRole('button', { name: /^Join$/ }).click()

  const page3 = await context.newPage()
  await page3.goto('http://localhost:4000/')
  await page3.getByRole('button', { name: 'Continue as Guest' }).click()
  await page3.getByPlaceholder('Enter your nickname').fill('test name 3')
  await page3.getByRole('button', { name: 'Join' }).click()
  await page3.getByRole('button', { name: 'Join Public Game' }).click()
  await page3.getByRole('button', { name: /^Join$/ }).click()

  await page1.getByRole('button', { name: 'Start Game' }).click()

  await page1.getByRole('button', { name: 'Logout' }).click()
  await page1.getByRole('button', { name: 'Sign In' }).click()
  expect(
    await page1
      .getByRole('heading', { name: 'Login to Your Account' })
      .isVisible()
  )
})
