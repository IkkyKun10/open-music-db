const InvariantError = require("../exceptions/InvariantError")
const { AlbumSongPayloadSchema } = require("./songs/schema")

const AlbumSongValidator = {
    validateMusicPayload: (payload, schema) => {
        const validatioResult = schema.validate(payload)
        if (validatioResult.error) {
            throw new InvariantError(validatioResult.error.message)
        }
    }
}

module.exports = { AlbumSongValidator }