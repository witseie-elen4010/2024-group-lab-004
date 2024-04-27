const { test, expect } = require('@playwright/test')

test('canvas exists', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  const canvas = await page.$('canvas')
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

test('input field closes when the done button is pressed', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  //enter a prompt
  await page.locator('#getInput').fill('test prompt')
  await page.locator('#doneButton').click()

  //check if the prompt is displayed
  const prompt = await page.locator('#prompt').innerText()
  expect(prompt).toBe('test prompt')
})

test('input field closes when the enter key is pressed', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  //enter a prompt
  await page.locator('#getInput').fill('test prompt')
  await page.locator('#getInput').press('Enter')

  //check if the prompt is displayed
  const prompt = await page.locator('#prompt').innerText()
  expect(prompt).toBe('test prompt')
})

test('input field closes after a certain amount of time', async ({ page }) => {
  const inputTimer = 3

  await page.goto(`http://localhost:4000/draw?inputTimer=${inputTimer}`)

  // input field does not close after 1.5 seconds before the timer ends
  await page.waitForTimeout(inputTimer * 1000 - 1500)
  let isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(true)

  // input field closes after the full time
  await page.waitForTimeout(1500)
  isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(false)
})

test('the user can draw for a certain amount of time', async ({ page }) => {
  const drawTimer = 3

  await page.goto(`http://localhost:4000/draw?drawingTimer=${drawTimer}`)
  await page.locator('#doneButton').click()

  // input field does appear after 1.5 seconds before the timer ends
  await page.waitForTimeout(drawTimer * 1000 - 1500)
  let isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(false)

  // input field opens after the full time
  await page.waitForTimeout(1500)
  isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(true)
})

test('testing the timer bar appears until the prompt is entered', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/draw')

  //check if the timer bar is displayed
  let timerBar = await page.locator('#inputCountdownBar').isVisible()
  expect(timerBar).toBe(true)

  //enter a prompt and click done
  await page.locator('#doneButton').click()

  //check if the timer bar is displayed
  timerBar = await page.locator('#inputCountdownBar').isVisible()
  expect(timerBar).toBe(false)
})

test.describe('testing that the timer bar decreases in width', () => {
  const waitTime = 1000
  const inputTimer = 25
  const drawingTimer = 60
  const percentageAllowed = 10
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `http://localhost:4000/draw?inputTimer=${inputTimer}&drawingTimer=${drawingTimer}`
    )
  })
  // The difPercentage part of the test is very inconsistent, and it can go from about 1-2.5% for all of them, up to around 10%

  test('The input timer bar decreases for the original prompt entering', async ({
    page,
  }) => {
    //get the initial width of the timer bar
    const initialWidth = parseInt(
      await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    //wait for some time
    await page.waitForTimeout(waitTime)

    //get the width of the timer bar after half a second
    const laterWidth = parseInt(
      await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    // get the expected decrease in width in seconds
    const expectedDecrease =
      ((initialWidth - laterWidth) / initialWidth) * inputTimer * 1000

    // the difference in percentage must be less than a certain percentage
    const difPercentage =
      (Math.abs(expectedDecrease - waitTime) / waitTime) * 100
    console.log(difPercentage)

    //check if the width of the timer bar has decreased
    expect(laterWidth).toBeLessThan(initialWidth)
    expect(difPercentage).toBeLessThan(percentageAllowed)
  })

  test('The input timer bar decreases for describing a drawing', async ({
    page,
  }) => {
    // get to the describe a drawing point
    await page.locator('#doneButton').click()
    await page.locator('#submit').click()

    //get the initial width of the timer bar
    const initialWidth = parseInt(
      await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    //wait for some time
    await page.waitForTimeout(waitTime)

    //get the width of the timer bar after half a second
    const laterWidth = parseInt(
      await page.$eval('#inputCountdownBar', (e) => getComputedStyle(e).width)
    )

    // get the expected decrease in width in seconds
    const expectedDecrease =
      ((initialWidth - laterWidth) / initialWidth) * inputTimer * 1000

    // the difference in percentage must be less than a certain percentage
    const difPercentage =
      (Math.abs(expectedDecrease - waitTime) / waitTime) * 100
    console.log(difPercentage)

    //check if the width of the timer bar has decreased
    expect(laterWidth).toBeLessThan(initialWidth)
    expect(difPercentage).toBeLessThan(percentageAllowed)
  })
  test('The draw timer bar decreases', async ({ page }) => {
    // get to the describe a drawing point
    await page.locator('#doneButton').click()

    //get the initial width of the timer bar
    const initialWidth = parseInt(
      await page.$eval('#drawingCountdownBar', (e) => getComputedStyle(e).width)
    )

    //wait for some time
    await page.waitForTimeout(waitTime)

    //get the width of the timer bar after half a second
    const laterWidth = parseInt(
      await page.$eval('#drawingCountdownBar', (e) => getComputedStyle(e).width)
    )

    // get the expected decrease in width in seconds
    const expectedDecrease =
      ((initialWidth - laterWidth) / initialWidth) * drawingTimer * 1000

    // the difference in percentage must be less than a certain percentage
    const difPercentage =
      (Math.abs(expectedDecrease - waitTime) / waitTime) * 100
    console.log(difPercentage)

    //check if the width of the timer bar has decreased
    expect(laterWidth).toBeLessThan(initialWidth)
    expect(difPercentage).toBeLessThan(percentageAllowed)
  })
})

test('testing that a drawing is shown after submitting the drawing', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/draw')

  // make sure the drawingDisplay is not visible
  let drawingDisplay = await page.locator('#drawing').isVisible()
  expect(drawingDisplay).toBe(false)

  //enter a prompt and click done
  await page.locator('#doneButton').click()

  //press the submit button
  await page.locator('#submit').click()

  // make sure the drawingDisplay is  visible
  drawingDisplay = await page.locator('#drawing').isVisible()
  expect(drawingDisplay).toBe(true)
})

test('testing that the description entered becomes the new prompt', async ({
  page,
}) => {
  await page.goto('http://localhost:4000/draw')

  //enter a prompt and click done
  await page.locator('#doneButton').click()

  //press the submit button
  await page.locator('#submit').click()

  //enter a prompt and click done
  await page.locator('#getInput').fill('test prompt')
  await page.locator('#doneButton').click()

  //check if the prompt is displayed
  const prompt = await page.locator('#prompt').innerText()
  expect(prompt).toBe('test prompt')
})

test('testing colour change', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

  //enter a prompt
  await page.locator('#getInput').fill('test')
  await page.locator('#doneButton').click()

  //Check Red
  await page.locator('#redButton').click()
  let strokeStyleColor = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#ff0000')

  //Check Blue
  await page.locator('#blueButton').click()
  strokeStyleColor = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#0000ff')

  //Check Green
  await page.locator('#greenButton').click()
  strokeStyleColor = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#008000')

  //Check Pink
  await page.locator('#pinkButton').click()
  strokeStyleColor = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })
  expect(strokeStyleColor).toBe('#ffc0cb')
})

test('testing custom colour picker', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')
  await page.locator('#colour-picker').fill('#01f901')

  // Get the strokeStyle color of the canvas
  const strokeStyleColor = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })

  // Check if the strokeStyle color is the expected color
  expect(strokeStyleColor).toBe('#01f901')
})
