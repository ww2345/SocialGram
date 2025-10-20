import React, { useEffect, useRef, useState } from 'react';

export default function NeonTerminal() {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Welcome to SocialGram Shell — type `help` to see commands.' },
    { type: 'output', text: 'Predefined commands: help, about, whoami, ls, cat README, date, banner, get-profile, clear' }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Blink cursor
  useEffect(() => {
    const t = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(t);
  }, []);

  // Scroll to bottom when history changes
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const COMMANDS = {
    help: () => (
      `Available commands:\n` +
      `help         - show this help\n` +
      `about        - about SocialGram (short)\n` +
      `whoami       - show developer name\n` +
      `ls           - list files\n` +
      `cat README   - print README\n` +
      `date         - show current date/time\n` +
      `banner       - animate neon banner\n` +
      `get-profile  - fetch fake profile JSON\n` +
      `clear        - clear terminal\n`
    ),
    about: () => 'SocialGram — neon social platform. Minimal shell demo.',
    whoami: () => 'Ishant Dahiya',
    ls: () => 'README  configs  src  package.json',
    'cat README': () => (
      `SocialGram\n` +
      `A neon-themed social prototype.\n` +
      `Use \"help\" for commands.`
    ),
    date: () => new Date().toString(),
    banner: () => 'BANNER',
    'get-profile': () => JSON.stringify({ name: 'Ishant Dahiya', role: 'Developer', version: '1.0' }, null, 2),
  };

  function pushHistory(entry) {
    setHistory(h => [...h, entry]);
  }

  // Simulate typing output (nice visual)
  function typeOutput(text, speed = 6) {
    return new Promise(resolve => {
      setBusy(true);
      let i = 0;
      const id = setInterval(() => {
        i++;
        setHistory(h => {
          const copy = [...h.filter(x => x.type !== 'typing')];
          copy.push({ type: 'typing', text: text.slice(0, i) });
          return copy;
        });
        if (i >= text.length) {
          clearInterval(id);
          // replace typing with final output
          setHistory(h => [...h.filter(x => x.type !== 'typing'), { type: 'output', text }]);
          setBusy(false);
          resolve();
        }
      }, speed);
    });
  }

  async function runCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    // push the prompt as submitted command
    setHistory(h => [...h, { type: 'prompt', text: cmd }]);
    setCmdHistory(ch => [cmd, ...ch].slice(0, 50));
    setHistoryIndex(-1);

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    // If command exists
    const fn = COMMANDS[cmd] || null;
    if (!fn) {
      await typeOutput(`Command not found: ${cmd}`);
      return;
    }

    if (cmd === 'banner') {
      // a custom animated banner: we just push a few stylized lines
      const lines = [
        '╔════════════════════════════════╗',
        '║   S O C I A L G R A M   ║',
        '║   — Neon Shell Demo —         ║',
        '╚════════════════════════════════╝'
      ];
      for (const l of lines) {
        await typeOutput(l, 8);
      }
      return;
    }

    // simulate a little processing delay for get-profile
    if (cmd === 'get-profile') {
      await typeOutput('Fetching profile...');
      await new Promise(r => setTimeout(r, 500));
      await typeOutput(fn());
      return;
    }

    // default: immediate output typed
    await typeOutput(fn());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const toRun = input;
      setInput('');
      runCommand(toRun);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // navigate history
      const nextIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(nextIndex);
      setInput(cmdHistory[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(nextIndex);
      setInput(cmdHistory[nextIndex] || '');
    } else if (e.key === 'Tab') {
      // simple autocomplete for matching commands
      e.preventDefault();
      const candidates = Object.keys(COMMANDS).filter(c => c.startsWith(input));
      if (candidates.length === 1) setInput(candidates[0]);
      else if (candidates.length > 1) pushHistory({ type: 'output', text: candidates.join('   ') });
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-black/60 rounded-xl p-4 shadow-[0_10px_30px_rgba(126,240,255,0.06)] border border-[#1b1b2e]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="ml-auto text-sm text-slate-400">neon-shell v1</div>
        </div>

        <div ref={containerRef} className="terminal-window bg-gradient-to-b from-[#050515] to-[#07071a] rounded-md p-4 min-h-[320px] max-h-[420px] overflow-y-auto text-left font-mono text-sm text-[#9beaf3]">
          {history.map((h, idx) => (
            <div key={idx} className="mb-2 whitespace-pre-wrap">
              {h.type === 'prompt' && (
                <div>
                  <span className="text-[#7ef0ff]">$</span> <span className="text-white">{h.text}</span>
                </div>
              )}
              {h.type === 'output' && (
                <div className="text-[#9beaf3]">{h.text}</div>
              )}
              {h.type === 'typing' && (
                <div className="text-[#9beaf3]">{h.text}<span className="inline-block w-[8px] h-[14px] align-middle" style={{background: cursorVisible ? '#7ef0ff' : 'transparent'}}></span></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-mono text-sm text-[#7ef0ff]">
              <span>$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500"
                placeholder="Type a command (try 'help')"
                disabled={busy}
                autoFocus
              />
            </div>
            <div className="mt-2 text-xs text-slate-500 font-mono">Tip: Press Tab to autocomplete, ↑/↓ for history</div>
          </div>
          <button
            onClick={() => { runCommand(input); setInput(''); }}
            className="px-4 py-2 rounded bg-[#7ef0ff] text-black font-semibold hover:brightness-90"
            disabled={busy}
          >Run</button>
        </div>
      </div>
    </div>
  );
}
