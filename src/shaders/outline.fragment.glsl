//#extension GL_OES_standard_derivatives : enable
    
varying vec2 vUv;
uniform float thickness;
uniform float lineValue;
uniform float baseValue;

float edgeFactor(vec2 p){
    vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p) / thickness;
    return min(grid.x, grid.y);
}

void main() {
        
    float a = edgeFactor(vUv);
    
    vec3 c = mix(vec3(lineValue), vec3(baseValue), a);
    
    gl_FragColor = vec4(c, 1.0);
}