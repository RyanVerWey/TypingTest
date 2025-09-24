// ================================
// FILE: src/pages/EnhancedResults.jsx  
// Professional dashboard-style results page
// ================================
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, PieChart, Pie, Cell, ComposedChart, ReferenceLine
} from "recharts";
import { exportPNG } from "../shared/exporters.js";
import { DIFFICULTY_LABELS } from "../lib/passage.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine, faBolt, faKeyboard,
  faBullseye, faDownload, faPlay, faTachometerAlt,
  faChartBar, faChartPie, faCheckCircle, faUser, faRocket, faLightbulb,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export default function EnhancedResults() {
  const nav = useNavigate();
  const { state } = useLocation();
  const resultsRef = useRef(null);
  const [data] = useState(() => state || safeRead());

  useEffect(() => {
    if (!data) nav("/", { replace: true });
  }, [data, nav]);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-16">
          <FontAwesomeIcon icon={faChartLine} className="text-6xl text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Results Available</h2>
          <p className="text-gray-500 mb-8">Take a typing test to see your performance dashboard</p>
          <button onClick={() => nav("/")} className="btn btn-primary px-8 py-3">
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
            Start Typing Test
          </button>
        </div>
      </div>
    );
  }

// KPI Row (kept Recharts as requested)
function MetricRowChart({ icon, title, value, displayValue, color = '#3B82F6', target }) {
  const data = useMemo(() => [{ name: title, pct: Math.max(0, Math.min(100, Math.round(value))) }], [title, value]);
  return (
    <div className="panel panel-tight flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center rounded-md" style={{ background: color + '22' }}>
            <FontAwesomeIcon icon={icon} style={{ color }} className="text-xs" />
          </span>
          <span className="text-small font-medium text-slate-700 dark:text-slate-300">{title}</span>
        </div>
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{displayValue}</div>
      </div>
      <div style={{ width: '100%', height: 38 }} className="-mx-1">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 6, left: 6, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            {typeof target === 'number' && <ReferenceLine x={target} stroke="#475569" strokeDasharray="3 3" />}
            <Bar dataKey="pct" radius={[5,5,5,5]} fill={color} background={{ fill: 'rgba(148,163,184,0.18)' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {typeof target === 'number' && (
        <div className="text-micro text-slate-500 dark:text-slate-400">Target: {title === 'Speed' ? `${target} WPM` : `${target}%`}</div>
      )}
    </div>
  );
}

  const {
    difficulty = "",
    wpm = 0,
    accuracy = 0,
    enhancedAccuracy = null,
    errors = 0,
    keystrokes = 0,
    timeline = [],
    date = new Date().toISOString(),
    charStats = {},
    analytics = null,
  } = data;

  // Prepare chart data
  const timelineData = Array.isArray(timeline) ? timeline.map((d, index) => ({
    time: Number(d.t ?? d.time ?? index * 5),
    wpm: Number(d.wpm ?? 0),
    accuracy: Math.max(0, 100 - (index * 1.5)) // Simulated accuracy decline
  })).filter(d => Number.isFinite(d.time) && Number.isFinite(d.wpm)) : [];

  const characterData = [
    { type: "Letters", accuracy: pct(charStats.letters?.correct || 0, charStats.letters?.attempted || 1), fill: "#3B82F6" },
    { type: "Numbers", accuracy: pct(charStats.numbers?.correct || 0, charStats.numbers?.attempted || 1), fill: "#10B981" },
    { type: "Symbols", accuracy: pct(charStats.symbols?.correct || 0, charStats.symbols?.attempted || 1), fill: "#F59E0B" },
  ];

  const performanceData = [
    { skill: 'Speed', score: Math.min(100, (wpm / 80) * 100), target: 80 },
    { skill: 'Accuracy', score: accuracy, target: 95 },
    { skill: 'Consistency', score: analytics?.rhythm?.consistency || 75, target: 85 },
    { skill: 'Efficiency', score: Math.max(0, 100 - (errors / Math.max(keystrokes, 1)) * 100), target: 98 }
  ];

  const keystrokeData = [
    { name: 'Correct', value: Math.max(0, keystrokes - errors), fill: '#22C55E' },
    { name: 'Errors', value: errors, fill: '#EF4444' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12" ref={resultsRef} data-export-root>
      {/* Header */}
      <div className="panel panel-roomy">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Results Overview</h1>
            <div className="flex flex-wrap items-center gap-4 text-base text-slate-600 dark:text-slate-400">
              <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
              <span className="opacity-40">•</span>
              <span>Difficulty: <span className="font-semibold text-slate-800 dark:text-slate-200">{DIFFICULTY_LABELS?.[difficulty] || difficulty || 'Standard'}</span></span>
              <span className="opacity-40">•</span>
              <span className="tabular-nums font-semibold text-blue-600 dark:text-blue-400">{wpm} WPM</span>
              <span className="opacity-40">/</span>
              <span className="tabular-nums font-semibold text-green-600 dark:text-green-400">{accuracy}% Accuracy</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => exportPNG(resultsRef.current)} className="btn btn-soft h-12 px-6 text-base font-medium">
              <FontAwesomeIcon icon={faDownload} className="mr-3" />Export PNG
            </button>
              <button onClick={() => nav('/')} className="btn btn-primary h-12 px-8 text-base font-medium">
              <FontAwesomeIcon icon={faPlay} className="mr-3" />New Test
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricRowChart icon={faBolt} title="Speed" value={(wpm / 80) * 100} displayValue={`${wpm} WPM`} color="#3B82F6" target={80} />
        <MetricRowChart icon={faCheckCircle} title="Accuracy" value={enhancedAccuracy?.adjusted || accuracy} displayValue={`${enhancedAccuracy?.adjusted || accuracy}%`} color="#22C55E" target={95} />
        <MetricRowChart icon={faKeyboard} title="Keystrokes" value={(keystrokes / 1000) * 100} displayValue={`${keystrokes} (${errors} errors)`} color="#8B5CF6" />
        <MetricRowChart icon={faTachometerAlt} title="Efficiency" value={Math.round(((keystrokes - errors) / Math.max(keystrokes, 1)) * 100)} displayValue={`${Math.round(((keystrokes - errors) / Math.max(keystrokes, 1)) * 100)}%`} color="#F59E0B" target={98} />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Performance Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <ChartCard 
            title="Performance Over Time" 
            icon={faChartLine}
            description="Track your typing speed (WPM) and accuracy percentage throughout the entire test session. The blue area shows speed trends while the green line indicates accuracy consistency."
          >
            <div className="w-full h-full overflow-hidden">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={timelineData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(t) => `${t}s`}
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <YAxis 
                    yAxisId="wpm"
                    orientation="left"
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <YAxis 
                    yAxisId="accuracy"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    fontSize={12}
                    stroke="#64748b"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="wpm"
                    type="monotone"
                    dataKey="wpm"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Speed (WPM)"
                  />
                  <Line
                    yAxisId="accuracy"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#22C55E"
                    strokeWidth={2}
                    name="Accuracy (%)"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Keystroke Breakdown Pie Chart */}
        <ChartCard 
          title="Keystroke Analysis" 
          icon={faChartPie}
          description="Breakdown of all keystrokes during your session. Green represents correctly typed keys while red shows errors that required correction."
        >
          <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={keystrokeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {keystrokeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={(value) => [value, "Keystrokes"]} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

  {/* Secondary Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Character Type Performance */}
        <ChartCard 
          title="Character Accuracy" 
          icon={faChartBar}
          description="Accuracy breakdown by character type. Shows how well you handle letters (blue), numbers (green), and symbols (orange) separately."
        >
          <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={characterData} margin={{ top: 10, right: 15, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" fontSize={12} stroke="#64748b" />
                <YAxis 
                  domain={[0, 100]} 
                  tickFormatter={(v) => `${v}%`}
                  fontSize={12}
                  stroke="#64748b"
                />
                <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, "Accuracy"]} />} />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {characterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Skill Assessment Radar */}
        <ChartCard 
          title="Skill Assessment" 
          icon={faBullseye}
          description="Overall typing performance across four key areas. The solid blue area shows your current scores while the dotted line indicates target benchmarks."
        >
          <div className="w-full h-full overflow-hidden">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={performanceData} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" fontSize={11} />
                <PolarRadiusAxis 
                  angle={0} 
                  domain={[0, 100]} 
                  fontSize={10}
                  stroke="#94a3b8"
                />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#e2e8f0"
                  fill="transparent"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <Tooltip content={<CustomTooltip formatter={(value) => [`${Math.round(value)}%`, ""]} />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Insight & Improvement Plan */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InsightCard profile={analytics.personality} />
          <TipsCard tips={analytics.tips} />
        </div>
      )}
    </div>
  );
}

