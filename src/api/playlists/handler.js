const autoBind = require("auto-bind")

class PlaylistsHandler {
    constructor(playlistsService, songsServices, playlistActivitiesService, validator, schema) {
        this._playlistsService = playlistsService
        this._songsService = songsServices
        this._playlistActivitiesService = playlistActivitiesService
        this._validator = validator
        this._schema = schema

        autoBind(this)
    }

    async postPlaylistHandler(request, h) {
        this._validator.validateMusicPayload(request.payload, this._schema.PostPlaylistPayloadSchema)

        const { name } = request.payload

        const { id: credentialId } = request.auth.credentials

        const playlistId = await this._playlistsService.addPlaylist(name, credentialId)

        const response = h.response({
            status: 'success',
            message: 'Succes menambahkan playlist',
            data: {
                playlistId,
            },
        })

        response.code(201)
        return response

    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials
        const playlists = await this._playlistsService.getPlaylists(credentialId)

        return {
            status: 'success',
            data: {
                playlists,
            },
        }
    }

    async getSongsInPlaylistWithPlaylistIdHandler(request) {
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        const playlist = await this._playlistsService.getSongsInPlaylist(playlistId)

        return {
            status: 'success',
            data: {
                ...playlist,
            },
        }
    }

    async deletePlaylistByIdHandler(request, h) {
        const { id } = request.params
        const { id: credentialId } = request.auth.credentials

        await this._playlistsService.verifyPlaylistOwner(id, credentialId)
        await this._playlistsService.deletePlaylistsById(id)

        return {
            status: 'success',
            message: 'Berhasil menghapus playlist'
        }
    }

    async postSongToPlaylistWithPlaylistIdHandler(request, h) {
        this._validator.validateMusicPayload(request.payload, this._schema.PostSongToPlaylistPayloadSchema)

        const { songId } = request.payload
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        await this._songsService.getSongById(songId)
        await this._playlistsService.addSongToPlaylist(songId, playlistId)

        await this._playlistActivitiesService.addActivity({ playlistId, songId, userId: credentialId, action: 'add' })
        console.log(await this._songsService.getSongById(songId))

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambah ke playlist'
        })

        response.code(201)
        return response
    }



    async deleteSongFromPlaylistWithPlaylistIdHandler(request, h) {
        this._validator.validateMusicPayload(request.payload, this._schema.DeleteSongFromPlaylistPayloadSchema)

        const { songId } = request.payload
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        await this._playlistsService.deleteSongFromPlaylist(songId, playlistId)
        await this._playlistActivitiesService.addActivity({ playlistId, songId, userId: credentialId, action: 'delete' })

        return {
            status: 'success',
            message: 'Berhasil menghapus lagu dari playlist'
        }
    }
}

module.exports = PlaylistsHandler