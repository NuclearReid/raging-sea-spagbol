uniform vec3 uDepthColor; // Remember, it's a color so use 'vec3'
uniform vec3 uSurfaceColor;
uniform float uColorOffSet;
uniform float uColorMultiplier;

varying float vElevation; // taking vElevation from vertex.glsl



void main()
{
    float mixStrength = (vElevation + uColorOffSet) * uColorMultiplier;
    
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    
        
    
    gl_FragColor = vec4(color, 1.0);
    
    
    // #include <colorspace_fragment> // Not sure when/where to add this
}