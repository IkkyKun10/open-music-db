const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../../exceptions/InvariantError')

class PlaylistActivitiesService {
  constructor () {
    this._pool = new Pool()
  }

  async addActivity ({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}}`
    const time = new Date().toISOString()

    const query = {
      text: 'INSERT INTO playlist_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas tidak berhasil ditambahkan')
    }

    return result.rows[0].id
  }

  async getActivities (playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, 
            playlist_activities.action, playlist_activities.time 
            FROM playlist_activities
            INNER JOIN users ON playlist_activities.user_id = users.id
            INNER JOIN songs ON playlist_activities.song_id = songs.id
            WHERE playlist_activities.playlist_id = $1`,
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    return result.rows
  }
}

module.exports = PlaylistActivitiesService
