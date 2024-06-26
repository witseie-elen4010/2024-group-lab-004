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

  await page1.getByRole('button', { name: 'Start Game' }).click()

  return { page1, page2, page3 }
}

// waits for the overlay to disappear on the page
async function waitForOverlayToHide(page) {
  await page.waitForFunction(
    'document.querySelector("#waitingContainer").style.display === "none"'
  )
}

test('canvas exists', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page1.waitForSelector('#canvas')
  const canvas = await page1.$('#canvas')
  expect(canvas).toBeTruthy()
})

test('erasor sets colour to white', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  await page1.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page3.locator('#doneButton').click()

  await page1.waitForFunction(
    'document.querySelector("#waitingContainer").style.display === "none"'
  )

  await page1.locator('#eraser').click()
  const strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#ffffff')
})

test('player can exit game', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  await page1.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page3.locator('#doneButton').click()

  await page1.locator('#helpButton').getByRole('img', { name: 'Logo' }).click()
  await page1.locator('#exitButton').click()
  // check that I am at the url localhost:4000/landing
  expect(page1.url()).toBe('http://localhost:4000/landing')
})

test('canvas has correct dimensions', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  await page1.waitForSelector('#doneButton')

  const canvas = await page1.$('canvas')
  const width = await canvas.getAttribute('width')
  const height = await canvas.getAttribute('height')

  const windowSize = await page1.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }))

  expect(width).toBe(`${windowSize.innerWidth - 300}`)
  expect(height).toBe(`${windowSize.innerHeight - 350}`)
})

test('canvas has white rectangle', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  await page1.waitForSelector('#doneButton')

  const whiteRectangle = await page1.evaluate(() => {
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return Array.from(imageData.data).every((value) => value === 255)
  })

  expect(whiteRectangle).toBeTruthy()
})

test.describe('Testing the input field when the draw page is loaded', () => {
  test('the overlay is created', async ({ context }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    await page1.waitForSelector('#overlay')
    const overlay = await page1.$('#overlay')
    expect(overlay).toBeTruthy()
  })

  test('input field is created', async ({ context }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    await page1.waitForSelector('#getInput')
    const inputField = await page1.$('#getInput')
    expect(inputField).toBeTruthy()
  })

  test('button is created', async ({ context }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    await page1.waitForSelector('#doneButton')

    const button = await page1.$('#doneButton')
    expect(button).toBeTruthy()
  })
})

test('waitingContainer becomes visible when the done button is pressed', async ({
  context,
}) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  // enter a prompt
  await page1.waitForSelector('#doneButton')
  await page1.locator('#getInput').fill('test prompt')
  await page1.locator('#doneButton').click()

  // check if the waitingContainer is visible
  const isVisible = await page1.locator('#waitingContainer').isVisible()
  expect(isVisible).toBe(true)
})

test('input field closes when the enter key is pressed', async ({
  context,
}) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  await page1.waitForSelector('#doneButton')
  await page1.locator('#getInput').press('Enter')

  // check if the getInput field is not visible
  const isVisible = await page1.locator('#getInput').isVisible()
  expect(isVisible).toBe(false)
})

test('prompt is displayed to one other user', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  const testPrompt = 'test prompt'
  await page1.waitForSelector('#doneButton')
  await page1.locator('#getInput').fill(testPrompt)
  await page1.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page3.locator('#doneButton').click()

  await Promise.all([
    waitForOverlayToHide(page1),
    waitForOverlayToHide(page2),
    waitForOverlayToHide(page3),
  ])

  // check if the text 'test prompt' appears in exactly one of page2 or page3's prompt
  const prompt1 = await page1.locator('#prompt').innerText()
  const prompt2 = await page2.locator('#prompt').innerText()
  const prompt3 = await page3.locator('#prompt').innerText()

  const promptCount = [prompt2, prompt3].filter(
    (prompt) => prompt === testPrompt
  ).length

  expect(promptCount).toBe(1)
  expect(prompt1).not.toBe(testPrompt)
})

test('the timer bar appears until the prompt is entered', async ({
  context,
}) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page1.waitForSelector('#doneButton')

  // check if the timer bar is displayed
  let timerBar = await page1.locator('#inputCountdownBar').isVisible()
  expect(timerBar).toBe(true)

  // enter a prompt and click done
  await page1.locator('#doneButton').click()

  // check if the timer bar is displayed
  timerBar = await page1.locator('#inputCountdownBar').isVisible()
  expect(timerBar).toBe(false)
})

