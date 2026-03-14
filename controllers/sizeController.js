const Size = require('../models/sizeModel')
const Unit = require('../models/unitModel')

exports.createSize = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only admin or artist can create sizes'
      })
    }

    const { name, minArea, maxArea, unit, description } = req.body

    if (!name || minArea === undefined || maxArea === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: 'name, minArea, maxArea and unit are required'
      })
    }
    const unitExists = await Unit.findById(unit)

    if (!unitExists) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      })
    }

    const size = await Size.create({
      name,
      minArea,
      maxArea,
      unit,
      description
    })

    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      size
    })
  } catch (error) {
    console.error('CREATE SIZE ERROR:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

/**
 * Get all sizes
 */
exports.getSizes = async (req, res) => {
  try {
    const sizes = await Size.find()
      .populate('unit', 'name symbol')
      .sort({ minArea: 1 })

    res.status(200).json({
      success: true,
      count: sizes.length,
      sizes
    })
  } catch (error) {
    console.error('GET SIZE ERROR:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

/**
 * Get single size
 */
exports.getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id)

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      })
    }

    res.status(200).json({
      success: true,
      size
    })
  } catch (error) {
    console.error('GET SIZE ERROR:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

/**
 * Update size (Admin only)
 */
exports.updateSize = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update sizes'
      })
    }

    const size = await Size.findById(req.params.id)

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      })
    }

    const { name, minArea, maxArea, unit, description, isActive } = req.body

    if (name !== undefined) size.name = name
    if (minArea !== undefined) size.minArea = minArea
    if (maxArea !== undefined) size.maxArea = maxArea
    if (unit !== undefined) size.unit = unit
    if (description !== undefined) size.description = description
    if (isActive !== undefined) size.isActive = isActive

    await size.save()

    res.status(200).json({
      success: true,
      message: 'Size updated successfully',
      size
    })
  } catch (error) {
    console.error('UPDATE SIZE ERROR:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

/**
 * Delete size (Admin only)
 */
exports.deleteSize = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete sizes'
      })
    }

    const size = await Size.findByIdAndDelete(req.params.id)

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Size deleted successfully'
    })
  } catch (error) {
    console.error('DELETE SIZE ERROR:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
