const { test, expect } = require('@playwright/test')

test('canvas exists', async ({ context }) => {
  // Create a room on page1
  const page1 = await context.newPage()
  await page1.goto('http://localhost:4000/')
  await page1.getByRole('button', { name: 'Sign In' }).click()
  await page1.getByLabel('Username:').click()
  await page1.getByLabel('Username:').fill('test')
  await page1.getByLabel('Password:').click()
  await page1.getByLabel('Password:').fill('test')
  await page1
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page1.getByRole('button', { name: 'Create Room' }).click()
  await page1.waitForSelector('#roomId')
  const roomId = await page1.$eval('#roomId', (el) => el.textContent)

  // Join the room on page2
  const page2 = await context.newPage()
  await page2.goto('http://localhost:4000/')
  await page2.getByRole('button', { name: 'Sign In' }).click()
  await page2.getByLabel('Username:').click()
  await page2.getByLabel('Username:').fill('test')
  await page2.getByLabel('Password:').click()
  await page2.getByLabel('Password:').fill('test')
  await page2
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page2.click('#joinRoom')
  await page2.getByRole('button', { name: 'Join Room' }).click()
  await page2.fill('#roomToJoin', roomId)
  await page2.click('#submitJoinRoom')

  // Join the room on page3
  const page3 = await context.newPage()
  await page3.goto('http://localhost:4000/')
  await page3.getByRole('button', { name: 'Sign In' }).click()
  await page3.getByLabel('Username:').click()
  await page3.getByLabel('Username:').fill('test')
  await page3.getByLabel('Password:').click()
  await page3.getByLabel('Password:').fill('test')
  await page3
    .locator('#loginForm')
    .getByRole('button', { name: 'Login' })
    .click()
  await page3.click('#joinRoom')
  await page3.getByRole('button', { name: 'Join Room' }).click()
  await page3.fill('#roomToJoin', roomId)
  await page3.click('#submitJoinRoom')

  const canvas = await page3.$('canvas')
  expect(canvas).toBeTruthy()
})

test('canvas has correct dimensions', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  const canvas = await page.$('canvas')
  const width = await canvas.getAttribute('width')
  const height = await canvas.getAttribute('height')

  const windowSize = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }))

  expect(width).toBe(`${windowSize.innerWidth - 300}`)
  expect(height).toBe(`${windowSize.innerHeight - 300}`)
})

test('canvas has white rectangle', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  const whiteRectangle = await page.evaluate(() => {
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return Array.from(imageData.data).every((value) => value === 255)
  })

  expect(whiteRectangle).toBeTruthy()
})

test.describe('Testing the input field when the draw page is loaded', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/draw')
  })

  test('the overlay is created', async ({ page }) => {
    const overlay = await page.$('#overlay')
    expect(overlay).toBeTruthy()
  })

  test('input field is created', async ({ page }) => {
    const inputField = await page.$('#getInput')
    expect(inputField).toBeTruthy()
  })

  test('button is created', async ({ page }) => {
    const button = await page.$('#doneButton')
    expect(button).toBeTruthy()
  })
})

test('waitingContainer becomes visible when the done button is pressed', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/draw')

  // enter a prompt
  await page.locator('#getInput').fill('test prompt')
  await page.locator('#doneButton').click()

  // check if the waitingContainer is visible
  const isVisible = await page.locator('#waitingContainer').isVisible()
  expect(isVisible).toBe(true)
})

test('input field closes when the enter key is pressed', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  await page.locator('#getInput').press('Enter')

  // check if the getInput field is not visible
  const isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(false)
})

test('testing random prompt generation', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  await page.locator('#getInput').fill('test prompt')
  await page.locator('#getInput').press('Enter')

  // check if the prompt is displayed
  const prompt = await page.locator('#prompt').innerText()
  expect(prompt).toBe('test prompt')
})

// test('input field closes after a certain amount of time', async ({ page }) => {
//   const inputTimer = 3

//   await page.goto(`http://localhost:4000/draw?inputTimer=${inputTimer}`)

//   // input field does not close after 1.5 seconds before the timer ends
//   await page.waitForTimeout(inputTimer * 1000 - 1500)
//   let isVisible = await page.locator('#getInput').isVisible()
//   expect(isVisible).toBe(true)

//   // input field closes after the full time
//   await page.waitForTimeout(1500)
//   isVisible = await page.locator('#getInput').isVisible()
//   expect(isVisible).toBe(false)
// })

// test('the user can draw for a certain amount of time', async ({ page }) => {
//   const drawTimer = 3

//   await page.goto(`http://localhost:4000/draw?drawingTimer=${drawTimer}`)
//   await page.locator('#doneButton').click()

//   // input field does appear after 1.5 seconds before the timer ends
//   await page.waitForTimeout(drawTimer * 1000 - 1500)
//   let isVisible = await page.locator('#getInput').isVisible()
//   expect(isVisible).toBe(false)

