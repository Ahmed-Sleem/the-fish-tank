/** Wave/raised-cosine impulse adapted from jeantimex/threejs-water f35a700a,
 * MIT (c) 2011 Evan Wallace, (c) 2026 Yong Su. RG = height/velocity.
 * Screenjoy caustic function adapted from @screenjoy/fishtank 0.1.0,
 * MIT Copyright 2026 Steven Partridge. Complete licenses in public/licenses.
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
export const tankFragment = `
in vec2 vTextureCoord;
in vec2 vUv;
out vec4 finalColor;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec4 uLook;
uniform vec4 uStyle;
uniform vec3 uDeep;
uniform vec3 uFoam;
float caustic(vec2 p,float t) {
 p+=vec2(sin(p.y*1.7+t*0.31),cos(p.x*1.4-t*0.23))*0.24;
 float a=abs(sin(p.x*3.4+p.y*2.7+t*0.4));
 float b=abs(sin(p.x*2.9-p.y*3.1-t*0.33));
 return pow(1.-min(a,b),12.);
}
void main() {
 vec2 uv=vUv;
 float h=texture(uState,uv).r;
 vec2 slope=vec2(texture(uState,uv+vec2(uTexel.x,0.)).r-texture(uState,uv-vec2(uTexel.x,0.)).r,
 texture(uState,uv+vec2(0.,uTexel.y)).r-texture(uState,uv-vec2(0.,uTexel.y)).r);
 vec2 refracted=clamp(uv+slope*uLook.w*40.,0.,1.);
 float depth=smoothstep(0.,1.,refracted.y);
 vec3 water=mix(uDeep*1.1,uDeep*0.17,depth);
 float c=caustic(refracted*uStyle.y,uLook.x*uStyle.z);
 float floorLight=smoothstep(0.55,0.98,refracted.y);
 water+=uFoam*c*uLook.y*uStyle.x*(0.15+floorLight);
 float ray=pow(max(0.,sin(refracted.x*28.+refracted.y*4.+sin(uLook.x*0.13)*0.4)),18.);
 water+=uFoam*ray*uLook.z*(1.-depth)*0.09;
 float edge=smoothstep(0.,0.025,uv.x)*smoothstep(0.,0.025,1.-uv.x);
 water*=mix(0.5,1.,edge);
 float floorLine=1.-smoothstep(0.,0.003,abs(refracted.y-0.94));
 water+=uFoam*(floorLine*0.13+abs(h)*1.3+length(slope)*2.5);
 finalColor=vec4(water,1.);
}`;
export const refractFragment = `
in vec2 vTextureCoord;
in vec2 vUv;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uStrength;
void main(){vec2 uv=vUv;vec2 d=vec2(texture(uState,uv+vec2(uTexel.x,0.)).r-texture(uState,uv-vec2(uTexel.x,0.)).r,texture(uState,uv+vec2(0.,uTexel.y)).r-texture(uState,uv-vec2(0.,uTexel.y)).r);finalColor=texture(uTexture,clamp(vTextureCoord+d*uStrength,0.,1.));}
`;
