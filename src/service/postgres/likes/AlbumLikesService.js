const { Pool } = require('pg')
const InvariantError = require('../../../exceptions/InvariantError')
const { nanoid } = require('nanoid')

class AlbumLikesService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async likeAlbum (userId, albumId) {
    await this.verifyLikeRequest(userId, albumId)

    const id = `likes-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const result = await this._pool.query(query)

    await this._cacheService.delete(`album-${albumId}-like`)

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album')
    }
  }

  async unlikeAlbum (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    await this._cacheService.delete(`album-${albumId}-like`)

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal batal menyukai album')
    }
  }

  async verifyLikeRequest (userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal sukai album, album sudah disukai')
    }
  }

  async getLikeAlbumCount (albumId) {
    try {
      const likeCounting = await this._cacheService.get(`album-${albumId}-like`)

      return {
        fromCache: true,
        likeCounting: JSON.parse(likeCounting)
      }
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      }

      const result = await this._pool.query(query)
      const likeCounting = parseInt(result.rows[0].count) || 0

      await this._cacheService.set({
        key: `album-${albumId}-like`,
        value: JSON.stringify(likeCounting)
      })

      return { likeCounting }
    }
  }
}

module.exports = AlbumLikesService