//   // input field opens after the full time
//   await page.waitForTimeout(1500)
//   isVisible = await page.locator('#getInput').isVisible()
//   expect(isVisible).toBe(true)
// })

// test('testing the timer bar appears until the prompt is entered', async ({
//   page,
// }) => {
//   await page.goto('http://localhost:4000/draw')

//   // check if the timer bar is displayed
//   let timerBar = await page.locator('#inputCountdownBar').isVisible()
//   expect(timerBar).toBe(true)

//   // enter a prompt and click done
//   await page.locator('#doneButton').click()

//   // check if the timer bar is displayed
//   timerBar = await page.locator('#inputCountdownBar').isVisible()
//   expect(timerBar).toBe(false)
// })

// test.describe('testing that the timer bar decreases in width', () => {
//   const waitTime = 1000
//   const inputTimer = 25
//   const drawingTimer = 60
//   const percentageAllowed = 10
//   test.beforeEach(async ({ page }) => {
//     await page.goto(
//       `http://localhost:4000/draw?inputTimer=${inputTimer}&drawingTimer=${drawingTimer}`
//     )
//   })
//   The difPercentage part of the test is very inconsistent, and it can go from about 1-2.5% for all of them, up to around 10%

//   test('The input timer bar decreases for the original prompt entering', async ({
//     page,
//   }) => {
//     // get the initial width of the timer bar
//     const initialWidth = parseInt(
//       await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
//     )

//     // wait for some time
//     await page.waitForTimeout(waitTime)

//     // get the width of the timer bar after half a second
//     const laterWidth = parseInt(
//       await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
//     )

//     // get the expected decrease in width in seconds
//     const expectedDecrease =
//       ((initialWidth - laterWidth) / initialWidth) * inputTimer * 1000

//     // the difference in percentage must be less than a certain percentage
//     const difPercentage =
//       (Math.abs(expectedDecrease - waitTime) / waitTime) * 100

//     // check if the width of the timer bar has decreased
//     expect(laterWidth).toBeLessThan(initialWidth)
//     expect(difPercentage).toBeLessThan(percentageAllowed)
//   })

//   test('The input timer bar decreases for describing a drawing', async ({
//     page,
//   }) => {
//     // get to the describe a drawing point
//     await page.locator('#doneButton').click()
//     await page.locator('#submit').click()

//     // get the initial width of the timer bar
//     const initialWidth = parseInt(
//       await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
//     )

//     // wait for some time
//     await page.waitForTimeout(waitTime)

//     // get the width of the timer bar after half a second
//     const laterWidth = parseInt(
//       await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
//     )

//     // get the expected decrease in width in seconds
//     const expectedDecrease =
//       ((initialWidth - laterWidth) / initialWidth) * inputTimer * 1000

//     // the difference in percentage must be less than a certain percentage
//     const difPercentage =
//       (Math.abs(expectedDecrease - waitTime) / waitTime) * 100

//     // check if the width of the timer bar has decreased
//     expect(laterWidth).toBeLessThan(initialWidth)
//     expect(difPercentage).toBeLessThan(percentageAllowed)
//   })
//   test('The draw timer bar decreases', async ({ page }) => {
//     // get to the describe a drawing point
//     await page.locator('#doneButton').click()

//     // get the initial width of the timer bar
//     const initialWidth = parseInt(
//       await page.$eval('#drawingCountdownBar', (e) => getComputedStyle(e).width)
//     )

//     // wait for some time
//     await page.waitForTimeout(waitTime)

//     // get the width of the timer bar after half a second
//     const laterWidth = parseInt(
//       await page.$eval('#drawingCountdownBar', (e) => getComputedStyle(e).width)
//     )

//     // get the expected decrease in width in seconds
//     const expectedDecrease =
//       ((initialWidth - laterWidth) / initialWidth) * drawingTimer * 1000

//     // the difference in percentage must be less than a certain percentage
//     const difPercentage =
//       (Math.abs(expectedDecrease - waitTime) / waitTime) * 100

//     // check if the width of the timer bar has decreased
//     expect(laterWidth).toBeLessThan(initialWidth)
//     expect(difPercentage).toBeLessThan(percentageAllowed)
//   })
// })

// test('testing that a drawing is shown after submitting the prompt', async ({
//   page,
// }) => {
//   await page.goto('http://localhost:4000/draw')

//   // make sure the drawingDisplay is not visible
//   let drawingDisplay = await page.locator('#drawing').isVisible()
//   expect(drawingDisplay).toBe(false)

//   // enter a prompt and click done
//   await page.locator('#doneButton').click()

//   // press the submit button
//   await page.locator('#submit').click()

