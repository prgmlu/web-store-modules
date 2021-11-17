/*
1k
2x2 tiles of 512x512 images
 _ _
|_|_|
|_|_|
*/
uniform sampler2D textures[4];
varying vec2 vUV;

bool isInRange(float a, float low, float high) {
  return a > low && a <= high;
}

bool isVUVInRange(float lowX, float highX, float lowY, float HighY) {
  return isInRange(vUV.x, lowX, highX) && isInRange(vUV.y, lowY, HighY);
}

void main() {
    if (isVUVInRange(0.0, 0.5, 0.0, 0.5))
    {
        gl_FragColor = texture2D(textures[0], vUV * 2.0);
    }
    else if (isVUVInRange(0.5, 1.0, 0.0, 0.5))
    {
        gl_FragColor = texture2D(textures[1], vec2((vUV.x - 0.5) * 2.0, vUV.y * 2.0));
    }
    else if (isVUVInRange(0.0, 0.5, 0.5, 1.0))
    {
        gl_FragColor = texture2D(textures[2], vec2(vUV.x * 2.0, (vUV.y - 0.5) * 2.0));
    }
    else
    {
        gl_FragColor = texture2D(textures[3], (vUV - 0.5) * 2.0);
    }
}