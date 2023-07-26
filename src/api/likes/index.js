const AlbumLikesHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'likeAlbum',
  version: '1.0.0',
  register: async (server, { albumLikesService, albumsService }) => {
    const albumLikeHandler = new AlbumLikesHandler(albumLikesService, albumsService)

    server.route(routes(albumLikeHandler))
  }
}
