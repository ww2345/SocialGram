import React, { useState, useRef, useEffect } from "react";
import "./About.css";

export default function About() {
  const [history, setHistory] = useState([
    { type: "output", text: "Welcome to SocialGram Terminal! Type 'help' to start." },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [typingOutput, setTypingOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const containerRef = useRef(null);

  const COMMANDS = {
    devloper: "DEVLOPED BY ISHANT DAHIYA",
    help: "Available commands:\n -devloper\n -about\n -contact\n -date",
    about: "This is A Platform Devloped By Ishant dahiya. This is a social media platform where people connect to each other make freinds and chat with them.",
    contact: "Hey U can Contect me By following Ways :\n -IG : ishantdahiya_01\n -Email : ishantdahiya2007@gamil.com\n -Linkdin : ishantdahiya_01\n",
    date: new Date().toString(),
  };

  // Scroll terminal automatically
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [history, typingOutput]);

  // Typing output effect
  const typeOutput = async (text, speed = 25) => {
    setTypingOutput("");
    for (let i = 0; i <= text.length; i++) {
      await new Promise(r => setTimeout(r, speed));
      setTypingOutput(text.slice(0, i));
    }
    setHistory(h => [...h, { type: "output", text }]);
    setTypingOutput("");
  };

  const runCommand = async (cmd) => {
    if (busy || !cmd.trim()) return;
    setBusy(true);
    setHistory(h => [...h, { type: "prompt", text: cmd }]);
    setCurrentInput("");

    if (cmd === "clear") {
      setHistory([]);
      setBusy(false);
      return;
    }

    const output = COMMANDS[cmd] || `Command not found: ${cmd}`;
    await typeOutput(output);
    setBusy(false);
  };

  const handleKeyDown = (e) => {
    if (busy) return;
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(currentInput);
    } else if (e.key === "Backspace") {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setCurrentInput(prev => prev + e.key);
    }
  };

  return (
    <div className="about-container">
      <h1>SocialGram Terminal</h1>

      <div className="terminal-box" onKeyDown={handleKeyDown} tabIndex={0}>
        <div className="terminal-window" ref={containerRef}>
          {history.map((h, idx) => (
            <div key={idx} className="terminal-line">
              {h.type === "prompt" && <span className="terminal-prompt">$ {h.text}</span>}
              {h.type === "output" && <span className="terminal-output">{h.text}</span>}
            </div>
          ))}
          {typingOutput && (
            <div className="terminal-line">
              <span className="terminal-output">{typingOutput}</span>
            </div>
          )}
          <div className="terminal-line">
            <span className="terminal-prompt">$ </span>
            <span className="terminal-input">
              {currentInput}
              <span className="terminal-cursor"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

