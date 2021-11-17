/*
4k
1x8 tiles of 512x512 images
 _ _ _ _ _ _ _ _
|_|_|_|_|_|_|_|_|
*/
uniform sampler2D textures[8];
varying vec2 vUV;

bool isInRange(float a, float low, float high) {
  return a > low && a <= high;
}

void main() {
    if (isInRange(vUV.x, 0.0, 0.125))
    {
        gl_FragColor = texture2D(textures[0], vec2(vUV.x * 8.0, vUV.y));
    }
    else if (isInRange(vUV.x, 0.125, 0.25))
    {
        gl_FragColor = texture2D(textures[1], vec2((vUV.x - 0.125) * 8.0, vUV.y));
    }
    else if (isInRange(vUV.x, 0.25, 0.375))
    {
        gl_FragColor = texture2D(textures[2], vec2((vUV.x - 0.25) * 8.0, vUV.y));
    }
    else if (isInRange(vUV.x, 0.375, 0.5))
    {
        gl_FragColor = texture2D(textures[3], vec2((vUV.x - 0.375) * 8.0, vUV.y));
    }
    else if (isInRange(vUV.x, 0.5, 0.625))
    {
        gl_FragColor = texture2D(textures[4], vec2((vUV.x - 0.5) * 8.0, vUV.y));
    }
    else if (isInRange(vUV.x, 0.625, 0.75))
    {
        gl_FragColor = texture2D(textures[5], vec2((vUV.x - 0.625) * 8.0, vUV.y));
    }
    else if (isInRange(vUV.x, 0.75, 0.875))
    {
        gl_FragColor = texture2D(textures[6], vec2((vUV.x - 0.75) * 8.0, vUV.y));
    }
    else
    {
        gl_FragColor = texture2D(textures[7], vec2((vUV.x - 0.875) * 8.0, vUV.y));
    }
}