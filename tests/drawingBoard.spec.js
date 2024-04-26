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
test('input field closes after 25 seconds', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')
  const inputTimer = 25

  //enter a prompt
  await page.locator('#getInput').fill('test prompt')

  // input field does not close after 24 seconds
  await page.waitForTimeout((inputTimer - 1) * 1000)
  let isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(true)

  // input field closes after 25 seconds
  await page.waitForTimeout(1000)
  isVisible = await page.locator('#getInput').isVisible()
  expect(isVisible).toBe(false)
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
