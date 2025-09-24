import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faChartLine, 
  faClock, 
  faBolt,
  faLeaf,
  faGraduationCap,
  faRocket,
  faMagicWandSparkles
} from '@fortawesome/free-solid-svg-icons';

// Difficulty configuration with icons and themes
const DIFFICULTY_CONFIG = {
  beginner: {
    icon: faLeaf,
    color: 'rgb(34, 197, 94)', // green
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  student: {
    icon: faGraduationCap,
    color: 'rgb(59, 130, 246)', // blue
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  advanced: {
    icon: faRocket,
    color: 'rgb(168, 85, 247)', // purple
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)'
  },
  wizard: {
    icon: faMagicWandSparkles,
    color: 'rgb(239, 68, 68)', // red
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  }
};

const DIFFICULTY_OPTIONS = ["beginner", "student", "advanced", "wizard"];
const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  student: "Student", 
  advanced: "Advanced",
  wizard: "Wizard"
};

export default function Toolbar({ difficulty, setDifficulty }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="w-full border-b glass" style={{ borderColor: 'rgb(var(--border))' }}>
      <div className="content-wrapper" style={{ padding: '1rem 2rem' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => nav("/")} 
              className={`btn ${
                pathname === "/" 
                  ? "btn-primary glow-blue" 
                  : "btn-ghost"
              }`}
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>Typing Test</span>
            </button>
            <button 
              onClick={() => nav("/results")} 
              className={`btn ${
                pathname === "/results" 
                  ? "btn-primary glow-blue" 
                  : "btn-ghost"
              }`}
            >
              <FontAwesomeIcon icon={faChartLine} />
              <span>Analytics</span>
            </button>
          </div>
          
          {/* Difficulty selector for typing test page */}
          {pathname === "/" && difficulty && setDifficulty ? (
            <div className="flex items-center">
              <div className="flex items-center gap-6" style={{ marginRight: '3rem' }}>
                <div className="w-3 h-3 rounded-full" style={{ 
                  background: 'linear-gradient(135deg, rgb(59,130,246), rgb(147,51,234))',
                  boxShadow: '0 0 8px rgba(59,130,246,0.5)'
                }}></div>
                <span style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(135deg, rgb(59,130,246), rgb(147,51,234))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}>
                  DIFFICULTY
                </span>
              </div>
              <div className="flex items-center gap-6">
                {DIFFICULTY_OPTIONS.map((key) => {
                  const config = DIFFICULTY_CONFIG[key];
                  const isActive = difficulty === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setDifficulty(key)}
                      className={`btn px-4 py-2 transition-all duration-300 flex items-center gap-2 min-w-[120px] justify-center hover:-translate-y-0.5 ${
                        isActive 
                          ? 'btn-primary glow-blue ring-2 ring-opacity-50' 
                          : 'btn-ghost hover:scale-105'
                      }`}
                      style={{
                        color: isActive ? 'white' : config.color,
                        background: isActive 
                          ? `linear-gradient(135deg, ${config.color}, ${config.color}cc)` 
                          : undefined,
                        borderColor: isActive ? config.color : undefined,
                        ringColor: isActive ? config.color : 'transparent',
                        boxShadow: isActive 
                          ? `0 4px 15px rgba(0,0,0,0.1), 0 0 15px ${config.color}30`
                          : undefined
                      }}
                    >
                      <FontAwesomeIcon icon={config.icon} className="text-base" />
                      <span className="text-sm font-medium">{DIFFICULTY_LABELS[key]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'rgb(var(--muted))' }}>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} />
                <span>2-minute test</span>
              </div>
              <div className="w-px h-4" style={{ background: 'rgba(148,163,184,0.35)' }}></div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBolt} />
                <span>Auto-advance</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}