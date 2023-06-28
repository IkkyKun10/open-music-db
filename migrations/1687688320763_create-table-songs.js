/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        title: {
            type: 'TEXT',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
        performer: {
            type: 'TEXT',
            notNull: true,
        },
        genre: {
            type: 'TEXT',
            notNull: true,
        },
        duration: {
            type: 'INTEGER',
            notNull: true,
        },
        album_id: {
            type: 'VARCHAR(50)',
        },
    })

    pgm.addConstraint('songs', 'fk_songs_album_id_albums_id', {
        foreignKeys: {
            columns: 'album_id',
            references: 'albums(id)',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        }
    })
};

exports.down = (pgm) => {
    pgm.dropConstraint('songs', 'fk_songs_album_id_albums_id')
    pgm.dropTable('songs')
};
