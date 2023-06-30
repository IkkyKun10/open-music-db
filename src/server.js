require('dotenv').config();

const ClientError = require("./exceptions/ClientError")
const { AlbumsServices } = require("./service/postgres/Albums/AlbumsServices")
const { SongsServices } = require("./service/postgres/Songs/SongsServices")

const Hapi = require('@hapi/hapi')

const album = require('./api/albums')
const song = require('./api/songs');
const { AlbumSongValidator } = require('./validator');
const { AlbumPayloadSchema } = require('./validator/albums/AlbumSchema');
const { SongPayloadSchema } = require('./validator/songs/Songschema');

const init = async () => {
    const albumsService = new AlbumsServices()
    const songsServices = new SongsServices()

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    })

    server.ext('onPreResponse', (request, h) => {
        const { response } = request

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                })

                newResponse.code(response.statusCode)
                console.log(newResponse)
                return newResponse
            }

            if (!response.isServer) {
                return h.continue
            }

            const newResponse = h.response({
                status: 'error',
                message: 'Maaf, terjadi kesalahan pada server',
            })
            newResponse.code(500)
            console.log(newResponse)
            return newResponse
        }

        return h.continue
    })

    await server.register([
        {
            plugin: album,
            options: {
                service: albumsService,
                validator: AlbumSongValidator,
                schema: AlbumPayloadSchema,
            },
        },
        {
            plugin: song,
            options: {
                service: songsServices,
                validator: AlbumSongValidator,
                schema: SongPayloadSchema,
            },
        },
    ])

    await server.start()
    console.log(`Server listening on ${server.info.uri}`)

}

init()