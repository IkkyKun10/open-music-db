const Joi = require('joi')

const currentYear = new Date().getFullYear()

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().trim().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required()
})

module.exports = { AlbumPayloadSchema }
