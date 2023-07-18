const { Pool } = require('pg')
const InvariantError = require('../../../exceptions/InvariantError')
const { nanoid } = require('nanoid')

class CollaborationsService {
  constructor () {
    this._pool = new Pool()
  }

  async addCollaboration (playlistId, userId) {
    const id = `collab-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO collaborations VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Collaborasi gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async verifyCollaborator (playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Gagal verifikasi collaborator, id playlist dan id user tidak cocok')
    }
  }

  async deleteCollaboration (playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Collaborasi gagal dihapus')
    }
  }
}

module.exports = CollaborationsService
