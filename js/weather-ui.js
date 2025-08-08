// Weather UI Controller
class WeatherUI {
    constructor() {
        this.container = null;
        this.isLoading = false;
        this.setupEventListeners();
    }

    // Método principal modificado com fallback
    async loadWeatherWithFallback() {
        this.showLoading();
        
        try {
            // Tenta primeiro carregar os dados reais
            await this.loadWeatherSuggestion();
        } catch (error) {
            console.error('Erro ao carregar dados reais:', error);
            
            // Fallback para dados simulados
            try {
                await this.loadMockWeather();
                this.showNotification(
                    "Mostrando dados simulados enquanto a API não responde", 
                    "info"
                );
            } catch (mockError) {
                console.error('Erro no fallback:', mockError);
                this.showError("Não foi possível carregar informações do clima");
            }
        }
    }

    // Método para carregar dados simulados
    async loadMockWeather() {
        if (!weatherService) {
            throw new Error('Serviço de clima não disponível');
        }

        // Usa o método mock do serviço se disponível
        if (typeof weatherService.getMockWeather === 'function') {
            this.currentWeather = await weatherService.getMockWeather();
            this.currentSuggestion = weatherService.getSuggestionByWeather(this.currentWeather);
            this.displayWeatherSuggestion();
            return;
        }

        // Fallback básico se não houver método mock
        this.currentWeather = {
            city: "São Paulo",
            country: "BR",
            temperature: 22,
            feelsLike: 24,
            humidity: 65,
            description: "nublado",
            main: "Clouds",
            iconUrl: "https://openweathermap.org/img/wn/03d@2x.png",
            timestamp: new Date()
        };
        
        this.currentSuggestion = {
            id: 3,
            name: "Bolo de Morango",
            title: "Sugestão Padrão",
            message: "Nosso clássico Bolo de Morango é sempre uma ótima escolha!",
            description: "Massa branca com recheio de creme de baunilha e morangos frescos",
            price: 99.90,
            image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg",
            discount: 0,
            tips: [
                "Perfeito para qualquer ocasião",
                "Feito com ingredientes frescos",
                "Ótimo para compartilhar"
            ]
        };
        
        this.displayWeatherSuggestion();
    }

    // Initialize weather UI
    async initialize() {
        this.createWeatherSection();
        await this.loadWeatherSuggestion();
    }

    

    // Create weather section HTML
    createWeatherSection() {
    const menuSection = document.getElementById('menu');
    if (!menuSection) return;

    const weatherSection = document.createElement('section');
    weatherSection.className = 'weather-suggestion';
    weatherSection.id = 'weather-suggestion';
    
    weatherSection.innerHTML = `
        <div class="container">
            <div class="section-header">
                <h2>🍰 Sugestão Especial pelo Clima</h2>
                <p>Deixe o tempo escolher o bolo perfeito para você!</p>
            </div>
            <div class="weather-content" id="weatherContent">
                <div class="loading-weather">
                    <div class="weather-loader">
                        <i class="fas fa-cloud-sun fa-spin"></i>
                    </div>
                    <p>Verificando o clima da sua região...</p>
                </div>
            </div>
            <div class="weather-controls">
                <div class="city-input-container" style="display: none;">
                    <input type="text" id="cityInput" placeholder="Digite seu CEP..." class="city-input">
                    <button onclick="weatherUI.searchCity()" class="search-city-btn">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
                <button onclick="weatherUI.toggleCityInput()" class="change-city-btn">
                    <i class="fas fa-map-marker-alt"></i>
                    Alterar Cidade
                </button>
            </div>
        </div>
    `;

    menuSection.parentNode.insertBefore(weatherSection, menuSection);
    this.container = weatherSection;
}


   
    // Load weather suggestion
    async loadWeatherSuggestion() {
        if (!weatherService) return;

        this.showLoading();

        try {
            await weatherService.initialize();
            
            if (weatherService.isReady()) {
                this.displayWeatherSuggestion();
            } else {
                this.showError('Não foi possível carregar as informações do clima');
            }
        } catch (error) {
            console.error('Error loading weather:', error);
            this.showError('Erro ao carregar informações do clima');
        }
    }

