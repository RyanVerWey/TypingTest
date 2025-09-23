// ================================
// FILE: src/components/analytics/TypingTips.jsx
// Clean, modern tips component with actionable advice
// ================================
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faBullseye, faGauge, faWaveSquare, faWind, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function TypingTips({ tips, onDismiss }) {
  if (!tips || tips.length === 0) return null;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Accuracy': return faBullseye;
      case 'Speed': return faGauge;
      case 'Rhythm': return faWaveSquare;
      case 'Flow': return faWind;
      default: return faLightbulb;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Accuracy': return 'text-red-600';
      case 'Speed': return 'text-green-600';
      case 'Rhythm': return 'text-purple-600';
      case 'Flow': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: 'rgb(var(--border))' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600" />
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>
            Improvement Tips
          </h3>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: 'rgb(var(--muted))' }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {tips.slice(0, 4).map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/30 dark:bg-black/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FontAwesomeIcon 
                icon={getCategoryIcon(tip.category)} 
                className={`text-sm ${getCategoryColor(tip.category)}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--muted))' }}>
                  {tip.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityBadge(tip.priority)}`}>
                  {tip.priority}
                </span>
              </div>
              <h4 className="font-medium mb-1" style={{ color: 'rgb(var(--text))' }}>
                {tip.title}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--muted))' }}>
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
        <p className="text-xs flex items-center gap-2 justify-center" style={{ color: 'rgb(var(--muted))' }}>
          <FontAwesomeIcon icon={faGauge} className="text-blue-600" />
          Practice these areas consistently to see improvement in your next test
        </p>
      </div>
    </div>
  );
}