test.describe('testing that the timer bar decreases in width', () => {
  const waitTime = 1500
  //   The difPercentage part of the test is very inconsistent, and it can go from about 1-2.5% for all of them, up to around 10%

  test('The input timer bar decreases for the original prompt entering', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    await page1.waitForSelector('#doneButton')
    await page1.waitForTimeout(1000)

    // get the initial width of the timer bar
    const initialWidth = parseInt(
      await page1.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    // wait for some time
    await page1.waitForTimeout(waitTime)

    // get the width of the timer bar after half a second
    const laterWidth = parseInt(
      await page1.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    // check if the width of the timer bar has decreased
    expect(laterWidth).not.toEqual(initialWidth)
  })

  test('The input timer bar decreases for describing a drawing', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)

    // get to the describe a drawing point
    await page3.waitForSelector('#doneButton')
    await page3.locator('#doneButton').click()
    await page2.waitForSelector('#doneButton')
    await page2.locator('#doneButton').click()
    await page1.waitForSelector('#doneButton')
    await page1.locator('#doneButton').click()

    await page3.locator('#submit').click()
    await page2.locator('#submit').click()
    await page1.locator('#submit').click()

    // get the initial width of the timer bar
    const initialWidth = parseInt(
      await page1.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    // wait for some time
    await page1.waitForTimeout(waitTime)

    // get the width of the timer bar after half a second
    const laterWidth = parseInt(
      await page1.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    // check if the width of the timer bar has decreased
    expect(laterWidth).not.toEqual(initialWidth)
  })
  test('The draw timer bar decreases', async ({ context }) => {
    // get to the describe a drawing point
    const { page1, page2, page3 } = await navigateToGame(context)

    await page3.waitForSelector('#doneButton')
    await page3.locator('#doneButton').click()
    await page2.waitForSelector('#doneButton')
    await page2.locator('#doneButton').click()
    await page1.waitForSelector('#doneButton')
    await page1.locator('#doneButton').click()

    // get the initial width of the timer bar
    const initialWidth = parseInt(
      await page1.$eval(
        '#drawingCountdownBar',
        (e) => getComputedStyle(e).width
      )
    )

    // wait for some time
    await page1.waitForTimeout(waitTime)

    // get the width of the timer bar after half a second
    const laterWidth = parseInt(
      await page1.$eval(
        '#drawingCountdownBar',
        (e) => getComputedStyle(e).width
      )
    )

    // check if the width of the timer bar has decreased
    expect(laterWidth).toBeLessThan(initialWidth)
  })
})

test('testing that a drawing is shown after submitting the prompt', async ({
  context,
}) => {
  const { page1, page2, page3 } = await navigateToGame(context)

  await page1.waitForSelector('#doneButton')

  // make sure the drawingDisplay is not visible
  let drawingDisplay = await page1.locator('#drawing').isVisible()
  expect(drawingDisplay).toBe(false)

  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  // press the submit button
  await page1.locator('#submit').click()
  await page2.locator('#submit').click()
  await page3.locator('#submit').click()

  await waitForOverlayToHide(page1)

  // make sure the drawingDisplay is  visible
  drawingDisplay = await page1.locator('#drawing').isVisible()
  expect(drawingDisplay).toBe(true)
})

test('testing colour change', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  // Check Red
  await page1.locator('#redButton').click()
  let strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#ff0000')

  // Check Blue
  await page1.locator('#blueButton').click()
  strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#0000ff')

  // Check Green
  await page1.locator('#greenButton').click()
  strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#008000')

  // Check Pink
  await page1.locator('#pinkButton').click()
  strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#ffc0cb')
})

test('testing custom colour picker', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  await page1.locator('#colour-picker').fill('#01f901')

  // Get the strokeStyle color of the canvas
  const strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })

  // Check if the strokeStyle color is the expected color
  expect(strokeStyleColor).toBe('#01f901')
})

test('Test linewidth changes', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  await page1.locator('#getInput').press('Enter')
  await page1.locator('#size-picker').fill('23')

  const strokeStyleColor = await page1.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.lineWidth
  })

  expect(strokeStyleColor).toBe(23)
})

test('Help menu appears when help button is clicked', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  await page1.locator('#helpButton').getByRole('img', { name: 'Logo' }).click()
  expect(
    await page1.getByRole('heading', { name: 'How to play' }).isVisible()
  ).toBeTruthy()
})

test('Help menu closes when close button is clicked', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  await page1.locator('#helpButton').getByRole('img', { name: 'Logo' }).click()
  await page1.locator('#helpClose').click()
  expect(
    await page1.getByRole('heading', { name: 'How to play' }).isVisible()
  ).toBeFalsy()
})

test('Undo and redo buttons disabled on loading.', async ({ context }) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  expect(
    await page1.getByRole('button', { name: 'Undo' }).isDisabled()
  ).toBeTruthy()
  expect(
    await page1.getByRole('button', { name: 'Redo' }).isDisabled()
  ).toBeTruthy()
})

