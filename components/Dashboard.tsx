
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Student, AttendanceData, AttendanceSubject, DayAttendance } from '../types.ts';
import AttendanceCard from './AttendanceCard.tsx';

interface Props {
  user: Student;
  onLogout: () => void;
}

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const Dashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: user.accessToken,
          user_id: user.userId,
          context_id: user.contextId,
          x_token: user.xToken,
          session_id: user.sessionId
        })
      });
      
      const rawData = await res.json();
      if (!res.ok) throw new Error(rawData.error || "Sync failed.");

      const mappedSubjects: AttendanceSubject[] = (rawData.summary || []).map((item: any) => ({
        subjectName: item.name,
        subjectCode: item.code,
        present: item.presentLeactures,
        absent: item.absentLeactures,
        total: item.totalLeactures,
        percentage: item.percentageAttendance,
        subjectId: item.subjectId || item.code
      }));

      setData({
        subjects: mappedSubjects,
        overallPercentage: rawData.overall.percentage || 0,
        totalPresent: rawData.overall.present || 0,
        totalLectures: rawData.overall.total || 0,
        dailyLogs: rawData.daily_logs || [],
        extraLectures: [],
        profile: rawData.profile || {}
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const getColor = (p: number) => p < 75 ? '#ef4444' : p <= 80 ? '#f59e0b' : '#10b981';

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id === selectedSubjectId ? null : id);
  };

  const selectedSubject = data?.subjects.find(s => s.subjectId === selectedSubjectId);
  const filteredLogs = data?.dailyLogs.filter(log => log.subjectName === selectedSubject?.subjectName)
    .sort((a, b) => new Date(b.absentDate).getTime() - new Date(a.absentDate).getTime());

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-bolt text-indigo-400 animate-pulse"></i>
          </div>
        </div>
        <p className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Synchronizing Records</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center">
        <div className="bg-slate-900 border border-red-900/20 p-12 rounded-[2.5rem] max-w-sm w-full shadow-2xl">
          <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-6"></i>
          <h2 className="text-xl font-bold text-white mb-2">Sync Interrupted</h2>
          <p className="text-sm text-slate-500 mb-8">{error}</p>
          <button onClick={fetchAttendance} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-colors">Retry Sync</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in bg-slate-950 min-h-screen">
      <header className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {data?.profile.firstName ? `Hi, ${data.profile.firstName}` : 'Student Dashboard'}
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
            AKGEC Portal • ERP Sync Active
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 transition-all ${showProfile ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' : 'text-slate-500 hover:text-indigo-400 hover:border-slate-700'}`}
          >
            <i className={`fa-solid ${showProfile ? 'fa-id-card-clip' : 'fa-id-card'} text-sm`}></i>
          </button>
          <button 
            onClick={fetchAttendance}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-slate-700 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <i className="fa-solid fa-rotate-right text-xs"></i>
          </button>
          <button onClick={onLogout} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-slate-700 transition-all">
            <i className="fa-solid fa-power-off text-sm"></i>
          </button>
        </div>
      </header>

      {data && showProfile && (
        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl transition-all">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-800 pb-4">Academic Background</h3>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">JEE Rank</p><p className="font-bold text-slate-100">{data.profile.jeeRank || 'N/A'}</p></div>
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">Mobile</p><p className="font-bold text-slate-100">{data.profile.mobileNo || 'N/A'}</p></div>
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">X Score</p><p className="font-bold text-slate-100">{data.profile.tenthPercentage}%</p></div>
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">XII Score</p><p className="font-bold text-slate-100">{data.profile.twelfthPercentage}%</p></div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-800 pb-4">Personal Records</h3>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">Father</p><p className="font-bold text-slate-100 truncate">{data.profile.fatherName}</p></div>
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">Blood</p><p className="font-bold text-slate-100">{data.profile.bloodGroup}</p></div>
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">Bank</p><p className="font-bold text-slate-100 truncate">{data.profile.bankName}</p></div>
              <div><p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-1.5">DOB</p><p className="font-bold text-slate-100">{data.profile.dob}</p></div>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-16 pb-24">
          {/* Summary Hub */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${selectedSubjectId ? 'opacity-0 h-0 overflow-hidden mb-0 scale-95 pointer-events-none' : 'opacity-100 mb-16 scale-100'}`}>
            <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 flex flex-col items-center justify-center shadow-xl">
              <div className="w-36 h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{v: data.overallPercentage}, {v: 100-data.overallPercentage}]} innerRadius={48} outerRadius={58} paddingAngle={0} dataKey="v" startAngle={90} endAngle={450}>
                      <Cell fill={getColor(data.overallPercentage)} stroke="none" /><Cell fill="#0f172a" stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{data.overallPercentage.toFixed(1)}%</span>
                  <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Aggregate</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center shadow-xl">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Presence Ratio</p>
              <p className="text-4xl font-black text-white">{data.totalPresent} <span className="text-slate-800 font-medium text-2xl mx-1">/</span> <span className="text-slate-500 text-2xl">{data.totalLectures}</span></p>
              <div className="h-2 w-full bg-slate-950 rounded-full mt-6 overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000" style={{ width: `${(data.totalPresent/data.totalLectures)*100}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center shadow-xl">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Risk Evaluation</p>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{data.overallPercentage >= 75 ? 'Optimal Standing' : 'Critical Warning'}</h3>
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-2xl w-fit border ${data.overallPercentage < 75 ? 'bg-red-950/20 border-red-900/30 text-red-500' : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-500'}`}>
                {data.overallPercentage < 75 ? 'Below 75% Threshold' : 'Above Academic Minimum'}
              </div>
            </div>
          </div>

          <section>
            <div className={`flex items-center justify-between mb-10 px-4 transition-opacity duration-500 ${selectedSubjectId ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Subject Analysis</h2>
              <div className="h-px bg-slate-800 flex-1 mx-8"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{data.subjects.length} Enrollments</span>
            </div>
            
            {/* Subject Grid with items-stretch to enforce identical card height in a row */}
            <div className={`grid gap-8 items-stretch transition-all duration-700 ${selectedSubjectId ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {data.subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.subjectId;
                const isHidden = selectedSubjectId && !isSelected;
                return (
                  <div key={sub.subjectId} className={`transition-all duration-700 ${isHidden ? 'opacity-0 h-0 overflow-hidden absolute pointer-events-none' : 'opacity-100 relative'}`}>
                    <div className="flex flex-col h-full gap-6">
                      {isSelected && (
                        <button onClick={() => setSelectedSubjectId(null)} className="flex items-center gap-3 text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 w-fit hover:translate-x-[-6px] transition-transform">
                          <i className="fa-solid fa-chevron-left"></i> Return to Grid
                        </button>
                      )}
                      
                      <div className="h-full">
                        <AttendanceCard 
                          subject={sub} 
                          onClick={() => handleSubjectSelect(sub.subjectId!)}
                          isActive={isSelected}
                        />
                      </div>

                      {isSelected && (
                        <div className="animate-fade-in-up bg-slate-900 border border-slate-800 rounded-[3rem] p-10 mt-4 shadow-3xl">
                           <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Session History</p>
                               <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest">Chronological Log</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Entries</p>
                                <p className="text-3xl font-black text-indigo-500">{filteredLogs?.length}</p>
                             </div>
                           </div>
                           
                           {!filteredLogs || filteredLogs.length === 0 ? (
                             <div className="py-24 text-center bg-slate-950/40 rounded-[2.5rem] border border-dashed border-slate-800">
                               <i className="fa-solid fa-calendar-xmark text-slate-800 text-4xl mb-6"></i>
                               <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest">No Log Data Found</p>
                             </div>
                           ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {filteredLogs.map((log, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all group">
                                   <div className="flex items-center gap-6">
                                      <div className={`w-3 h-3 rounded-full ${!log.isAbsent ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_12px_rgba(0,0,0,0.6)]`}></div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-200">{log.absentDate}</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Normal Session</p>
                                      </div>
                                   </div>
                                   <div className={`px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest border ${!log.isAbsent ? 'text-emerald-500 border-emerald-950 bg-emerald-500/5' : 'text-red-500 border-red-950 bg-red-500/5'}`}>
                                      {!log.isAbsent ? 'PRESENT' : 'ABSENT'}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
