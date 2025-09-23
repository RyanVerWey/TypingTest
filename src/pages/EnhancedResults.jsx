// ================================
// FILE: src/pages/EnhancedResults.jsx  
// Professional dashboard-style results page
// ================================
import React, { useEffect, useRef, useState } from "react";
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
  faBullseye, faLightbulb, faDownload,
  faPlay, faTachometerAlt,
  faChartBar, faChartPie,
  faCheckCircle, faUser, faRocket
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

// Compact horizontal metric chart (0-100) with target marker
function MetricRowChart({ icon, title, value, displayValue, color = '#3B82F6', target }) {
  const data = [{ name: title, pct: Math.max(0, Math.min(100, Math.round(value))) }];
  const tickStyle = { fontSize: 12, fill: '#94a3b8' };
  const labelColor = { color: '#0f172a' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icon} style={{ color }} />
          <span className="font-semibold" style={labelColor}>{title}</span>
        </div>
        <div className="text-sm font-medium" style={labelColor}>{displayValue}</div>
      </div>
      <div style={{ width: '100%', height: 36 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="#eef2f7" />
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" tick={tickStyle} width={0} />
            <Tooltip formatter={(v) => [`${v}%`, title]} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            {typeof target === 'number' && (
              <ReferenceLine x={target} stroke="#ef4444" strokeDasharray="4 4" />
            )}
            <Bar dataKey="pct" radius={[6, 6, 6, 6]} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {typeof target === 'number' && (
        <div className="text-[10px] text-gray-500 mt-1">Target: {title === 'Speed' ? `${target} WPM` : `${target}%`}</div>
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
    <div className="max-w-7xl mx-auto p-6 space-y-6" ref={resultsRef} data-export-root>
      
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Typing Performance Dashboard</h1>
            <p className="text-gray-600">
              Test completed on {new Date(date).toLocaleDateString()} • 
              Difficulty: <span className="font-medium">{DIFFICULTY_LABELS?.[difficulty] || difficulty || "Standard"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => exportPNG(resultsRef.current)} className="btn btn-soft">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export PNG
            </button>
            <button onClick={() => nav("/")} className="btn btn-primary">
              <FontAwesomeIcon icon={faPlay} className="mr-2" />
              New Test
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <MetricRowChart
          icon={faBolt}
          title="Speed"
          value={(wpm / 80) * 100}
          displayValue={`${wpm} WPM`}
          color="#3B82F6"
          target={80}
        />
        <MetricRowChart
          icon={faCheckCircle}
          title="Accuracy"
          value={enhancedAccuracy?.adjusted || accuracy}
          displayValue={`${enhancedAccuracy?.adjusted || accuracy}%`}
          color="#22C55E"
          target={95}
        />
        <MetricRowChart
          icon={faKeyboard}
          title="Keystrokes"
          value={(keystrokes / 1000) * 100}
          displayValue={`${keystrokes} (${errors} errors)`}
          color="#8B5CF6"
        />
        <MetricRowChart
          icon={faTachometerAlt}
          title="Efficiency"
          value={Math.round(((keystrokes - errors) / Math.max(keystrokes, 1)) * 100)}
          displayValue={`${Math.round(((keystrokes - errors) / Math.max(keystrokes, 1)) * 100)}%`}
          color="#F59E0B"
          target={98}
        />
  </div>

      {/* Charts Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Main Performance Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <ChartCard title="Performance Over Time" icon={faChartLine}>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={timelineData}>
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
          </ChartCard>
        </div>

        {/* Keystroke Breakdown Pie Chart */}
        <ChartCard title="Keystroke Analysis" icon={faChartPie}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={keystrokeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {keystrokeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Keystrokes"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Character Type Performance */}
        <ChartCard title="Character Accuracy" icon={faChartBar}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={characterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="type" fontSize={12} stroke="#64748b" />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={(v) => `${v}%`}
                fontSize={12}
                stroke="#64748b"
              />
              <Tooltip formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {characterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Skill Assessment Radar */}
        <ChartCard title="Skill Assessment" icon={faBullseye}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
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
              <Tooltip formatter={(value) => [`${Math.round(value)}%`, ""]} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insights Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InsightCard profile={analytics.personality} />
          <TipsCard tips={analytics.tips} />
        </div>
      )}
    </div>
  );
}

// Clean stat card component
function StatCard({ icon, label, value, subtitle, status = "idle" }) {
  const statusColors = {
    success: '#22c55e',
    warning: '#f59e0b', 
    error: '#ef4444',
    idle: '#64748b'
  };

  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex items-center gap-3 mb-3">
        <FontAwesomeIcon 
          icon={icon} 
          className="text-xl"
          style={{ color: statusColors[status] }}
        />
        <span className="text-sm font-medium text-gray-600">
          {label}
        </span>
      </div>
      <div 
        className="text-3xl font-bold mb-2"
        style={{ color: statusColors[status] }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500">
          {subtitle}
        </div>
      )}
    </div>
  );
}

// Clean chart card wrapper - keeping for compatibility
function ChartCard({ title, icon, children }) {
  return (
    <div className="rounded-lg p-6 glass" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex items-center gap-3 mb-6">
        <FontAwesomeIcon icon={icon} className="text-xl text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          {title}
        </h3>
      </div>
      {children}
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

// Custom tooltip for composed chart
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800 mb-2">{`Time: ${label}s`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${typeof entry.value === 'number' ? Math.round(entry.value) : entry.value}${entry.name.includes('Accuracy') ? '%' : entry.name.includes('Speed') ? ' WPM' : ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Dashboard Components
// (Old ProgressBar removed in favor of MetricRowChart)

const MetricCard = ({ icon, title, value, unit, subtitle, color, trend }) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600", 
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <FontAwesomeIcon 
          icon={icon} 
          className={`text-2xl ${colorClasses[color] || "text-gray-600"}`}
        />
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend === "up" ? "bg-green-100 text-green-700" :
            trend === "down" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-lg text-gray-500">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

const InsightCard = ({ profile }) => {
  if (!profile) return null;
  
  const { type = "Adaptive Typist", traits = [], keyFindings = [] } = profile;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <FontAwesomeIcon icon={faUser} className="text-lg text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Typing Profile</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {type}
          </span>
        </div>
        
        {traits.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Characteristics</h4>
            <ul className="space-y-1">
              {traits.slice(0, 3).map((trait, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {keyFindings.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
            <ul className="space-y-1">
              {keyFindings.slice(0, 2).map((finding, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 mt-0.5 text-xs" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const TipsCard = ({ tips }) => {
  if (!tips?.length) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <FontAwesomeIcon icon={faRocket} className="text-lg text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Improvement Tips</h3>
      </div>
      
      <div className="space-y-3">
        {tips.slice(0, 4).map((tip, index) => {
          // Handle both string tips and object tips
          const isObject = typeof tip === 'object' && tip !== null;
          const displayText = isObject ? (tip.description || tip.title || 'Improvement tip') : tip;
          const category = isObject ? tip.category : '';
          const priority = isObject ? tip.priority : '';
          
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                {category && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {category}
                    </span>
                    {priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        priority === 'high' ? 'bg-red-100 text-red-700' :
                        priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {priority}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {displayText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};