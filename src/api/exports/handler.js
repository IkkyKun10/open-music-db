const autoBind = require('auto-bind')

class ExportHandler {
  constructor (producerService, playlistsService, validator, schema) {
    this._producerService = producerService
    this._playlistService = playlistsService
    this._validator = validator
    this._schema = schema

    autoBind(this)
  }

  async postExportPlaylistHandler (request, h) {
    this._validator.validateMusicPayload(request.payload, this._schema)

    const { playlistId } = request.params
    const { id: credentialId } = request.auth.credentials
    const { targetEmail } = request.payload

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)

    const message = {
      playlistId,
      targetEmail
    }

    await this._producerService.sendMessage('export:songsInPlaylist', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses'
    })

    response.code(201)
    return response
  }
}

module.exports = ExportHandler
