const InvariantError = require("../exceptions/InvariantError")

const AlbumSongValidator = {
    validateMusicPayload: (payload, schema) => {
        const validatioResult = schema.validate(payload)
        if (validatioResult.error) {
            throw new InvariantError(validatioResult.error.message)
        }
    }
}

module.exports = { AlbumSongValidator }