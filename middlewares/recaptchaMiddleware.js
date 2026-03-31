const axios = require('axios');

const recaptchaVerify = async (req, res, next) => {
  try {
    const recaptchaToken = req.body.recaptchaToken || req.headers['x-recaptcha-token'];

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA token is required'
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // In development, if secret key is not set, skip verification but warn
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not set in .env. Skipping verification for development.');
      return next();
    }

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
    );

    if (response.data.success) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errors: response.data['error-codes']
      });
    }
  } catch (error) {
    console.error('reCAPTCHA Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during reCAPTCHA verification'
    });
  }
};

module.exports = recaptchaVerify;
