const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id //eslint-disable-line

}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id //eslint-disable-line
})

const mapAlbumToModel = ({
  id: _id,
  name,
  year
}) => ({
  id: _id,
  name,
  year,
  songs: []
})

module.exports = { mapSongDBToModel, mapAlbumToModel }
