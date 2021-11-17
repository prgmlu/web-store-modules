import BackgroundLODs from './BackgroundLODs';

/**
 * LOD 0 512:
 *  single 512x512 texture per face
 * LOD 1 1k:
 *  2x2 grid per face made of 512x512 textures
 * LOD 2 2k:
 *  4x4 grid per face made of 512x512 textures
 * LOD 3 4k:
 *  8x8 grid per face made of 512x512 textures
 */
export function isImageArrayMatchingLOD(lod, imageArrayLength) {
    switch (lod) {
        case BackgroundLODs.LOD0:
            return imageArrayLength === 1;
        case BackgroundLODs.LOD1:
            return imageArrayLength === 4;
        case BackgroundLODs.LOD2:
            return imageArrayLength === 16;
        case BackgroundLODs.LOD3:
            return imageArrayLength === 64;
        default:
            return false;
    }
}
