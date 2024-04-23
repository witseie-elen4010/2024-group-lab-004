document.addEventListener('DOMContentLoaded', function () {
  const signInButton = document.getElementById('signin-btn')
  const guestButton = document.getElementById('guest-btn')
  const guestWarningMessage = document.getElementById('warningmessage')
  const guestNicknameSection = document.querySelector('.guest-nickname')
  const nicknameInput = guestNicknameSection.querySelector('input')
  const joinButton = guestNicknameSection.querySelector('button')
  const languageButtons = document.querySelectorAll('.language-selector button')

  // Redirect to login page on sign-in
  signInButton.addEventListener('click', function () {
    window.location.href = 'http://localhost:4000/login'
  })

  // Toggle display of guest nickname input
  guestButton.addEventListener('click', function () {
    guestNicknameSection.style.display = 'block'
    guestButton.style.display = 'none'
    signInButton.textContent = 'Sign In Instead'
    guestWarningMessage.style.display = 'block'
    guestWarningMessage.style.color = 'red'
  })

  // Join as guest and redirect
  joinButton.addEventListener('click', function () {
    if (nicknameInput.value.trim() === '') {
      alert('Please enter a nickname.')
    } else {
      window.location.href = 'http://localhost:4000/draw'
    }
  })

  // Language selection buttons
  languageButtons.forEach((button) => {
    button.addEventListener('click', function () {
      // Implement language change logic
      alert('Language changed to ' + button.innerText)
    })
  })
})
