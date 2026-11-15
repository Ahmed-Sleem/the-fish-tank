/** Wave/raised-cosine impulse adapted from jeantimex/threejs-water f35a700a,
 * MIT (c) 2011 Evan Wallace, (c) 2026 Yong Su. RG = height/velocity.
 * Caustic/god-ray/refraction maths adapted from the owner's reference scene
 * (sanctuary_tank_reference.html) and @screenjoy/fishtank 0.1.0, MIT.
 * Complete licenses in public/licenses; provenance in docs/REUSE_LEDGER.md.
 *
 * Every colour, strength and mood value arrives as a uniform read from theme.css, so this file
 * holds no palette of its own and the day/night cycle changes the tank by changing tokens.
 */
export const waveFragment = `
in vec2 vTextureCoord;
in vec2 vUv;
out vec4 finalColor;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec4 uImpulse;
uniform vec4 uPhysics;
uniform float uAspect;
void main() {
 vec2 uv=vUv;
 vec2 info=texture(uState,uv).rg;
 float lap=texture(uState,clamp(uv+vec2(uTexel.x,0.),vec2(0.),vec2(1.))).r
 +texture(uState,clamp(uv-vec2(uTexel.x,0.),vec2(0.),vec2(1.))).r
 +texture(uState,clamp(uv+vec2(0.,uTexel.y),vec2(0.),vec2(1.))).r
 +texture(uState,clamp(uv-vec2(0.,uTexel.y),vec2(0.),vec2(1.))).r-4.*info.r;
 info.g=clamp((info.g+lap*uPhysics.y)*uPhysics.x,-uPhysics.w,uPhysics.w);
 float drop=max(0.,1.-length((uv-uImpulse.xy)*vec2(uAspect,1.))/uImpulse.w);
 info.r=clamp(info.r+info.g+(0.5-0.5*cos(drop*3.14159265))*uImpulse.z,-uPhysics.z,uPhysics.z);
 finalColor=vec4(info,0.,1.);
}`;

/** Tank shading: depth gradient, caustics, god rays, surface band and vignette.
 * Adapted from the owner's reference: rays fan from the light source, caustics warp the floor,
 * and the water column darkens with depth. */
/** Water LIGHT pass. Draws only the light the water adds — caustics, god rays, surface glow —
 * with alpha carrying its strength, so the sprite can be composited additively over the
 * pixel-art scene. It deliberately does not sample the art: the art is already on screen and
 * the water must never repaint it opaque.
 */
