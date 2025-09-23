// ================================
// FILE: src/lib/enhanced-metrics.js
// Enhanced analytics with correction tracking and personality profiling
// ================================

/**
 * Enhanced metrics that track corrections, typing patterns, and provide insights
 */
export class TypingAnalytics {
  constructor() {
    this.reset();
  }

  reset() {
    this.keyEvents = [];
    this.corrections = [];
    this.pauseEvents = [];
    this.speedVariations = [];
    this.lastKeyTime = null;
    this.currentPosition = 0;
    this.totalBackspaces = 0;
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 0;
    this.timeSpentCorrecting = 0;
    this.characterVelocities = new Map(); // char -> [times]
    this.problemCharacters = new Map(); // char -> error count
    this.flowInterruptions = 0;
    this.rythmConsistency = [];
    
    // Real-time accuracy tracking
    this.totalCharactersTyped = 0;
    this.correctCharactersTyped = 0;
    this.errorsCommitted = 0;
    this.correctionsMade = 0;
  }

  /**
   * Record a keystroke event
   */
  recordKeystroke(key, target, isCorrect, timestamp, position) {
    const now = timestamp || Date.now();
    const timeDelta = this.lastKeyTime ? now - this.lastKeyTime : 0;

    const event = {
      key,
      target,
      isCorrect,
      timestamp: now,
      position,
      timeDelta,
      correctionMade: key === 'Backspace'
    };

    this.keyEvents.push(event);

    // Track backspaces and corrections
    if (key === 'Backspace') {
      this.totalBackspaces++;
      this.correctionsMade++;
      this.recordCorrection(now, position);
    } else {
      // Count every character typed (except special keys)
      if (key.length === 1) { // Only count actual characters, not special keys
        this.totalCharactersTyped++;
        
        if (isCorrect) {
          this.correctCharactersTyped++;
        } else {
          this.errorsCommitted++;
        }
      }

      // Track character-specific performance
      if (!isCorrect && target) {
        this.problemCharacters.set(target, (this.problemCharacters.get(target) || 0) + 1);
        this.consecutiveErrors++;
        this.maxConsecutiveErrors = Math.max(this.maxConsecutiveErrors, this.consecutiveErrors);
      } else {
        this.consecutiveErrors = 0;
        if (target) {
          if (!this.characterVelocities.has(target)) {
            this.characterVelocities.set(target, []);
          }
          this.characterVelocities.get(target).push(timeDelta);
        }
      }

      // Track rhythm consistency
      if (timeDelta > 0 && timeDelta < 2000) { // Reasonable keystroke interval
        this.rythmConsistency.push(timeDelta);
      }

      // Detect flow interruptions (pauses > 1 second)
      if (timeDelta > 1000) {
        this.flowInterruptions++;
        this.pauseEvents.push({ timestamp: now, duration: timeDelta, position });
      }
    }

    this.lastKeyTime = now;
    this.currentPosition = position;
  }

  /**
   * Record a correction event
   */
  recordCorrection(timestamp, position) {
    this.corrections.push({
      timestamp,
      position,
      correctionIndex: this.corrections.length
    });
  }

  /**
   * Calculate enhanced accuracy that accounts for corrections
   */
  calculateTrueAccuracy(_finalText, _targetText) {
    if (this.totalCharactersTyped === 0) {
      return {
        raw: 100,
        adjusted: 100,
        correctionBonus: 0,
        corrections: 0,
        errorsCommitted: 0,
        correctTyped: 0,
        totalTyped: 0
      };
    }

    // Base accuracy: how many characters were typed correctly initially
    const baseAccuracy = (this.correctCharactersTyped / this.totalCharactersTyped) * 100;
    
    // Calculate correction effectiveness
    // If user makes corrections, they show awareness and effort to fix mistakes
    const correctionRatio = this.correctionsMade / Math.max(this.errorsCommitted, 1);
    
    // Correction bonus: reward users who fix their mistakes (up to +5% bonus)
    const correctionBonus = Math.min(correctionRatio * 5, 5);
    
    // Final accuracy with correction bonus
    const adjustedAccuracy = Math.min(100, baseAccuracy + correctionBonus);

    return {
      raw: Math.round(baseAccuracy),
      adjusted: Math.round(adjustedAccuracy),
      correctionBonus: Math.round(correctionBonus * 10) / 10, // 1 decimal place
      corrections: this.correctionsMade,
      errorsCommitted: this.errorsCommitted,
      correctTyped: this.correctCharactersTyped,
      totalTyped: this.totalCharactersTyped
    };
  }

