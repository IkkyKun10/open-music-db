const autoBind = require('auto-bind')

class UsersHandler {
  constructor (service, validator, schema) {
    this._service = service
    this._validator = validator
    this._schema = schema

    autoBind(this)
  }

  async postUserHandler (request, h) {
    this._validator.validateMusicPayload(request.payload, this._schema)

    const { username, password, fullname } = request.payload

    const userId = await this._service.addUser({ username, password, fullname })

    const response = h.response({
      status: 'success',
      data: {
        userId
      }
    })

    response.code(201)
    return response
  }

  async getUserByIdHandler (request, h) {
    const { id } = request.params

    const user = await this._service.getUserById(id)

    return {
      status: 'success',
      data: {
        user
      }
    }
  }

  async getUsersByUsernameHandler (request, h) {
    const { username = '' } = request.query
    const users = await this._service.getUsersByUsername(username)
    return {
      status: 'success',
      data: {
        users
      }
    }
  }
}

module.exports = UsersHandler
