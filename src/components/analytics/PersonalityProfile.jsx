// ================================
// FILE: src/components/analytics/PersonalityProfile.jsx
// Clean, modern personality analysis component
// ================================
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faBolt, faWaveSquare, faShuffle, faScaleBalanced } from '@fortawesome/free-solid-svg-icons';

export default function PersonalityProfile({ profile }) {
  if (!profile) return null;

  const getPersonalityIcon = (style) => {
    switch (style) {
      case 'Perfectionist': return faBullseye;
      case 'Speed Demon': return faBolt;
      case 'Metronome': return faWaveSquare;
      case 'Variable': return faShuffle;
      default: return faScaleBalanced;
    }
  };

  const getPersonalityColor = (style) => {
    switch (style) {
      case 'Perfectionist': return 'text-red-600';
      case 'Speed Demon': return 'text-green-600';
      case 'Metronome': return 'text-purple-600';
      case 'Variable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPersonalityDescription = (style) => {
    const descriptions = {
      'Perfectionist': 'You prioritize accuracy over speed, making careful corrections along the way.',
      'Speed Demon': 'You type fast and confidently, preferring speed over perfection.',
      'Metronome': 'You maintain a remarkably consistent rhythm throughout your typing.',
      'Variable': 'Your typing speed varies as you adapt to different content and challenges.',
      'Balanced': 'You maintain a good balance between speed and accuracy.'
    };
    return descriptions[style] || descriptions.Balanced;
  };

  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: 'rgb(var(--border))' }}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 mb-3">
          <FontAwesomeIcon icon={getPersonalityIcon(profile.style)} className="text-xl text-blue-600" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'rgb(var(--text))' }}>
          <span className={getPersonalityColor(profile.style)}>&ldquo;{profile.style}&rdquo;</span> Typer
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--muted))' }}>
          {getPersonalityDescription(profile.style)}
        </p>
      </div>

      {/* Key Traits */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'rgb(var(--text))' }}>
          Key Traits
        </h4>
        <div className="space-y-2">
          {(profile.traits || []).slice(0, 3).map((trait, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/30 dark:bg-black/10">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm" style={{ color: 'rgb(var(--text))' }}>{trait}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Corrections"
          value={`${profile.metrics?.correctionRate || 0}%`}
          status={profile.metrics?.correctionRate > 15 ? 'error' : 'success'}
        />
        <MetricCard
          label="Consistency"
          value={`${profile.metrics?.rhythmConsistency || 0}%`}
          status={profile.metrics?.rhythmConsistency > 70 ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, status = 'idle' }) {
  const statusColors = {
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-600',
    warning: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-600',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600',
    idle: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800'
  };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[status]}`}>
      <div className="text-xs font-medium mb-1" style={{ color: 'rgb(var(--muted))' }}>
        {label}
      </div>
      <div className="text-lg font-bold">
        {value}
      </div>
    </div>
  );
}