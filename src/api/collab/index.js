const CollaborationsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, usersService, playlistsService, validator, schema }) => {
    const collabHandler = new CollaborationsHandler(
      collaborationsService,
      usersService,
      playlistsService,
      validator,
      schema
    )

    server.route(routes(collabHandler))
  }
}
