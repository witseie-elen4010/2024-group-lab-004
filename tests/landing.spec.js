// import { test, expect } from '@playwright/test'

// async function signIn(page) {
//   await page.goto('http://localhost:4000/')
//   await page.getByRole('button', { name: 'Continue as Guest' }).click()
//   await page.getByPlaceholder('Enter your nickname').fill('test name 1')
//   await page.getByRole('button', { name: 'Join' }).click()
//   return page
// }

// test.describe('Landing page tests', () => {
//   test.beforeEach(async ({ page }) => {
//     page = await signIn(page)
//   })

//   test('createPrivateRoomButton is visible', async ({ page }) => {
//     const createPrivateRoomButton = await page.$('#createPrivateRoom')
//     const isVisible = await createPrivateRoomButton.isVisible()
//     expect(isVisible).toBe(true)
//   })

//   test('createPublicRoomButton is visible', async ({ page }) => {
//     const createPublicRoomButton = await page.$('#createPublicRoom')
//     const isVisible = await createPublicRoomButton.isVisible()
//     expect(isVisible).toBe(true)
//   })

//   test('joinRoomButton is visible', async ({ page }) => {
//     const joinRoomButton = await page.$('#joinRoom')
//     const isVisible = await joinRoomButton.isVisible()
//     expect(isVisible).toBe(true)
//   })

//   test('joinPublicRoomButton is visible', async ({ page }) => {
//     const joinPublicRoomButton = await page.$('#joinPublicRoom')
//     const isVisible = await joinPublicRoomButton.isVisible()
//     expect(isVisible).toBe(true)
//   })

//   test('startGameButton is not visible', async ({ page }) => {
//     const startGameButton = await page.$('#startGame')
//     const isVisible = await startGameButton.isVisible()
//     expect(isVisible).toBe(false)
//   })

//   test('startGameButton exists', async ({ page }) => {
//     const startGameButton = await page.$('#startGame')
//     expect(startGameButton).toBeTruthy()
//   })

//   test('joinRoomForm exists', async ({ page }) => {
//     const joinRoomForm = await page.$('#joinRoomForm')
//     expect(joinRoomForm).toBeTruthy()
//   })

//   test('roomToJoinInput exists', async ({ page }) => {
//     const roomToJoinInput = await page.$('#roomToJoin')
//     expect(roomToJoinInput).toBeTruthy()
//   })

//   test('submitJoinRoomButton exists', async ({ page }) => {
//     const submitJoinRoomButton = await page.$('#submitJoinRoom')
//     expect(submitJoinRoomButton).toBeTruthy()
//   })

//   test('submitJoinRoomButton is not visible', async ({ page }) => {
//     const submitJoinRoomButton = await page.$('#submitJoinRoom')
//     const isVisible = await submitJoinRoomButton.isVisible()
//     expect(isVisible).toBe(false)
//   })

//   test('join room', async ({ page }) => {
//     await page.click('#joinRoom')

//     // Check if the text area appears
//     const roomToJoinInput = await page.$('#roomToJoin')
//     expect(roomToJoinInput).toBeTruthy()
//     const submitJoinRoomButton = await page.$('#submitJoinRoom')
//     await page.fill('#roomToJoin', 'testRoom')
//     await page.click('#submitJoinRoom')
//     const isVisible = await submitJoinRoomButton.isVisible()
//     expect(isVisible).toBe(true)
//   })

//   test('join room with invalid id', async ({ page, browserName }) => {
//     if (browserName === 'webkit') {
//       test.fixme()
//       return
//     }

//     await page.click('#joinRoom')
//     await page.fill('#roomToJoin', 'invalidRoomId')
//     page.on('dialog', (dialog) => {
//       expect(dialog.message()).toBe('Room does not exist')
//       dialog.dismiss()
//     })
//     await page.click('#submitJoinRoom')
//   })

//   test('join room created by another page', async ({ context }) => {
//     // Create a room on page1
//     const page1 = await context.newPage()
//     await page1.goto('http://localhost:4000/landing')
//     await page1.click('#createPrivateRoom')
//     await page1.waitForSelector('#roomId')
//     const roomId = await page1.$eval('#roomId', (el) => el.textContent)

//     // Join the room on page2
//     const page2 = await context.newPage()
//     await page2.goto('http://localhost:4000/landing')
//     await page2.click('#joinRoom')
//     await page2.waitForSelector('#roomToJoin')
//     await page2.fill('#roomToJoin', roomId)
//     await page2.click('#submitJoinRoom')

//     // Wait for the members count to update on both pages
//     await page1.waitForFunction(
//       (membersCount) =>
//         document.querySelector('#membersCount').textContent === membersCount,
//       '2'
//     )
//     await page2.waitForFunction(
//       (membersCount) =>
//         document.querySelector('#membersCount').textContent === membersCount,
//       '2'
//     )

//     // Check if the members count is 2 on both pages
//     const membersCount1 = await page1.$eval(
//       '#membersCount',
//       (el) => el.textContent
//     )
//     const membersCount2 = await page2.$eval(
//       '#membersCount',
//       (el) => el.textContent
//     )
//     expect(membersCount1).toBe('2')
//     expect(membersCount2).toBe('2')
//   })

//   test('private room form is not visible after pressing join public room button', async ({
//     page,
//   }) => {
//     // Click on the join private room button
//     await page.click('#joinRoom')

//     // Click on the join public room button
//     await page.click('#joinPublicRoom')

//     // Check if the private room form is not visible
//     const joinRoomForm = await page.$('#joinRoomForm')
//     const isVisible = await joinRoomForm.isVisible()
//     expect(isVisible).toBe(false)
//   })

//   test('createPublicRoom button, when pressed, removes buttons and shows room ID with members: 1', async ({
//     context,
//   }) => {
//     // Go to landing page
//     const page = await context.newPage()
//     await page.goto('http://localhost:4000/landing')

//     // Click on the create public room button
//     await page.click('#createPublicRoom')

//     // Check if the buttons are not visible
//     const createPublicRoomButton = await page.$('#createPublicRoom')
//     const joinPublicRoomButton = await page.$('#joinPublicRoom')
//     expect(await createPublicRoomButton.isVisible()).toBe(false)
//     expect(await joinPublicRoomButton.isVisible()).toBe(false)
//   })
// })
