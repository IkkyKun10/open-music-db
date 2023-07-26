const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postAlbumLikeHandler,
    options: {
      auth: 'albumsongapp_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteAlbumLikeHandler,
    options: {
      auth: 'albumsongapp_jwt'
    }
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikeHandler
  }
]

module.exports = routes
