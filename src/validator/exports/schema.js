const Joi = require('joi')

const ExportSongsFromPlaylistSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required()
})

module.exports = ExportSongsFromPlaylistSchema