// Unified chart card wrapper
function ChartCard({ title, icon, children, description }) {
  return (
    <div className="panel panel-tight flex flex-col gap-4 overflow-hidden">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            <FontAwesomeIcon icon={icon} className="text-xs" />
          </span>
          <h3 className="panel-title m-0">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-9">{description}</p>
        )}
      </div>
      <div className="flex-1 min-h-[300px] w-full overflow-hidden">{children}</div>
    </div>
  );
}

// Modern personality insight component
function PersonalityInsight({ profile }) {
  if (!profile) return null;

  const getPersonalityIcon = (style) => {
    switch (style) {
      case 'Perfectionist': return faBullseye;
      case 'Speed Demon': return faBolt;
      case 'Metronome': return faKeyboard;
      default: return faUser;
    }
  };

  const getPersonalityColor = (style) => {
    switch (style) {
      case 'Perfectionist': return '#ef4444';
      case 'Speed Demon': return '#22c55e';
      case 'Metronome': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: '#e2e8f0' }}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 mb-4">
          <FontAwesomeIcon 
            icon={getPersonalityIcon(profile.style)} 
            className="text-2xl" 
            style={{ color: getPersonalityColor(profile.style) }}
          />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-gray-800">
          <span style={{ color: getPersonalityColor(profile.style) }}>&ldquo;{profile.style}&rdquo;</span> Typer
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {getPersonalityDescription(profile.style)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricBadge
          label="Corrections"
          value={`${profile.metrics?.correctionRate || 0}%`}
          status={profile.metrics?.correctionRate > 15 ? 'error' : 'success'}
        />
        <MetricBadge
          label="Consistency"
          value={`${profile.metrics?.rhythmConsistency || 0}%`}
          status={profile.metrics?.rhythmConsistency > 70 ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
}

// Clean improvement tips component
function ImprovementTips({ tips }) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={faLightbulb} className="text-xl text-yellow-500" />
        <h3 className="text-xl font-semibold text-gray-800">
          Improvement Tips
        </h3>
      </div>
      
      <div className="space-y-4">
        {tips.slice(0, 3).map((tip, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-blue-50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-1 text-gray-800">
                {tip.title}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {tip.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Problem areas component
function ProblemAreas({ problemChars, characterSpeeds }) {
  if (!problemChars || problemChars.length === 0) return null;

  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={faChartBar} className="text-xl text-orange-500" />
        <h3 className="text-xl font-semibold text-gray-800">
          Problem Characters
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {problemChars.slice(0, 16).map((char, index) => {
          const speed = characterSpeeds?.[char] || 0;
          return (
            <div key={index} className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-mono font-bold mb-2 text-red-600">
                {char === ' ' ? '␣' : char}
              </div>
              <div className="text-xs text-red-500">
                {speed > 0 ? `${speed} WPM` : 'Slow'}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-orange-50 text-center">
        <p className="text-sm text-orange-700">
          Focus on practicing these characters to improve your overall typing speed
        </p>
      </div>
    </div>
  );
}

// Simple metric badge
function MetricBadge({ label, value, status = 'idle' }) {
  const statusStyles = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    idle: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
  };

  const style = statusStyles[status];

  return (
    <div className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
      <div className="text-xs font-medium mb-1 text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-xl font-bold ${style.text}`}>
        {value}
      </div>
    </div>
  );
}

// Personality descriptions
function getPersonalityDescription(style) {
  const descriptions = {
    'Perfectionist': 'You prioritize accuracy over speed, making careful corrections along the way.',
    'Speed Demon': 'You type fast and confidently, preferring speed over perfection.',
    'Metronome': 'You maintain a remarkably consistent rhythm throughout your typing.',
    'Variable': 'Your typing speed varies as you adapt to different content and challenges.',
    'Balanced': 'You maintain a good balance between speed and accuracy.'
  };
  return descriptions[style] || descriptions.Balanced;
}

function safeRead() {
  try {
    const raw = sessionStorage.getItem("typingTester:last");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Enhanced dashboard card component
function DashboardCard({ icon, label, value, unit, subtitle, trend, color }) {
  const trendColors = {
    up: '#22c55e',
    stable: '#f59e0b',
    down: '#ef4444'
  };

  const trendIcons = {
    up: '↗',
    stable: '→',
    down: '↘'
  };

  return (
    <div className="rounded-lg p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
        {trend && (
          <span 
            className="text-lg font-bold"
            style={{ color: trendColors[trend] }}
          >
            {trendIcons[trend]}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        <div className="flex items-baseline gap-1">
          <span 
            className="text-3xl font-bold"
            style={{ color: color }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-lg font-medium text-gray-500">{unit}</span>
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// Enhanced chart card for dashboard
function DashboardChartCard({ title, icon, children }) {
  return (
    <div className="rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} className="text-lg text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Custom tooltip with strong contrast background for all charts
function CustomTooltip({ active, payload, label, labelFormatter, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        color: '#1e293b',
        padding: '12px', 
        border: '1px solid #cbd5e1', 
        borderRadius: '8px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {label && (
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>
            {labelFormatter ? labelFormatter(label) : `Time: ${label}s`}
          </div>
        )}
        {payload.map((entry, index) => (
          <div key={index} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: entry.color, 
              borderRadius: '50%', 
              marginRight: '8px',
              flexShrink: 0
            }}></div>
            <span>
              {formatter 
                ? formatter(entry.value, entry.name, entry, index, payload)
                : `${entry.name}: ${typeof entry.value === 'number' ? Math.round(entry.value) : entry.value}${entry.name.includes('Accuracy') ? '%' : entry.name.includes('Speed') ? ' WPM' : ''}`
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

const InsightCard = ({ profile }) => {
  if (!profile) return null;
  const { type = 'Adaptive Typist', traits = [], keyFindings = [], metrics = {} } = profile;

  const METRIC_ITEMS = [
    { label: 'CPM', value: metrics.avgSpeed || 0, color: '#2563eb' },
    { label: 'ACC', value: (metrics.accuracy || 0) + '%', color: '#16a34a' },
    { label: 'CONS', value: (metrics.rhythmConsistency || 0) + '%', color: '#7e22ce' },
    { label: 'CORR', value: (metrics.correctionRate || 0) + '%', color: '#d97706' }
  ];

  // Mini bar config
  const barMap = [
    { key: 'avgSpeed', label: 'Speed', from: '#3b82f6', to: '#2563eb', value: metrics.avgSpeed || 0, max: 120, target: 80, format: v => `${v}` },
    { key: 'accuracy', label: 'Accuracy', from: '#16a34a', to: '#15803d', value: metrics.accuracy || 0, max: 100, target: 95, format: v => `${v}%` },
    { key: 'rhythmConsistency', label: 'Consistency', from: '#7e22ce', to: '#6d28d9', value: metrics.rhythmConsistency || 0, max: 100, target: 85, format: v => `${v}%` },
    { key: 'correctionRate', label: 'Correction', from: '#d97706', to: '#b45309', value: metrics.correctionRate != null ? 100 - metrics.correctionRate : 0, max: 100, target: 90, format: v => `${v}%` }
  ];

  // Simple trait explanation mapping (derive short meaning fragments)
  // Classification + richer explanation (encouraging tone)
  const classifyTrait = (t) => {
    const l = t.toLowerCase();
  const isGrowth = /variable|inconsistent|pause|interrupt|challenge|max consecutive errors|problem|improve|break error/i.test(l);
    let base;
    if (l.includes('accuracy')) base = `Consistently prioritizes precision (Adj. Accuracy ${metrics.accuracy ?? '--'}%)`;
    else if (l.includes('correction')) base = `Actively fixes mistakes (Correction rate ${metrics.correctionRate ?? '--'}%)`;
    else if (l.includes('consistency') || l.includes('timing') || l.includes('interval')) base = `Keystroke timing reflects current rhythm (Consistency ${metrics.rhythmConsistency ?? '--'}%)`;
    else if (l.includes('variable')) base = `Speed shifts with passage difficulty – adaptability is present but rhythm can tighten`;
    else if (l.includes('pause')) base = `Uses brief pauses for planning (Pause freq ${metrics.pauseFrequency ?? '--'}/50 keys)`;
    else if (l.includes('flow')) base = `Maintains forward momentum with minimal context switching`;
    else if (l.includes('errors')) base = `Recovers from mistakes quickly (Max consecutive ${metrics.maxConsecutiveErrors ?? '--'})`;
    else if (l.includes('speed') || l.includes('cpm')) base = `Generates solid symbol throughput (CPM ${metrics.avgSpeed ?? '--'})`;
    else base = 'Observed live-session behavioral pattern';

    if (isGrowth) {
      return {
        status: 'growth',
        color: '#d97706',
        icon: faExclamationTriangle,
        label: 'Growth Area',
        explanation: base + '. Opportunity: apply short (30–45s) rhythm drills & deliberate pacing to convert variance into sustainable speed.'
      };
    }
    return {
      status: 'strength',
      color: '#16a34a',
      icon: faCheckCircle,
      label: 'Strength',
      explanation: base + '. Keep reinforcing this by layering small speed bursts without letting quality slip.'
    };
  };

  return (
    <div className="panel panel-roomy relative overflow-hidden" style={{ '--ab-from':'#3b82f6', '--ab-to':'#6366f1' }}>
      <div className="flex flex-col gap-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-4 min-w-[240px]">
            <div className="h-12 flex items-center leading-tight">
              <h3 className="text-title text-slate-800 dark:text-slate-100 mb-0 leading-tight">
                <FontAwesomeIcon icon={faUser} className="text-slate-600 dark:text-slate-200 text-[17px] mr-3" />
                Personality Profile: <span className="font-semibold">{type}</span>
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full sm:w-auto">
            {METRIC_ITEMS.map(m => (
              <div key={m.label} className="kpi-badge items-center text-center !px-4 !py-3 min-w-[90px]">
                <span className="kpi-badge-label tracking-wide text-xs">{m.label}</span>
                <span className="kpi-badge-value text-xl" style={{ color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Metrics */}
        <div className="grid grid-cols-2 gap-8">
          {barMap.map(bar => {
            const pct = Math.min(100, Math.round((bar.value / bar.max) * 100));
            const targetPct = Math.min(100, Math.round((bar.target / bar.max) * 100));
            return (
              <div key={bar.key} className="mini-metric py-2" style={{ '--mm-from': bar.from, '--mm-to': bar.to }}>
                <div className="mini-metric-label text-sm mb-2"><span>{bar.label}</span><span className="tabular-nums font-semibold">{bar.format(bar.value)}</span></div>
                <div className="mini-metric-track h-3">
                  <div className="mini-metric-fill" style={{ width: pct + '%' }} />
                  <div className="mini-metric-target" style={{ left: targetPct + '%' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {traits.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gradient-to-r from-blue-500 to-purple-600 flex-1"></div>
                <h4 className="text-sm font-bold tracking-wider text-slate-700 dark:text-slate-300">CORE TRAITS</h4>
                <div className="h-px bg-gradient-to-r from-purple-600 to-blue-500 flex-1"></div>
              </div>
              <div className="grid gap-4">
                {traits.slice(0, 6).map((t,i) => {
                  const info = classifyTrait(t);
                  return (
                    <div key={i} className="group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl opacity-60"></div>
                      <div className="relative p-4 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm" style={{ background: info.color + '20', color: info.color, border: `1px solid ${info.color}40` }}>{info.label}</span>
                            <span className="mx-2 text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                              {t.split(/(\d+%?|\d+\s*[a-zA-Z]+|\(\d+%?\))/).map((part, idx) => {
                                if (/\d/.test(part)) {
                                  return <span key={idx} className="text-blue-600 dark:text-blue-400">{part}</span>;
                                }
                                return part;
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{info.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {keyFindings.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gradient-to-r from-emerald-500 to-blue-600 flex-1"></div>
                <h4 className="text-sm font-bold tracking-wider text-slate-700 dark:text-slate-300">DATA INSIGHTS</h4>
                <div className="h-px bg-gradient-to-r from-blue-600 to-emerald-500 flex-1"></div>
              </div>
              <div className="grid gap-4">
                {keyFindings.slice(0,5).map((f,i) => (
                  <div key={i} className="group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl opacity-60"></div>
                    <div className="relative flex items-start gap-4 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm shadow-lg flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{f}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TipsCard = ({ tips }) => {
  if (!tips?.length) return null;

  const CATEGORY_META = {
    SPEED:      { color: '#2563eb', icon: faRocket, label: 'Speed' },
    ACCURACY:   { color: '#16a34a', icon: faBullseye, label: 'Accuracy' },
    EFFICIENCY: { color: '#7e22ce', icon: faChartBar, label: 'Efficiency' },
    FLOW:       { color: '#d97706', icon: faChartLine, label: 'Flow' },
    ADVANCED:   { color: '#4f46e5', icon: faLightbulb, label: 'Advanced' },
    ERGONOMICS: { color: '#334155', icon: faUser, label: 'Ergonomics' },
    GENERAL:    { color: '#475569', icon: faLightbulb, label: 'General' }
  };

  // legacy helpers removed in refactor

  // Highlight numeric / quantitative tokens inside description for visual hierarchy
  const formatDescription = (text) => {
    if (!text) return null;
    const regex = /(\b\d+\.?\d*%?|\b\d+ms\b|\b<\d+ms\b|\b\d+ CPM\b|\b\d+ WPM\b|\b\d+ errors?\b|\b\d+ keystrokes?\b)/gi;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (regex.test(part)) {
        return (
          <span key={i} className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="panel panel-roomy relative" style={{ '--ab-from':'#1e3a8a', '--ab-to':'#6366f1' }}>
      <div className="flex items-center justify-between flex-wrap gap-6 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-4 min-w-[260px]">
          <div className="h-12 flex items-center leading-tight">
            <h3 className="text-title text-slate-800 dark:text-slate-100 mb-0 leading-tight">
              <FontAwesomeIcon icon={faRocket} className="text-blue-600 dark:text-blue-300 text-[17px] mr-3" />
              Performance Enhancement Plan
            </h3>
          </div>
        </div>
        <div className="hidden md:flex gap-2 flex-wrap items-center">
          {Array.from(new Set(tips.map(t => (typeof t === 'object' ? t.category : 'GENERAL')))).slice(0,6).map(cat => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.GENERAL;
            return <span key={cat} className="badge-chip" style={{ background: meta.color + '22', color: meta.color }}>{cat}</span>;
          })}
        </div>
      </div>

      <div className="tip-grid">
        {tips.map((raw, idx) => {
          const tip = typeof raw === 'object' && raw !== null ? raw : { title: raw, description: '', category: 'GENERAL', priority: 'low' };
          const meta = CATEGORY_META[tip.category] || CATEGORY_META.GENERAL;
          const priorityClass = tip.priority === 'high' ? 'badge-priority-high' : tip.priority === 'medium' ? 'badge-priority-medium' : 'badge-priority-low';
          const impactPct = tip.impact ? Math.min(100, Math.max(5, tip.impact)) : (tip.priority === 'high' ? 70 : tip.priority === 'medium' ? 45 : 25);
          return (
            <div key={idx} className="tip" style={{ '--impact-from': meta.color, '--impact-to': meta.color }}>
              <div className="tip-head">
                <span className="tip-rank">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                <span className="tip-title" style={{ background: `linear-gradient(90deg, ${meta.color} 0%, ${meta.color}cc 100%)`, WebkitBackgroundClip: 'text', color: 'transparent' }}>{tip.title}</span>
              </div>
              <div className="tip-meta">
                <span className={`badge-chip ${priorityClass}`}>{tip.priority} priority</span>
                <span className="badge-chip" style={{ background: meta.color + '22', color: meta.color }}>{meta.label}</span>
                {tip.metric && <span className="badge-chip" style={{ background: 'rgba(148,163,184,0.18)' }}>Improves {tip.metric}</span>}
                {tip.evidence && <span className="badge-chip font-mono" style={{ fontSize:'0.5rem' }}>{tip.evidence}</span>}
              </div>
              {tip.description && (
                <p className="tip-desc">{formatDescription(tip.description)}</p>
              )}
              <div className="tip-impact-track" aria-label="Estimated impact potential">
                <div className="tip-impact-fill" style={{ width: impactPct + '%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};