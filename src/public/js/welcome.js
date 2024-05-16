// welcome.js
document.addEventListener('DOMContentLoaded', function () {
  window.signInButton = document.getElementById('signin-btn')
  window.guestButton = document.getElementById('guest-btn')
  window.guestWarningMessage = document.getElementById('warningmessage')
  window.guestNicknameSection = document.querySelector('.guest-nickname')
  window.nicknameInput = guestNicknameSection.querySelector('input')
  window.joinButton = guestNicknameSection.querySelector('button')

  signInButton.addEventListener('click', loginRedirect)
  guestButton.addEventListener('click', guestRedirect)
  joinButton.addEventListener('click', joinRedirect)
})

function loginRedirect() {
  window.location.href = window.location.origin + '/login'
}

function guestRedirect() {
  guestNicknameSection.classList.remove('d-none')
  guestButton.classList.add('d-none')
  signInButton.textContent = 'Sign In Instead'
  guestWarningMessage.classList.remove('d-none')
}

function joinRedirect() {
  if (nicknameInput.value.trim() === '') {
    alert('Please enter a nickname.')
  } else {
    window.location.href = `${
      window.location.origin
    }/guest?nickname=${nicknameInput.value.trim()}`
  }
}

// Export functions for testing
// window.loginRedirect = loginRedirect
// window.guestRedirect = guestRedirect
// window.joinRedirect = joinRedirect

module.exports = { loginRedirect, guestRedirect, joinRedirect }
