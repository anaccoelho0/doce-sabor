// Authentication Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            // Check if user is already logged in
            const savedUser = localStorage.getItem('doceSaborUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }

            // Initialize Google Sign-In
            this.initializeGoogleAuth();
            
            this.isInitialized = true;
            this.notifyAuthStateChange();
        } catch (error) {
            console.error('Error initializing auth:', error);
        }
    }

    initializeGoogleAuth() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: 'your-google-client-id.apps.googleusercontent.com', // Replace with your actual client ID
                callback: this.handleGoogleSignIn.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            });
        }
    }

    // Email/Password Registration
    async registerWithEmail(userData) {
        try {
            // Simulate API call delay
            await this.delay(1500);

            // Validate email doesn't exist (simulated)
            const existingUsers = JSON.parse(localStorage.getItem('doceSaborUsers') || '[]');
            if (existingUsers.find(user => user.email === userData.email)) {
                throw new Error('Este e-mail já está cadastrado');
            }

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                name: userData.name,
                email: userData.email,
                photoURL: null,
                provider: 'email',
                createdAt: new Date().toISOString(),
                emailVerified: false
            };

            // Save user to "database" (localStorage)
            existingUsers.push(newUser);
            localStorage.setItem('doceSaborUsers', JSON.stringify(existingUsers));

            // Set as current user
            this.currentUser = newUser;
            localStorage.setItem('doceSaborUser', JSON.stringify(newUser));

            // Merge cart data
            this.mergeCartData();

            this.notifyAuthStateChange();
            return newUser;
        } catch (error) {
            throw error;
        }
    }

    // Email/Password Login
    async loginWithEmail(email, password) {
        try {
            // Simulate API call delay
            await this.delay(1200);

            // Find user in "database"
            const existingUsers = JSON.parse(localStorage.getItem('doceSaborUsers') || '[]');
            const user = existingUsers.find(user => user.email === email);

            if (!user) {
                throw new Error('E-mail não encontrado');
            }

            // In a real app, you would verify the password hash
            // For demo purposes, we'll just simulate success
            
            // Set as current user
            this.currentUser = user;
            localStorage.setItem('doceSaborUser', JSON.stringify(user));

            // Merge cart data
            this.mergeCartData();

            this.notifyAuthStateChange();
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Google Sign-In
    async handleGoogleSignIn(response) {
        try {
            // Decode JWT token (in production, verify on server)
            const payload = this.parseJwt(response.credential);
            
            const userData = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                photoURL: payload.picture,
                provider: 'google',
                createdAt: new Date().toISOString(),
                emailVerified: true
            };

            // Save/update user in "database"
            const existingUsers = JSON.parse(localStorage.getItem('doceSaborUsers') || '[]');
            const existingUserIndex = existingUsers.findIndex(user => user.email === userData.email);
            
            if (existingUserIndex >= 0) {
                existingUsers[existingUserIndex] = { ...existingUsers[existingUserIndex], ...userData };
            } else {
                existingUsers.push(userData);
            }
            
            localStorage.setItem('doceSaborUsers', JSON.stringify(existingUsers));

            // Set as current user
            this.currentUser = userData;
            localStorage.setItem('doceSaborUser', JSON.stringify(userData));

            // Merge cart data
            this.mergeCartData();

            this.notifyAuthStateChange();
            
            // Redirect to main page
            window.location.href = 'index.html';
            
            return userData;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw new Error('Erro ao fazer login com Google');
        }
    }

    // Trigger Google Sign-In popup
    async signInWithGoogle() {
        try {
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.prompt();
            } else {
                throw new Error('Google Sign-In não está disponível');
            }
        } catch (error) {
            throw error;
        }
    }

    // Password Reset
    async resetPassword(email) {
        try {
            // Simulate API call delay
            await this.delay(1000);

            // Check if email exists
            const existingUsers = JSON.parse(localStorage.getItem('doceSaborUsers') || '[]');
            const user = existingUsers.find(user => user.email === email);

            if (!user) {
                throw new Error('E-mail não encontrado');
            }

            // In a real app, you would send a reset email
            // For demo purposes, we'll just simulate success
            return { success: true, message: 'Instruções enviadas para seu e-mail' };
        } catch (error) {
            throw error;
        }
    }

    // Logout
    async logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('doceSaborUser');
            
            // Sign out from Google
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }

            this.notifyAuthStateChange();
            
            // Redirect to auth page
            if (window.location.pathname !== '/auth.html') {
                window.location.href = 'auth.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Merge cart data when user logs in
    mergeCartData() {
        try {
            const localCart = JSON.parse(localStorage.getItem('doceSaborCart') || '[]');
            const userCartKey = `doceSaborCart_${this.currentUser.id}`;
            const userCart = JSON.parse(localStorage.getItem(userCartKey) || '[]');

            // Merge carts (prioritize local cart)
            const mergedCart = [...userCart];
            
            localCart.forEach(localItem => {
                const existingItem = mergedCart.find(item => item.id === localItem.id);
                if (existingItem) {
                    existingItem.quantity += localItem.quantity;
                } else {
                    mergedCart.push(localItem);
                }
            });

            // Save merged cart
            localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
            localStorage.setItem('doceSaborCart', JSON.stringify(mergedCart));

            // Update cart UI if available
            if (typeof updateCartUI === 'function') {
                updateCartUI();
            }
        } catch (error) {
            console.error('Error merging cart data:', error);
        }
    }

    // Save cart for authenticated user
    saveUserCart(cart) {
        if (this.currentUser) {
            const userCartKey = `doceSaborCart_${this.currentUser.id}`;
            localStorage.setItem(userCartKey, JSON.stringify(cart));
        }
    }

    // Utility functions
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Notify auth state changes
    notifyAuthStateChange() {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: this.currentUser }
        }));
    }

    // Validation helpers
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, 1 number, 1 special character
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    }

    getPasswordStrength(password) {
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength += 1;
        else feedback.push('Mínimo 8 caracteres');

        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('Letra minúscula');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('Letra maiúscula');

        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('Número');

        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else feedback.push('Caractere especial');

        let level = 'weak';
        if (strength >= 4) level = 'strong';
        else if (strength >= 3) level = 'medium';

        return { level, strength, feedback };
    }
}

// Create global auth service instance
window.authService = new AuthService();