  /**
   * Analyze typing rhythm and consistency
   */
  analyzeRhythm() {
    if (this.rythmConsistency.length < 10) {
      return { consistency: 0, averageInterval: 0, variance: 0 };
    }

    const intervals = this.rythmConsistency;
    const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, interval) => {
      return acc + Math.pow(interval - average, 2);
    }, 0) / intervals.length;

    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (standardDeviation / average * 100));

    return {
      consistency: Math.round(consistency),
      averageInterval: Math.round(average),
      variance: Math.round(variance),
      standardDeviation: Math.round(standardDeviation)
    };
  }

  /**
   * Get problem characters ranked by error frequency
   */
  getProblemCharacters() {
    return Array.from(this.problemCharacters.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([char, errors]) => ({ char, errors }));
  }

  /**
   * Calculate character-specific speeds
   */
  getCharacterSpeeds() {
    const speeds = new Map();
    
    for (const [char, times] of this.characterVelocities.entries()) {
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const speed = avgTime > 0 ? 60000 / avgTime : 0; // chars per minute
        speeds.set(char, {
          averageTime: Math.round(avgTime),
          speed: Math.round(speed),
          samples: times.length
        });
      }
    }

    return speeds;
  }

  /**
   * Generate typing personality profile
   */
  generatePersonalityProfile() {
    const rhythm = this.analyzeRhythm();
    const correctionRatio = this.totalBackspaces / Math.max(this.keyEvents.length, 1);
    const pauseFrequency = this.flowInterruptions / Math.max(this.keyEvents.length / 10, 1);

    // Determine typing style
    let style = "Balanced";
    let traits = [];

    if (correctionRatio > 0.15) {
      style = "Perfectionist";
      traits.push("High attention to accuracy", "Frequent self-correction", "Quality over speed");
    } else if (correctionRatio < 0.05) {
      style = "Speed Demon";
      traits.push("Prioritizes speed", "Minimal corrections", "Confident typing");
    }

    if (rhythm.consistency > 80) {
      if (style === "Balanced") style = "Metronome";
      traits.push("Highly consistent rhythm", "Steady pace", "Reliable performance");
    } else if (rhythm.consistency < 50) {
      if (style === "Balanced") style = "Variable";
      traits.push("Inconsistent timing", "Burst typing", "Adapts pace frequently");
    }

    if (pauseFrequency > 2) {
      traits.push("Contemplative pauses", "Thinks before typing", "Strategic approach");
    }

    return {
      style,
      traits,
      metrics: {
        correctionRate: Math.round(correctionRatio * 100),
        rhythmConsistency: rhythm.consistency,
        pauseFrequency: Math.round(pauseFrequency),
        maxConsecutiveErrors: this.maxConsecutiveErrors
      }
    };
  }

  /**
   * Generate actionable improvement tips
   */
  generateTips() {
    const tips = [];
    const rhythm = this.analyzeRhythm();
    const correctionRatio = this.totalBackspaces / Math.max(this.keyEvents.length, 1);
    const problemChars = this.getProblemCharacters();

    // Accuracy tips
    if (correctionRatio > 0.2) {
      tips.push({
        category: "Accuracy",
        title: "Slow down for better accuracy",
        description: "You're making many corrections. Try typing 10-15% slower to reduce errors.",
        priority: "high",
        icon: "accuracy"
      });
    }

    // Problem character tips
    if (problemChars.length > 0) {
      tips.push({
        category: "Accuracy",
        title: `Practice problem characters: ${problemChars.slice(0, 3).map(p => p.char).join(', ')}`,
        description: "Focus on these characters that cause the most errors for you.",
        priority: "medium",
        icon: "accuracy"
      });
    }

    // Rhythm tips
    if (rhythm.consistency < 60) {
      tips.push({
        category: "Rhythm",
        title: "Work on consistent timing",
        description: "Practice with a metronome or focus on steady, even keystrokes.",
        priority: "medium",
        icon: "rhythm"
      });
    }

    // Flow tips
    if (this.flowInterruptions > 5) {
      tips.push({
        category: "Flow",
        title: "Reduce hesitation pauses",
        description: "Practice sight-reading to type without stopping to think.",
        priority: "low",
        icon: "flow"
      });
    }

    // Speed tips
    if (rhythm.averageInterval > 300) {
      tips.push({
        category: "Speed",
        title: "Increase typing speed",
        description: "Your intervals are slow. Practice burst typing exercises to build speed.",
        priority: "medium",
        icon: "speed"
      });
    }

    return tips.slice(0, 4); // Return top 4 tips
  }

  /**
   * Get comprehensive analytics summary
   */
  getSummary() {
    return {
      keyEvents: this.keyEvents.length,
      corrections: this.corrections.length,
      backspaces: this.totalBackspaces,
      pauseEvents: this.pauseEvents.length,
      flowInterruptions: this.flowInterruptions,
      maxConsecutiveErrors: this.maxConsecutiveErrors,
      rhythm: this.analyzeRhythm(),
      problemCharacters: this.getProblemCharacters(),
      characterSpeeds: this.getCharacterSpeeds(),
      personality: this.generatePersonalityProfile(),
      tips: this.generateTips()
    };
  }
}

export default TypingAnalytics;