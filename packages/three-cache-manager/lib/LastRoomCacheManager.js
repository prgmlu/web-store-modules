import * as THREE from 'three';
import BaseCacheManager from './BaseCacheManager';

export default class LastRoomCacheManager extends BaseCacheManager {
    constructor() {
        super();
        this.onNewRoomLoaded = this.onNewRoomLoaded.bind(this);
        this.add = this.add.bind(this);
        this.get = this.get.bind(this);
        this.remove = this.remove.bind(this);

        THREE.Cache.enabled = true;
        this.roomIdKeysMap = {};
        this.currentRoomId = null;
    }

    onNewRoomLoaded(roomId) {
        // only the new room and last room are considered NOT expired
        const expiredRoomIds = Object.keys(this.roomIdKeysMap).filter( id => !([this.currentRoomId, roomId].includes(id)) );
        expiredRoomIds.forEach(id => {
            // get all file keys for the expired room
            const keys = this.roomIdKeysMap[id];
            // remove all files from three.js cache
            keys.forEach(key => THREE.Cache.remove(key));
            // delete expired room from this.roomIdKeysMap
            delete this.roomIdKeysMap[id];
        });
        this.currentRoomId = roomId;
    }

    add(key, file, roomId) {
        if (!this.roomIdKeysMap[roomId]) {
            this.roomIdKeysMap[roomId] = [];
        }
        this.roomIdKeysMap[roomId].push(key);

        THREE.Cache.add(key, file);
    }

    get(key) {
        return THREE.Cache.get(key);
    }

    remove(key) {
        THREE.Cache.remove(key)
    }
}
