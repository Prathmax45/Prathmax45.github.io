import Link from 'next/link';
import { projects, apps, profile } from '@/content/projects';
import PhysicsStage from './PhysicsStage';
import Terminal from './Terminal';
import CpuDemo from './CpuDemo';
import SatelliteViewer from './SatelliteViewer';
import Activity from './Activity';
import ScrollStory from './ScrollStory';
import FieldNote from './FieldNote';
import UncommonPhysics from './UncommonPhysics';
import WorkConnection from './WorkConnection';

export default function PhysicsExpedition(){
 return <div className="physics-expedition">
  <section id="work" className="gravity-chapter expedition-chapter" aria-labelledby="gravity-title">
   <div className="chapter-entry" id="story-entry"><span className="chapter-coordinate">ENTERING THE UNPREDICTABLE</span><span>YOUR CURIOSITY IS THE INPUT. THE UNIVERSE RESPONDS.</span></div>
   <div className="chapter-heading"><div><p className="chapter-number">01 / GRAVITATIONAL MISCHIEF</p><h2 id="gravity-title" data-reveal>Break the <em>orbit.</em></h2></div><p>Three bodies. One delicate dance.<br/>It only takes one intruder to change everything.<br/><span className="interaction-invitation">That intruder is yours.</span></p></div>
   <PhysicsStage/>
   <p className="model-note">Softened Newtonian N-body model · dimensionless units · max 12 bodies · no collision merging. A separate browser experiment inspired by my Earth–Sun project.</p>
  </section>

  <section id="magnetic-lab" className="beam-chapter expedition-chapter" aria-labelledby="beam-title">
   <div className="beam-layout"><div className="beam-editorial"><p className="chapter-number">02 / INVISIBLE RULES. VISIBLE CONSEQUENCES.</p><h2 id="beam-title" data-reveal>Bend a <br/><em>beam.</em></h2><p>Move an invisible magnetic field through a stream of particles. Positive and negative charges peel apart. Neutral particles keep going.</p><div className="beam-legend"><span><i/> POSITIVE</span><span><i/> NEGATIVE</span><span><i/> NEUTRAL</span></div><p className="beam-question">I turn physical descriptions into software that can be explored.</p><details className="physics-method"><summary>What am I seeing?</summary><p>A 2D charged-particle beam in a localised Gaussian magnetic field. A magnetic force bends a moving charge without changing its speed; neutral particles pass straight through. Moving the field changes future paths. Dimensionless educational model; no electric field or particle collisions.</p><a href="https://docs.plasmapy.org/en/latest/api/plasmapy.simulation.particle_integrators.BorisIntegrator.html" target="_blank" rel="noreferrer">The Boris particle integrator</a></details></div><div className="beam-instrument"><UncommonPhysics kind="magnet"/></div></div>
  </section>

  <section id="flip-lab" className="tumble-chapter expedition-chapter" aria-labelledby="tumble-title">
   <div className="tumble-layout"><div className="tumble-instrument"><UncommonPhysics kind="tumble"/><div className="tumble-legend"><span><i/> REVERSE FACE</span><span><i/> FRONT FACE</span><span>ONE OBJECT. THREE AXES. ONE SURPRISE.</span></div></div><div className="tumble-editorial"><p className="chapter-number">03 / THE UNEXPECTED FLIP</p><h2 id="tumble-title" data-reveal>Trust the <br/><em>unexpected.</em></h2><p>Spin a body around its middle principal axis. It flips, even without an external torque. Change to its long or short axis and the rotation settles into a different kind of motion.</p><p>Flick to disturb the spin. Change the axis above the scene. This is the kind of hidden behaviour that keeps me building numerical experiments.</p><details className="physics-method"><summary>Why does it flip?</summary><p>The intermediate-axis theorem: rotation near the middle moment of inertia is unstable. This uniform cuboid follows Euler’s rigid-body equations and a quaternion orientation, integrated with RK4. A flick adds an impulse; between flicks the body is torque-free. The lime vector shows world angular momentum. Numerical error is finite.</p><a href="https://qiweb.tudelft.nl/mecharela/noninertialframes/" target="_blank" rel="noreferrer">Explore rigid-body stability</a></details></div></div>
  </section>

  <section id="source-index" className="source-chapter expedition-chapter" aria-labelledby="source-title"><div className="source-intro"><p className="chapter-number">THE EXPERIMENTS HAVE A SOURCE</p><h2 id="source-title" data-reveal>Curiosity.<br/><em>Committed.</em></h2><p>The playground is the invitation.<br/>The repositories are the evidence.</p></div><div className="source-index">{projects.map((p,i)=><article className="source-row" key={p.slug}><span className="source-number">0{i+1}</span><Link href={`/work/${p.slug}/`} className="source-photo" tabIndex={-1} aria-hidden="true"><img src={p.image} alt="" width="120" height="100" loading="lazy"/></Link><div><span className="source-language">{p.language} / {p.field}</span><h3><Link href={`/work/${p.slug}/`}>{p.title} <span>↗</span></Link></h3><p>{p.slug==='virtual-computer'?'An instruction. A register. The machine underneath.':p.slug==='orbital-mechanics'?'Numerical motion, custom vectors and energy drift.':'Lagrangian → symbolic equations → a physics-informed network.'}</p></div><a href={p.source} className="source-github" target="_blank" rel="noreferrer" aria-label={`${p.title} source on GitHub`}>Source ↗</a></article>)}</div></section>

  <section id="mission" className="human-chapter expedition-chapter" aria-labelledby="human-title"><div><p className="chapter-number">THE HUMAN IN THE LOOP</p><h2 id="human-title" data-reveal>Build it.<br/><em>Question it.</em></h2><p className="human-statement">I’m Prathmesh. A software engineer with a habit of looking underneath the interface. Computers, physical systems, strange little experiments — I like finding out how they work.</p><a href={profile.linkedin} target="_blank" rel="noreferrer" className="expedition-link">The professional side ↗</a></div><div className="human-notes"><article><span>WHERE I BUILD</span><h3>Siemens Technology<br/>and Services</h3><p>Software / frontend engineering.</p></article><article><span>WHERE I STARTED</span><h3>Computer Engineering</h3><p>B.E. · Dr. D. Y. Patil Institute of Technology.</p></article><div id="arsenal"><span>WHAT I BUILD WITH</span><p className="tool-sentence">C <i>/</i> C++ <i>/</i> Python <i>/</i> React<br/>TypeScript <i>/</i> SymPy <i>/</i> PyTorch<br/>FastAPI <i>/</i> GSAP <i>/</i> Three.js</p></div></div></section>

  <section className="field-notes expedition-chapter" id="field-notes" aria-labelledby="notes-title"><div className="notes-heading"><p className="chapter-number">TAKE A DETOUR</p><h2 id="notes-title">Field <em>notes.</em></h2><p>More things to pull apart.<br/>Open whatever catches your curiosity.</p></div><div className="notes-list">
   <FieldNote number="01" title="The view from up there" caption="SCROLL THROUGH REAL NASA FOOTAGE"><div className="note-content film-note"><ScrollStory/></div></FieldNote>
   <FieldNote number="02" title="Inside an instruction" caption="STEP THROUGH AN 8-BIT MODEL" id="cpu-notebook"><div className="note-content" id="lab"><CpuDemo/><p className="model-note">Educational LOAD / ADD / SEND model. Separate from the original C implementation.</p></div></FieldNote>
   <FieldNote number="03" title="A small satellite, unfolded" caption="ROTATE A CUBESAT CONCEPT"><div className="note-content satellite-note"><SatelliteViewer/></div></FieldNote>
   <FieldNote number="04" title="The work keeps moving" caption="TOOLS, REPOSITORIES & ACTIVITY"><div className="note-content"><div className="app-list">{apps.map(app=><a key={app.name} href={app.href} target="_blank" rel="noreferrer"><h3>{app.name}</h3><p>{app.description}</p><span>{app.type}</span><span>↗</span></a>)}</div><Activity/><WorkConnection topic="activity"/></div></FieldNote>
  </div></section>

  <section id="shell" className="shell-chapter expedition-chapter"><div className="shell-intro"><p className="chapter-number">FOR THOSE WHO PREFER A PROMPT</p><h2>Talk to <em>the system.</em></h2><p>No secret handshake.<br/>Start with <code>help</code>.</p></div><div className="shell-experience"><Terminal/><WorkConnection topic="terminal"/></div></section>
 </div>;
}
