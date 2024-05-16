const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// login.test.js
const fs = require('fs')
const path = require('path')
const { JSDOM } = require('jsdom')

// Load the JavaScript file into a string
const jsFile = fs.readFileSync(
  path.join(__dirname, '../src/public/js', 'login.js'),
  'utf8'
)

// Create a new JSDOM instance with the JavaScript file
let dom
let container

beforeEach(() => {
  dom = new JSDOM(
    `<!DOCTYPE html><html><body><div id="loginError"></div><button id="loginButton"></button><button id="registerButton"></button><form id="loginForm"></form><form id="registerForm"></form></body></html>`,
    { runScripts: 'dangerously' }
  )
  dom.window.eval(jsFile)
  container = dom.window.document
})

it('should hide loginError by default', () => {
  expect(container.getElementById('loginError').style.display).toBe('')
})

it('should show loginForm and hide registerForm when loginButton is clicked', () => {
  const loginButton = container.getElementById('loginButton')
  const loginForm = container.getElementById('loginForm')
  const registerForm = container.getElementById('registerForm')

  loginButton.click()

  expect(loginForm.style.display).toBe('block')
  expect(registerForm.style.display).toBe('none')
})

it('should show registerForm and hide loginForm when registerButton is clicked', () => {
  const registerButton = container.getElementById('registerButton')
  const loginForm = container.getElementById('loginForm')
  const registerForm = container.getElementById('registerForm')

  registerButton.click()

  expect(registerForm.style.display).toBe('block')
  expect(loginForm.style.display).toBe('none')
})
