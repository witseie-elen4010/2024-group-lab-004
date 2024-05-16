const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

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
    '<!DOCTYPE html><html><body><div id="loginError" style="display: none;"></div><button id="loginButton"></button><button id="registerButton"></button><form id="loginForm"></form><form id="registerForm"></form></body></html>',
    { runScripts: 'dangerously', url: 'http://localhost' }
  )
  dom.window.eval(jsFile)
  container = dom.window.document
  // Manually dispatch the DOMContentLoaded event
  const event = new dom.window.Event('DOMContentLoaded', {
    bubbles: true,
    cancelable: true,
  })
  container.dispatchEvent(event)
})

it('should hide loginError by default', () => {
  expect(container.getElementById('loginError').style.display).toBe('none')
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

it('should show loginError when loginError URL parameter is true', () => {
  // Recreate the DOM with the URL containing the loginError parameter
  dom = new JSDOM(
    '<!DOCTYPE html><html><body><div id="loginError" style="display: none;"></div><button id="loginButton"></button><button id="registerButton"></button><form id="loginForm"></form><form id="registerForm"></form></body></html>',
    { runScripts: 'dangerously', url: 'http://localhost?loginError=true' }
  )
  dom.window.eval(jsFile)
  container = dom.window.document

  // Manually dispatch the DOMContentLoaded event
  const event = new dom.window.Event('DOMContentLoaded', {
    bubbles: true,
    cancelable: true,
  })
  container.dispatchEvent(event)

  const loginError = container.getElementById('loginError')
  expect(loginError.style.display).toBe('block')
})

it('should set the form actions correctly', () => {
  const loginForm = container.getElementById('loginForm')
  const registerForm = container.getElementById('registerForm')

  expect(loginForm.action).toBe('http://localhost/login')
  expect(registerForm.action).toBe('http://localhost/register')
})
