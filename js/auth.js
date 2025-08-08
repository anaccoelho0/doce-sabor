// Auth Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
});

function initializeAuthPage() {
    setupFormHandlers();
    setupPasswordValidation();
    setupGoogleAuth();
    
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

function setupFormHandlers() {
    // Login form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgotPasswordFormElement');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

function setupPasswordValidation() {
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            validatePasswordStrength(this.value);
            if (confirmPassword.value) {
                validatePasswordMatch();
            }
        });
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordMatch);
    }
}

function setupGoogleAuth() {
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleSignIn);
    }
    
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleSignIn);
    }
}

// Form handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Show loading state
    setButtonLoading('loginBtn', true);
    
    try {
        await authService.loginWithEmail(email, password);
        
        // Set remember me preference
        if (rememberMe) {
            localStorage.setItem('doceSaborRememberMe', 'true');
        }
        
        showNotification('Login realizado com sucesso!', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showNotification(error.message, 'error');
        setButtonLoading('loginBtn', false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateRegisterForm(name, email, password, confirmPassword, acceptTerms)) {
        return;
    }
    
    // Show loading state
    setButtonLoading('registerBtn', true);
    
    try {
        await authService.registerWithEmail({ name, email, password });
        
        showNotification('Conta criada com sucesso!', 'success');
        
        // Show welcome modal
        setTimeout(() => {
            setButtonLoading('registerBtn', false);
            showWelcomeModal();
        }, 1000);
        
    } catch (error) {
        showNotification(error.message, 'error');
        setButtonLoading('registerBtn', false);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    // Clear previous errors
    clearErrors();
    
    // Validate email
    if (!authService.validateEmail(email)) {
        showFieldError('forgotEmailError', 'Digite um e-mail válido');
        return;
    }
    
    // Show loading state
    setButtonLoading('forgotBtn', true);
    
    try {
        await authService.resetPassword(email);
        
        showNotification('Instruções enviadas para seu e-mail!', 'success');
        
        // Switch back to login form
        setTimeout(() => {
            setButtonLoading('forgotBtn', false);
            showLogin();
        }, 2000);
        
    } catch (error) {
        showNotification(error.message, 'error');
        setButtonLoading('forgotBtn', false);
    }
}

async function handleGoogleSignIn() {
    try {
        await authService.signInWithGoogle();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Validation functions
function validateLoginForm(email, password) {
    let isValid = true;
    
    if (!email) {
        showFieldError('loginEmailError', 'E-mail é obrigatório');
        isValid = false;
    } else if (!authService.validateEmail(email)) {
        showFieldError('loginEmailError', 'Digite um e-mail válido');
        isValid = false;
    }
    
    if (!password) {
        showFieldError('loginPasswordError', 'Senha é obrigatória');
        isValid = false;
    }
    
    return isValid;
}

function validateRegisterForm(name, email, password, confirmPassword, acceptTerms) {
    let isValid = true;
    
    if (!name || name.length < 2) {
        showFieldError('registerNameError', 'Nome deve ter pelo menos 2 caracteres');
        isValid = false;
    }
    
    if (!email) {
        showFieldError('registerEmailError', 'E-mail é obrigatório');
        isValid = false;
    } else if (!authService.validateEmail(email)) {
        showFieldError('registerEmailError', 'Digite um e-mail válido');
        isValid = false;
    }
    
    if (!password) {
        showFieldError('registerPasswordError', 'Senha é obrigatória');
        isValid = false;
    } else if (!authService.validatePassword(password)) {
        showFieldError('registerPasswordError', 'Senha deve ter 8+ caracteres, 1 número e 1 caractere especial');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmPasswordError', 'Senhas não coincidem');
        isValid = false;
    }
    
    if (!acceptTerms) {
        showNotification('Você deve aceitar os termos de privacidade', 'error');
        isValid = false;
    }
    
    return isValid;
}

function validatePasswordStrength(password) {
    const strengthResult = authService.getPasswordStrength(password);
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (strengthBar && strengthText) {
        strengthBar.className = `strength-fill ${strengthResult.level}`;
        
        if (password.length === 0) {
            strengthText.textContent = 'Digite uma senha';
        } else if (strengthResult.level === 'weak') {
            strengthText.textContent = 'Senha fraca';
        } else if (strengthResult.level === 'medium') {
            strengthText.textContent = 'Senha média';
        } else {
            strengthText.textContent = 'Senha forte';
        }
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
        showFieldError('confirmPasswordError', 'Senhas não coincidem');
        return false;
    } else {
        clearFieldError('confirmPasswordError');
        return true;
    }
}

// UI Helper functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    clearErrors();
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    clearErrors();
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
    clearErrors();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (button) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        
        // Add error class to input
        const input = errorElement.previousElementSibling;
        if (input && input.tagName === 'INPUT') {
            input.classList.add('error');
        } else if (input && input.classList.contains('password-input')) {
            input.querySelector('input').classList.add('error');
        }
    }
}

function clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        
        // Remove error class from input
        const input = errorElement.previousElementSibling;
        if (input && input.tagName === 'INPUT') {
            input.classList.remove('error');
        } else if (input && input.classList.contains('password-input')) {
            input.querySelector('input').classList.remove('error');
        }
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    const errorInputs = document.querySelectorAll('input.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Modal functions
function showWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.add('open');
    }
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.remove('open');
    }
    
    // Redirect to main page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

function showTerms() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('open');
    }
}

function closeTermsModal() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 1003;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        max-width: 350px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 4000);
}