const autoBind = require("auto-bind")

class AlbumsHandler {
    constructor(service, validator, schema) {
        this._service = service
        this._validator = validator
        this._schema = schema

        autoBind(this)
    }

    async postAlbumHandler(request, h) {
        this._validator.validateMusicPayload(request.payload, this._schema)

        const { name = 'untitle album', year } = request.payload

        const albumId = await this._service.addAlbum({ name, year })

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId
            },
        })

        response.code(201)
        return response
    }

    async getAlbumsHandler() {
        const albums = await this._service.getAlbums()

        return {
            status: 'success',
            data: albums,
        }
    }

    async getAlbumByIdHandler(request, h) {
        const id = request.params

        const album = await this._service.getAlbumById(id)

        const response = h.response({
            status: 'success',
            data: {
                album
            },
        })

        return response
    }

    async putAlbumByIdHandler(request, h) {
        const id = request.params

        this._validator.validateMusicPayload(request.payload, this._schema)

        await this._service.editAlbumById(id, request.payload)

        return h.response({
            status: 'success',
            message: 'Album berhasil diperbaharui',
        })
    }

    async deleteAlbumByIdHandler(request, h) {
        const id = request.params

        await this._service.deleteAlbumById(id)

        return h.response({
            status: 'success',
            message: 'Album berhasil dihapus',
        })
    }
}

module.exports = { AlbumsHandler }