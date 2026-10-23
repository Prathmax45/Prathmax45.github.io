// Softened, dimensionless Newtonian gravity; assumptions are displayed beside the experiment.
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
