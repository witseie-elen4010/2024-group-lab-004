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
})
