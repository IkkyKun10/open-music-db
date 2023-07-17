/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNull: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    })

    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', {
        foreignKeys: {
            columns: 'owner',
            references: 'users(id)',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    })
};

exports.down = pgm => {
    pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id')
    pgm.dropTable('playlists')
};
