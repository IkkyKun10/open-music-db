const autoBind = require("auto-bind")

class SongsHandler {
    constructor(service, validator, schema) {
        this._service = service
        this._validator = validator
        this._schema = schema

        autoBind(this)
    }

    async postSongHandler(request, h) {
        this._validator.validateMusicPayload(request.payload, this._schema)

        //const { title, year, performer, genre, duration } = request.payload

        const idSong = await this._service.addSong(request.payload)

        const response = h.response({
            status: 'success',
            data: {
                idSong,
            },
        })

        response.code(201)
        return response
    }

    async getSongsHandler() {
        const songs = await this._service.getSongs()

        return {
            status: 'success',
            data: {
                songs
            },
        }
    }

    async getSongByIdHandler(request, h) {
        const id = request.params

        const song = await this._service.getSongById(id)

        const response = h.response({
            status: 'success',
            data: {
                song
            },
        })

        return response
    }

    async putSongByIdHandler(request, h) {
        const id = request.params

        this._validator.validateMusicPayload(request.payload, this._schema)

        await this._service.editSongById(id, request.payload)

        return h.response({
            status: 'success',
            message: 'Lagu berhasil diperbaharui',
        })

    }

    async deleteSongByIdHandler(request, h) {
        const id = request.params

        await this._service.deleteSongById(id)

        return h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus',
        })
    }
}

module.exports = { SongsHandler }
