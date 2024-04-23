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
  expect(height).toBe(`${windowSize.innerHeight * 0.5}`)
})

test('canvas has white rectangle', async ({ page }) => {
  await page.goto('http://localhost:4000/draw') // Replace with your page URL

  const whiteRectangle = await page.evaluate(() => {
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return Array.from(imageData.data).every((value) => value === 255)
  })

  expect(whiteRectangle).toBeTruthy()
})

test('testing colour change', async ({ page }) => {
  await page.goto('http://localhost:4000/draw')

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
  await page.locator('#colour-picker').click()
  await page.locator('#colour-picker').fill('#01f901')
  await page.locator('#canvas').click({
    position: {
      x: 434,
      y: 139,
    },
  })

  // Get the strokeStyle color of the canvas
  const strokeStyleColor = await page.evaluate(() => {
    const canvas = document.querySelector('#canvas')
    const context = canvas.getContext('2d')
    return context.strokeStyle
  })

  // Check if the strokeStyle color is the expected color
  expect(strokeStyleColor).toBe('#01f901')
})
