const path = require('path')

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postAlbumCoverHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000
      }
    }
  },
  {
    method: 'GET',
    path: '/assets/{params*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'assets')
      }
    }
  }
]

module.exports = routes
