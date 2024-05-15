import { test, expect } from '@playwright/test'

test('logout button destroys session', async ({ context }) => {
  const setupPage = async (nickname) => {
    const page = await context.newPage()
    await page.goto('http://localhost:4000/')
    await page.getByRole('button', { name: 'Continue as Guest' }).click()
    await page.getByPlaceholder('Enter your nickname').fill(nickname)
    await page.getByRole('button', { name: 'Join' }).click()
    return page
  }

  const pagePromises = [
    setupPage('test name 1'),
    setupPage('test name 2'),
    setupPage('test name 3'),
  ]

  const [page1, page2, page3] = await Promise.all(pagePromises)
  await page1.getByRole('button', { name: 'Create Private Game' }).click()
  await page1.waitForSelector('#roomId')
  const roomID = await page1.locator('#roomId').innerText()

  await page2.getByRole('button', { name: 'Join Private Game' }).click()
  await page3.getByRole('button', { name: 'Join Private Game' }).click()

  await Promise.all([
    page2.getByPlaceholder('Enter room ID').fill(roomID),
    page3.getByPlaceholder('Enter room ID').fill(roomID),
  ])

  await Promise.all([
    page2.getByRole('button', { name: 'Join', exact: true }).click(),
    page3.getByRole('button', { name: 'Join', exact: true }).click(),
  ])

  await page1.getByRole('button', { name: 'Start Game' }).click()

  await page1.waitForURL('http://localhost:4000/draw')
  await page1.getByRole('button', { name: 'Logout' }).click()
  await page1.getByRole('button', { name: 'Sign In' }).click()
  expect(
    await page1
      .getByRole('heading', { name: 'Login to Your Account' })
      .isVisible()
  )
})
