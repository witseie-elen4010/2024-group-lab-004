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
})
