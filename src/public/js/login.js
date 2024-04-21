document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById('loginButton')
  const registerButton = document.getElementById('registerButton')
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')

  loginButton.addEventListener('click', function () {
    loginForm.style.display = 'block'
    registerForm.style.display = 'none'
    loginButton.classList.add('active')
    registerButton.classList.remove('active')
  })

  registerButton.addEventListener('click', function () {
    registerForm.style.display = 'block'
    loginForm.style.display = 'none'
    registerButton.classList.add('active')
    loginButton.classList.remove('active')
  })
})
