precision lowp float;

uniform float alpha;
uniform sampler2D texture;

uniform lowp vec3 colorVariance;
varying vec2 vUV;

const vec2 centerPos = vec2(0.5, 0.5);
const float radiusFactor = 3.0;

void main() {
    float distanceToCenter = distance(vUV, centerPos);
    float alphaFactor = mix(alpha, 0.0, distanceToCenter * radiusFactor);
    vec4 color = texture2D(texture, vec2(vUV.x, vUV.y));
    gl_FragColor = vec4(color.xyz, color.a * alphaFactor) * vec4(colorVariance.rgb, 1.0);
}
