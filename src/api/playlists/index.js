const PlaylistsHandler = require("./handler")
const routes = require("./routes")

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { playlistsService, songsServices, playlistActivitiesService, validator, schema }) => {
        const playlistHandler = new PlaylistsHandler(
            playlistsService,
            songsServices,
            playlistActivitiesService,
            validator,
            schema
        )

        server.route(routes(playlistHandler))

    }
}