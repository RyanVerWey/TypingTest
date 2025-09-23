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
   * Generate evidence-based typing personality profile
   */
  generatePersonalityProfile() {
    const rhythm = this.analyzeRhythm();
    const correctionRatio = this.totalBackspaces / Math.max(this.keyEvents.length, 1);
    const pauseFrequency = this.flowInterruptions / Math.max(this.keyEvents.length / 50, 1); // Per 50 keystrokes
    const accuracy = this.calculateTrueAccuracy();
    const avgSpeed = rhythm.averageInterval > 0 ? Math.round(60000 / rhythm.averageInterval) : 0; // CPM

    // Determine primary typing archetype based on measurable behaviors
    let type = "Adaptive Typist";
    let traits = [];
    let keyFindings = [];

    // Speed vs Accuracy Analysis
    if (accuracy.adjusted >= 98 && correctionRatio > 0.12) {
      type = "Precision Perfectionist";
      traits.push("Maintains 98%+ accuracy through active correction");
      traits.push("Self-corrects " + Math.round(correctionRatio * 100) + "% of keystrokes");
      traits.push("Quality-focused approach with " + this.correctionsMade + " total corrections");
      keyFindings.push("High correction rate (" + Math.round(correctionRatio * 100) + "%) indicates strong self-monitoring");
    } else if (avgSpeed > 300 && accuracy.adjusted >= 92) { // >60 WPM equivalent
      type = "Velocity Typist";
      traits.push("Achieves " + avgSpeed + " characters per minute");
      traits.push("Maintains " + accuracy.adjusted + "% accuracy at high speed");
      traits.push("Low correction rate (" + Math.round(correctionRatio * 100) + "%) shows confidence");
      keyFindings.push("Speed-accuracy balance favors velocity over perfection");
    }

    // Consistency Analysis
    if (rhythm.consistency >= 85) {
      if (type === "Adaptive Typist") type = "Rhythmic Typist";
      traits.push("Exceptional timing consistency (" + rhythm.consistency + "%)");
      traits.push("Standard deviation of " + rhythm.standardDeviation + "ms between keystrokes");
      traits.push("Reliable " + rhythm.averageInterval + "ms average keystroke interval");
      keyFindings.push("High rhythm consistency suggests developed muscle memory");
    } else if (rhythm.consistency < 50) {
      if (type === "Adaptive Typist") type = "Variable Pace Typist";
      traits.push("Highly variable timing (" + rhythm.consistency + "% consistency)");
      traits.push("Adapts speed based on text complexity");
      traits.push("Wide keystroke interval range (σ=" + rhythm.standardDeviation + "ms)");
      keyFindings.push("Variable pace may indicate strategic speed adjustment");
    }

    // Flow State Analysis
    if (pauseFrequency > 8) { // More than 8 pauses per 50 keystrokes
      traits.push("Contemplative approach with " + this.flowInterruptions + " strategic pauses");
      traits.push("Average pause duration: " + (this.pauseEvents.length > 0 ? Math.round(this.pauseEvents.reduce((sum, p) => sum + p.duration, 0) / this.pauseEvents.length) : 0) + "ms");
      keyFindings.push("Frequent pauses suggest text preview or planning behavior");
    } else if (pauseFrequency < 2) {
      traits.push("Sustained flow state with minimal interruptions");
      traits.push("Only " + this.flowInterruptions + " pauses >1 second in entire session");
      keyFindings.push("Low pause frequency indicates strong sight-reading ability");
    }

    // Error Pattern Analysis
    if (this.maxConsecutiveErrors > 5) {
      keyFindings.push("Max consecutive errors (" + this.maxConsecutiveErrors + ") suggests occasional focus lapses");
    } else if (this.maxConsecutiveErrors <= 1) {
      keyFindings.push("Excellent error recovery - max " + this.maxConsecutiveErrors + " consecutive mistakes");
    }

    // Character-specific insights
    const problemChars = this.getProblemCharacters();
    if (problemChars.length > 0) {
      const topProblem = problemChars[0];
      keyFindings.push("Primary challenge: '" + (topProblem.char === ' ' ? 'SPACE' : topProblem.char) + "' character (" + topProblem.errors + " errors)");
    }

    return {
      type,
      traits: traits.slice(0, 4), // Top 4 most relevant traits
      keyFindings: keyFindings.slice(0, 3), // Top 3 data-driven insights
      metrics: {
        correctionRate: Math.round(correctionRatio * 100),
        rhythmConsistency: rhythm.consistency,
        pauseFrequency: Math.round(pauseFrequency * 10) / 10, // 1 decimal place
        maxConsecutiveErrors: this.maxConsecutiveErrors,
        avgSpeed: avgSpeed,
        accuracy: accuracy.adjusted
      }
    };
  }

  /**
   * Generate comprehensive, evidence-based improvement tips
   */
  generateTips() {
    const tips = [];
    const rhythm = this.analyzeRhythm();
    const correctionRatio = this.totalBackspaces / Math.max(this.keyEvents.length, 1);
    const problemChars = this.getProblemCharacters();
    const accuracy = this.calculateTrueAccuracy();
    const avgInterval = rhythm.averageInterval;

    // Speed Enhancement Tips
    if (avgInterval > 250) {
      tips.push({
        category: "SPEED",
        title: "Increase keystroke velocity",
        description: "Your average keystroke interval is " + avgInterval + "ms. Practice 30-second speed bursts to reduce this to under 200ms.",
        priority: "high",
        metric: "WPM",
        evidence: `Current interval: ${avgInterval}ms, Target: <200ms`
      });
    }

    if (rhythm.consistency < 70) {
      tips.push({
        category: "SPEED", 
        title: "Develop consistent rhythm",
        description: "Your rhythm consistency is " + rhythm.consistency + "%. Use a metronome at 120 BPM to build steady timing patterns.",
        priority: "medium",
        metric: "WPM",
        evidence: `Consistency: ${rhythm.consistency}%, Target: >80%`
      });
    }

    // Accuracy Enhancement Tips
    if (accuracy.adjusted < 95) {
      tips.push({
        category: "ACCURACY",
        title: "Reduce error rate through deliberate practice",
        description: "Your accuracy is " + accuracy.adjusted + "%. Slow down 15-20% and focus on correct finger placement to reach 98%+.",
        priority: "high", 
        metric: "Accuracy",
        evidence: `Current: ${accuracy.adjusted}%, Errors: ${this.errorsCommitted}/${this.totalCharactersTyped}`
      });
    }

    if (problemChars.length > 0) {
      const topProblems = problemChars.slice(0, 3).map(p => p.char === ' ' ? 'SPACE' : p.char).join(', ');
      tips.push({
        category: "ACCURACY",
        title: "Target problem characters: " + topProblems,
        description: "These characters caused " + problemChars.slice(0, 3).reduce((sum, p) => sum + p.errors, 0) + " total errors. Practice them in isolation using typing.com's custom lessons.",
        priority: "high",
        metric: "Accuracy", 
        evidence: `Error distribution: ${problemChars.slice(0, 3).map(p => `${p.char}:${p.errors}`).join(', ')}`
      });
    }

    // Keystroke Efficiency Tips
    if (correctionRatio > 0.15) {
      tips.push({
        category: "EFFICIENCY",
        title: "Minimize correction overhead",
        description: "You made " + this.correctionsMade + " corrections (" + Math.round(correctionRatio * 100) + "% correction rate). Preview upcoming text to reduce backspacing.",
        priority: "medium",
        metric: "Keystrokes",
        evidence: `Corrections: ${this.correctionsMade}, Backspaces: ${this.totalBackspaces}`
      });
    }

    if (this.maxConsecutiveErrors > 3) {
      tips.push({
        category: "EFFICIENCY", 
        title: "Break error cascades",
        description: "Your max consecutive errors was " + this.maxConsecutiveErrors + ". When you make 2+ errors, pause briefly to reset focus.",
        priority: "medium",
        metric: "Keystrokes",
        evidence: `Max consecutive errors: ${this.maxConsecutiveErrors}`
      });
    }

    // Flow State Tips  
    if (this.flowInterruptions > 4) {
      tips.push({
        category: "FLOW",
        title: "Reduce typing interruptions", 
        description: "You paused " + this.flowInterruptions + " times for >1 second. Practice reading 2-3 words ahead to maintain continuous flow.",
        priority: "low",
        metric: "Flow",
        evidence: `Interruptions: ${this.flowInterruptions}, Avg pause: ${this.pauseEvents.length > 0 ? Math.round(this.pauseEvents.reduce((sum, p) => sum + p.duration, 0) / this.pauseEvents.length) : 0}ms`
      });
    }

    // Advanced technique tips based on performance patterns
    if (avgInterval < 200 && accuracy.adjusted > 95) {
      tips.push({
        category: "ADVANCED",
        title: "Focus on text preview skills",
        description: "You have solid fundamentals. Practice reading 4-5 words ahead while maintaining your " + Math.round(60000/avgInterval) + " CPM speed.",
        priority: "low", 
        metric: "Overall",
        evidence: `Speed: ${Math.round(60000/avgInterval)} CPM, Accuracy: ${accuracy.adjusted}%`
      });
    }

    if (rhythm.consistency > 85 && correctionRatio < 0.08) {
      tips.push({
        category: "ADVANCED",
        title: "Work on complex text patterns",
        description: "Your consistency (" + rhythm.consistency + "%) and low correction rate (" + Math.round(correctionRatio*100) + "%) suggest readiness for programming/technical content.",
        priority: "low",
        metric: "Overall", 
        evidence: `Consistency: ${rhythm.consistency}%, Correction rate: ${Math.round(correctionRatio*100)}%`
      });
    }

    // Ergonomic/Health Tips
    if (this.keyEvents.length > 500) {
      tips.push({
        category: "ERGONOMICS",
        title: "Maintain proper posture during long sessions",
        description: "You typed " + this.keyEvents.length + " keystrokes. Take breaks every 500-1000 keystrokes to prevent RSI.",
        priority: "low",
        metric: "Health",
        evidence: `Session keystrokes: ${this.keyEvents.length}`
      });
    }

    // Sort by priority and return top tips
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    let sorted = tips.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    // Ensure at least 4 directives for visual balance
    if (sorted.length < 4) {
      sorted.push({
        category: "GENERAL",
        title: "Establish a structured daily drill block",
        description: "Do one 5‑minute precision warmup, three focused speed bursts, and a cooldown passage to consolidate improvements.",
        priority: sorted.length <= 2 ? 'high' : 'medium',
        metric: 'Overall',
        evidence: 'Balanced regimen'
      });
    }

    return sorted.slice(0, 6); // Return top 6 most relevant tips
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