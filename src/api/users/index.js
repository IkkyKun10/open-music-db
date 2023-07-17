const UsersHandler = require("./handler")
const routes = require("./routes")

module.exports = {
    name: 'users',
    version: '1.0.0',
    register: async (server, { service, validator, schema }) => {
        const usersHandler = new UsersHandler(service, validator, schema)
        server.route(routes(usersHandler))
    },
}