const Currency = require('../models/currencyModel');

/**
 * Convert amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} - Converted amount
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    // If same currency, return original amount
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return amount;
    }

    // Get currency data
    const [fromCurr, toCurr] = await Promise.all([
      Currency.findOne({ code: fromCurrency.toUpperCase(), isActive: true }),
      Currency.findOne({ code: toCurrency.toUpperCase(), isActive: true })
    ]);

    if (!fromCurr || !toCurr) {
      throw new Error('Invalid currency code');
    }

    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromCurr.exchangeRate;
    const convertedAmount = amountInUSD * toCurr.exchangeRate;

    return Number(convertedAmount.toFixed(2));
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw error;
  }
};

/**
 * Get currency symbol by code
 * @param {string} currencyCode - Currency code
 * @returns {Promise<string>} - Currency symbol
 */
const getCurrencySymbol = async (currencyCode) => {
  try {
    const currency = await Currency.findOne({
      code: currencyCode.toUpperCase(),
      isActive: true
    });

    return currency ? currency.symbol : '$';
  } catch (error) {
    console.error('Get currency symbol error:', error);
    return '$';
  }
};

/**
 * Format price with currency symbol
 * @param {number} amount - Price amount
 * @param {string} currencyCode - Currency code
 * @returns {Promise<string>} - Formatted price string
 */
const formatPrice = async (amount, currencyCode) => {
  try {
    const symbol = await getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString()}`;
  } catch (error) {
    console.error('Format price error:', error);
    return `$${amount.toLocaleString()}`;
  }
};

module.exports = {
  convertCurrency,
  getCurrencySymbol,
  formatPrice
};