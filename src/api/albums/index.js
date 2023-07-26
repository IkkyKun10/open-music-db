const { AlbumsHandler } = require('./AlbumsHandler')
const albumRoutes = require('./AlbumsRoutes')

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server, { albumsService, songsServices, validator, schema }) => {
    const albumHandler = new AlbumsHandler(albumsService, songsServices, validator, schema)

    server.route(albumRoutes(albumHandler))
  }
}
