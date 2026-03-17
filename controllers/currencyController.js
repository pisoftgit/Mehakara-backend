const Currency = require('../models/currencyModel');
const axios = require('axios');

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
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5,
      KRW: 1180
    };
  }
};

// Get all active currencies
exports.getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find({ isActive: true })
      .select('code name symbol exchangeRate flag')
      .sort('name');

    res.status(200).json({
      success: true,
      currencies
    });
  } catch (error) {
    console.error('GET CURRENCIES ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single currency by code
exports.getCurrencyByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const currency = await Currency.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.status(200).json({
      success: true,
      currency
    });
  } catch (error) {
    console.error('GET CURRENCY ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new currency (Admin only)
exports.createCurrency = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create currencies'
      });
    }

    const { code, name, symbol, exchangeRate, flag } = req.body;

    // Validate required fields
    if (!code || !name || !symbol || !exchangeRate) {
      return res.status(400).json({
        success: false,
        message: 'Code, name, symbol, and exchange rate are required'
      });
    }

    // Check if currency already exists
    const existing = await Currency.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Currency with this code already exists'
      });
    }

    const currency = await Currency.create({
      code: code.toUpperCase(),
      name,
      symbol,
      exchangeRate: Number(exchangeRate),
      flag
    });

    res.status(201).json({
      success: true,
      message: 'Currency created successfully',
      currency
    });
  } catch (error) {
    console.error('CREATE CURRENCY ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update currency (Admin only)
exports.updateCurrency = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update currencies'
      });
    }

    const { code } = req.params;
    const updates = req.body;

    const currency = await Currency.findOneAndUpdate(
      { code: code.toUpperCase() },
      updates,
      { new: true, runValidators: true }
    );

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      currency
    });
  } catch (error) {
    console.error('UPDATE CURRENCY ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete currency (Admin only)
exports.deleteCurrency = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete currencies'
      });
    }

    const { code } = req.params;
    const currency = await Currency.findOneAndDelete({ code: code.toUpperCase() });

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Currency deleted successfully'
    });
  } catch (error) {
    console.error('DELETE CURRENCY ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update exchange rates from external API (Admin only)
exports.updateExchangeRates = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update exchange rates'
      });
    }

    // Fetch latest rates from API
    const rates = await fetchExchangeRates();

    // Update all currencies with new rates
    const updatePromises = Object.entries(rates).map(async ([code, rate]) => {
      try {
        return await Currency.findOneAndUpdate(
          { code: code.toUpperCase() },
          { exchangeRate: Number(rate) },
          { new: true }
        );
      } catch (error) {
        console.error(`Error updating ${code}:`, error);
        return null;
      }
    });

    const updatedCurrencies = await Promise.all(updatePromises);

    const successfulUpdates = updatedCurrencies.filter(c => c !== null);

    res.status(200).json({
      success: true,
      message: `Exchange rates updated successfully for ${successfulUpdates.length} currencies`,
      currencies: successfulUpdates
    });
  } catch (error) {
    console.error('UPDATE EXCHANGE RATES ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};