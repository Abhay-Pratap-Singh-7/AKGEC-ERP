
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

  // Automatically fetch on mount
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
        <p className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing ERP Data...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-12 text-center border border-red-900/20 shadow-2xl shadow-red-950/20">
          <div className="w-16 h-16 bg-red-950/30 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <i className="fa-solid fa-circle-exclamation text-xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Sync Failed</h2>
          <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium">
            {error}
          </p>
          <button 
            onClick={fetchAttendance}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-950/40"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in relative bg-slate-950">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {data?.profile.firstName ? `Hello, ${data.profile.firstName}` : 'Student Dashboard'}
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            AKGEC ERP • {user.userId}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 transition-all shadow-sm ${showProfile ? 'text-indigo-400 border-indigo-900/50 shadow-indigo-900/20' : 'text-slate-500 hover:text-indigo-400'}`}
            title="View Profile"
          >
            <i className={`fa-solid ${showProfile ? 'fa-id-card-clip' : 'fa-id-card'} text-sm`}></i>
          </button>
          <button 
            onClick={fetchAttendance}
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-indigo-400 transition-all shadow-sm ${loading ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <i className="fa-solid fa-rotate-right text-xs"></i>
          </button>
          <button 
            onClick={onLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition-all shadow-sm"
            title="Logout"
          >
            <i className="fa-solid fa-power-off text-sm"></i>
          </button>
        </div>
      </header>

      {/* Profile Section */}
      {data && showProfile && (
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-sm transition-all ease-in-out duration-500">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-4">Academic History</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">JEE Rank</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.jeeRank || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.mobileNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">10th Marks</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.tenthPercentage}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">12th Marks</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.twelfthPercentage}%</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-4">Personal & Banking</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Father's Name</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.fatherName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Blood Group</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bank Account</p>
                <p className="text-sm font-bold text-slate-100 leading-tight">{data.profile.bankName}<br/><span className="text-slate-500 text-xs">{data.profile.ifscCode}</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</p>
                <p className="text-lg font-bold text-slate-100">{data.profile.dob}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-12 pb-20">
          {/* Main Stats Row */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500 ease-in-out ${selectedSubjectId ? 'opacity-0 h-0 overflow-hidden pointer-events-none mb-0' : 'opacity-100 mb-12'}`}>
            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-800 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{value: data.overallPercentage}, {value: 100 - data.overallPercentage}]}
                      innerRadius={55} outerRadius={70} paddingAngle={0} dataKey="value" startAngle={90} endAngle={450}
                    >
                      <Cell fill={getColor(data.overallPercentage)} stroke="none" />
                      <Cell fill="#0f172a" stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-white tracking-tighter">
                    {data.overallPercentage.toFixed(2)}%
                  </span>
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-0.5">Overall</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-800 flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Attendance Ring</p>
                   <p className="text-3xl font-black text-white">{data.totalPresent} <span className="text-slate-700 font-medium">/ {data.totalLectures}</span></p>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(data.totalPresent / data.totalLectures) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-800 flex flex-col justify-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Academic Standing</p>
              <h3 className="text-2xl font-black mb-4 text-white">
                {data.overallPercentage >= 75 ? 'Safe Territory' : 'At Risk'}
              </h3>
              <div className="flex">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${data.overallPercentage < 75 ? 'bg-red-950/30 text-red-400 border border-red-900/30' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30'}`}>
                  {data.overallPercentage < 75 ? 'Action Required' : 'Optimal Standing'}
                </div>
              </div>
            </div>
          </div>

          {/* Subject Grid Area */}
          <section>
            <div className={`flex items-center justify-between mb-8 px-2 transition-opacity duration-500 ${selectedSubjectId ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subject Analysis</h2>
              <div className="h-px bg-slate-800 flex-1 mx-6"></div>
              <span className="text-xs font-bold text-slate-400">{data.subjects.length} Courses</span>
            </div>
            
            <div className={`grid grid-cols-1 gap-8 items-start transition-all duration-500 ease-in-out ${selectedSubjectId ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {data.subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.subjectId;
                const isHidden = selectedSubjectId && !isSelected;
                
                return (
                  <div 
                    key={sub.subjectId} 
                    className={`transition-all duration-500 ease-in-out transform ${isHidden ? 'opacity-0 h-0 overflow-hidden scale-95 pointer-events-none absolute' : 'opacity-100 relative'}`}
                  >
                    <div className="flex flex-col gap-6">
                      {isSelected && (
                        <button 
                          onClick={() => setSelectedSubjectId(null)}
                          className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 hover:translate-x-[-4px] transition-transform w-fit"
                        >
                          <i className="fa-solid fa-arrow-left"></i> Back to all subjects
                        </button>
                      )}
                      
                      <AttendanceCard 
                        subject={sub} 
                        onClick={() => handleSubjectSelect(sub.subjectId!)}
                        isActive={isSelected}
                      />

                      {/* Daily Logs View */}
                      {isSelected && (
                        <div className="animate-fade-in-up bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-sm p-10 mt-2 transition-all ease-in-out duration-700">
                           <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                             <div>
                               <h3 className="text-xs font-black text-white uppercase tracking-widest">Chronological Timeline</h3>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Detailed Logs • Newest First</p>
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Recorded Entries</p>
                               <p className="text-lg font-black text-indigo-400">{filteredLogs?.length || 0}</p>
                             </div>
                           </div>
                           
                           {!filteredLogs || filteredLogs.length === 0 ? (
                             <div className="text-center py-20 bg-slate-950 rounded-3xl border border-dashed border-slate-800">
                               <i className="fa-solid fa-calendar-xmark text-slate-800 text-3xl mb-4"></i>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Daily Data Found</p>
                             </div>
                           ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {filteredLogs.map((log, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-indigo-900 hover:shadow-md transition-all duration-300 group">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-3 h-3 rounded-full ${!log.isAbsent ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'}`}></div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-200">{log.absentDate}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Class Session</p>
                                      </div>
                                   </div>
                                   <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${!log.isAbsent ? 'text-emerald-400 bg-emerald-950/30' : 'text-red-400 bg-red-950/30'}`}>
                                      {!log.isAbsent ? 'Present' : 'Absent'}
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

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
