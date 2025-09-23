// ================================
// FILE: src/components/analytics/ProblemCharacters.jsx  
// Visual display of problematic characters with practice suggestions
// ================================
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faBullseye, faLightbulb } from '@fortawesome/free-solid-svg-icons';

export default function ProblemCharacters({ problemChars, characterSpeeds }) {
  if (!problemChars || problemChars.length === 0) {
    return (
      <div className="rounded-2xl p-6 glass shadow-xl text-center" style={{ borderColor: 'rgb(var(--border))' }}>
        <FontAwesomeIcon icon={faCircleCheck} className="text-2xl" style={{ color: 'rgb(34,197,94)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgb(34,197,94)' }}>
          No Problem Characters!
        </h3>
        <p className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
          Great job! You didn’t make consistent errors on any specific characters.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 glass shadow-xl" style={{ borderColor: 'rgb(var(--border))' }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text))' }}>
        <FontAwesomeIcon icon={faBullseye} />
        Characters to Practice
      </h3>
      
      <div className="space-y-3 mb-4">
        {problemChars.map((item, index) => {
          const speed = characterSpeeds?.get?.(item.char);
          return (
            <motion.div
              key={item.char}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border-2 border-red-300 dark:border-red-600 flex items-center justify-center">
                  <span className="text-xl font-mono font-bold text-red-600 dark:text-red-400">
                    {item.char === ' ' ? '␣' : item.char}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.char === ' ' ? 'Space' : `"${item.char}"`}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {item.errors} error{item.errors !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {speed && (
                  <>
                    <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {speed.averageTime}ms
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      avg time
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <PracticeExercises characters={problemChars.slice(0, 3)} />
    </motion.div>
  );
}

function PracticeExercises({ characters }) {
  if (!characters || characters.length === 0) return null;

  const generatePracticeText = (chars) => {
    const charList = chars.map(c => c.char);
    const exercises = [];
    
    // Simple repetition
    exercises.push(`${charList.join(' ')} `.repeat(3).trim());
    
    // Common combinations
    const combinations = charList.map(char => {
      if (char === ' ') return 'the and for are';
      return `${char}a ${char}e ${char}i ${char}o ${char}u`;
    });
    exercises.push(combinations.join(' '));
    
    // In context
    if (charList.includes('s')) {
      exercises.push('she sells seashells by the seashore');
    } else if (charList.includes('t')) {
      exercises.push('the quick brown fox jumps over the lazy dog');
    } else {
      exercises.push(`practice makes perfect with ${charList.join(', ')}`);
    }
    
    return exercises;
  };

  const exercises = generatePracticeText(characters);

  return (
    <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'rgb(var(--text))' }}>
        <FontAwesomeIcon icon={faLightbulb} />
        Practice Exercises
      </h4>
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={index} className="p-3 rounded-lg glass" style={{ borderColor: 'rgb(var(--border))' }}>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wide">
              Exercise {index + 1}
            </div>
            <div className="font-mono text-sm leading-relaxed" style={{ color: 'rgb(var(--text))' }}>
              {exercise}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3 text-center" style={{ color: 'rgb(var(--muted))' }}>
        Type these exercises slowly and accurately to build muscle memory
      </p>
    </div>
  );
}