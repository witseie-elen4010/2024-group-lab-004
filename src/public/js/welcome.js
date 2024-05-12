document.addEventListener('DOMContentLoaded', function () {
  const signInButton = document.getElementById('signin-btn')
  const guestButton = document.getElementById('guest-btn')
  const guestWarningMessage = document.getElementById('warningmessage')
  const guestNicknameSection = document.querySelector('.guest-nickname')
  const nicknameInput = guestNicknameSection.querySelector('input')
  const joinButton = guestNicknameSection.querySelector('button')

  signInButton.addEventListener('click', function () {
    window.location.href = window.location.origin + '/login'
  })

  guestButton.addEventListener('click', function () {
    guestNicknameSection.classList.remove('d-none')
    guestButton.classList.add('d-none')
    signInButton.textContent = 'Sign In Instead'
    guestWarningMessage.classList.remove('d-none')
  })

  joinButton.addEventListener('click', function () {
    if (nicknameInput.value.trim() === '') {
      alert('Please enter a nickname.')
    } else {
      window.location.href = `${
        window.location.origin
      }/guest?nickname=${nicknameInput.value.trim()}`
    }
  })
})
