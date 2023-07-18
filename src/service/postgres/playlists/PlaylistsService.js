const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const AuthorizationError = require('../../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor (collaborationsService) {
    this._pool = new Pool()
    this._collabService = collaborationsService
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

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
            INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1
            OR collaborations.user_id = $1 GROUP BY playlists.id, playlists.name, users.username`,
      values: [owner]
    }

    const result = await this._pool.query(query)
    return result.rows
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
  }

  async getSongsInPlaylist (playlistId) {
    const playlist = await this.getPlaylistsById(playlistId)

    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
            INNER JOIN playlists_songs ON songs.id = playlists_songs.song_id
            WHERE playlists_songs.playlist_id = $1`,
      values: [playlistId]
    }

    const result = await this._pool.query(query)
    const songs = result.rows || []

    return {
      playlist: {
        ...playlist,
        songs
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
