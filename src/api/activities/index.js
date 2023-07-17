const PlaylistActivitiesHandler = require("./handler")
const routes = require("./routes")

module.exports = {
    name: 'playlistActivities',
    version: '1.0.0',
    register: async (server, { playlistsService, playlistActivitiesService }) => {
        const activitiesService = new PlaylistActivitiesHandler(playlistsService, playlistActivitiesService)

        server.route(routes(activitiesService))
    }
}