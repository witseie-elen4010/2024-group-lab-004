document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search)
  const loginError = urlParams.get('loginError')
  const errorElement = document.getElementById('loginError')

  if (loginError) {
    errorElement.style.display = 'block' // Show the error message if loginError is true
  }

  // Existing code for toggling forms
  const loginButton = document.getElementById('loginButton')
  const registerButton = document.getElementById('registerButton')
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')

  registerButton.addEventListener('click', function () {
    registerForm.style.display = 'block'
    loginForm.style.display = 'none'
    registerButton.classList.add('active')
    loginButton.classList.remove('active')
  })

  loginButton.addEventListener('click', function () {
    loginForm.style.display = 'block'
    registerForm.style.display = 'none'
    loginButton.classList.add('active')
    registerButton.classList.remove('active')
  })

  loginForm.action = window.location.origin + '/login'
  registerForm.action = window.location.origin + '/register'
})
