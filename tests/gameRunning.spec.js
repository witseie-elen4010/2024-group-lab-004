const { test, expect } = require('@playwright/test')

test('start button becomes visible when 3 members join the room', async ({
  context,
}) => {
  // Create a room on page1
  const page1 = await context.newPage()
  await page1.goto('http://localhost:4000/landing')
  await page1.click('#createRoom')
  await page1.waitForSelector('#roomId')
  const roomId = await page1.$eval('#roomId', (el) => el.textContent)

  // Join the room on page2
  const page2 = await context.newPage()
  await page2.goto('http://localhost:4000/landing')
  await page2.click('#joinRoom')
  await page2.waitForSelector('#roomToJoin')
  await page2.fill('#roomToJoin', roomId)
  await page2.click('#submitJoinRoom')

  // Join the room on page3
  const page3 = await context.newPage()
  await page3.goto('http://localhost:4000/landing')
  await page3.click('#joinRoom')
  await page3.waitForSelector('#roomToJoin')
  await page3.fill('#roomToJoin', roomId)
  await page3.click('#submitJoinRoom')

  // Wait for the members count to update on page1
  await page1.waitForFunction(
    (membersCount) =>
      document.querySelector('#membersCount').textContent === membersCount,
    '3'
  )

  // Check if the start game button is visible on page1
  const isStartGameButtonVisible = await page1.$eval(
    '#startGame',
    (el) => el.style.display !== 'none'
  )
  expect(isStartGameButtonVisible).toBe(true)
})

test.describe('Getting to game page', () => {
  let page1, page2, page3, roomId

  test.beforeEach(async ({ context }) => {
    // Create a room on page1
    page1 = await context.newPage()
    await page1.goto('http://localhost:4000/landing')
    await page1.click('#createRoom')
    await page1.waitForSelector('#roomId')
    roomId = await page1.$eval('#roomId', (el) => el.textContent)

    // Join the room on page2
    page2 = await context.newPage()
    await page2.goto('http://localhost:4000/landing')
    await page2.click('#joinRoom')
    await page2.waitForSelector('#roomToJoin')
    await page2.fill('#roomToJoin', roomId)
    await page2.click('#submitJoinRoom')

    // Join the room on page3
    page3 = await context.newPage()
    await page3.goto('http://localhost:4000/landing')
    await page3.click('#joinRoom')
    await page3.waitForSelector('#roomToJoin')
    await page3.fill('#roomToJoin', roomId)
    await page3.click('#submitJoinRoom')

    // Wait for the members count to update on page1
    await page1.waitForFunction(
      (membersCount) =>
        document.querySelector('#membersCount').textContent === membersCount,
      '3'
    )
  })

  test('start game button becomes visible when 3 members join the room', async () => {
    // Check if the start game button is visible on page1
    const isStartGameButtonVisible = await page1.$eval(
      '#startGame',
      (el) => el.style.display !== 'none'
    )
    expect(isStartGameButtonVisible).toBe(true)
  })

  test('clicking start game button loads /draw page', async () => {
    // Start listening for the navigation event before clicking the start game button
    const navigationPromise = page1.waitForNavigation()

    // Click the start game button on page1
    await page1.click('#startGame')

    // Wait for navigation to complete
    await navigationPromise

    // Check if the current URL includes '/draw'
    const currentURL = page1.url()
    expect(currentURL).toContain('/draw')
  })

  test('clicking start game button on page1 loads /draw page on all pages', async () => {
    // Start listening for the navigation event before clicking the start game button
    const navigationPromise1 = page1.waitForNavigation()
    const navigationPromise2 = page2.waitForNavigation()
    const navigationPromise3 = page3.waitForNavigation()

    // Click the start game button on page1
    await page1.click('#startGame')

    // Wait for navigation to complete on all pages
    await navigationPromise1
    await navigationPromise2
    await navigationPromise3

    // Check if the current URL includes '/draw' on all pages
    const currentURL1 = page1.url()
    const currentURL2 = page2.url()
    const currentURL3 = page3.url()
    expect(currentURL1).toContain('/draw')
    expect(currentURL2).toContain('/draw')
    expect(currentURL3).toContain('/draw')
  })
})

