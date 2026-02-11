
import React from 'react';
import { AttendanceSubject } from '../types.ts';

interface Props {
  subject: AttendanceSubject;
  onClick: () => void;
  isActive?: boolean;
}

const AttendanceCard: React.FC<Props> = ({ subject, onClick, isActive }) => {
  const { present, total, percentage, subjectName, subjectCode } = subject;
  
  const isAtRisk = percentage < 75;
  const isNearRisk = !isAtRisk && percentage <= 80;
  
  const statusColor = isAtRisk ? 'red' : isNearRisk ? 'amber' : 'emerald';
  const colorMap: Record<string, { text: string, bg: string, border: string, ring: string }> = {
    red: { 
      text: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/40',
      ring: 'ring-red-500/20'
    },
    amber: { 
      text: 'text-amber-400', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/40',
      ring: 'ring-amber-500/20'
    },
    emerald: { 
      text: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/40',
      ring: 'ring-emerald-500/20'
    }
  };

  const getBunkMsg = () => {
    if (isAtRisk) {
      const x = Math.ceil((0.75 * total - present) / 0.25);
      return `Critical: Attend ${x} more session${x > 1 ? 's' : ''} to reach 75%.`;
    }
    const x = Math.floor((present - 0.75 * total) / 0.75);
    return x > 0 
      ? `Safe: You can safely bunk ${x} more class${x > 1 ? 'es' : ''}.` 
      : `Warning: On the margin. Next session is mandatory.`;
  };

  const firstLetter = subjectName.charAt(0).toUpperCase();

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col h-full bg-slate-900 rounded-[2.5rem] border transition-all duration-500 cursor-pointer active:scale-[0.98] ${isActive ? 'border-indigo-500 shadow-2xl shadow-indigo-950/50 ring-2 ring-indigo-500/10' : `${colorMap[statusColor].border} hover:shadow-2xl hover:shadow-slate-950/60`}`}
    >
      <div className="flex flex-col flex-1 p-8">
        {/* Header: Logo and Status Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black ${colorMap[statusColor].bg} ${colorMap[statusColor].text} border ${colorMap[statusColor].border} shadow-inner`}>
            {firstLetter}
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-slate-800 group-hover:text-slate-200 transition-colors">
            {isAtRisk ? 'At Risk' : isNearRisk ? 'Warning' : 'Safe'}
          </div>
        </div>

        {/* Content: Subject Title and Subtitle */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            {subjectCode}
          </p>
          <h3 className="text-lg font-bold text-slate-100 leading-tight group-hover:text-white transition-colors">
            {subjectName}
          </h3>
        </div>

        {/* Insight Paragraph */}
        <div className="mb-8 flex-1">
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium group-hover:text-slate-400 transition-colors">
            {getBunkMsg()}
          </p>
        </div>

        {/* Footer: Stats Section inspired by Airbnb bottom row */}
        <div className="pt-6 border-t border-slate-800 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Current %</span>
            <span className={`text-2xl font-black tracking-tighter ${colorMap[statusColor].text}`}>
              {percentage.toFixed(1)}<span className="text-xs ml-0.5 opacity-60">%</span>
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Fractions</span>
            <div className="px-5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-black text-slate-200 group-hover:border-slate-700 transition-all">
              {present} <span className="text-slate-700">/</span> {total}
            </div>
          </div>
        </div>
      </div>

      {/* Active Selection Glow */}
      {isActive && (
        <div className="absolute top-4 right-4 animate-pulse">
          <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
