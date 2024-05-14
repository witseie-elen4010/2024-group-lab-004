// import { test, expect } from '@playwright/test'

// test('user sees past games', async ({ page }) => {
//   await page.goto('http://localhost:4000/')
//   await page.getByRole('button', { name: 'Continue as Guest' }).click()
//   await page.getByPlaceholder('Enter your nickname').fill('test')
//   await page.getByRole('button', { name: 'Join' }).click()
//   await page.getByRole('button', { name: 'History' }).click()

//   let numGames = await page.locator('li').count()
//   while (numGames === 0) {
//     numGames = await page.locator('li').count()
//   }

//   expect(numGames).toBeGreaterThan(0)
// })

// // test('next page button works', async ({ page }) => {
// //   await page.goto('http://localhost:4000/')
// //   await page.getByRole('button', { name: 'Sign In' }).click()
// //   await page.getByLabel('Username:').click()
// //   await page.getByLabel('Username:').fill('test')
// //   await page.getByLabel('Password:').click()
// //   await page.getByLabel('Password:').fill('test')
// //   await page
// //     .locator('#loginForm')
// //     .getByRole('button', { name: 'Login' })
// //     .click()
// //   await page.getByRole('button', { name: 'History' }).click()
// //   await page.getByRole('button', { name: 'Next' }).click()
// //   expect(await page.getByText('test11 - 4/30/').isVisible())
// // })

// // test('previous page button works', async ({ page }) => {
// //   await page.goto('http://localhost:4000/')
// //   await page.getByRole('button', { name: 'Sign In' }).click()
// //   await page.getByLabel('Username:').click()
// //   await page.getByLabel('Username:').fill('test')
// //   await page.getByLabel('Password:').click()
// //   await page.getByLabel('Password:').fill('test')
// //   await page
// //     .locator('#loginForm')
// //     .getByRole('button', { name: 'Login' })
// //     .click()
// //   await page.getByRole('button', { name: 'History' }).click()
// //   await page.getByRole('button', { name: 'Next' }).click()
// //   await page.getByRole('button', { name: 'Previous' }).click()
// //   expect(await page.getByText('test1 - 4/30/').isVisible())
// // })
// // test('games in history show past drawings', async ({ page }) => {
// //   await page.goto('http://localhost:4000/')
// //   await page.getByRole('button', { name: 'Sign In' }).click()
// //   await page.getByLabel('Username:').click()
// //   await page.getByLabel('Username:').fill('guest')
// //   await page.getByLabel('Password:').click()
// //   await page.getByLabel('Password:').fill('guest')
// //   await page
// //     .locator('#loginForm')
// //     .getByRole('button', { name: 'Login' })
// //     .click()
// //   await page.getByRole('button', { name: 'History' }).click()
// //   await page.getByText('Test here, game ID').click()

// //   // Wait for <li> element to appear
// //   await page.waitForSelector('li', { timeout: 10000 })

// //   // Check for <li> element
// //   const listItem = await page.locator('li')
// //   expect(await listItem.count()).toBeGreaterThan(0)

// //   // Wait for <img> element to appear
// //   await page.waitForSelector('img', { timeout: 10000 })

// //   // Check for image
// //   const image = await page.locator('img')
// //   expect(await image.count()).toBeGreaterThan(0)
// // })
