export const instructions = ['Load register A', 'Load register B', 'Add A and B', 'Send the result', 'Store at node B'];
export function initialState(a = 12, b = 30) {
  if (![a, b].every(n => Number.isInteger(n) && n >= 0 && n <= 255)) throw new RangeError('Use whole numbers from 0 to 255');
  return { step: 0, inputA: a, inputB: b, a: 0, b: 0, result: 0, received: 0, carry: false, message: 'Ready. Load two values into the processor.' };
}
export function advance(s) {
  switch (s.step) {
    case 0: return { ...s, step: 1, a: s.inputA, message: `Register A now holds ${s.inputA}.` };
    case 1: return { ...s, step: 2, b: s.inputB, message: `Register B now holds ${s.inputB}.` };
    case 2: return { ...s, step: 3, result: (s.a + s.b) % 256, carry: s.a + s.b > 255, message: `${s.a} + ${s.b} = ${s.a + s.b}. ${s.a + s.b > 255 ? 'The 8-bit register wraps; carry is set.' : 'The result fits in 8 bits.'}` };
    case 3: return { ...s, step: 4, message: `A packet carrying ${s.result} travels to node B.` };
    case 4: return { ...s, step: 5, received: s.result, message: `Node B stored ${s.result}. Execution complete.` };
    default: return s;
  }
}
export function frameAt(progress, count) {
  if (!Number.isFinite(progress) || count < 1) return 0;
  return Math.round(Math.max(0, Math.min(1, progress)) * (count - 1));
}
export function cleanRepos(value) {
  if (!Array.isArray(value)) throw new TypeError('Expected a list of repositories');
  return value.filter(x => x && typeof x.name === 'string' && typeof x.html_url === 'string' && /^https:\/\/github\.com\/Prathmax45\/[a-zA-Z0-9_.-]+$/.test(x.html_url) && typeof x.updated_at === 'string' && Number.isFinite(Date.parse(x.updated_at)) && !x.fork)
    .slice(0, 3).map(x => ({ name: x.name, url: x.html_url, updated: x.updated_at, language: typeof x.language === 'string' ? x.language : 'Repository' }));
}
