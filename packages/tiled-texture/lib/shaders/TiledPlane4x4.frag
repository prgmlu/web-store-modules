/*
2k / 4k
4x4 tiles of 512x512 images
 _ _ _ _
|_|_|_|_|
|_|_|_|_|
|_|_|_|_|
|_|_|_|_|
*/
uniform sampler2D textures[16];
varying vec2 vUV;

bool isInRange(float a, float low, float high) {
  return a > low && a <= high;
}

bool isVUVInRange(float lowX, float highX, float lowY, float HighY) {
  return isInRange(vUV.x, lowX, highX) && isInRange(vUV.y, lowY, HighY);
}

void main() {
    if (isVUVInRange(0.0, 0.25, 0.0, 0.25))
    {
        gl_FragColor = texture2D(textures[0], vUV * 4.0);
    }
    else if (isVUVInRange(0.25, 0.5, 0.0, 0.25))
    {
        gl_FragColor = texture2D(textures[1], vec2((vUV.x - 0.25) * 4.0, vUV.y * 4.0));
    }
    else if (isVUVInRange(0.5, 0.75, 0.0, 0.25))
    {
        gl_FragColor = texture2D(textures[2], vec2((vUV.x - 0.5) * 4.0, vUV.y * 4.0));
    }
    else if (isVUVInRange(0.75, 1.0, 0.0, 0.25))
    {
        gl_FragColor = texture2D(textures[3], vec2((vUV.x - 0.75) * 4.0, vUV.y * 4.0));
    }
    else if (isVUVInRange(0.0, 0.25, 0.25, 0.5))
    {
        gl_FragColor = texture2D(textures[4], vec2(vUV.x * 4.0, (vUV.y - 0.25) * 4.0));
    }
    else if (isVUVInRange(0.25, 0.5, 0.25, 0.5))
    {
        gl_FragColor = texture2D(textures[5], vec2((vUV.x - 0.25) * 4.0, (vUV.y - 0.25) * 4.0));
    }
    else if (isVUVInRange(0.5, 0.75, 0.25, 0.5))
    {
        gl_FragColor = texture2D(textures[6], vec2((vUV.x - 0.5) * 4.0, (vUV.y - 0.25) * 4.0));
    }
    else if (isVUVInRange(0.75, 1.0, 0.25, 0.5))
    {
        gl_FragColor = texture2D(textures[7], vec2((vUV.x - 0.75) * 4.0, (vUV.y - 0.25) * 4.0));
    }
    else if (isVUVInRange(0.0, 0.25, 0.5, 0.75))
    {
        gl_FragColor = texture2D(textures[8], vec2(vUV.x * 4.0, (vUV.y - 0.5) * 4.0));
    }
    else if (isVUVInRange(0.25, 0.5, 0.5, 0.75))
    {
        gl_FragColor = texture2D(textures[9], vec2((vUV.x - 0.25) * 4.0, (vUV.y - 0.5) * 4.0));
    }
    else if (isVUVInRange(0.5, 0.75, 0.5, 0.75))
    {
        gl_FragColor = texture2D(textures[10], vec2((vUV.x - 0.5) * 4.0, (vUV.y - 0.5) * 4.0));
    }
    else if (isVUVInRange(0.75, 1.0, 0.5, 0.75))
    {
        gl_FragColor = texture2D(textures[11], vec2((vUV.x - 0.75) * 4.0, (vUV.y - 0.5) * 4.0));
    }
    else if (isVUVInRange(0.0, 0.25, 0.75, 1.0))
    {
        gl_FragColor = texture2D(textures[12], vec2(vUV.x * 4.0, (vUV.y - 0.75) * 4.0));
    }
    else if (isVUVInRange(0.25, 0.5, 0.75, 1.0))
    {
        gl_FragColor = texture2D(textures[13], vec2((vUV.x - 0.25) * 4.0, (vUV.y - 0.75) * 4.0));
    }
    else if (isVUVInRange(0.5, 0.75, 0.75, 1.0))
    {
        gl_FragColor = texture2D(textures[14], vec2((vUV.x - 0.5) * 4.0, (vUV.y - 0.75) * 4.0));
    }
    else
    {
        gl_FragColor = texture2D(textures[15], vec2((vUV.x - 0.75) * 4.0, (vUV.y - 0.75) * 4.0));
    }
}