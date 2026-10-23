export function respond(raw) {
  const command=raw.trim().toLowerCase().replace(/\s+/g,' ');
  const replies={help:'help / whoami / projects / experience / contact / run cpu / run orbit / clear',whoami:'Prathmesh Kanure. Software / frontend engineering at Siemens Technology and Services. Exploring systems, computational physics, and interactive software.',projects:'8-bit virtual computer — C\nOrbital Mechanics Engine — C++ / velocity Verlet\nDPDL — Python / SymPy / PyTorch\nMALLOC-job — FastAPI / spaCy',experience:'Siemens Technology and Services — software / frontend engineering.\nB.E. Computer Engineering — Dr. D. Y. Patil Institute of Technology.',contact:'prathmeshkanure@gmail.com\n9309075225\nhttps://github.com/Prathmax45\nhttps://www.linkedin.com/in/prathmesh-kanure/'};
  if(command==='clear') return {clear:true,text:''};
  if(command==='run cpu') return {text:'Opening the browser instruction model. This is separate from the C project.',target:'cpu-notebook'};
  if(command==='run orbit' || command==='run orbit-sim') return {text:'Opening the orbital concept visualization. See the project repository for the physics engine.',target:'hero-core'};
  return {text:replies[command]||`Unknown command: ${raw}. Type help for available commands.`};
}
