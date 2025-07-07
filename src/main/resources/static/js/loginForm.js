function togglePassword() {
    var togglePasswordButton = document.querySelector('#toggle-password-visibility')
    var passwordInput = document.querySelector('#password')
    if (!passwordInput)
        return
    passwordInput.type = passwordInput.type === 'text' ? 'password' : 'text'
    var svg = togglePasswordButton.querySelector('svg')
    if (!svg)
        return
    svg.classList.toggle('fa-eye')
    svg.classList.toggle('fa-eye-slash')
}