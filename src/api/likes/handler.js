const autoBind = require('auto-bind')

class AlbumLikesHandler {
  constructor (albumLikesService, albumsService) {
    this._albumLikesService = albumLikesService
    this._albumsService = albumsService

    autoBind(this)
  }

  async postAlbumLikeHandler (request, h) {
    const { id: albumId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._albumsService.getAlbumById(albumId)
    await this._albumLikesService.likeAlbum(credentialId, albumId)

    const response = h.response({
      status: 'success',
      message: 'Success menyukai album'
    })

    response.code(201)

    return response
  }

  async deleteAlbumLikeHandler (request) {
    const { id: albumId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._albumLikesService.unlikeAlbum(credentialId, albumId)

    return {
      status: 'success',
      message: 'Success menghapus favorite album'
    }
  }

  async getAlbumLikeHandler (request, h) {
    const { id: albumId } = request.params

    const likes = await this._albumLikesService.getLikeAlbumCount(albumId)

    const { fromCache = null, likeCounting } = likes

    const response = h.response({
      status: 'success',
      data: {
        likes: likeCounting
      }
    })

    if (fromCache) {
      response.header('X-Data-Source', 'cache')
    }

    return response
  }
}

module.exports = AlbumLikesHandler
