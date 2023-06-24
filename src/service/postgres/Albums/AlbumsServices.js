const { Pool } = require("pg");
const { nanoid } = require('nanoid');
const InvariantError = require("../../../exceptions/InvariantError");
const NotFoundError = require("../../../exceptions/NotFoundError");

class AlbumsServices {
    constructor() {
        this._pool = new Pool()
    }

    async addAlbum({ name, year }) {
        const albumId = nanoid(16)

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING albumId',
            values: [albumId, name, year]
        }

        const result = await this._pool.query(query)
        if (!result.rows[0].albumId) {
            throw new InvariantError('Album gagal ditambahkan')
        }

        return result.rows[0].albumId
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT * FROM albums')
        return result.rows
    }

    async getAlbumById(albumId) {
        const query = {
            text: 'SELECT * FROM albums WHERE albumId = $1',
            values: [albumId],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {

        }

    }

    async editAlbumById(albumId, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE albumId = $3 RETURNING albumId',
            values: [name, year, albumId],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui albums, id tidak ditemukan')
        }
    }

    async deleteAlbumById(albumId) {
        const query = {
            text: 'DELETE * FROM albums WHERE albumId = $1 RETURNING albumId',
            values: [albumId],
        }

        const result = await this._pool.query(query)

        if (!(await result).rows.length) {
            throw new NotFoundError('Album gagal dihapus, id tidak ditemukan')
        }


    }
}

module.exports = { AlbumsServices }