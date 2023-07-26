require('dotenv').config()

const Inert = require('@hapi/inert')
const path = require('path')
const ClientError = require('./exceptions/ClientError')
const { AlbumsServices } = require('./service/postgres/Albums/AlbumsServices')
const { SongsServices } = require('./service/postgres/Songs/SongsServices')

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const config = require('./utils/config')

const { AlbumSongValidator } = require('./validator')
const { AlbumPayloadSchema } = require('./validator/albums/AlbumSchema')
const { SongPayloadSchema } = require('./validator/songs/Songschema')
const AuthenticationsService = require('./service/postgres/auth/AuthenticationsService')
const authentications = require('./api/authentications')
const UsersServices = require('./service/postgres/users/UsersServices')
const TokenManager = require('./service/tokenize/TokenManager')

const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema
} = require('./validator/authentications/schema')

// plugin
const album = require('./api/albums')
const song = require('./api/songs')
const users = require('./api/users')
const playlists = require('./api/playlists')
const playlistActivities = require('./api/activities')
const collaborations = require('./api/collab')

const { UserPayloadSchema } = require('./validator/users/schema')
const CollaborationsService = require('./service/postgres/collaborations/CollaborationsServices')
const PlaylistsService = require('./service/postgres/playlists/PlaylistsService')
const PlaylistActivitiesService = require('./service/postgres/playlists/PlaylistActivitiesService')

const {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema
} = require('./validator/playlists/schema')

const CollaborationPayloadSchema = require('./validator/collaborations/schema')

const _exports = require('./api/exports')
const ExportSongsFromPlaylistSchema = require('./validator/exports/schema')
const producerService = require('./service/postgres/rabbitmq/ProducerService')

const uploads = require('./api/uploads')
const StorageService = require('./service/postgres/storage/StorageService')
const ImageHeadersSchema = require('./validator/uploads/schema')

const likeAlbum = require('./api/likes')
const CacheService = require('./service/postgres/redis/CacheService')
const AlbumLikesService = require('./service/postgres/likes/AlbumLikesService')

const init = async () => {
  const albumsService = new AlbumsServices()
  const songsServices = new SongsServices()
  const authenticationsService = new AuthenticationsService()
  const usersService = new UsersServices()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const playlistActivitiesService = new PlaylistActivitiesService()
  const cacheService = new CacheService()
  const storageService = new StorageService(
    path.resolve(__dirname, './api/uploads/assets/images')
  )
  const albumLikesService = new AlbumLikesService(cacheService)

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        })

        console.error(response.message)

        newResponse.code(response.statusCode)

        return newResponse
      }

      if (!response.isServer) {
        return h.continue
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server'
      })

      console.error(response.message)

      newResponse.code(500)

      return newResponse
    }

    return h.continue
  })

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('albumsongapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: album,
      options: {
        albumsService,
        songsServices,
        validator: AlbumSongValidator,
        schema: AlbumPayloadSchema
      }
    },
    {
      plugin: song,
      options: {
        service: songsServices,
        validator: AlbumSongValidator,
        schema: SongPayloadSchema
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AlbumSongValidator,
        schema: {
          PostAuthenticationPayloadSchema,
          PutAuthenticationPayloadSchema,
          DeleteAuthenticationPayloadSchema
        }
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: AlbumSongValidator,
        schema: UserPayloadSchema
      }
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsServices,
        playlistActivitiesService,
        validator: AlbumSongValidator,
        schema: {
          PostPlaylistPayloadSchema,
          PostSongToPlaylistPayloadSchema,
          DeleteSongFromPlaylistPayloadSchema
        }
      }
    },
    {
      plugin: playlistActivities,
      options: {
        playlistsService,
        playlistActivitiesService
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        usersService,
        playlistsService,
        validator: AlbumSongValidator,
        schema: CollaborationPayloadSchema
      }
    },
    {
      plugin: likeAlbum,
      options: {
        albumLikesService,
        albumsService
      }
    },
    {
      plugin: _exports,
      options: {
        producerService,
        playlistsService,
        validator: AlbumSongValidator,
        schema: ExportSongsFromPlaylistSchema
      }
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
        validator: AlbumSongValidator,
        schema: ImageHeadersSchema
      }
    }
  ])

  await server.start()
  console.log(`Server listening on ${server.info.uri}`)
}

init()
