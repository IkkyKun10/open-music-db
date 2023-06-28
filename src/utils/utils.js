const first_test = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: (request, h) => handler.postAlbumHandler(request, h),
    },
    {
        method: 'GET',
        path: '/albums',
        handler: () => handler.getAlbumsHandler(),
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: (request, h) => handler.getAlbumByIdHandler(request, h),
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: (request, h) => handler.putAlbumByIdHandler(request, h),
    },
    {
        method: 'DELETE',
        path: 'albums/{id}',
        handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
    },
    
]

const sec_test = (handler) => [
    {
        method: 'POST',
        path: '/songs',
        handler: (request, h) => handler.postSongHandler(request, h),
    },
    {
        method: 'GET',
        path: '/songs',
        handler: () => handler.getSongsHandler(),
    },
    {
        method: 'GET',
        path: '/songs/{id}',
        handler: (request, h) => handler.getSongByIdHandler(request, h),
    },
    {
        method: 'PUT',
        path: '/songs/{id}',
        handler: (request, h) => handler.putSongByIdHandler(request, h),
    },
    {
        method: 'DELETE',
        path: '/songs/{id}',
        handler: (request, h) => handler.deleteSongByIdHandler(request, h),
    },
    
]