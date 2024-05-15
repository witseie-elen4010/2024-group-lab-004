const { test, expect } = require('@playwright/test')

async function navigateToGame(context) {
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

    await Promise.all([
      page1.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page2.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page3.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
    ])

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

    await Promise.all([
      page1.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page2.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page3.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
    ])

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

    await Promise.all([
      page1.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page2.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page3.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
    ])

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
      page1.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page2.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page3.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
    ])

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

    await page1.waitForFunction(
      'document.querySelector("#waitingContainer").style.display === "none"'
    )

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
      page1.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page2.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page3.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
    ])

    await Promise.all([
      page1.locator('#doneButton').click(),
      page2.locator('#doneButton').click(),
      page3.locator('#doneButton').click(),
    ])

    await page1.waitForFunction(
      'document.querySelector("#waitingContainer").style.display === "none"'
    )

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
      page1.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page2.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
      page3.waitForFunction(
        'document.querySelector("#specialOverlay").style.display === "none"'
      ),
    ])

    // Simulate page3 exiting the game
    await page3.close()

    // Wait for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 4000))

    // Check if page1 and page2 navigate to /landing
    expect(page1.url()).toContain('/landing')
    expect(page2.url()).toContain('/landing')
  })
})
