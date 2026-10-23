// Dimensionless educational models: magnetic-only Lorentz motion and a free rigid body.
export function magneticWorld() {
 return {time:0,field:{x:0,y:0,strength:3.8,radius:.7},particles:Array.from({length:72},(_,i)=>({x:-2,y:(i%16-7.5)*.075,vx:1.3+(i%5)*.045,vy:0,charge:[1,-1,0][i%3],mass:.85+(i%4)*.15,age:-i*.025,trail:/** @type {number[][]} */([])})),sample:0};
}
export function borisStep(p,dt,field) {
 if(!(dt>0&&dt<=.02)||![p.x,p.y,p.vx,p.vy,p.charge,p.mass,field.x,field.y,field.strength,field.radius].every(Number.isFinite)||p.mass<=0||field.radius<=0)throw new RangeError('Invalid magnetic model state');
 const hx=p.x+p.vx*dt/2,hy=p.y+p.vy*dt/2;
 const b=field.strength*Math.exp(-((hx-field.x)**2+(hy-field.y)**2)/(2*field.radius**2));
 const t=p.charge/p.mass*b*dt/2,s=2*t/(1+t*t),px=p.vx+p.vy*t,py=p.vy-p.vx*t;
 p.vx+=py*s;p.vy-=px*s;p.x=hx+p.vx*dt/2;p.y=hy+p.vy*dt/2;
}
export function magneticStep(world,dt=.008) {
 if(!(dt>0&&dt<=.02))throw new RangeError('Magnetic step outside supported range');
 world.time+=dt;world.sample++;
 world.particles.forEach((p,i)=>{
  p.age+=dt;if(p.age<0)return;borisStep(p,dt,world.field);
  if(Math.abs(p.x)>2.45||Math.abs(p.y)>1.45||p.age>8){p.x=-2;p.y=(i%16-7.5)*.075;p.vx=1.3+(i%5)*.045;p.vy=0;p.age=0;p.trail=[];}
  if(world.sample%3===0){p.trail.push([p.x,p.y]);if(p.trail.length>110)p.trail.shift();}
 });
}
export const inertia=[(1.3**2+.36**2)/12,(2.8**2+.36**2)/12,(2.8**2+1.3**2)/12];
export function rotateVector(q,v) {
 const [x,y,z,w]=q,[a,b,c]=v,tx=2*(y*c-z*b),ty=2*(z*a-x*c),tz=2*(x*b-y*a);
 return [a+w*tx+y*tz-z*ty,b+w*ty+z*tx-x*tz,c+w*tz+x*ty-y*tx];
}
export function rigidWorld(axis=1,speed=4.8) {
 if(!Number.isInteger(axis)||axis<0||axis>2||!Number.isFinite(speed)||speed<=0||speed>8)throw new RangeError('Invalid rigid-body release');
 const omega=[.035,.025,.04];omega[axis]=speed;
 return {state:[...omega,0,0,0,1],axis,time:0,flips:0,sign:1,trail:/** @type {number[][]} */([])};
}
function rigidDerivative(s) {
 const [a,b,c,x,y,z,w]=s,[i,j,k]=inertia;
 return [(j-k)/i*b*c,(k-i)/j*c*a,(i-j)/k*a*b,.5*(w*a+y*c-z*b),.5*(w*b+z*a-x*c),.5*(w*c+x*b-y*a),-.5*(x*a+y*b+z*c)];
}
export function rigidStep(world,dt=.004) {
 if(!(dt>0&&dt<=.01))throw new RangeError('Rigid-body step outside stable range');
 const s=world.state,a=rigidDerivative(s),b=rigidDerivative(s.map((v,i)=>v+a[i]*dt/2)),c=rigidDerivative(s.map((v,i)=>v+b[i]*dt/2)),d=rigidDerivative(s.map((v,i)=>v+c[i]*dt));
 world.state=s.map((v,i)=>v+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);
 const norm=Math.hypot(...world.state.slice(3));for(let i=3;i<7;i++)world.state[i]/=norm;
 world.time+=dt;
 const axis=[0,0,0];axis[world.axis]=1;
 const direction=rotateVector(world.state.slice(3),axis)[world.axis];
 if(direction*world.sign<-.65){world.flips++;world.sign*=-1;}
}
export function rigidEnergy(s) {return .5*inertia.reduce((sum,i,k)=>sum+i*s[k]**2,0);}
export function rigidMomentum(s) {return rotateVector(s.slice(3),inertia.map((i,k)=>i*s[k]));}
