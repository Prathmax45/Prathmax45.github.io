export const meshEdges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[0,7],[2,7],[4,7],[6,7],[1,6],[3,5]];
export function meshWorld() {
  const points=[[-.72,-.4],[-.15,-.74],[.53,-.58],[.8,.05],[.45,.65],[-.25,.72],[-.78,.25],[0,0]];
  return points.map(([x,y],id)=>({id,x,y,homeX:x,homeY:y,vx:0,vy:0,offline:false}));
}
// Distance-weighted Dijkstra over live relays. An empty route is a real disconnection.
export function meshRoute(nodes,source,target) {
  if(!Number.isInteger(source)||!Number.isInteger(target)||!nodes[source]||!nodes[target]||nodes[source].offline||nodes[target].offline)return [];
  const cost=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),seen=new Set();cost[source]=0;
  for(let step=0;step<nodes.length;step++){
    let u=-1;for(let i=0;i<nodes.length;i++)if(!seen.has(i)&&!nodes[i].offline&&(u<0||cost[i]<cost[u]))u=i;
    if(u<0||!Number.isFinite(cost[u]))break;if(u===target)break;seen.add(u);
    for(const [a,b] of meshEdges){const v=a===u?b:b===u?a:-1;if(v<0||nodes[v].offline)continue;
      const d=cost[u]+Math.hypot(nodes[u].x-nodes[v].x,nodes[u].y-nodes[v].y);
      if(d<cost[v]){cost[v]=d;prev[v]=u;}
    }
  }
  if(!Number.isFinite(cost[target]))return [];
  const path=[];for(let v=target;v>=0;v=prev[v])path.unshift(v);return path;
}
export function meshStep(nodes,dt=.008,held=-1) {
  if(!(dt>0&&dt<=.02))throw new RangeError('Mesh step outside stable range');
  const forces=nodes.map(n=>[(n.homeX-n.x)*1.8,(n.homeY-n.y)*1.8]);
  for(const [a,b] of meshEdges){const dx=nodes[b].x-nodes[a].x,dy=nodes[b].y-nodes[a].y,d=Math.max(.01,Math.hypot(dx,dy)),rest=Math.hypot(nodes[a].homeX-nodes[b].homeX,nodes[a].homeY-nodes[b].homeY),f=(d-rest)*8;
    forces[a][0]+=dx/d*f;forces[a][1]+=dy/d*f;forces[b][0]-=dx/d*f;forces[b][1]-=dy/d*f;}
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const dx=nodes[j].x-nodes[i].x,dy=nodes[j].y-nodes[i].y,d=Math.max(.04,Math.hypot(dx,dy)),f=.008/(d*d);
    forces[i][0]-=dx/d*f;forces[i][1]-=dy/d*f;forces[j][0]+=dx/d*f;forces[j][1]+=dy/d*f;
  }
  nodes.forEach((n,i)=>{if(i===held){n.vx=0;n.vy=0;return;}n.vx=(n.vx+forces[i][0]*dt)*Math.exp(-3*dt);n.vy=(n.vy+forces[i][1]*dt)*Math.exp(-3*dt);n.x=Math.max(-.94,Math.min(.94,n.x+n.vx*dt));n.y=Math.max(-.86,Math.min(.86,n.y+n.vy*dt));});
}
export function byteOperation(value,operation) {
  if(!Number.isInteger(value)||value<0||value>255)throw new RangeError('Expected an unsigned byte');
  let next,carry=0;
  if(operation==='add'){next=(value+1)&255;carry=value===255?1:0;}
  else if(operation==='left'){next=(value<<1)&255;carry=(value>>7)&1;}
  else if(operation==='right'){next=value>>>1;carry=value&1;}
  else if(operation==='not')next=value^255;
  else throw new RangeError('Unknown byte operation');
  return {value:next,carry,changed:value^next};
}
