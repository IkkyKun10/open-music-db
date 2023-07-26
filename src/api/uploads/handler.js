const autoBind = require('auto-bind')
const config = require('../../utils/config')

class UploadCoverAlbumHandler {
  constructor (storageService, albumsService, validator, schema) {
    this._storageService = storageService
    this._albumsService = albumsService
    this._validator = validator
    this._schema = schema

    autoBind(this)
  }

  async postAlbumCoverHandler (request, h) {
    const { id } = request.params
    const { cover } = request.payload

    this._validator.validateMusicPayload(cover.hapi.headers, this._schema)

    const { name, year } = await this._albumsService.getAlbumById(id)
    const filename = await this._storageService.writeFile(cover, cover.hapi)

    const coverUrl = `http://${config.app.host}:${config.app.port}/assets/images/${filename}`

    await this._albumsService.editAlbumById(id, { name, year, coverUrl })

    const response = h.response({
      status: 'success',
      message: 'Cover berhasil diunggah'
    })

    response.code(201)
    return response
  }
}

module.exports = UploadCoverAlbumHandler
