import { test, expect } from '@playwright/test'

test.describe('Landing page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/landing')
  })

  test('createRoomButton is visible', async ({ page }) => {
    const createRoomButton = await page.$('#createRoom')
    const isVisible = await createRoomButton.isVisible()
    expect(isVisible).toBe(true)
  })

  test('joinRoomButton is visible', async ({ page }) => {
    const joinRoomButton = await page.$('#joinRoom')
    const isVisible = await joinRoomButton.isVisible()
    expect(isVisible).toBe(true)
  })

  test('startGameButton is not visible', async ({ page }) => {
    const startGameButton = await page.$('#startGame')
    const isVisible = await startGameButton.isVisible()
    expect(isVisible).toBe(false)
  })

  test('startGameButton exists', async ({ page }) => {
    const startGameButton = await page.$('#startGame')
    expect(startGameButton).toBeTruthy()
  })

  test('joinRoomForm exists', async ({ page }) => {
    const joinRoomForm = await page.$('#joinRoomForm')
    expect(joinRoomForm).toBeTruthy()
  })

  test('roomToJoinInput exists', async ({ page }) => {
    const roomToJoinInput = await page.$('#roomToJoin')
    expect(roomToJoinInput).toBeTruthy()
  })

  test('submitJoinRoomButton exists', async ({ page }) => {
    const submitJoinRoomButton = await page.$('#submitJoinRoom')
    expect(submitJoinRoomButton).toBeTruthy()
  })

  test('submitJoinRoomButton is not visible', async ({ page }) => {
    const submitJoinRoomButton = await page.$('#submitJoinRoom')
    const isVisible = await submitJoinRoomButton.isVisible()
    expect(isVisible).toBe(false)
  })

  test('join room', async ({ page }) => {
    await page.click('#joinRoom')

    // Check if the text area appears
    const roomToJoinInput = await page.$('#roomToJoin')
    expect(roomToJoinInput).toBeTruthy()
    const submitJoinRoomButton = await page.$('#submitJoinRoom')
    await page.fill('#roomToJoin', 'testRoom')
    await page.click('#submitJoinRoom')
    const isVisible = await submitJoinRoomButton.isVisible()
    expect(isVisible).toBe(true)
  })

  test('join room with invalid id', async ({ page }) => {
    await page.click('#joinRoom')
    await page.fill('#roomToJoin', 'invalidRoomId')
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toBe('Room does not exist')
      dialog.dismiss()
    })
    await page.click('#submitJoinRoom')
  })

  test('join room created by another page', async ({ context }) => {
    // Create a room on page1
    const page1 = await context.newPage()
    await page1.goto('http://localhost:4000/landing')
    await page1.click('#createRoom')
    const roomId = await page1.$eval('#roomId', (el) => el.textContent)

    // Join the room on page2
    const page2 = await context.newPage()
    await page2.goto('http://localhost:4000/landing')
    await page2.click('#joinRoom')
    await page2.fill('#roomToJoin', roomId)
    await page2.click('#submitJoinRoom')

    // Check if the members count is 2 on both pages
    const membersCount1 = await page1.$eval(
      '#membersCount',
      (el) => el.textContent
    )
    const membersCount2 = await page2.$eval(
      '#membersCount',
      (el) => el.textContent
    )
    expect(membersCount1).toBe('2')
    expect(membersCount2).toBe('2')
  })

  test('create room', async ({ page }) => {
    await page.click('#createRoom')
    const createRoomButtonDisplay = await page.$eval(
      '#createRoom',
      (el) => getComputedStyle(el).display
    )
    const joinRoomButtonDisplay = await page.$eval(
      '#joinRoom',
      (el) => getComputedStyle(el).display
    )
    expect(createRoomButtonDisplay).toBe('none')
    expect(joinRoomButtonDisplay).toBe('none')

    // Check if the roomId and membersCount are displayed
    const roomIdDisplay = await page.$eval(
      '#roomId',
      (el) => getComputedStyle(el).display
    )
    const membersCountDisplay = await page.$eval(
      '#membersCount',
      (el) => getComputedStyle(el).display
    )
    expect(roomIdDisplay).not.toBe('none')
    expect(membersCountDisplay).not.toBe('none')

    // Check if the roomId and membersCount have correct values
    const roomId = await page.$eval('#roomId', (el) => el.textContent)
    const membersCount = await page.$eval(
      '#membersCount',
      (el) => el.textContent
    )
    expect(roomId).toBeTruthy()
    expect(membersCount).toBe('1')
  })
})
