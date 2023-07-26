/* eslint-disable camelcase */

const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id

}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id
})

const mapAlbumToModel = ({
  id: _id,
  name,
  year,
  cover_url
}) => ({
  id: _id,
  name,
  year,
  coverUrl: cover_url,
  songs: []
})

module.exports = { mapSongDBToModel, mapAlbumToModel }
