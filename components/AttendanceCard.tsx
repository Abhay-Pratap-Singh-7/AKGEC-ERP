
import React from 'react';
import { AttendanceSubject } from '../types.ts';

interface Props {
  subject: AttendanceSubject;
  onClick: () => void;
  isActive?: boolean;
}

const AttendanceCard: React.FC<Props> = ({ subject, onClick, isActive }) => {
  const { present, total, percentage } = subject;
  
  const isAtRisk = percentage < 75;
  const isNearRisk = !isAtRisk && percentage <= 80;
  
  const statusColor = isAtRisk ? 'red' : isNearRisk ? 'amber' : 'emerald';
  const colors: Record<string, string> = {
    red: 'bg-red-500 text-red-400 border-red-900/30',
    amber: 'bg-amber-500 text-amber-400 border-amber-900/30',
    emerald: 'bg-emerald-500 text-emerald-400 border-emerald-900/30'
  };

  const getBunkMsg = () => {
    if (isAtRisk) {
      const x = Math.ceil((0.75 * total - present) / 0.25);
      return { text: `Need ${x} class${x > 1 ? 'es' : ''} for 75%`, type: 'urgent' };
    }
    const x = Math.floor((present - 0.75 * total) / 0.75);
    return { 
      text: x > 0 ? `Can safely bunk ${x} class${x > 1 ? 'es' : ''}` : 'Crucial next class',
      type: 'safe'
    };
  };

  const bunk = getBunkMsg();

  return (
    <div 
      onClick={onClick}
      className={`group relative overflow-hidden bg-slate-900 p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer active:scale-[0.98] ${isActive ? 'border-indigo-500 shadow-2xl shadow-indigo-950/40 ring-1 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50'}`}
    >
      {/* Visual Status Indicator Strip */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${isAtRisk ? 'bg-red-500' : isNearRisk ? 'bg-amber-500' : 'bg-emerald-500'} opacity-50`}></div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isAtRisk ? 'bg-red-500' : isNearRisk ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {subject.subjectCode}
            </p>
          </div>
          <h3 className="text-[15px] font-bold text-slate-100 leading-tight group-hover:text-white transition-colors duration-300">
            {subject.subjectName}
          </h3>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black tracking-tighter ${colors[statusColor].split(' ')[1]}`}>
            {percentage.toFixed(1)}<span className="text-xs ml-0.5 opacity-60">%</span>
          </p>
          {!isActive && (
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">View Timeline</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-check-circle text-[10px] text-slate-700"></i>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Present</p>
          </div>
          <p className="text-2xl font-black text-slate-100">{present}</p>
        </div>
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Held</p>
            <i className="fa-solid fa-layer-group text-[10px] text-slate-700"></i>
          </div>
          <p className="text-2xl font-black text-slate-100">{total}</p>
        </div>
      </div>

      <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full ${isAtRisk ? 'bg-red-500' : isNearRisk ? 'bg-amber-500' : 'bg-emerald-500'} shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        {/* 75% Marker Line */}
        <div className="absolute left-[75%] top-0 w-px h-full bg-slate-700/50"></div>
      </div>

      <div className={`py-4 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border transition-all duration-300 ${bunk.type === 'urgent' ? 'bg-red-950/20 border-red-900/30 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-900/30 group-hover:bg-indigo-950/10'}`}>
        {bunk.text}
      </div>

      {isActive && (
        <div className="absolute bottom-4 right-4 animate-bounce">
          <i className="fa-solid fa-chevron-down text-indigo-500 text-xs"></i>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;