//   // make sure the drawingDisplay is  visible
//   drawingDisplay = await page.locator('#drawing').isVisible()
//   expect(drawingDisplay).toBe(true)
// })

// test('testing that the description entered becomes the new prompt', async ({
//   page,
// }) => {
//   await page.goto('http://localhost:4000/draw')

//   // enter a prompt and click done
//   await page.locator('#doneButton').click()

//   // press the submit button
//   await page.locator('#submit').click()

//   // enter a prompt and click done
//   await page.locator('#getInput').fill('test prompt')
//   await page.locator('#doneButton').click()

//   // check if the prompt is displayed
//   const prompt = await page.locator('#prompt').innerText()
//   expect(prompt).toBe('test prompt')
// })

// test('testing colour change', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')

//   // enter a prompt
//   await page.locator('#getInput').fill('test')
//   await page.locator('#doneButton').click()

//   // Check Red
//   await page.locator('#redButton').click()
//   let strokeStyleColor = await page.evaluate(() => {
//     const canvas = document.querySelector('#canvas')
//     const context = canvas.getContext('2d')
//     return context.strokeStyle
//   })
//   expect(strokeStyleColor).toBe('#ff0000')

//   // Check Blue
//   await page.locator('#blueButton').click()
//   strokeStyleColor = await page.evaluate(() => {
//     const canvas = document.querySelector('#canvas')
//     const context = canvas.getContext('2d')
//     return context.strokeStyle
//   })
//   expect(strokeStyleColor).toBe('#0000ff')

//   // Check Green
//   await page.locator('#greenButton').click()
//   strokeStyleColor = await page.evaluate(() => {
//     const canvas = document.querySelector('#canvas')
//     const context = canvas.getContext('2d')
//     return context.strokeStyle
//   })
//   expect(strokeStyleColor).toBe('#008000')

//   // Check Pink
//   await page.locator('#pinkButton').click()
//   strokeStyleColor = await page.evaluate(() => {
//     const canvas = document.querySelector('#canvas')
//     const context = canvas.getContext('2d')
//     return context.strokeStyle
//   })
//   expect(strokeStyleColor).toBe('#ffc0cb')
// })

// test('testing custom colour picker', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#colour-picker').fill('#01f901')

//   // Get the strokeStyle color of the canvas
//   const strokeStyleColor = await page.evaluate(() => {
//     const canvas = document.querySelector('#canvas')
//     const context = canvas.getContext('2d')
//     return context.strokeStyle
//   })

//   // Check if the strokeStyle color is the expected color
//   expect(strokeStyleColor).toBe('#01f901')
// })

// test('Test linewidth changes', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')
//   await page.locator('#size-picker').fill('23')

//   const strokeStyleColor = await page.evaluate(() => {
//     const canvas = document.querySelector('#canvas')
//     const context = canvas.getContext('2d')
//     return context.lineWidth
//   })

//   expect(strokeStyleColor).toBe(23)
// })

// test('Help menu appears when help button is clicked', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#HelpButton').getByRole('img', { name: 'Logo' }).click()
//   expect(
//     await page.getByRole('heading', { name: 'How to play' }).isVisible()
//   ).toBeTruthy()
// })

// test('Help menu closes when close button is clicked', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#HelpButton').getByRole('img', { name: 'Logo' }).click()
//   await page.locator('#HelpClose').click()
//   expect(
//     await page.getByRole('heading', { name: 'How to play' }).isVisible()
//   ).toBeFalsy()
// })

// test('Undo and redo buttons disabled on loading.', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')

//   expect(
//     await page.getByRole('button', { name: 'Undo' }).isDisabled()
//   ).toBeTruthy()
//   expect(
//     await page.getByRole('button', { name: 'Redo' }).isDisabled()
//   ).toBeTruthy()
// })

// test('Undo button becomes enabled once something is drawn', async ({
//   page,
// }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')
//   await page.locator('#canvas').click({
//     position: {
//       x: 525,
//       y: 195,
//     },
//   })

//   expect(
//     await page.getByRole('button', { name: 'Undo' }).isDisabled()
//   ).toBeFalsy()
//   expect(
//     await page.getByRole('button', { name: 'Redo' }).isDisabled()
//   ).toBeTruthy()
// })

// test('Undo button back tracks drawing', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')
//   await page.locator('#canvas').hover()
//   await page.mouse.down()
//   for (let y = 500; y <= 600; y += 10) {
//     await page.mouse.move(500, y)
//   }

//   await page.mouse.up()
//   await page.getByRole('button', { name: 'Undo' }).click()

//   const isEmpty = await page.evaluate(() => {
//     const canvas = document.getElementById('canvas')
//     const context = canvas.getContext('2d')
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
//     return Array.from(imageData.data).every((value) => value === 255)
//   })

//   expect(isEmpty).toBeTruthy()
// })

