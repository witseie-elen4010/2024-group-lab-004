const { test, expect } = require('@playwright/test')

async function navigateToGame(context) {
  const page1 = await context.newPage()
  await page1.goto('http://localhost:4000/')
  await page1.getByRole('button', { name: 'Continue as Guest' }).click()
  await page1.getByPlaceholder('Enter your nickname').fill('test name 1')
  await page1.getByRole('button', { name: 'Join' }).click()
  await page1.getByRole('button', { name: 'Create Public Game' }).click()

  const page2 = await context.newPage()
  await page2.goto('http://localhost:4000/')
  await page2.getByRole('button', { name: 'Continue as Guest' }).click()
  await page2.getByPlaceholder('Enter your nickname').fill('test name 2')
  await page2.getByRole('button', { name: 'Join' }).click()
  await page2.getByRole('button', { name: 'Join Public Game' }).click()
  await page2.getByRole('button', { name: /^Join$/ }).click()

  const page3 = await context.newPage()
  await page3.goto('http://localhost:4000/')
  await page3.getByRole('button', { name: 'Continue as Guest' }).click()
  await page3.getByPlaceholder('Enter your nickname').fill('test name 3')
  await page3.getByRole('button', { name: 'Join' }).click()
  await page3.getByRole('button', { name: 'Join Public Game' }).click()
  await page3.getByRole('button', { name: /^Join$/ }).click()

  // await page1.getByRole('button', { name: 'Start Game' }).click()
  return { page1, page2, page3 }
}

test.describe('Start game tests', () => {
  test('member count is correct', async ({ context }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    // await page1.waitForTimeout(500) // needed?

    // check that memberCount == 3
    const memberCount = await page1.locator('#membersCount').textContent()
    expect(memberCount).toBe('3')
  })

  // Test if the Start Game button becomes visible after three members join
  test('start game button becomes visible when 3 members join the room', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    // Wait for the members count to update on page1
    await page1.waitForFunction(
      (membersCount) =>
        document.querySelector('#membersCount').textContent === membersCount,
      '3'
    )

    // Check if the Start Game button is visible on page1
    const isStartGameButtonVisible = await page1.$eval(
      '#startGame',
      (el) => el.style.display !== 'none'
    )
    expect(isStartGameButtonVisible).toBe(true)
  })

  // Test navigation to the /draw page
  test('clicking start game button loads /draw page on all pages', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page1.getByRole('button', { name: 'Start Game' }).click()

    await page1.waitForSelector('#doneButton')
    await page2.waitForSelector('#doneButton')
    await page3.waitForSelector('#doneButton')

    expect(page1.url()).toContain('/draw')
    expect(page2.url()).toContain('/draw')
    expect(page3.url()).toContain('/draw')
  })

  // Test if the /draw page is loaded on all pages
  test('clicking start game button on page1 loads /draw page on all pages', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page1.click('#startGame')
    await page1.waitForSelector('#doneButton')
    await page2.waitForSelector('#doneButton')
    await page3.waitForSelector('#doneButton')

    const currentURL1 = page1.url()
    const currentURL2 = page2.url()
    const currentURL3 = page3.url()
    expect(currentURL1).toContain('/draw')
    expect(currentURL2).toContain('/draw')
    expect(currentURL3).toContain('/draw')
  })
})

test.describe('Gameplay tests', () => {
  // Test if the waiting container is shown after filling and submitting the input
  test('pressing enter on page1 makes waiting container visible', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page1.getByRole('button', { name: 'Start Game' }).click()
    await page1.waitForSelector('#doneButton')

    let isVisible = await page1.locator('#waitingContainer').isVisible()
    expect(isVisible).toBe(false)
    await page1.locator('#doneButton').click()

    isVisible = await page1.locator('#waitingContainer').isVisible()
    expect(isVisible).toBe(true)
  })

  // Test if the waiting container is hidden after all pages complete input
  test('waitingContainer is no longer visible when all pages fill input and click done button', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page1.getByRole('button', { name: 'Start Game' }).click()

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

    const isVisible1 = await page1.locator('#waitingContainer').isVisible()
    const isVisible2 = await page2.locator('#waitingContainer').isVisible()
    const isVisible3 = await page3.locator('#waitingContainer').isVisible()

    expect(isVisible1).toBe(false)
    expect(isVisible2).toBe(false)
    expect(isVisible3).toBe(false)
  })

  // Test if the canvas is visible after all pages submit
  test('canvas is visible when all pages click done button', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page1.getByRole('button', { name: 'Start Game' }).click()

    await Promise.all([
      page1.locator('#doneButton').click(),
      page2.locator('#doneButton').click(),
      page3.locator('#doneButton').click(),
    ])

    const isCanvasVisible1 = await page1.locator('#canvas').isVisible()
    const isCanvasVisible2 = await page2.locator('#canvas').isVisible()
    const isCanvasVisible3 = await page3.locator('#canvas').isVisible()

    expect(isCanvasVisible1).toBe(true)
    expect(isCanvasVisible2).toBe(true)
    expect(isCanvasVisible3).toBe(true)
  })
})

test.describe('Exit game tests', () => {
  test('page1 and page2 navigate to /landing when page3 exits', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page1.getByRole('button', { name: 'Start Game' }).click()

    await Promise.all([
      page1.locator('#doneButton').click(),
      page2.locator('#doneButton').click(),
      page3.locator('#doneButton').click(),
    ])

    // Simulate page3 exiting the game
    await page3.close()

    // Wait for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Check if page1 and page2 navigate to /landing
    expect(page1.url()).toContain('/landing')
    expect(page2.url()).toContain('/landing')
  })
})
