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
