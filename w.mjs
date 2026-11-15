import { chromium, devices } from '@playwright/test';
const b = await chromium.launch({ executablePath:'/tmp/chromium', args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1280,height:720} });
await p.goto('http://localhost:4173/the-fish-tank/');
await p.waitForSelector('.loading-screen',{state:'detached',timeout:45000});
console.log('webgl2:', await p.evaluate(()=>{
  const c=document.createElement('canvas');
  const gl=c.getContext('webgl2');
  return { ctx: !!gl, float: gl ? !!gl.getExtension('EXT_color_buffer_float') : false };
}));
await b.close();
