const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const AuthorizationError = require('../../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor (collaborationsService, cacheService) {
    this._pool = new Pool()
    this._collabService = collaborationsService
    this._cacheService = cacheService

    this._keySong = 'cache-song-playlist'
    this._keyPlaylist = 'cache-playlist'
  }

  async addPlaylist (name, owner) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    await this._cacheService.delete(this._keyPlaylist)

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    try {
      const cache = await this._cacheService.get(this._keyPlaylist)
      const result = JSON.parse(cache)

      return result
    } catch (error) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
            INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1
            OR collaborations.user_id = $1 GROUP BY playlists.id, playlists.name, users.username`,
        values: [owner]
      }

      const result = await this._pool.query(query)

      await this._cacheService.set({
        key: `cache-pl-${owner}`,
        value: JSON.stringify(result.rows)
      })

      return result.rows
    }
  }

  async getPlaylistsById (id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            INNER JOIN users ON playlists.owner = users.id WHERE playlists.id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows[0]
  }

  async deletePlaylistsById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dihapus. Id tidak ditemukan.')
    }

    await this._cacheService.delete(this._keyPlaylist)
  }

  async getSongsInPlaylist (playlistId) {
    const playlist = await this.getPlaylistsById(playlistId)

    try {
      const result = await this._cacheService.get(this._keySong)
      const songs = JSON.parse(result)

      return {
        playlist: {
          ...playlist,
          songs
        }
      }
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM songs 
            INNER JOIN playlists_songs ON songs.id = playlists_songs.song_id
            WHERE playlists_songs.playlist_id = $1`,
        values: [playlistId]
      }

      const result = await this._pool.query(query)
      const songs = result.rows || []

      await this._cacheService.set({
        key: this._keySong,
        value: JSON.stringify(songs)
      })

      return {
        playlist: {
          ...playlist,
          songs
        }
      }
    }
  }

  async addSongToPlaylist (songId, playlistId) {
    const id = `pl-song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, songId, playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu kedalam playlist')
    }

    await this._cacheService.delete(this._keySong)
  }

  async deleteSongFromPlaylist (songId, playlistId) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new NotFoundError('Gagal menghapus lagu di playlist, lagu tidak ditemukan')
    }

    await this._cacheService.delete(this._keySong)
  }

  async verifyPlaylistOwner (playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      try {
        await this._collabService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService
