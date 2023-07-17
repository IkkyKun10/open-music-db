const autoBind = require("auto-bind")

class CollaborationsHandler {
    constructor(collaborationsService, usersService, playlistsService, validator, schema) {
        this._collabService = collaborationsService
        this._usersService = usersService
        this._playlistsService = playlistsService
        this._validator = validator
        this._schema = schema

        autoBind(this)
    }

    async postCollaborationHandler(request, h) {
        await this._validator.validateMusicPayload(request.payload, this._schema)

        const { playlistId, userId } = request.payload
        const { id: credentialId } = request.auth.credentials

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
        await this._usersService.getUserById(userId);
        const collaborationId = await this._collabService.addCollaboration(playlistId, userId)

        const response = h.response({
            status: 'success',
            message: 'Collaborasi ditambahkan',
            data: {
                collaborationId,
            },
        });

        response.code(201)
        return response
    }

    async deleteCollaborationHandler(request, h) {
        await this._validator.validateMusicPayload(request.payload, this._schema)

        const { playlistId, userId } = request.payload
        const { id: credentialId } = request.auth.credentials

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
        await this._collabService.deleteCollaboration(playlistId, userId)

        return {
            status: 'success',
            message: 'Collaborator dihapus',
        }

    }
}

module.exports = CollaborationsHandler