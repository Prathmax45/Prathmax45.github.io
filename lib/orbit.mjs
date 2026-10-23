// Educational planar central-gravity model. Fixed star; no planet-planet forces.
export const MU = 0.3;
export function makePlanet(x,y,id,gravity=1,vx,vy){
 const radius=Math.hypot(x,y);if(!Number.isFinite(radius)||radius<.12||radius>3)throw new RangeError('Place a planet between 0.12 and 3 scene units from the star');
 const speed=Math.sqrt(MU*gravity/radius);
 const trail=/** @type {number[][]} */([]);
 return {id,x,y,vx:vx??-y/radius*speed,vy:vy??x/radius*speed,trail,initialRadius:radius};
}
export function createWorld(){return {planets:Array.from({length:4},(_,i)=>{const r=.32+i*.18,a=i*1.7;return makePlanet(Math.cos(a)*r,Math.sin(a)*r,i);}),nextId:4,elapsed:0,absorbed:0,escaped:0};}
export function energy(planet,gravity=1){return (planet.vx**2+planet.vy**2)/2-MU*gravity/Math.hypot(planet.x,planet.y);}
export function stepWorld(world,dt,gravity=1){
 if(!Number.isFinite(dt)||dt<=0||dt>.05||!Number.isFinite(gravity)||gravity<.1||gravity>3)throw new RangeError('Invalid simulation step');
 const accel=(x,y)=>{const r=Math.max(Math.hypot(x,y),.05),f=-MU*gravity/(r*r*r);return [x*f,y*f];};
 for(const p of world.planets){const [ax,ay]=accel(p.x,p.y);p.x+=p.vx*dt+.5*ax*dt*dt;p.y+=p.vy*dt+.5*ay*dt*dt;const [bx,by]=accel(p.x,p.y);p.vx+=(ax+bx)*.5*dt;p.vy+=(ay+by)*.5*dt;p.trail.push([p.x,p.y]);if(p.trail.length>110)p.trail.shift();}
 world.planets=world.planets.filter(p=>{const r=Math.hypot(p.x,p.y);if(r<.075){world.absorbed++;return false;}if(r>4){world.escaped++;return false;}return true;});world.elapsed+=dt;
}
