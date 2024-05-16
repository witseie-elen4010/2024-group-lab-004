const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const { JSDOM } = require('jsdom')
const userEvent = require('@testing-library/user-event')
const { getByText, getByRole } = require('@testing-library/dom')
const { fireEvent } = require('@testing-library/dom')
const {
  loginRedirect,
  guestRedirect,
  joinRedirect,
} = require('../src/public/js/welcome')

describe('welcome.js', () => {
  let dom
  let document
  let signInButton
  let guestButton
  let guestWarningMessage
  let guestNicknameSection
  let nicknameInput

  beforeEach(() => {
    delete global.window.location
    global.window.location = { href: '', origin: 'localhost:4000' }
    dom = new JSDOM(`<!DOCTYPE html><body>
      <button id="signin-btn"></button>
      <button id="guest-btn"></button>
      <div id="warningmessage" class="d-none"></div>
      <div class="guest-nickname d-none"></div>
    </body></html>`)
    document = dom.window.document
    signInButton = document.getElementById('signin-btn')
    guestButton = document.getElementById('guest-btn')
    guestWarningMessage = document.getElementById('warningmessage')
    guestNicknameSection = document.querySelector('.guest-nickname')

    global.signInButton = signInButton
    global.guestButton = guestButton
    global.guestWarningMessage = guestWarningMessage
    global.guestNicknameSection = guestNicknameSection
    nicknameInput = document.createElement('input')
    global.window.nicknameInput = nicknameInput
  })

  it('should redirect to /login when sign in button is clicked', () => {
    loginRedirect()
    expect(global.window.location.href).toBe(
      global.window.location.origin + '/login'
    )
  })
  it('should show guest nickname section when guest button is clicked', () => {
    guestRedirect()
    expect(guestNicknameSection.classList.contains('d-none')).toBe(false)
    expect(guestButton.classList.contains('d-none')).toBe(true)
    expect(signInButton.textContent).toBe('Sign In Instead')
    expect(guestWarningMessage.classList.contains('d-none')).toBe(false)
  })

  it('should redirect to /guest with nickname when join button is clicked', () => {
    nicknameInput.value = 'test'
    joinRedirect()
    expect(global.window.location.href).toBe(
      `${global.window.location.origin}/guest?nickname=test`
    )
  })

  it('should alert when join button is clicked with empty nickname', () => {
    nicknameInput.value = ''
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    joinRedirect()
    expect(alertSpy).toHaveBeenCalledWith('Please enter a nickname.')
    alertSpy.mockRestore()
  })
})