test.describe('Gameplay tests', () => {
  let page1, page2, page3, roomId

  test.beforeEach(async ({ context }) => {
    // Create a room on page1
    page1 = await context.newPage()
    await page1.goto('http://localhost:4000/landing')
    await page1.click('#createRoom')
    await page1.waitForSelector('#roomId')
    roomId = await page1.$eval('#roomId', (el) => el.textContent)

    // Join the room on page2
    page2 = await context.newPage()
    await page2.goto('http://localhost:4000/landing')
    await page2.click('#joinRoom')
    await page2.waitForSelector('#roomToJoin')
    await page2.fill('#roomToJoin', roomId)
    await page2.click('#submitJoinRoom')

    // Join the room on page3
    page3 = await context.newPage()
    await page3.goto('http://localhost:4000/landing')
    await page3.click('#joinRoom')
    await page3.waitForSelector('#roomToJoin')
    await page3.fill('#roomToJoin', roomId)
    await page3.click('#submitJoinRoom')

    // Wait for the members count to update on page1
    await page1.waitForFunction(
      (membersCount) =>
        document.querySelector('#membersCount').textContent === membersCount,
      '3'
    )

    const navigationPromise1 = page1.waitForNavigation()
    const navigationPromise2 = page2.waitForNavigation()
    const navigationPromise3 = page3.waitForNavigation()

    // Click the start game button on page1
    await page1.click('#startGame')

    // Wait for navigation to complete on all pages
    await navigationPromise1
    await navigationPromise2
    await navigationPromise3
  })

  test('pressing enter on page1 makes waiting container visible', async () => {
    // Press enter on page1

    let isVisible = await page1.locator('#waitingContainer').isVisible()
    expect(isVisible).toBe(false)
    await page1.locator('#getInput').fill('test prompt')
    await page1.locator('#doneButton').click()

    // Check if the waitingContainer is visible on page1
    isVisible = await page1.locator('#waitingContainer').isVisible()
    expect(isVisible).toBe(true)
  })

  test('waitingContainer is no longer visible when all pages fill input and click done button', async () => {
    // Fill the input and click the done button on all pages
    await Promise.all([
      page1.locator('#getInput').fill('test prompt'),
      page2.locator('#getInput').fill('test prompt'),
      page3.locator('#getInput').fill('test prompt'),
    ])

    await Promise.all([
      page1.locator('#doneButton').click(),
      page2.locator('#doneButton').click(),
      page3.locator('#doneButton').click(),
    ])

    // Check if the waitingContainer is no longer visible on all pages
    const isVisible1 = await page1.locator('#waitingContainer').isVisible()
    const isVisible2 = await page2.locator('#waitingContainer').isVisible()
    const isVisible3 = await page3.locator('#waitingContainer').isVisible()

    expect(isVisible1).toBe(false)
    expect(isVisible2).toBe(false)
    expect(isVisible3).toBe(false)
  })

  test('canvas is visible when all pages click done button', async () => {
    // Click the done button on all pages
    await Promise.all([
      page1.locator('#doneButton').click(),
      page2.locator('#doneButton').click(),
      page3.locator('#doneButton').click(),
    ])

    // Check if the canvas is visible on all pages
    const isCanvasVisible1 = await page1.locator('#canvas').isVisible()
    const isCanvasVisible2 = await page2.locator('#canvas').isVisible()
    const isCanvasVisible3 = await page3.locator('#canvas').isVisible()

    expect(isCanvasVisible1).toBe(true)
    expect(isCanvasVisible2).toBe(true)
    expect(isCanvasVisible3).toBe(true)
  })

  test('prompt from page1 is displayed on either page2 or page3 after all pages click done button', async () => {
    // Set the text content of getInput on page1 to "apples"
    await page1.locator('#getInput').fill('apples')

    // Click the done button on all pages
    await Promise.all([
      page1.locator('#doneButton').click(),
      page2.locator('#doneButton').click(),
      page3.locator('#doneButton').click(),
    ])

    // Get the prompts displayed on page2 and page3
    const promptPage2 = await page2.locator('#prompt').textContent()
    const promptPage3 = await page3.locator('#prompt').textContent()

    // Check if the prompt from page1 is displayed on either page2 or page3
    expect([promptPage2, promptPage3]).toContain('apples')
  })
})
