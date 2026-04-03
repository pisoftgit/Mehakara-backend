const { PaymentCredential } = require('../models/paymentCredentialModel');
const PaymentMode = require('../models/paymentModeModel');

/**
 * Get the active (currently in use) credential for a payment method
 * @param {string} paymentMethodCode - The payment method code (e.g., 'RAZORPAY', 'PAYPAL')
 * @returns {Promise<Object>} The active credential with all its fields
 */
exports.getActiveCredentialByCode = async (paymentMethodCode) => {
  try {
    const credential = await PaymentCredential.findOne({
      paymentMethodCode: paymentMethodCode.toUpperCase(),
      isActive: true
    });

    if (!credential) {
      throw new Error(
        `No active credential found for payment method: ${paymentMethodCode}`
      );
    }

    return credential;
  } catch (error) {
    console.error('Error getting active credential:', error);
    throw error;
  }
};

/**
 * Get the active credential for a payment mode ID
 * @param {string} paymentModeId - The payment mode MongoDB ID
 * @returns {Promise<Object>} The active credential
 */
exports.getActiveCredentialByModeId = async (paymentModeId) => {
  try {
    const credential = await PaymentCredential.findOne({
      paymentModeId,
      isActive: true
    }).populate('paymentModeId');

    if (!credential) {
      throw new Error(
        `No active credential found for payment mode: ${paymentModeId}`
      );
    }

    return credential;
  } catch (error) {
    console.error('Error getting active credential:', error);
    throw error;
  }
};

/**
 * Get all credentials for a payment method
 * @param {string} paymentMethodCode - The payment method code
 * @returns {Promise<Array>} Array of all credentials for this payment method
 */
exports.getCredentialsByCode = async (paymentMethodCode) => {
  try {
    const credentials = await PaymentCredential.find({
      paymentMethodCode: paymentMethodCode.toUpperCase()
    }).sort({ createdAt: -1 });

    return credentials;
  } catch (error) {
    console.error('Error getting credentials:', error);
    throw error;
  }
};

/**
 * Record that a credential was used in a transaction
 * Used for tracking which credentials are being actively used
 * @param {string} credentialId - The credential MongoDB ID
 * @returns {Promise<Object>} Updated credential
 */
exports.recordCredentialUsage = async (credentialId) => {
  try {
    const credential = await PaymentCredential.findByIdAndUpdate(
      credentialId,
      { lastUsed: new Date() },
      { new: true }
    );

    if (!credential) {
      throw new Error('Credential not found');
    }

    return credential;
  } catch (error) {
    console.error('Error recording credential usage:', error);
    throw error;
  }
};

/**
 * Example usage in payment processing:
 * 
 * const { getActiveCredentialByCode, recordCredentialUsage } = require('../utils/paymentCredentialUtils');
 * 
 * // In your payment processing endpoint:
 * async function processPayment(paymentMethod, amount) {
 *   try {
 *     // Get active credential for the payment method
 *     const credential = await getActiveCredentialByCode(paymentMethod);
 *     
 *     // Use the credential to make payment
 *     if (paymentMethod === 'RAZORPAY') {
 *       const razorpay = require('razorpay');
 *       const instance = new razorpay({
 *         key_id: credential.credentials.publishableKey,
 *         key_secret: credential.credentials.secretKey,
 *       });
 *       // Process payment
 *     }
 *     
 *     // Record that this credential was used
 *     await recordCredentialUsage(credential._id);
 *     
 *   } catch (error) {
 *     console.error('Payment processing error:', error);
 *     // Handle error
 *   }
 * }
 */

module.exports = {
  getActiveCredentialByCode,
  getActiveCredentialByModeId,
  getCredentialsByCode,
  recordCredentialUsage,
};