test.describe('Testing the undo and redo buttons', () => {
  test('Undo button becomes enabled once something is drawn', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page3.locator('#doneButton').click()
    await page2.locator('#doneButton').click()
    await page1.locator('#doneButton').click()

    await page1.locator('#canvas').click({
      position: {
        x: 525,
        y: 195,
      },
    })

    expect(
      await page1.getByRole('button', { name: 'Undo' }).isDisabled()
    ).toBeFalsy()
    expect(
      await page1.getByRole('button', { name: 'Redo' }).isDisabled()
    ).toBeTruthy()
  })

  test('Undo button back tracks drawing', async ({ context }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page3.locator('#doneButton').click()
    await page2.locator('#doneButton').click()
    await page1.locator('#doneButton').click()

    await page1.locator('#canvas').hover()
    await page1.mouse.down()
    for (let y = 500; y <= 600; y += 10) {
      await page1.mouse.move(500, y)
    }

    await page1.mouse.up()
    await page1.getByRole('button', { name: 'Undo' }).click()

    const isEmpty = await page1.evaluate(() => {
      const canvas = document.getElementById('canvas')
      const context = canvas.getContext('2d')
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      return Array.from(imageData.data).every((value) => value === 255)
    })

    expect(isEmpty).toBeTruthy()
  })

  test('Redo button undoes the undo button', async ({ context }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page3.locator('#doneButton').click()
    await page2.locator('#doneButton').click()
    await page1.locator('#doneButton').click()

    await page1.locator('#canvas').hover()
    await page1.mouse.down()
    for (let y = 500; y <= 600; y += 10) {
      await page1.mouse.move(500, y)
    }

    await page1.mouse.up()
    await page1.getByRole('button', { name: 'Undo' }).click()
    await page1.getByRole('button', { name: 'Redo' }).click()

    const isEmpty = await page1.evaluate(() => {
      const canvas = document.getElementById('canvas')
      const context = canvas.getContext('2d')
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      return Array.from(imageData.data).every((value) => value === 255)
    })

    expect(isEmpty).toBeFalsy()
  })

  test('Undo button becomes disabled after undoing all drawings', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page3.locator('#doneButton').click()
    await page2.locator('#doneButton').click()
    await page1.locator('#doneButton').click()

    await page1.locator('#canvas').hover()
    await page1.mouse.down()
    for (let y = 500; y <= 600; y += 10) {
      await page1.mouse.move(500, y)
    }

    await page1.mouse.up()
    await page1.getByRole('button', { name: 'Undo' }).click()

    const isEmpty = await page1.evaluate(() => {
      const canvas = document.getElementById('canvas')
      const context = canvas.getContext('2d')
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      return Array.from(imageData.data).every((value) => value === 255)
    })

    expect(isEmpty).toBeTruthy()
    expect(
      await page1.getByRole('button', { name: 'Undo' }).isDisabled()
    ).toBeTruthy()
  })

  test('Redo button becomes disabled after redoing all drawings', async ({
    context,
  }) => {
    const { page1, page2, page3 } = await navigateToGame(context)
    await page3.locator('#doneButton').click()
    await page2.locator('#doneButton').click()
    await page1.locator('#doneButton').click()

    await page1.locator('#canvas').hover()
    await page1.mouse.down()
    for (let y = 500; y <= 600; y += 10) {
      await page1.mouse.move(500, y)
    }

    await page1.mouse.up()
    await page1.getByRole('button', { name: 'Undo' }).click()
    await page1.getByRole('button', { name: 'Redo' }).click()

    const isEmpty = await page1.evaluate(() => {
      const canvas = document.getElementById('canvas')
      const context = canvas.getContext('2d')
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      return Array.from(imageData.data).every((value) => value === 255)
    })

    expect(isEmpty).toBeFalsy()
    expect(
      await page1.getByRole('button', { name: 'Redo' }).isDisabled()
    ).toBeTruthy()
  })
})

test('Exactly 1 imposter is chosen at the start of the game', async ({
  context,
}) => {
  const { page1, page2, page3 } = await navigateToGame(context)
  await page3.locator('#doneButton').click()
  await page2.locator('#doneButton').click()
  await page1.locator('#doneButton').click()

  // wait for the websocket to send the message of who the imposter is
  await page1.waitForFunction(
    () =>
      document.querySelector('#playerStatus') &&
      !document
        .querySelector('#playerStatus')
        .innerText.includes('Are you an imposter?')
  )
  await page2.waitForFunction(
    () =>
      document.querySelector('#playerStatus') &&
      !document
        .querySelector('#playerStatus')
        .innerText.includes('Are you an imposter?')
  )
  await page3.waitForFunction(
    () =>
      document.querySelector('#playerStatus') &&
      !document
        .querySelector('#playerStatus')
        .innerText.includes('Are you an imposter?')
  )

  const playerStatus1 = await page1.locator('#playerStatus').innerText()
  const playerStatus2 = await page2.locator('#playerStatus').innerText()
  const playerStatus3 = await page3.locator('#playerStatus').innerText()

  // make sure only one says "You ARE the imposter!"
  const imposterCount = [playerStatus1, playerStatus2, playerStatus3].filter(
    (status) => status === 'You ARE the imposter!'
  ).length

  expect(imposterCount).toBe(1)
})
