const mongoose = require('mongoose');
const Currency = require('./models/currencyModel');
const axios = require('axios');
require('dotenv').config();

const currencies = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸'
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧'
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵'
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦'
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺'
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    flag: '🇨🇭'
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    flag: '🇨🇳'
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳'
  },
  {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    flag: '🇰🇷'
  }
];

// Fetch exchange rates from external API
const fetchExchangeRates = async () => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Fallback rates in case API fails
    return {
      USD: 1,
      EUR: 0.87,    
      GBP: 0.75,   
      JPY: 158.39,  
      CAD: 1.37,    
      AUD: 1.41,    
      CHF: 0.79,    
      CNY: 6.89,    
      INR: 93.31,   
      KRW: 1497.20  
    };
  }
};

async function seedCurrencies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch latest exchange rates
    console.log('Fetching latest exchange rates...');
    const rates = await fetchExchangeRates();

    // Add exchange rates to currencies
    const currenciesWithRates = currencies.map(currency => ({
      ...currency,
      exchangeRate: rates[currency.code] || 1
    }));

    // Clear existing currencies
    await Currency.deleteMany({});
    console.log('Cleared existing currencies');

    // Insert new currencies with real rates
    await Currency.insertMany(currenciesWithRates);
    console.log('Currencies seeded successfully with real exchange rates');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding currencies:', error);
    process.exit(1);
  }
}

seedCurrencies();