// test('Redo button undoes the undo button', async ({ page }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')
//   await page.locator('#canvas').hover()
//   await page.mouse.down()
//   for (let y = 500; y <= 600; y += 10) {
//     await page.mouse.move(500, y)
//   }

//   await page.mouse.up()
//   await page.getByRole('button', { name: 'Undo' }).click()
//   await page.getByRole('button', { name: 'Redo' }).click()

//   const isEmpty = await page.evaluate(() => {
//     const canvas = document.getElementById('canvas')
//     const context = canvas.getContext('2d')
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
//     return Array.from(imageData.data).every((value) => value === 255)
//   })

//   expect(isEmpty).toBeFalsy()
// })

// test('Undo button becomes disabled after undoing all drawings', async ({
//   page,
// }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')
//   await page.locator('#canvas').hover()
//   await page.mouse.down()
//   for (let y = 500; y <= 600; y += 10) {
//     await page.mouse.move(500, y)
//   }

//   await page.mouse.up()
//   await page.getByRole('button', { name: 'Undo' }).click()

//   const isEmpty = await page.evaluate(() => {
//     const canvas = document.getElementById('canvas')
//     const context = canvas.getContext('2d')
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
//     return Array.from(imageData.data).every((value) => value === 255)
//   })

//   expect(isEmpty).toBeTruthy()
//   expect(
//     await page.getByRole('button', { name: 'Undo' }).isDisabled()
//   ).toBeTruthy()
// })

// test('Redo button becomes disabled after redoing all drawings', async ({
//   page,
// }) => {
//   await page.goto('http://localhost:4000/draw')
//   await page.locator('#getInput').press('Enter')
//   await page.locator('#canvas').hover()
//   await page.mouse.down()
//   for (let y = 500; y <= 600; y += 10) {
//     await page.mouse.move(500, y)
//   }

//   await page.mouse.up()
//   await page.getByRole('button', { name: 'Undo' }).click()
//   await page.getByRole('button', { name: 'Redo' }).click()

//   const isEmpty = await page.evaluate(() => {
//     const canvas = document.getElementById('canvas')
//     const context = canvas.getContext('2d')
//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
//     return Array.from(imageData.data).every((value) => value === 255)
//   })

//   expect(isEmpty).toBeFalsy()
//   expect(
//     await page.getByRole('button', { name: 'Redo' }).isDisabled()
//   ).toBeTruthy()
// })

// // this test starts from landing and goes to drawingBoard, so I didnt know which test file to put it in
// test('Exactly 1 imposter is chosen at the start of the game', async ({
//   context,
//   browserName,
// }) => {
//   if (browserName === 'chromium') {
//     test.fixme() // this test needs to be fixed
//     return
//   }
//   const page1 = await context.newPage()
//   await page1.goto('http://localhost:4000/landing')
//   await page1.getByRole('button', { name: 'Create Room' }).click()
//   const roomId = await page1.locator('#roomId').innerText()

//   const page2 = await context.newPage()
//   await page2.goto('http://localhost:4000/landing')
//   await page2.click('#joinRoom')
//   await page2.waitForSelector('#roomToJoin')
//   await page2.fill('#roomToJoin', roomId)
//   await page2.click('#submitJoinRoom')

//   const page3 = await context.newPage()
//   await page3.goto('http://localhost:4000/landing')
//   await page3.click('#joinRoom')
//   await page3.waitForSelector('#roomToJoin')
//   await page3.fill('#roomToJoin', roomId)
//   await page3.click('#submitJoinRoom')

//   // Wait for the members count to update on all pages
//   await page1.waitForTimeout(2000)

//   await page1.locator('#startGame').click()

//   // wait for the websocket to send the message of who the imposter is
//   await page1.waitForFunction(
//     () =>
//       document.querySelector('#playerStatus') &&
//       !document
//         .querySelector('#playerStatus')
//         .innerText.includes('Are you an imposter?')
//   )
//   await page2.waitForFunction(
//     () =>
//       document.querySelector('#playerStatus') &&
//       !document
//         .querySelector('#playerStatus')
//         .innerText.includes('Are you an imposter?')
//   )
//   await page3.waitForFunction(
//     () =>
//       document.querySelector('#playerStatus') &&
//       !document
//         .querySelector('#playerStatus')
//         .innerText.includes('Are you an imposter?')
//   )

//   const playerStatus1 = await page1.locator('#playerStatus').innerText()
//   const playerStatus2 = await page2.locator('#playerStatus').innerText()
//   const playerStatus3 = await page3.locator('#playerStatus').innerText()

//   // make sure only one says "You ARE the imposter!"
//   const imposterCount = [playerStatus1, playerStatus2, playerStatus3].filter(
//     (status) => status === 'You ARE the imposter!'
//   ).length

//   expect(imposterCount).toBe(1)
// })
