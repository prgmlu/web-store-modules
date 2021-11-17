import LastRoomCacheManager from './LastRoomCacheManager';

export let ThreeCacheManager = null;

export const THREE_CACHE_MANAGER_OPTION = Object.freeze({
    LAST_ROOM: 'LAST_ROOM',
    CUSTOM: 'CUSTOM',
});

export const initThreeCacheManager = (managerOption, customManager=null) => {
    if (ThreeCacheManager !== null) {
        throw new Error(`Three cache manager already initialized to ${ThreeCacheManager.constructor.name}`);
    }

    switch (managerOption) {
        case THREE_CACHE_MANAGER_OPTION.LAST_ROOM:
            ThreeCacheManager = new LastRoomCacheManager();
            break;
        case THREE_CACHE_MANAGER_OPTION.CUSTOM:
            ThreeCacheManager = customManager;
            break;
        default:
            break;
    }
}
