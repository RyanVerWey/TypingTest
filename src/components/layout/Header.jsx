import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const [theme, setTheme] = useState(() => {
    try {
      return sessionStorage.getItem('typingTester:theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      html.classList.add('dark');
    } else {
      html.removeAttribute('data-theme');
      html.classList.remove('dark');
    }
    try {
      sessionStorage.setItem('typingTester:theme', theme);
    } catch {
      /* ignore storage errors (private mode/quota) */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <header className="w-full border-b glass" style={{ borderColor: 'rgb(var(--border))' }}>
      <div className="content-wrapper" style={{ padding: '1.5rem 2rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 font-bold" style={{ color: 'rgb(var(--text))' }}>
              TypingForce
            </h1>
            <p className="font-medium" style={{ color: 'rgb(var(--muted))' }}>
              Professional typing speed assessment platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="btn btn-soft" aria-label="Toggle theme">
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}