    // Display weather suggestion
    displayWeatherSuggestion() {
        const weather = weatherService.getCurrentWeather();
        const suggestion = weatherService.getCurrentSuggestion();
        
        if (!weather || !suggestion) {
            this.showError('Dados do clima indisponíveis');
            return;
        }

        const weatherContent = document.getElementById('weatherContent');
        if (!weatherContent) return;

        const discountBadge = suggestion.discount > 0 ? 
            `<div class="discount-badge">
                <i class="fas fa-tag"></i>
                ${suggestion.discount}% OFF
            </div>` : '';

        const tipsHtml = suggestion.tips.map(tip => 
            `<li><i class="fas fa-check-circle"></i> ${tip}</li>`
        ).join('');

        weatherContent.innerHTML = `
            <div class="weather-card">
                ${discountBadge}
                
                <div class="weather-info">
                    <div class="weather-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${weather.city}, ${weather.country}</span>
                    </div>
                    
                    <div class="weather-current">
                        <div class="weather-icon">
                            <img src="${weather.iconUrl}" alt="${weather.description}">
                        </div>
                        <div class="weather-details">
                            <div class="temperature">${weather.temperature}°C</div>
                            <div class="description">${weather.description}</div>
                            <div class="feels-like">Sensação: ${weather.feelsLike}°C</div>
                        </div>
                    </div>
                </div>

                <div class="suggestion-content">
                    <div class="suggestion-header">
                        <h3>${suggestion.title}</h3>
                        <p class="suggestion-message">${suggestion.message}</p>
                    </div>

                    <div class="cake-showcase">
                        <div class="cake-image">
                            <img src="${suggestion.image}" alt="${suggestion.name}">
                        </div>
                        <div class="cake-details">
                            <h4>${suggestion.name}</h4>
                            <p class="cake-description">${suggestion.description}</p>
                            
                            <div class="price-section">
                                ${suggestion.discount > 0 ? 
                                    `<span class="original-price">R$ ${suggestion.price.toFixed(2).replace('.', ',')}</span>
                                     <span class="discounted-price">R$ ${(suggestion.price * (1 - suggestion.discount / 100)).toFixed(2).replace('.', ',')}</span>` :
                                    `<span class="current-price">R$ ${suggestion.price.toFixed(2).replace('.', ',')}</span>`
                                }
                            </div>

                            <ul class="cake-tips">
                                ${tipsHtml}
                            </ul>

                            <div class="suggestion-actions">
                                <button onclick="addToCart(${suggestion.id})" class="add-suggested-cake">
                                    <i class="fas fa-shopping-cart"></i>
                                    Adicionar ao Carrinho
                                </button>
                                <button onclick="scrollToMenu()" class="view-menu-btn">
                                    <i class="fas fa-utensils"></i>
                                    Ver Cardápio Completo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="weather-timestamp">
                    <i class="fas fa-clock"></i>
                    Atualizado às ${weather.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;

        this.hideLoading();
    }

    // Show loading state
    showLoading() {
        this.isLoading = true;
        const weatherContent = document.getElementById('weatherContent');
        if (weatherContent) {
            weatherContent.innerHTML = `
                <div class="loading-weather">
                    <div class="weather-loader">
                        <i class="fas fa-cloud-sun fa-spin"></i>
                    </div>
                    <p>Verificando o clima da sua região...</p>
                </div>
            `;
        }
    }

    // Hide loading state
    hideLoading() {
        this.isLoading = false;
    }

    // Show error message
    showError(message) {
        const weatherContent = document.getElementById('weatherContent');
        if (weatherContent) {
            weatherContent.innerHTML = `
                <div class="weather-error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p>${message}</p>
                    <p class="error-suggestion">
                        Que tal experimentar nosso delicioso 
                        <a href="#menu" onclick="scrollToMenu()">Bolo de Chocolate</a>?
                    </p>
                    <button onclick="weatherUI.refreshWeather()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
        this.hideLoading();
    }

// Toggle CEP input
// Substitua o método toggleCityInput por este:
toggleCityInput() {
    const container = document.querySelector('.city-input-container');
    const button = document.querySelector('.change-city-btn');
    
    // Sempre mostra o campo ao clicar no botão
    container.style.display = 'flex';
    button.style.display = 'none'; // Esconde o botão "Alterar cidade"
    document.getElementById('cityInput').placeholder = "Digite seu CEP...";
    document.getElementById('cityInput').focus();
    
    // Adiciona evento para quando o campo perder o foco
    document.getElementById('cityInput').addEventListener('blur', () => {
        if (document.getElementById('cityInput').value.trim() === '') {
            container.style.display = 'none';
            button.style.display = 'flex';
        }
    });
}

// Search by CEP
async searchCity() {
    const cepInput = document.getElementById('cityInput');
    const cep = cepInput.value.trim().replace(/\D/g, '');
    const container = document.querySelector('.city-input-container');
    const button = document.querySelector('.change-city-btn');
    
    if (!cep || cep.length !== 8) {
        this.showNotification('Digite um CEP válido (8 dígitos)', 'error');
        cepInput.focus();
        return;
    }

    this.showLoading();

    try {
        const address = await this.getAddressByCEP(cep);
        if (!address || !address.localidade) {
            throw new Error('CEP não encontrado');
        }
        
        await weatherService.getWeatherByCity(address.localidade);
        this.displayWeatherSuggestion();
        
        // Esconde o campo e mostra o botão novamente
        container.style.display = 'none';
        button.style.display = 'flex';
        
        this.showNotification(`Clima atualizado para ${address.localidade}!`, 'success');
    } catch (error) {
        this.showError(`Erro ao buscar CEP: ${error.message}`);
        cepInput.focus();
    }
}

// Novo método para buscar endereço por CEP
async getAddressByCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) {
            throw new Error('CEP não encontrado');
        }
        const data = await response.json();
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        return data;
    } catch (error) {
        throw new Error(`Erro ao buscar CEP: ${error.message}`);
    }
}

    // Refresh weather
    async refreshWeather() {
        const refreshBtn = document.querySelector('.refresh-weather-btn');
        const originalContent = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Atualizando...';
        refreshBtn.disabled = true;

        try {
            await weatherService.getCurrentLocationWeather();
            this.displayWeatherSuggestion();
            this.showNotification('Clima atualizado!', 'success');
        } catch (error) {
            // Try with default city if geolocation fails
            try {
                await weatherService.getWeatherByCity(weatherService.defaultCity);
                this.displayWeatherSuggestion();
                this.showNotification('Clima atualizado para São Paulo!', 'info');
            } catch (fallbackError) {
                this.showError('Erro ao atualizar clima');
            }
        } finally {
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle Enter key in city input
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'cityInput') {
                this.searchCity();
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        }
    }
}

// Create global weather UI instance
window.weatherUI = new WeatherUI();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other services to initialize
    setTimeout(() => {
        if (weatherUI) {
            weatherUI.initialize();
        }
    }, 1000);
});