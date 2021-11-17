/*
2k (4x4 total broke into 2 meshes) / 4k
2x4 tiles of 512x512 images
 _ _ _ _
|_|_|_|_|
|_|_|_|_|
*/
uniform sampler2D textures[8];
varying vec2 vUV;

bool isInRange(float a, float low, float high) {
    return a > low && a <= high;
}

bool isVUVInRange(float lowX, float highX, float lowY, float HighY) {
    return isInRange(vUV.x, lowX, highX) && isInRange(vUV.y, lowY, HighY);
}

void main() {
    vec4 texColor = vec4(0.0, 0.0, 0.0, 0.0);

    if (isVUVInRange(0.0, 0.25, 0.0, 0.5))
    {
        texColor = texture2D(textures[0], vec2(vUV.x * 4.0, vUV.y * 2.0));
    }
    else if (isVUVInRange(0.25, 0.5, 0.0, 0.5))
    {
        texColor = texture2D(textures[1], vec2((vUV.x - 0.25) * 4.0, vUV.y * 2.0));
    }
    else if (isVUVInRange(0.5, 0.75, 0.0, 0.5))
    {
        texColor = texture2D(textures[2], vec2((vUV.x - 0.5) * 4.0, vUV.y * 2.0));
    }
    else if (isVUVInRange(0.75, 1.0, 0.0, 0.5))
    {
        texColor = texture2D(textures[3], vec2((vUV.x - 0.75) * 4.0, vUV.y * 2.0));
    }
    else if (isVUVInRange(0.0, 0.25, 0.5, 1.0))
    {
        texColor = texture2D(textures[4], vec2(vUV.x * 4.0, (vUV.y - 0.5) * 2.0));
    }
    else if (isVUVInRange(0.25, 0.5, 0.5, 1.0))
    {
        texColor = texture2D(textures[5], vec2((vUV.x - 0.25) * 4.0, (vUV.y - 0.5) * 2.0));
    }
    else if (isVUVInRange(0.5, 0.75, 0.5, 1.0))
    {
        texColor = texture2D(textures[6], vec2((vUV.x - 0.5) * 4.0, (vUV.y - 0.5) * 2.0));
    }
    else
    {
        texColor = texture2D(textures[7], vec2((vUV.x - 0.75) * 4.0, (vUV.y - 0.5) * 2.0));
    }

    gl_FragColor = mapTexelToLinear(texColor);
    // gl_FragColor = linearToOutputTexel(gl_FragColor);
}