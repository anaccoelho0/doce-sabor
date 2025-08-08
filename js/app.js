// Menu data
const menuItems = [
    {
        id: 1,
        name: "Bolo Red Velvet",
        description: "Camadas de massa vermelha aveludada com cream cheese frosting",
        price: 109.90,
        image: "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=800",
        rating: 5,
        alt: "Bolo Red Velvet com cobertura de cream cheese e decoração elegante"
    },
    {
        id: 2,
        name: "Bolo de Chocolate Belga",
        description: "Chocolate 70% cacau com recheio de brigadeiro gourmet",
        price: 94.90,
        image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800",
        rating: 5,
        alt: "Bolo de chocolate belga com ganache e decoração sofisticada"
    },
    {
        id: 3,
        name: "Bolo de Morango",
        description: "Massa branca com recheio de creme de baunilha e morangos frescos",
        price: 99.90,
        image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=800",
        rating: 4,
        alt: "Bolo de morango com chantilly e morangos frescos"
    },
    {
        id: 4,
        name: "Bolo de Limão Siciliano",
        description: "Massa cítrica com cobertura de merengue italiano queimado",
        price: 89.90,
        image: "https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=800",
        rating: 4,
        alt: "Bolo de limão siciliano com merengue dourado"
    }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('doceSaborCart')) || [];

// DOM elements
const menuGrid = document.getElementById('menuGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadMenu();
    updateCartUI();
    setupEventListeners();
    initializeAuth();
});

// Initialize authentication
function initializeAuth() {
    // Wait for auth service to initialize
    const checkAuthReady = () => {
        if (window.authService && window.authService.isInitialized) {
            updateAuthUI();
            setupAuthListeners();
        } else {
            setTimeout(checkAuthReady, 100);
        }
    };
    checkAuthReady();
}

// Update authentication UI
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    
    if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        
        // Update auth link to show user name
        if (authLink) {
            authLink.textContent = user.name.split(' ')[0]; // First name only
            authLink.href = '#';
            authLink.onclick = toggleUserProfile;
        }
        
        // Update profile dropdown
        if (userProfileDropdown) {
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');
            const avatarPlaceholder = document.querySelector('.avatar-placeholder');
            
            if (userName) userName.textContent = user.name;
            if (userEmail) userEmail.textContent = user.email;
            
            if (user.photoURL && userAvatar) {
                userAvatar.src = user.photoURL;
                userAvatar.style.display = 'block';
                if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
            } else {
                if (userAvatar) userAvatar.style.display = 'none';
                if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
            }
        }
        
        // Load user-specific cart
        loadUserCart();
    } else {
        // Show login link
        if (authLink) {
            authLink.textContent = 'Login';
            authLink.href = 'auth.html';
            authLink.onclick = null;
        }
    }
}

// Setup auth event listeners
function setupAuthListeners() {
    // Listen for auth state changes
    window.addEventListener('authStateChanged', function(event) {
        updateAuthUI();
    });
    
    // Close profile dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('userProfileDropdown');
        const authLink = document.getElementById('authLink');
        
        if (dropdown && dropdown.style.display === 'block') {
            if (!dropdown.contains(event.target) && event.target !== authLink) {
                dropdown.style.display = 'none';
            }
        }
    });
}

// Toggle user profile dropdown
function toggleUserProfile(event) {
    event.preventDefault();
    const dropdown = document.getElementById('userProfileDropdown');
    
    if (dropdown) {
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        } else {
            dropdown.style.display = 'block';
        }
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        authService.logout();
    }
}

// Load user-specific cart
function loadUserCart() {
    if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        const userCartKey = `doceSaborCart_${user.id}`;
        const userCart = JSON.parse(localStorage.getItem(userCartKey) || '[]');
        
        // Update global cart
        cart = userCart;
        localStorage.setItem('doceSaborCart', JSON.stringify(cart));
        updateCartUI();
    }
}

// Load menu items
function loadMenu() {
    if (!menuGrid) return;
    
    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.alt}">
                <div class="rating">
                    <div class="stars">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>
                    <span class="rating-text">${item.rating}.0</span>
                </div>
            </div>
            <div class="menu-item-content">
                <h3 class="menu-item-title">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-plus"></i>
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add item to cart
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${item.name} adicionado ao carrinho!`);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
}

// Update item quantity
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('doceSaborCart', JSON.stringify(cart));
    
    // Also save to user-specific cart if authenticated
    if (window.authService && authService.isAuthenticated()) {
        authService.saveUserCart(cart);
    }
}

// Update cart UI
function updateCartUI() {
    updateCartCount();
    updateCartItems();
    updateCartSummary();
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Update cart items display
function updateCartItems() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <small>Adicione alguns bolos deliciosos!</small>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.alt}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cart.length > 0 ? 15.00 : 0;
    const total = subtotal + shipping;
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
    
    // Update checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Toggle cart sidebar
function toggleCart() {
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
    }
}

// Scroll to menu section
function scrollToMenu() {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Open checkout modal
function openCheckout() {
    if (cart.length === 0) return;
    
    if (checkoutModal) {
        checkoutModal.classList.add('open');
        updateOrderSummary();
    }
}

// Close checkout modal
function closeCheckout() {
    if (checkoutModal) {
        checkoutModal.classList.remove('open');
    }
}

// Update order summary in modal
function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const modalTotal = document.getElementById('modalTotal');
    
    if (!orderSummary || !modalTotal) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 15.00;
    const total = subtotal + shipping;
    
    orderSummary.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('') + `
        <div class="summary-item">
            <span>Frete</span>
            <span>R$ ${shipping.toFixed(2).replace('.', ',')}</span>
        </div>
    `;
    
    modalTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Payment method change
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Close modal when clicking outside
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                closeCheckout();
            }
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-btn')) {
                toggleCart();
            }
        }
    });
}

// Handle payment method change
function handlePaymentMethodChange(e) {
    const pixDetails = document.getElementById('pixDetails');
    const cardDetails = document.getElementById('cardDetails');
    
    if (pixDetails && cardDetails) {
        if (e.target.value === 'pix') {
            pixDetails.style.display = 'block';
            cardDetails.style.display = 'none';
        } else {
            pixDetails.style.display = 'none';
            cardDetails.style.display = 'block';
        }
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = {
        customer: {
            name: formData.get('fullName'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        payment: {
            method: formData.get('payment'),
            cardNumber: formData.get('cardNumber'),
            cardName: formData.get('cardName'),
            expiry: formData.get('expiry'),
            cvv: formData.get('cvv')
        },
        items: cart,
        observations: formData.get('observations'),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 15.00
    };
    
    // Simulate order processing
    showNotification('Processando pedido...', 'info');
    
    setTimeout(() => {
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        
        // Close modal
        closeCheckout();
        
        // Show success message
        showNotification('Pedido confirmado! Entraremos em contato em breve.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Reset payment method display
        document.getElementById('pixDetails').style.display = 'block';
        document.getElementById('cardDetails').style.display = 'none';
        document.querySelector('input[name="payment"][value="pix"]').checked = true;
        
    }, 2000);
}

// Show notification
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

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 3);
        });
    }
});