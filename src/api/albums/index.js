const { AlbumsHandler } = require("./AlbumsHandler")
const albumRoutes = require("./AlbumsRoutes")

module.exports = {
    name: 'album',
    version: '1.0.0',
    register: async (server, {service, validator, schema}) => {
        const albumHandler = new AlbumsHandler(service, validator, schema)

        server.route(albumRoutes(albumHandler))
    }
}