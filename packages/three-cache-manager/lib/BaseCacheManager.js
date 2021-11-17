export default class BaseCacheManager {
    onNewRoomLoaded(roomId) {
        throw new Error(`onNewRoomLoaded not implemented for ${this.constructor.name}`)
    }

    add(key, file) {
        throw new Error(`add not implemented for ${this.constructor.name}`)
    }

    get(key) {
        throw new Error(`get not implemented for ${this.constructor.name}`)
    }

    remove(key) {
        throw new Error(`remove not implemented for ${this.constructor.name}`)
    }
}