export const tankFragment = `
in vec2 vTextureCoord;
in vec2 vUv;
out vec4 finalColor;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec4 uLook;      // time, rayStrength, causticStrength, displacement
uniform vec4 uStyle;     // causticScale, causticSpeed, vignette, daylight
uniform vec4 uLightA;    // key, ambient, warmth, azimuth
uniform vec4 uLightB;    // caustics, rays, surface, grade
uniform vec3 uTop;
uniform vec3 uDeep;
uniform vec3 uRay;
uniform vec3 uSurface;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
/* Warped sine interference gives the caustic web seen on the reference's sand. */
float caustic(vec2 p,float t){
 // Two differently-warped wave sets; multiplying them breaks the grid into cells rather than bars.
 vec2 w=vec2(noise(p*0.9+t*0.07),noise(p*0.9+7.3-t*0.06))-0.5;
 vec2 q=p+w*0.55+vec2(sin(p.y*1.7+t*0.31),cos(p.x*1.4-t*0.23))*0.18;
 float a=abs(sin(q.x*2.6+q.y*2.1+t*0.35));
 float b=abs(sin(q.x*2.2-q.y*2.7-t*0.28));
 float c=abs(sin(q.x*1.4+q.y*3.3+t*0.19));
 return pow(1.-min(min(a,b),c),9.);
}
void main(){
 vec2 uv=vUv;
 float h=texture(uState,uv).r;
 vec2 slope=vec2(
  texture(uState,uv+vec2(uTexel.x,0.)).r-texture(uState,uv-vec2(uTexel.x,0.)).r,
  texture(uState,uv+vec2(0.,uTexel.y)).r-texture(uState,uv-vec2(0.,uTexel.y)).r);
 vec2 refracted=clamp(uv+slope*uLook.w*22.,0.,1.);
 float depth=smoothstep(0.0,1.0,refracted.y);
 vec3 tint=mix(uTop,uDeep,depth);

 /*
  * Light is graded, not multiplied by one dial.
  *
  * uLightA = key, ambient, warmth, azimuth. uLightB = caustics, rays, surface, grade.
  * Each channel has its own curve (see config/lighting.ts), so the scene does not brighten and
  * darken as a single sheet: the sun leaves first, the shadows fill in behind it, the light warms
  * through dusk, and the picture gains weight instead of merely losing exposure.
  */
 float key=uLightA.x;
 float ambient=uLightA.y;
 float warmth=uLightA.z;
 float azimuth=uLightA.w;

 // Caustics gather on the floor and the plants above it, and are pure sunlight: they go early.
 float c=caustic(refracted*uStyle.x,uLook.x*uStyle.y);
 float floorMask=smoothstep(0.55,1.0,depth);
 float causticLight=min(c,0.6)*uLook.z*uLightB.x*(0.03+floorMask*0.30);

 // God rays fan from wherever the light is coming from this hour, not from a fixed centre.
 vec2 rel=refracted-vec2(azimuth,-0.05);
 float ang=atan(rel.x,rel.y*0.6);
 float len=length(rel);
 float rays=pow(noise(vec2(ang*13.,uLook.x*0.04))*0.72+noise(vec2(ang*29.+3.,-uLook.x*0.05))*0.28,2.4);
 float fan=smoothstep(0.72,0.02,abs(ang))*smoothstep(1.05,0.10,len);
 float rayLight=rays*fan*uLook.y*uLightB.y*0.34;

 // Surface band: the sky reflecting off the top of the water. The last light to leave.
 float surfBand=smoothstep(0.13,0.0,refracted.y)*(0.10+uLightB.z*0.18);

 // Sun shaft: a soft column that widens as it sinks and warms the middle of the water. It travels
 // with the azimuth, so the column leans across the tank as the day turns instead of standing
 // permanently in the centre.
 float lean=azimuth-0.5;
 float shaftX=abs(refracted.x-0.5-lean+0.06*sin(refracted.y*3.0+uLook.x*0.05));
 float shaftTop=smoothstep(0.46,0.0,shaftX)*smoothstep(0.9,0.06,refracted.y);
 float shaft=smoothstep(0.62,0.0,shaftX)*smoothstep(0.85,0.02,refracted.y);
 float sunShaft=(shaftTop*0.55+shaft*0.45)*key*0.30;

 // Ripple highlights so cursor interaction is visible.
 float rippleGlow=abs(h)*0.22+length(slope)*0.55;

 float amount=causticLight+rayLight+surfBand+sunShaft+rippleGlow;

 /*
  * Colour, in the order light actually behaves.
  *
  * The glow is mixed toward amber by warmth — a *hump* through dusk, not a ramp toward either end.
  * The base is the light reaching the water (key) over the tint, lifted by the ambient fill so the
  * deepest part of the tank keeps a little colour instead of going black. Finally everything is
  * pulled a fraction toward the surface sky, which is what stops the night from reading as a single
  * flat blue and keeps an edge of daylight in it.
  */
 vec3 warmTint=mix(vec3(0.72,0.86,0.95),uRay,warmth);
 vec3 glow=mix(uSurface,warmTint,warmth);

 // The floor is lit least; the column is lit most. Ambient is what fills the difference.
 float column=1.0-depth*0.35;
 vec3 base=tint*(key*column+ambient*0.55);
 vec3 lightColour=base+warmTint*key*0.28*(1.0-warmth*0.35)+glow*(rippleGlow+surfBand+sunShaft)*2.2;
 lightColour=mix(lightColour,uSurface,0.18);

 /*
  * A gentle shoulder, because this pass is *additive*.
  *
  * The render is added to the pixel art, so a value near zero adds nothing and the art shows
  * through, while a high value adds a lot of that colour. The old code hard-clipped the colour by
  * multiplying by the light amount, which is what turned the pass into a binary: bright where the
  * light was strong, nothing where it was weak, and no middle. An exponential shoulder instead
  * compresses the top so highlights roll off rather than flat-lining, and leaves the low end a
  * long, quiet tail — which is exactly the range dusk lives in.
  *
  * The shoulder is scaled by the key, so at night the pass adds almost nothing and the tank keeps
  * its own art rather than being washed over by a blue film.
  */
 float headroom=clamp(lightColour*amount,0.0,4.0);
 vec3 exposed=(1.0-exp(-headroom*0.85))*(0.35+key*0.65);
 finalColor=vec4(mix(vec3(0.0),exposed,clamp(amount*1.25,0.0,1.0)),clamp(amount*1.6,0.0,1.0));
}`;

export const refractFragment = `
in vec2 vTextureCoord;
in vec2 vUv;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uStrength;
void main(){
 vec2 uv=vUv;
 vec2 d=vec2(
  texture(uState,uv+vec2(uTexel.x,0.)).r-texture(uState,uv-vec2(uTexel.x,0.)).r,
  texture(uState,uv+vec2(0.,uTexel.y)).r-texture(uState,uv-vec2(0.,uTexel.y)).r);
 finalColor=texture(uTexture,clamp(vTextureCoord+d*uStrength,0.,1.));
}`;

/** Translucent water body drawn between the pixel art and the light pass.
 * Simple on purpose: absorption toward depth, no sampling, so it cannot hide the scene.
 */
export const waterBodyFragment = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform vec3 uTop;
uniform vec3 uDeep;
uniform float uStrength;
void main(){
 float depth=smoothstep(0.0,1.0,vTextureCoord.y);
 vec3 tint=mix(uTop,uDeep,depth);
 float alpha=uStrength*(0.55+0.45*depth);
 finalColor=vec4(tint,alpha);
}`;
