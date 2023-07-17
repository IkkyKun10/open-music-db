const autoBind = require("auto-bind")

class AuthenticationsHandler {
    constructor(authenticationsService, usersService, tokenManager, validator, schema) {
        this._authenticationsService = authenticationsService
        this._usersService = usersService
        this._tokenManager = tokenManager
        this._validator = validator
        this._schema = schema

        autoBind(this)
    }

    async postAuthenticationHandler(request, h) {
        this._validator.validateMusicPayload(request.payload, this._schema.PostAuthenticationPayloadSchema)

        const { username, password } = request.payload

        const id = await this._usersService.verifyUserCredential(username, password)
        const accessToken = this._tokenManager.generateAccessToken({ id })
        const refreshToken = this._tokenManager.generateRefreshToken({ id })

        await this._authenticationsService.addRefreshToken(refreshToken)
        const response = h.response({
            status: 'success',
            message: 'Authentication berhasil ditambahkan',
            data: {
                accessToken,
                refreshToken,
            }
        })

        response.code(201)
        return response
    }

    async putAuthenticationHandler(request) {
        this._validator.validateMusicPayload(request.payload, this._schema.PutAuthenticationPayloadSchema)

        const { refreshToken } = request.payload

        await this._authenticationsService.verifyRefreshToken(refreshToken)
        const id = this._tokenManager.verifyRefreshToken(refreshToken)

        const accessToken = await this._tokenManager.generateAccessToken({ id })

        return {
            status: 'success',
            message: 'Access token berhasil diperbaharui',
            data: {
                accessToken,
            },
        }

    }

    async deleteAuthenticationHandler(request) {
        this._validator.validateMusicPayload(request.payload, this._schema.DeleteAuthenticationPayloadSchema)

        const { refreshToken } = request.payload

        await this._authenticationsService.verifyRefreshToken(refreshToken)
        await this._authenticationsService.deleteRefreshToken(refreshToken)

        return {
            status: 'success',
            message: 'Refresh token berhasil dihapus',
        }
    }

}

module.exports = AuthenticationsHandler