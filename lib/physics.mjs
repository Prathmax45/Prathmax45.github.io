// Dimensionless educational models; see docs/PHYSICS-EXPEDITION.md for assumptions.
const softening = 0.025;
export function gravityWorld() {
  // Equal-mass figure-eight initial conditions, scaled to this stage.
  return { time: 0, bodies: [
    { x: -.97000436, y: .24308753, vx: .466203685, vy: .43236573, mass: 1, trail: /** @type {number[][]} */ ([]) },
    { x: .97000436, y: -.24308753, vx: .466203685, vy: .43236573, mass: 1, trail: /** @type {number[][]} */ ([]) },
    { x: 0, y: 0, vx: -.93240737, vy: -.86473146, mass: 1, trail: /** @type {number[][]} */ ([]) }
  ] };
}
function acceleration(bodies) {
  const a = bodies.map(() => [0, 0]);
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const dx = bodies[j].x - bodies[i].x, dy = bodies[j].y - bodies[i].y;
    const f = Math.pow(dx * dx + dy * dy + softening * softening, -1.5);
    a[i][0] += dx * f * bodies[j].mass; a[i][1] += dy * f * bodies[j].mass;
    a[j][0] -= dx * f * bodies[i].mass; a[j][1] -= dy * f * bodies[i].mass;
  }
  return a;
}
export function gravityStep(world, dt = .004) {
  if (!(dt > 0 && dt <= .01)) throw new RangeError('Gravity step must be in (0, .01]');
  const before = acceleration(world.bodies);
  world.bodies.forEach((b, i) => { b.x += b.vx * dt + .5 * before[i][0] * dt * dt; b.y += b.vy * dt + .5 * before[i][1] * dt * dt; });
  const after = acceleration(world.bodies);
  world.bodies.forEach((b, i) => { b.vx += .5 * (before[i][0] + after[i][0]) * dt; b.vy += .5 * (before[i][1] + after[i][1]) * dt; });
  world.time += dt;
}
export function launchBody(world, x, y, vx, vy) {
  if (![x,y,vx,vy].every(Number.isFinite) || Math.hypot(x,y) > 3 || world.bodies.length >= 12) return false;
  const speed = Math.hypot(vx,vy), factor = speed > 3 ? 3 / speed : 1;
  world.bodies.push({x,y,vx:vx*factor,vy:vy*factor,mass:.12,trail:[]}); return true;
}
export function gravityEnergy(world) {
  let e = 0;
  world.bodies.forEach((b,i) => {
    e += .5 * b.mass * (b.vx*b.vx+b.vy*b.vy);
    for(let j=i+1;j<world.bodies.length;j++){const c=world.bodies[j];e-=b.mass*c.mass/Math.sqrt((b.x-c.x)**2+(b.y-c.y)**2+softening**2);}
  }); return e;
}

export function waveWorld(width = 220, height = 128) {
  if (!Number.isInteger(width)||!Number.isInteger(height)||width<20||height<20||width>300||height>200) throw new RangeError('Wave grid outside supported bounds');
  return {width,height,u:new Float32Array(width*height),prev:new Float32Array(width*height),next:new Float32Array(width*height),time:0,wall:true,source:true};
}
export function waveWall(world,x,y) {
  const nx=x/world.width,ny=y/world.height;
  return world.wall && Math.abs(nx-.5)<.009 && Math.abs(ny-.35)>.036 && Math.abs(ny-.65)>.036;
}
export function waveImpulse(world,x,y,strength=2) {
  if(![x,y,strength].every(Number.isFinite))return;
  const cx=Math.round(Math.max(.03,Math.min(.97,x))*world.width),cy=Math.round(Math.max(.03,Math.min(.97,y))*world.height);
  for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){
    const px=cx+i,py=cy+j;
    if(px>0&&py>0&&px<world.width-1&&py<world.height-1&&!waveWall(world,px,py))world.u[py*world.width+px]+=Math.max(-3,Math.min(3,strength))*Math.exp(-(i*i+j*j)/5);
  }
}
export function waveStep(world) {
  const {width:w,height:h,u,prev,next}=world;
  // c²dt²/dx²=.22; in 2D the sum .44 is below the CFL bound of 1.
  next.fill(0);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    if(waveWall(world,x,y))continue;
    const k=y*w+x,edge=Math.min(x,y,w-1-x,h-1-y),damping=edge<12?.93+edge*.005:.998;
    next[k]=(2*u[k]-prev[k]+.22*(u[k-1]+u[k+1]+u[k-w]+u[k+w]-4*u[k]))*damping;
  }
  if(world.source)next[Math.floor(h*.5)*w+Math.floor(w*.18)]=Math.sin(world.time*.19)*1.8;
  world.prev=u;world.u=next;world.next=prev;world.time++;
}

export function pendulumWorld(angle = 2.15, epsilon = .001) {
  return {time:0,states:[[angle,1.35,0,0],[angle+epsilon,1.35,0,0]],trails:/** @type {number[][][]} */ ([[],[]])};
}
function pendulumDerivative(s) {
  const [a,b,av,bv]=s,d=a-b,c=Math.cos(d),sn=Math.sin(d),den=2-c*c,g=9.81;
  return [av,bv,(-g*(2*Math.sin(a)-Math.sin(b)*c)-sn*(bv*bv+av*av*c))/den,
    (2*sn*(av*av+g*Math.cos(a))+bv*bv*sn*c)/den];
}
export function pendulumStep(world,dt=.006) {
  if(!(dt>0&&dt<=.01))throw new RangeError('Pendulum step must be in (0, .01]');
  world.states=world.states.map(s=>{
    const a=pendulumDerivative(s),b=pendulumDerivative(s.map((v,i)=>v+a[i]*dt/2)),c=pendulumDerivative(s.map((v,i)=>v+b[i]*dt/2)),d=pendulumDerivative(s.map((v,i)=>v+c[i]*dt));
    return s.map((v,i)=>v+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
  });world.time+=dt;
}
export function pendulumPoints(s) { return [Math.sin(s[0]),Math.cos(s[0]),Math.sin(s[0])+Math.sin(s[1]),Math.cos(s[0])+Math.cos(s[1])]; }
export function pendulumEnergy(s) { return s[2]**2+.5*s[3]**2+s[2]*s[3]*Math.cos(s[0]-s[1])-9.81*(2*Math.cos(s[0])+Math.cos(s[1])); }
