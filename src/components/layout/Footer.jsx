import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="w-full mt-16" style={{ borderTop: '1px solid rgb(var(--border))', background: 'linear-gradient(180deg, rgba(2,6,23,0.02), rgba(2,6,23,0.06))' }}>
      <div className="content-wrapper" style={{ padding: '2rem' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
            © {new Date().getFullYear()} <span className="font-semibold" style={{ color: 'rgb(var(--text))' }}>Ryan VerWey</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'rgb(var(--muted))' }}>
            <FontAwesomeIcon icon={faCode} />
            <span>React 19 · Tailwind CSS 4 · Font Awesome</span>
          </div>
        </div>
      </div>
    </footer>
  );
}