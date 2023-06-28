const mapSongDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    album_id,

}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId: album_id,
})


const mapAlbumToModel = ({
    id: _id,
    name,
    year,
}) => ({
    id: _id,
    name,
    year,
    songs: [],
})

module.exports = { mapSongDBToModel, mapAlbumToModel }