// Weather Service for Cake Suggestions
class WeatherService {
    constructor() {
        this.API_KEY = 'c4dc5fb00cb08163e76fa465fe7e9a59'; // Chave da API OpenWeatherMap
        this.defaultCity = 'São Paulo';
        this.isInitialized = false;
        this.currentWeather = null;
        this.currentSuggestion = null;
    }

    

    // Initialize weather service
    async initialize() {
        try {
            await this.getCurrentLocationWeather();
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing weather service:', error);
            await this.getWeatherByCity(this.defaultCity);
        }
    }

    // Get weather by current location
    async getCurrentLocationWeather() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const weather = await this.getWeatherByCoords(latitude, longitude);
                        resolve(weather);
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    reject(error);
                },
                {
                    timeout: 10000,
                    enableHighAccuracy: false
                }
            );
        });
    }

    // Get weather by coordinates
    async getWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=pt_br`
            );

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            this.currentWeather = this.processWeatherData(data);
            this.currentSuggestion = this.getSuggestionByWeather(this.currentWeather);
            
            return this.currentWeather;
        } catch (error) {
            throw new Error(`Erro ao buscar clima: ${error.message}`);
        }
    }

    // Get weather by city name
    async getWeatherByCity(cityName) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${this.API_KEY}&units=metric&lang=pt_br`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Cidade não encontrada');
                }
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            this.currentWeather = this.processWeatherData(data);
            this.currentSuggestion = this.getSuggestionByWeather(this.currentWeather);
            
            return this.currentWeather;
        } catch (error) {
            throw new Error(`Erro ao buscar clima: ${error.message}`);
        }
    }

    // Process weather data from API
    processWeatherData(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            main: data.weather[0].main,
            icon: data.weather[0].icon,
            iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            windSpeed: data.wind?.speed || 0,
            timestamp: new Date()
        };
    }

    // Get cake suggestion based on weather
    getSuggestionByWeather(weather) {
        const temp = weather.temperature;
        const condition = weather.main.toLowerCase();
        const humidity = weather.humidity;

        // Hot weather (30°C+)
        if (temp >= 30) {
            return {
                id: 4,
                name: "Bolo de Limão Siciliano",
                title: "Perfeito para o Calor! 🌞",
                message: `Com ${temp}°C, nada melhor que nosso refrescante Bolo de Limão Siciliano com cobertura gelada!`,
                description: "Massa cítrica com cobertura de merengue italiano queimado - ideal para dias quentes",
                price: 89.90,
                image: "https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=800",
                discount: temp >= 35 ? 15 : 10, // Extra discount for very hot days
                reason: "clima-quente",
                tips: [
                    "Servido gelado para máximo refrescamento",
                    "Rico em vitamina C do limão siciliano",
                    "Perfeito para compartilhar em família"
                ]
            };
        }
        
        // Cold weather (15°C or below)
        else if (temp <= 15) {
            return {
                id: 2,
                name: "Bolo de Chocolate Belga",
                title: "Aqueça seu Coração! ❄️",
                message: `Com ${temp}°C, nosso Bolo de Chocolate Belga quentinho é o que você precisa!`,
                description: "Chocolate 70% cacau com recheio de brigadeiro gourmet - perfeito para aquecer o coração",
                price: 94.90,
                image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800",
                discount: temp <= 10 ? 12 : 8,
                reason: "clima-frio",
                tips: [
                    "Servido morno para maior conforto",
                    "Chocolate belga premium 70% cacau",
                    "Acompanha calda quente de chocolate"
                ]
            };
        }
        
        // Rainy weather
        else if (condition.includes('rain') || condition.includes('drizzle')) {
            return {
                id: 1,
                name: "Bolo Red Velvet",
                title: "Conforto para Dias Chuvosos! 🌧️",
                message: `Dia chuvoso pede aconchego! Nosso Red Velvet com cream cheese é puro conforto.`,
                description: "Camadas de massa vermelha aveludada com cream cheese frosting",
                price: 109.90,
                image: "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=800",
                discount: 10,
                reason: "clima-chuvoso",
                tips: [
                    "Perfeito com uma xícara de café quente",
                    "Massa úmida e saborosa",
                    "Cream cheese frosting artesanal"
                ]
            };
        }
        
        // High humidity
        else if (humidity >= 80) {
            return {
                id: 4,
                name: "Bolo de Limão Siciliano",
                title: "Refrescante para o Ar Úmido! 💨",
                message: `Umidade alta (${humidity}%)? Nosso Bolo de Limão traz leveza e frescor!`,
                description: "Massa cítrica com cobertura de merengue italiano queimado",
                price: 89.90,
                image: "https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=800",
                discount: 8,
                reason: "alta-umidade",
                tips: [
                    "Sabor cítrico refrescante",
                    "Textura leve e aerada",
                    "Ideal para clima úmido"
                ]
            };
        }
        
        // Pleasant weather (default)
        else {
            return {
                id: 3,
                name: "Bolo de Morango",
                title: "Perfeito para o Clima Agradável! 🍓",
                message: `Clima agradável de ${temp}°C! Nosso Bolo de Morango é a escolha perfeita.`,
                description: "Massa branca com recheio de creme de baunilha e morangos frescos",
                price: 99.90,
                image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=800",
                discount: 5,
                reason: "clima-agradavel",
                tips: [
                    "Morangos frescos selecionados",
                    "Creme de baunilha artesanal",
                    "Decoração elegante com frutas"
                ]
            };
        }
    }

    // Get current weather data
    getCurrentWeather() {
        return this.currentWeather;
    }

    // Get current suggestion
    getCurrentSuggestion() {
        return this.currentSuggestion;
    }

    // Check if service is ready
    isReady() {
        return this.isInitialized && this.currentWeather && this.currentSuggestion;
    }

    // Format temperature display
    formatTemperature(temp) {
        return `${Math.round(temp)}°C`;
    }

    // Get weather emoji
    getWeatherEmoji(condition) {
        const emojiMap = {
            'clear': '☀️',
            'clouds': '☁️',
            'rain': '🌧️',
            'drizzle': '🌦️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'mist': '🌫️',
            'fog': '🌫️',
            'haze': '🌫️'
        };
        
        return emojiMap[condition.toLowerCase()] || '🌤️';
    }
}

// Create global weather service instance
window.weatherService = new WeatherService();