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

const BackgroundLODs = Object.freeze({
    LOD0: 0,
    LOD1: 1,
    LOD2: 2,
    LOD3: 3,
});

export default BackgroundLODs;
