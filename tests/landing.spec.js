import { test, expect } from '@playwright/test'

test.describe('Landing page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/landing')
  })

  test('createRoomButton exists', async ({ page }) => {
    const createRoomButton = await page.$('#createRoom')
    expect(createRoomButton).toBeTruthy()
  })

  test('joinRoomButton exists', async ({ page }) => {
    const joinRoomButton = await page.$('#joinRoom')
    expect(joinRoomButton).toBeTruthy()
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

