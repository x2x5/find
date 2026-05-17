const LATEX_UNICODE: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ',
  mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
  pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
  upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ',
  omega: 'ω',
  ell: 'ℓ', L: 'Ł', partial: '∂', infty: '∞',
  sharp: '♯', neg: '¬', wedge: '∧', vee: '∨',
  forall: '∀', exists: '∃',
};

const STRIP_CMDS = [
  '\\textbf', '\\textit', '\\texttt', '\\emph', '\\underline',
  '\\mathbf', '\\boldsymbol', '\\textrm', '\\text',
];

function stripTextBraces(t: string, cmd: string): string {
  while (t.includes(cmd)) {
    const start = t.indexOf(cmd);
    let i = start + cmd.length;
    const parts: string[] = [];
    while (i < t.length && t[i] === '{') {
      let depth = 0;
      let j = i;
      while (j < t.length) {
        if (t[j] === '{') depth++;
        else if (t[j] === '}') {
          depth--;
          if (depth === 0) break;
        }
        j++;
      }
      parts.push(t.slice(i + 1, j));
      i = j + 1;
    }
    t = t.slice(0, start) + parts.join('') + t.slice(i);
  }
  return t;
}

function processMathBlock(s: string): string {
  for (const cmd of STRIP_CMDS) {
    s = stripTextBraces(s, cmd);
  }
  const out: string[] = [];
  let j = 0;
  while (j < s.length) {
    let m = /^\\([a-zA-Z]+)((?:\{[^}]*\})+)/.exec(s.slice(j));
    if (m) {
      const name = m[1];
      out.push(name in LATEX_UNICODE ? LATEX_UNICODE[name] : m[0]);
      j += m[0].length;
      continue;
    }
    m = /^\\([a-zA-Z]+)/.exec(s.slice(j));
    if (m) {
      const name = m[1];
      out.push(name in LATEX_UNICODE ? LATEX_UNICODE[name] : m[0]);
      j += m[0].length;
      continue;
    }
    m = /^[_^](\{[^}]*\}|\w)/.exec(s.slice(j));
    if (m) {
      // Flatten subscripts/superscripts: keep only the content
      const raw = m[0];
      const content = raw.startsWith('{') ? raw.slice(1, -1) : raw.slice(1);
      out.push(content);
      j += m[0].length;
      continue;
    }
    out.push(s[j]);
    j++;
  }
  return out.join('');
}

export function cleanTitle(title: string): string {
  let t = title;
  t = t.replace(/_x0008_/g, '');
  t = t.replace(/\*\*(.+?)\*\*/g, '$1');
  t = t.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  for (const cmd of STRIP_CMDS) {
    t = stripTextBraces(t, cmd);
  }

  const result: string[] = [];
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === '$') {
      const j = t.indexOf('$', i + 1);
      if (j === -1) {
        result.push(t.slice(i));
        break;
      }
      const inner = processMathBlock(t.slice(i + 1, j));
      if (inner) result.push(inner);
      i = j + 1;
      continue;
    }
    if (t.slice(i, i + 2) === '\\(') {
      const j = t.indexOf('\\)', i + 2);
      if (j === -1) {
        result.push(t.slice(i));
        break;
      }
      const inner = processMathBlock(t.slice(i + 2, j));
      if (inner) result.push(inner);
      i = j + 2;
      continue;
    }
    if (t.slice(i, i + 2) === '\\[') {
      const j = t.indexOf('\\]', i + 2);
      if (j === -1) {
        result.push(t.slice(i));
        break;
      }
      const inner = processMathBlock(t.slice(i + 2, j));
      if (inner) result.push(inner);
      i = j + 2;
      continue;
    }
    let m = /^\{(\\([a-zA-Z]+))\}/.exec(t.slice(i));
    if (m) {
      const name = m[2];
      result.push(name in LATEX_UNICODE ? LATEX_UNICODE[name] : '$' + m[1] + '$');
      i += m[0].length;
      continue;
    }
    m = /^[_^](\{[^}]*\}|\w)/.exec(t.slice(i));
    if (m) {
      result.push('$' + m[0] + '$');
      i += m[0].length;
      continue;
    }
    m = /^\\([a-zA-Z]+)((?:\{[^}]*\})+)\s*/.exec(t.slice(i));
    if (m) {
      result.push('$' + m[0].trim() + '$');
      i += m[0].length;
      continue;
    }
    m = /^\\([a-zA-Z]+)[_^](?:\{[^}]*\}|\w)/.exec(t.slice(i));
    if (m) {
      result.push('$' + m[0] + '$');
      i += m[0].length;
      continue;
    }
    m = /^\\([a-zA-Z]+)/.exec(t.slice(i));
    if (m) {
      const name = m[1];
      result.push(name in LATEX_UNICODE ? LATEX_UNICODE[name] : '$' + m[0] + '$');
      i += m[0].length;
      continue;
    }
    result.push(c);
    i++;
  }
  return result.join('');
}
