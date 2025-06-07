const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

class ConfigService {
    constructor() {
        this.config = {
            port: process.env.PORT || 3005,
            mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-assistant',
            jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
            nodeEnv: process.env.NODE_ENV || 'development',
            
            // Add other configuration settings
            supermarket: {
                defaultCountry: 'AU',
                supportedCountries: ['AU'],
                apiTimeout: 30000, // 30 seconds
            },
            
            recipe: {
                maxIngredients: 50,
                maxSteps: 30,
                defaultServings: 4,
            },
            
            // Add paths configuration
            paths: {
                uploads: path.join(__dirname, '../uploads'),
                temp: path.join(__dirname, '../temp'),
            }
        };
    }

    async getConfig() {
        return this.config;
    }

    async updateConfig(updates) {
        Object.assign(this.config, updates);
        return this.config;
    }

    async addSupermarket(supermarket) {
        if (!this.config.supermarkets) {
            this.config.supermarkets = [];
        }
        this.config.supermarkets.push(supermarket);
        return this.config;
    }

    async updateSupermarket(id, updates) {
        const index = this.config.supermarkets?.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Supermarket not found');
        }
        this.config.supermarkets[index] = { ...this.config.supermarkets[index], ...updates };
        return this.config;
    }

    async removeSupermarket(id) {
        if (!this.config.supermarkets) return this.config;
        this.config.supermarkets = this.config.supermarkets.filter(s => s.id !== id);
        return this.config;
    }

    async updateTranslationService(provider, apiKey, region) {
        this.config.translation = { provider, apiKey, region };
        return this.config;
    }

    async getSupermarketsByCountry(country) {
        return this.config.supermarkets?.filter(s => s.country === country) || [];
    }
}

module.exports = new ConfigService(); 