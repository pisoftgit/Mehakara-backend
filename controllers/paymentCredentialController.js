const { PaymentCredential, credentialTemplates } = require('../models/paymentCredentialModel');
const PaymentMode = require('../models/paymentModeModel');

// ===== GET CREDENTIAL TEMPLATES =====
exports.getCredentialTemplates = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      templates: credentialTemplates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching credential templates'
    });
  }
};

// ===== CREATE NEW CREDENTIAL =====
exports.createPaymentCredential = async (req, res) => {
  try {
    const { paymentModeId, paymentMethodCode, credentialName, credentials, description, isTestMode, notes } = req.body;

    // Validate payment mode exists
    const paymentMode = await PaymentMode.findById(paymentModeId);
    if (!paymentMode) {
      return res.status(404).json({
        success: false,
        message: 'Payment mode not found'
      });
    }

    // Validate credential structure if template exists
    if (credentialTemplates[paymentMethodCode?.toLowerCase()]) {
      const template = credentialTemplates[paymentMethodCode.toLowerCase()];
      const requiredFields = Object.keys(template).filter(
        key => template[key].required !== false
      );

      for (const field of requiredFields) {
        if (!credentials[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing required field: ${field}`
          });
        }
      }
    }

    // If this is the first credential, make it active
    const existingCredentials = await PaymentCredential.findOne({ paymentModeId });
    const isActive = !existingCredentials;

    const credential = await PaymentCredential.create({
      paymentModeId,
      paymentMethodCode: paymentMethodCode.toUpperCase(),
      credentialName,
      credentials,
      description,
      isTestMode,
      isActive,
      createdBy: req.user._id,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Payment credential created successfully',
      data: credential
    });
  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment credential'
    });
  }
};

// ===== GET ALL CREDENTIALS FOR A PAYMENT MODE =====
exports.getCredentialsByPaymentMode = async (req, res) => {
  try {
    const { paymentModeId } = req.params;

    const credentials = await PaymentCredential.find({ paymentModeId })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: credentials
    });
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching credentials'
    });
  }
};

// ===== GET ACTIVE CREDENTIAL FOR A PAYMENT MODE =====
exports.getActiveCredential = async (req, res) => {
  try {
    const { paymentModeId } = req.params;

    const credential = await PaymentCredential.findOne({
      paymentModeId,
      isActive: true
    }).populate('createdBy', 'name email');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'No active credential found for this payment mode'
      });
    }

    res.status(200).json({
      success: true,
      data: credential
    });
  } catch (error) {
    console.error('Get active credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching active credential'
    });
  }
};

// ===== UPDATE CREDENTIAL =====
exports.updatePaymentCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { credentialName, credentials, description, isTestMode, notes } = req.body;

    const credential = await PaymentCredential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Update fields
    if (credentialName) credential.credentialName = credentialName;
    if (credentials) credential.credentials = credentials;
    if (description !== undefined) credential.description = description;
    if (isTestMode !== undefined) credential.isTestMode = isTestMode;
    if (notes !== undefined) credential.notes = notes;

    credential.updatedBy = req.user._id;
    await credential.save();

    res.status(200).json({
      success: true,
      message: 'Credential updated successfully',
      data: credential
    });
  } catch (error) {
    console.error('Update credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating credential'
    });
  }
};

// ===== ACTIVATE CREDENTIAL =====
exports.activateCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await PaymentCredential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Deactivate all other credentials for the same payment mode
    await PaymentCredential.updateMany(
      { paymentModeId: credential.paymentModeId },
      { isActive: false }
    );

    // Activate this credential
    credential.isActive = true;
    credential.updatedBy = req.user._id;
    await credential.save();

    res.status(200).json({
      success: true,
      message: 'Credential activated successfully',
      data: credential
    });
  } catch (error) {
    console.error('Activate credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error activating credential'
    });
  }
};

// ===== DELETE CREDENTIAL =====
exports.deletePaymentCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await PaymentCredential.findById(credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Don't allow deleting the only credential
    const credentialCount = await PaymentCredential.countDocuments({
      paymentModeId: credential.paymentModeId
    });

    if (credentialCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only credential for this payment mode'
      });
    }

    await PaymentCredential.findByIdAndDelete(credentialId);

    // If deleted credential was active, activate the next available one
    if (credential.isActive) {
      const nextCredential = await PaymentCredential.findOne({
        paymentModeId: credential.paymentModeId
      });
      if (nextCredential) {
        nextCredential.isActive = true;
        await nextCredential.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Credential deleted successfully'
    });
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting credential'
    });
  }
};

// ===== GET ALL CREDENTIALS (ADMIN) =====
exports.getAllCredentials = async (req, res) => {
  try {
    const credentials = await PaymentCredential.find()
      .populate('paymentModeId', 'name code')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: credentials
    });
  } catch (error) {
    console.error('Get all credentials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching credentials'
    });
  }
};

// ===== RECORD LAST USED =====
exports.recordCredentialUsage = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await PaymentCredential.findByIdAndUpdate(
      credentialId,
      { lastUsed: new Date() },
      { new: true }
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Credential usage recorded',
      data: credential
    });
  } catch (error) {
    console.error('Record usage error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error recording credential usage'
    });
  }
};
