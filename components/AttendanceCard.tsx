
import React from 'react';
import { AttendanceSubject } from '../types.ts';

interface Props {
  subject: AttendanceSubject;
  onClick: () => void;
  isActive?: boolean;
}

const AttendanceCard: React.FC<Props> = ({ subject, onClick, isActive }) => {
  const { present, total, percentage } = subject;
  
  const statusColor = percentage < 75 ? 'red' : percentage <= 80 ? 'amber' : 'emerald';
  const colors: Record<string, string> = {
    red: 'bg-red-500 text-red-600 shadow-red-500/10',
    amber: 'bg-amber-500 text-amber-600 shadow-amber-500/10',
    emerald: 'bg-emerald-500 text-emerald-600 shadow-emerald-500/10'
  };

  const getBunkMsg = () => {
    if (percentage < 75) {
      const x = Math.ceil((0.75 * total - present) / 0.25);
      return `Need ${x} class${x > 1 ? 'es' : ''} for 75%`;
    }
    const x = Math.floor((present - 0.75 * total) / 0.75);
    return x > 0 ? `Can safely bunk ${x} class${x > 1 ? 'es' : ''}` : 'Crucial next class';
  };

  return (
    <div 
      onClick={onClick}
      className={`group bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:border-indigo-100 transition-all duration-500 cursor-pointer active:scale-[0.98] ${isActive ? 'border-indigo-600 shadow-indigo-100/30 ring-1 ring-indigo-50 shadow-lg' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-sm font-bold text-gray-800 leading-snug truncate group-hover:text-indigo-600 transition-colors">
            {subject.subjectName}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            {subject.subjectCode}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xl font-black ${colors[statusColor].split(' ')[1]}`}>
            {percentage.toFixed(1)}%
          </span>
          {!isActive && (
            <span className="text-[7px] font-bold text-gray-300 uppercase tracking-widest mt-1 group-hover:text-indigo-400 transition-colors">Click for details</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Attended</p>
          <p className="text-xl font-bold text-gray-800">{present}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Total Held</p>
          <p className="text-xl font-bold text-gray-800">{total}</p>
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full ${colors[statusColor].split(' ')[0]} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className={`py-3 px-4 rounded-2xl text-[10px] font-bold text-center bg-gray-50 transition-all duration-300 group-hover:bg-indigo-50/30 border border-transparent group-hover:border-indigo-100 text-gray-500 group-hover:text-indigo-600`}>
        {getBunkMsg()}
      </div>
    </div>
  );
};

export default AttendanceCard;
