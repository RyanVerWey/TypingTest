// ================================
// FILE: src/components/analytics/StrategyGuide.jsx
// Comprehensive improvement strategy based on user analytics
// ================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBullseye, faWaveSquare, faWind, faClipboardList, faClock, faSun, faChartLine, faPen } from '@fortawesome/free-solid-svg-icons';

const IMPROVEMENT_STRATEGIES = {
  speed: {
    icon: faBolt,
    title: 'Speed Development Strategy',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    exercises: [
      'Practice burst typing: Type for 30 seconds at maximum speed, rest 30 seconds',
      'Use typing games that focus on speed over accuracy initially',
      'Practice common word combinations and keyboard shortcuts',
      'Set incremental WPM goals (increase by 5 WPM per week)'
    ],
    timeline: '2-4 weeks for noticeable improvement'
  },
  accuracy: {
    icon: faBullseye,
    title: 'Accuracy Improvement Strategy', 
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    exercises: [
      'Type slowly and deliberately, focusing on zero errors',
      'Practice problem characters in isolation before context',
      'Use proper finger positioning and avoid looking at keyboard',
      'Take breaks when accuracy drops below your target'
    ],
    timeline: '1-2 weeks for significant improvement'
  },
  rhythm: {
    icon: faWaveSquare,
    title: 'Rhythm Consistency Strategy',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    exercises: [
      'Practice with a metronome to maintain steady timing',
      'Focus on smooth, flowing movements between keys',
      'Avoid rushing through easy sections and slowing on hard ones',
      'Practice scales and drills for muscle memory development'
    ],
    timeline: '3-6 weeks for consistent rhythm'
  },
  flow: {
    icon: faWind,
    title: 'Flow State Strategy',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    exercises: [
      'Practice sight reading to reduce thinking pauses',
      'Work on touch typing without looking at keyboard',
      'Read ahead while typing to maintain flow',
      'Practice typing while following along with audio'
    ],
    timeline: '4-8 weeks for natural flow'
  }
};

export default function StrategyGuide({ analytics, currentPerformance }) {
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  if (!analytics) return null;

  const generatePersonalizedPlan = () => {
    const plan = [];
    const { wpm, accuracy } = currentPerformance;
    const { rhythmConsistency } = analytics.personality?.metrics || {};

    // Determine primary focus area
    if (accuracy < 90) {
      plan.push({ focus: 'accuracy', priority: 'high', reason: 'Low accuracy is limiting overall performance' });
    }
    if (wpm < 40) {
      plan.push({ focus: 'speed', priority: 'medium', reason: 'Building foundational speed will unlock potential' });
    }
    if (rhythmConsistency < 60) {
      plan.push({ focus: 'rhythm', priority: 'medium', reason: 'Inconsistent timing affects both speed and accuracy' });
    }
    if (analytics.flowInterruptions > 5) {
      plan.push({ focus: 'flow', priority: 'low', reason: 'Reducing hesitation will improve overall fluency' });
    }

    return plan.slice(0, 3); // Top 3 priorities
  };

  const personalizedPlan = generatePersonalizedPlan();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 glass shadow-xl" style={{ borderColor: 'rgb(var(--border))' }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text))' }}>
        <FontAwesomeIcon icon={faBullseye} />
        Your Improvement Strategy
      </h3>

      {/* Personalized Plan Overview */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.08), rgba(147,51,234,0.08))', border: '1px solid rgba(99,102,241,0.25)' }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'rgb(var(--text))' }}>
          <FontAwesomeIcon icon={faClipboardList} />
          Your Personalized Plan
        </h4>
        <div className="space-y-2">
          {personalizedPlan.map((item) => (
            <div key={item.focus} className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {item.priority} priority
              </span>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                <strong className="capitalize">{item.focus}:</strong> {item.reason}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(IMPROVEMENT_STRATEGIES).map(([key, strategy]) => (
          <button
            key={key}
            onClick={() => setSelectedStrategy(selectedStrategy === key ? null : key)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStrategy === key 
                ? `${strategy.borderColor} ${strategy.bgColor}` 
                : 'border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            <div className="text-2xl mb-2"><FontAwesomeIcon icon={strategy.icon} /></div>
            <div className={`text-sm font-medium ${selectedStrategy === key ? strategy.color : 'text-neutral-700 dark:text-neutral-300'}`}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Strategy Details */}
      {selectedStrategy && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`p-6 rounded-xl ${IMPROVEMENT_STRATEGIES[selectedStrategy].bgColor} border ${IMPROVEMENT_STRATEGIES[selectedStrategy].borderColor}`}
        >
          <h4 className={`text-lg font-semibold mb-4 ${IMPROVEMENT_STRATEGIES[selectedStrategy].color}`}>
            {IMPROVEMENT_STRATEGIES[selectedStrategy].title}
          </h4>
          
          <div className="mb-4">
            <h5 className="font-medium text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faPen} /> Practice Exercises:
            </h5>
            <ul className="space-y-2">
              {IMPROVEMENT_STRATEGIES[selectedStrategy].exercises.map((exercise, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="w-6 h-6 rounded-full bg-white/60 dark:bg-neutral-700/60 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {exercise}
                </li>
              ))}
            </ul>
          </div>

            <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" style={{ color: 'rgb(var(--text))' }}><FontAwesomeIcon icon={faClock} /> Timeline:</span>
            <span style={{ color: 'rgb(var(--muted))' }}>
              {IMPROVEMENT_STRATEGIES[selectedStrategy].timeline}
            </span>
          </div>
        </motion.div>
      )}

      {/* Weekly Practice Schedule */}
      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'rgb(var(--text))' }}>
          <FontAwesomeIcon icon={faChartLine} /> Suggested Weekly Schedule
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2" style={{ color: 'rgb(var(--text))' }}>
              <FontAwesomeIcon icon={faSun} /> Daily Practice (15-20 min)
            </div>
            <ul className="space-y-1" style={{ color: 'rgb(var(--muted))' }}>
              <li>• 5 min warm‑up typing</li>
              <li>• 10 min focused practice</li>
              <li>• 5 min cool‑down</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2" style={{ color: 'rgb(var(--text))' }}>
              <FontAwesomeIcon icon={faChartLine} /> Weekly Goals
            </div>
            <ul className="space-y-1" style={{ color: 'rgb(var(--muted))' }}>
              <li>• Complete 3 full tests</li>
              <li>• Track improvement metrics</li>
              <li>• Adjust strategy as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}