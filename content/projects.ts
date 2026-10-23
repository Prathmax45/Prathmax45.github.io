export const profile = {
  name: 'Prathmesh Kanure', email: 'prathmeshkanure@gmail.com', phone: '9309075225',
  github: 'https://github.com/Prathmax45', linkedin: 'https://www.linkedin.com/in/prathmesh-kanure/', instagram: 'https://www.instagram.com/prath_max/'
};

export const projects = [
  { slug: 'virtual-computer', title: '8-bit virtual computer', shortTitle: 'A computer, from the inside.', field: 'Systems programming', language: 'C', image: '/images/computer.webp', alt: 'A real CDP1802 microprocessor and its wire-wrap prototype board', source: 'https://github.com/Prathmax45/8-bit_virtual_computer',
    intro: 'Exploring the machinery beneath the software, one instruction at a time.',
    description: 'A virtual computer project written in C. The starting point for a deeper interest in processors, instructions, memory, and how independent parts become a working system.',
    sections: [ ['The question', 'What has to happen between a small instruction and a useful result? Building a virtual computer makes those hidden steps something you can inspect.'], ['The approach', 'The public project is written in C. This portfolio adds a separate, deliberately small browser demonstration of loading values, performing an addition, and transferring the result.'], ['Explore the work', 'The repository is the source of truth for the implementation. The browser model below is an educational explanation, not an emulator of the complete C project.'] ] },
  { slug: 'orbital-mechanics', title: 'Orbital Mechanics', shortTitle: 'Let the equations move.', field: 'Computational physics', language: 'C++', image: '/images/earth.webp', alt: 'Noctilucent clouds and the blue atmosphere photographed from the International Space Station', source: 'https://github.com/Prathmax45/Orbital-Mechanics-Engine',
    intro: 'Following gravitational motion through code, vectors, and energy.',
    description: 'A Newtonian orbital simulation with a custom 3D vector system and velocity Verlet integration. The project tracks motion and energy drift in an Earth–Sun setup.',
    sections: [ ['The question', 'How can a numerical model describe orbital motion, and how do we check whether the integration is behaving as intended?'], ['The approach', 'The project README describes object-oriented bodies, gravitational force calculations, a custom 3D vector class, and velocity Verlet integration. Position, velocity, acceleration, and energy are recorded.'], ['What to inspect', 'Start with the Earth–Sun configuration and follow the simulation log. Energy drift is a useful diagnostic; the portfolio does not assert an accuracy benchmark that has not been reproduced.'] ] },
  { slug: 'dpdl', title: 'DPDL', shortTitle: 'Physics, expressed in code.', field: 'Scientific software', language: 'Python', image: '/images/circuit.webp', alt: 'Close-up photograph of a green motherboard by alerkiv', source: 'https://github.com/Prathmax45/DPDL-Physics-Descriptor-Language-',
    intro: 'From a description of a physical system to a computational model.',
    description: 'A physics descriptor language exploring Lagrangian expressions, symbolic equations, and physics-informed neural networks with Python, SymPy, and PyTorch.',
    sections: [ ['The question', 'Can a concise description of a physical system become the starting point for its solver, instead of rewriting the numerical workflow for every model?'], ['The approach', 'The repository documents a Python decorator for Lagrangian expressions, symbolic derivation with SymPy, and a physics-informed neural-network solver using PyTorch.'], ['Explore the work', 'Read the examples and implementation in the repository. This portfolio describes the documented approach; it does not run training or present synthetic compiler output as a result.'] ] }
] as const;

export const apps = [
  { name: 'MALLOC-job', description: 'A resume-analysis tool exploring systems, hardware, and software career paths.', type: 'FastAPI · Python', href: 'https://github.com/Prathmax45/MALLOC-job' },
  { name: 'DPDL', description: 'Express a physical system and explore the computational pipeline behind it.', type: 'Python · Scientific software', href: 'https://github.com/Prathmax45/DPDL-Physics-Descriptor-Language-' },
  { name: '8-bit virtual computer', description: 'Look underneath the abstractions and follow the implementation in C.', type: 'C · Systems', href: 'https://github.com/Prathmax45/8-bit_virtual_computer' }
];
