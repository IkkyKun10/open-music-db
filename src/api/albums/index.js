const { AlbumsHandler } = require('./AlbumsHandler')
const albumRoutes = require('./AlbumsRoutes')

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server, { albumsService, songsService, validator, schema }) => {
    const albumHandler = new AlbumsHandler(albumsService, songsService, validator, schema)

    server.route(albumRoutes(albumHandler))
  }
}
