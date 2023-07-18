const { SongsHandler } = require('./SongsHandler')
const songRoutes = require('./SongsRoutes')

module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server, { service, validator, schema }) => {
    const songHandler = new SongsHandler(service, validator, schema)

    server.route(songRoutes(songHandler))
  }
}
