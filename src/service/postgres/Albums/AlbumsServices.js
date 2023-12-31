const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const { mapAlbumToModel } = require('../../../utils')

class AlbumsServices {
  constructor () {
    this._pool = new Pool()
  }

  async addAlbum ({ name, year }) {
    const id = `album-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbums () {
    const result = await this._pool.query('SELECT * FROM albums')
    return result.rows
  }

  async getAlbumById (id) {
    const firstQuery = {
      text: `
            SELECT albums.*, songs.id AS song_id, songs.title AS song_title, songs.performer AS song_performer
            FROM albums INNER JOIN songs ON albums.id = songs.album_id
            WHERE albums.id = $1
            `,
      values: [id]
    }

    const firstResult = await this._pool.query(firstQuery)

    if (!firstResult.rowCount) {
      const secQuery = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id]
      }

      const secResult = await this._pool.query(secQuery)

      if (!secResult.rows.length) {
        throw new NotFoundError('Album tidak ditemukan')
      }

      return secResult.rows.map(mapAlbumToModel)[0]
    }

    const { id: albumId, name, year } = firstResult.rows[0]

    const songs = firstResult.rows.map((row) => ({
      id: row.song_id,
      title: row.song_title,
      performer: row.song_performer
    }))

    const coverUrl = firstResult.rows.map((row) => ({
      coverUrl: row.cover_url
    }))[0]

    return {
      id: albumId,
      name,
      year,
      coverUrl,
      songs
    }

    // const query = {
    //     text: 'SELECT * FROM albums WHERE id = $1',
    //     values: [id],
    // };

    // const result = await this._pool.query(query);

    // if (!result.rowCount) {
    //     throw new NotFoundError('Album tidak ditemukan');
    // }

    // return result.rows[0];
  }

  async editAlbumById (id, { name, year, coverUrl }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, cover_url = $3 WHERE id = $4 RETURNING id',
      values: [name, year, coverUrl, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui albums, id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan')
    }
  }
}

module.exports = { AlbumsServices }
