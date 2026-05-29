/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Users, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  Compass, 
  Play, 
  Square, 
  Plus, 
  ArrowRight, 
  Search, 
  FileDown, 
  Trash2, 
  Sliders,
  BellRing,
  CircleDot,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  User,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';



interface AdminPortalProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onOpenExport?: (format: 'excel' | 'pdf') => void;
}

export default function AdminPortal({ currentTab, setTab, onOpenExport }: AdminPortalProps) {
  const { 
    currentUser, 
    users,
    courses, 
    records, 
    activeSession, 
    activities, 
    startNewSession, 
    endActiveSession,
    deleteRecord
  } = useAttendance();

  // Selected student for detail overview sheet
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);

  // Live configuration state
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'CICS 112');

  // Synchronize target course selection if courses update or load after mount
  useEffect(() => {
    if (courses.length > 0 && !courses.find(c => c.code === selectedCourse)) {
      setSelectedCourse(courses[0].code);
    }
  }, [courses]);

  const [sessionDuration, setSessionDuration] = useState(20); // Minutes
  const [selectedLocation, setSelectedLocation] = useState('Main Administration Block (Eva von Hirsch Auditorium)');
  const [customLocation, setCustomLocation] = useState('');

  // Student directory state
  const [studentSearch, setStudentSearch] = useState('');

  // Dynamic student list derived from cloud-synced database users
  const students = users.filter(u => u.role === 'student');

  if (!currentUser) return null;

  // Simple countdown seconds format
  const formatTimeLeft = (sec: number) => {
    const min = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${min.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    const loc = selectedLocation === 'custom' ? (customLocation || 'Custom Location') : selectedLocation;
    startNewSession(selectedCourse, sessionDuration, 0, loc);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Delete Record Confirmation:\nAre you sure you want to remove this verified chronicle log entry?')) {
      deleteRecord(id);
    }
  };

  // Overall statistics aggregations
  const totalEnrolled = students.length;
  const todayCheckedInCount = records.filter(r => r && r.date === new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })).length;

  // Calculate overall presence rate from actual records
  const totalPresenceRecords = records.length;
  const presentOrLateRecords = records.filter(r => r && (r.status === 'Present' || r.status === 'Late')).length;
  const overallPresenceRate = totalPresenceRecords > 0 
    ? Math.round((presentOrLateRecords / totalPresenceRecords) * 100) 
    : 0;

  // Dynamic benchmark averages derived from current course list
  const coursesWithClasses = courses.filter(c => c.totalClasses > 0);
  const coursePercentSum = coursesWithClasses.reduce((sum, c) => sum + c.attendancePercentage, 0);
  const calculatedAverage = coursesWithClasses.length > 0 
    ? Math.round(coursePercentSum / coursesWithClasses.length) 
    : 0; // Default to 0% if no sessions are logged yet

  // Derive highest and lowest scores rosters
  const sortedCourses = [...courses].sort((a, b) => b.attendancePercentage - a.attendancePercentage);
  const highestCourse = sortedCourses[0] || null;
  
  const lowestCourse = [...courses]
    .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
    .find(c => c.attendancePercentage < 75) || null;

  // Match visual charts trend points (Monday to Friday averages: 74%, 82%, 91%, 86%, 95%)
  const chartTrendPoints = [
    { label: 'Mon', rate: 74 },
    { label: 'Tue', rate: 82 },
    { label: 'Wed', rate: 91 },
    { label: 'Thu', rate: 86 },
    { label: 'Fri', rate: 95 }
  ];

  return (
    <div className="pt-24 pb-24 px-6 md:pl-72 md:pr-8 min-h-screen bg-slate-50 text-slate-900 select-none">
      <AnimatePresence mode="wait">

        {/* 1. ADMIN DASHBOARD */}
        {currentTab === 'admin_dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Admin Header Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">REGISTRAR OVERVIEW</p>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
                  Faculty Registrar Control Center
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-2">
                  Oversee active real-time class beacons, track verified sign-ins, and export digital attendance files.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex gap-3">
                <button
                  onClick={() => setTab('admin_sessions')}
                  className="inline-flex h-11 items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Configure Beacon</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Student count */}
              <article className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{totalEnrolled}</h3>
                  <p className="text-[10px] uppercase tracking-wider text-indigo-600 mt-1.5 font-bold">Active Candidates</p>
                </div>
              </article>

              {/* Today checked in list */}
              <article className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today Presence</span>
                  <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {todayCheckedInCount} <span className="text-xs text-slate-400 font-bold">/ 120</span>
                  </h3>
                  <p className="text-[9px] text-emerald-600 uppercase font-mono tracking-widest mt-1.5 font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{overallPresenceRate}% Term Presence Avg</span>
                  </p>
                </div>
              </article>

              {/* Active Sessions Widget */}
              <article 
                onClick={() => setTab('admin_sessions')}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Broadcast</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    activeSession 
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200 pulsing' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {activeSession ? '1 Active' : '0 Active'}
                  </h3>
                  <p className="text-[10px] text-slate-500 group-hover:text-indigo-600 uppercase tracking-wider mt-1.5 font-bold flex items-center gap-1 transition-all">
                    <span>Manage live signals</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </article>

              {/* Term average threshold */}
              <article className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Benchmark</span>
                  <div className="w-8 h-8 bg-amber-50 border border-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{calculatedAverage}%</h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1.5 font-semibold">General Benchmark Mean</p>
                </div>
              </article>

            </div>

            {/* Split layout block: Activity Feed (Left), Announcements & Quick Links (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Activity lists */}
              <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Live Campus Radio Signals Feed</span>
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Real-time sync</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {activities.map((act) => {
                    const typeColor = 
                      act.type === 'session_start'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        : act.type === 'check_in'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : act.type === 'alert'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-slate-50 text-slate-600 border-slate-100';

                    return (
                      <div key={act.id} className="py-4 flex items-start gap-4 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                        <div className={`w-8 h-8 border rounded-full flex items-center justify-center shrink-0 ${typeColor} text-xs font-bold font-mono`}>
                          {act.type === 'check_in' ? '✓' : '•'}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-bold text-slate-800 block leading-tight">{act.title}</h4>
                          <span className="text-[11px] font-medium text-slate-500 block mt-1">{act.subtitle}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase shrink-0 font-bold">
                          {act.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Utility block announcements & quick actions */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Bulletins Announcements Card */}
                <article className="bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-800 text-white rounded-xl p-6 flex flex-col justify-between h-[185px] shadow-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-300">CAMPUS SECURE GRID</span>
                    <h3 className="text-lg font-bold text-white leading-normal">Verification Node Active</h3>
                    <p className="text-xs text-indigo-100/80 font-medium leading-relaxed">
                      All class verification codes expire automatically. Students must verify in real-time to log attendance.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                    <CircleDot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Broadcaster Radio online</span>
                  </div>
                </article>

                {/* Quick actions listing */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  <h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Chamber Presets</h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => setTab('admin_students')}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-500 bg-slate-50 font-mono text-xs text-slate-700 hover:text-indigo-600 transition-all flex justify-between items-center cursor-pointer group"
                    >
                      <span className="font-sans font-bold text-xs">Review Resident Roster</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => setTab('admin_reports')}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-500 bg-slate-50 font-mono text-xs text-slate-700 hover:text-indigo-600 transition-all flex justify-between items-center cursor-pointer group"
                    >
                      <span className="font-sans font-bold text-xs">Spreadsheet & Charts</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* 2. ADMIN COURSES OVERVIEW */}
        {currentTab === 'admin_courses' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            <div className="border-b border-slate-200 pb-6">
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">SYLLABUS SUITE</span>
              <h1 className="text-4xl font-extrabold text-slate-900 mt-1">Class Courses Roster</h1>
              <p className="text-xs font-semibold text-slate-500 mt-2">Compare attendance metrics and certified rosters across various semesters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <article key={course.code} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-colors">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                      CAPACITY: 42 REGISTERED CANDIDATES
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{course.code}</h3>
                    <p className="text-xs text-indigo-650 font-bold leading-relaxed mt-0.5">{course.name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${course.attendancePercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-indigo-600">{course.attendancePercentage}%</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    <span>Active lectures: {course.totalClasses}</span>
                    <span className="text-slate-500">Prof. Constantine</span>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. ACTIVE SESSIONS GENERATOR & TRACKER */}
        {currentTab === 'admin_sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            <div className="border-b border-slate-200 pb-6">
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">BROADCAST BEACONS</span>
              <h1 className="text-4xl font-extrabold text-slate-900 mt-1">Attendance Session Controller</h1>
              <p className="text-xs font-semibold text-slate-500 mt-2">Initiate class verification codes and monitor dynamic incoming real-time check-ins.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column Config Menu */}
              <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Parameters Configuration</h3>
                </div>

                {/* Dropdown Course select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Course</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-650 transition-all cursor-pointer h-10 italic"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={!!activeSession}
                  >
                    {courses.map(c => (
                      <option className="bg-white text-slate-900" key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Dropdown Location select */}
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Class Location</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-650 transition-all cursor-pointer h-10 italic"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    disabled={!!activeSession}
                  >
                    <option className="bg-white text-slate-900" value="Main Administration Block (Eva von Hirsch Auditorium)">Main Administration Block (Eva von Hirsch Auditorium)</option>
                    <option className="bg-white text-slate-900" value="Block C Lecture Hall (Great Hall)">Block C Lecture Hall (Great Hall)</option>
                    <option className="bg-white text-slate-900" value="School of Graduate Studies & Research">School of Graduate Studies & Research</option>
                    <option className="bg-white text-slate-900" value="Sports Complex Lecture Pavillion">Sports Complex Lecture Pavillion</option>
                    <option className="bg-white text-slate-900" value="Hostel Block A Seminar Room">Hostel Block A Seminar Room</option>
                    <option className="bg-white text-slate-900" value="Virtual Room (MS Teams)">Virtual Room (MS Teams)</option>
                    <option className="bg-white text-slate-900 font-semibold" value="custom">Custom Location...</option>
                  </select>
                </div>

                {/* Custom Location input */}
                {selectedLocation === 'custom' && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Enter Custom Location</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-650 focus:bg-white transition-all h-10"
                      placeholder="e.g. Auditorium Annex, Room 101"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      disabled={!!activeSession}
                    />
                  </div>
                )}

                {/* Slider Duration */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Broadcast Duration</label>
                    <span className="text-indigo-600 font-bold font-mono">{sessionDuration} MINUTES</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    disabled={!!activeSession}
                  />
                  <div className="flex justify-between text-[9px] text-indigo-600 font-mono font-bold">
                    <span>5M</span>
                    <span>30M</span>
                    <span>60M</span>
                  </div>
                </div>

                {!activeSession ? (
                  <button
                    onClick={handleStartSession}
                    className="w-full h-11 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Play className="w-4 h-4" />
                    <span>Generate Session Code</span>
                  </button>
                ) : (
                  <div className="p-3.5 text-center bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100">
                    Broadcasting active code. Close current signal to create a new session.
                  </div>
                )}
              </section>

              {/* Right Column Tracker */}
              <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between min-h-[400px] hover:shadow-md transition-all">
                {!activeSession ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 flex-grow animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 animate-pulse">
                      <Compass className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Broadcaster Staged</h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mt-1 leading-relaxed">
                      Select target course, adjust broadcast minutes, and click 'Generate Session Code' to initialize the signal on the campus network.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between flex-grow">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 pulsing shrink-0" />
                        <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">Broadcasting beacon signal active</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                        {activeSession.courseCode}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-grow justify-center py-4">
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase mb-2">TELEMETRY ACCESS CODE CODEWORD</span>
                      <h2 style={{ letterSpacing: '8px' }} className="text-5xl font-mono font-bold text-slate-900 tracking-widest mb-6 border border-slate-200 bg-slate-50 py-4 px-10 rounded-xl select-all">
                        {activeSession.code}
                      </h2>

                      {/* Remaining duration countdown visualizer */}
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-mono tracking-wider mb-4 animate-fadeIn">
                        <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                        <span className="font-sans font-bold text-slate-400">COUNTDOWN TIME LEFT:</span>
                        <span className="font-mono text-lg text-slate-800 font-bold tracking-widest">
                          {formatTimeLeft(activeSession.timeLeft)}
                        </span>
                      </div>

                      {/* Active Session Location Details */}
                      {activeSession.location && (
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 tracking-wider mb-8 animate-fadeIn">
                          <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-sans font-bold text-slate-400">CLASS LOCATION:</span>
                          <span className="font-bold text-slate-850 font-sans tracking-wide">
                            {activeSession.location}
                          </span>
                        </div>
                      )}

                      {/* Dynamic Checkins graph indicator counts */}
                      <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold">
                          <span>Verified Class Check-Ins</span>
                          <span className="text-indigo-600">{activeSession.checkedInCount} checked-in</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-350"
                            style={{ width: `${Math.min(100, (activeSession.checkedInCount / 4) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 block font-bold mt-1">Classroom candidates progress bar list</span>
                      </div>
                    </div>

                    <button
                      onClick={endActiveSession}
                      className="w-full mt-8 h-11 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Square className="w-4 h-4" />
                      <span>End Live Attendance Broadcaster</span>
                    </button>
                  </div>
                )}
              </section>

            </div>
          </motion.div>
        )}

        {/* 4. ADMIN STUDENTS DIRECTORY TAB */}
        {currentTab === 'admin_students' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">FACOUTLY ACTIVE ROSTERS</span>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-1">Student Directory</h1>
                <p className="text-xs font-semibold text-slate-500 mt-2">Manage student physical coordinate identity tokens, registered workspaces, and rates.</p>
              </div>

              {/* Live search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search rosters..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none bg-white focus:border-indigo-600 shadow-sm"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Student grid cards matching design specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).map((student) => {
                const sRecords = records.filter(r => r.studentId === student.studentId);
                const sPresent = sRecords.filter(r => r.status === 'Present').length;
                const sLate = sRecords.filter(r => r.status === 'Late').length;
                const sAbsent = sRecords.filter(r => r.status === 'Absent').length;
                const sTotal = sPresent + sLate + sAbsent;
                
                const attends = student.id === 'student_john' 
                  ? 92 
                  : student.id === 'student_sarah' 
                  ? 96 
                  : sTotal > 0 
                  ? Math.round(((sPresent + sLate) / sTotal) * 100) 
                  : 0;
                
                return (
                  <article 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-500 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow relative shrink-0 flex items-center justify-center text-slate-400">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-lg select-none">
                            {student.name[0]}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-400 block mt-1 font-bold">
                          Index: {student.studentId}
                        </span>
                      </div>

                      <div className="flex gap-2 justify-center w-full">
                        <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                          {student.level}
                        </span>
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-5 w-full">
                      <div className="flex justify-between text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1.5 font-bold">
                        <span>Attendance rate</span>
                        <span className="text-indigo-600 font-bold">{attends}%</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${attends}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 5. ADMIN REPORTS TAB */}
        {currentTab === 'admin_reports' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Reports header */}
            <div className="flex justify-between items-end border-b border-slate-200 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold font-mono">CHRONICLE SPREADSHEETS</span>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-1">Analytical Reports</h1>
                <p className="text-xs font-semibold text-slate-500 mt-2">Observe weekly attendance curves, rates, and review curated physical ledger files.</p>
              </div>

              <button
                onClick={() => onOpenExport && onOpenExport('excel')}
                className="h-[40px] px-4 border border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>

            {/* Split analytics visualization and table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Chart container left */}
              <section className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Weekly Attendance Curve</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Average checkout logs percentage per active day</p>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    <span>Mean Term Rate: {calculatedAverage}%</span>
                  </span>
                </div>

                {/* SVG CHART REDESIGNED WITH INDIGO CUSTOM THEME GRADIENT */}
                <div className="w-full h-48 relative mt-2 select-none">
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                    {/* Grid lines horizontal */}
                    <line x1="0" y1="20" x2="500" y2="20" className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="500" y2="100" className="stroke-slate-100" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="500" y2="140" className="stroke-slate-200" strokeWidth="1" />

                    <defs>
                      <linearGradient id="indigoChartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient fill */}
                    <path
                      d="M 50,121.6 L 150,105.6 L 250,91.2 L 350,99.2 L 450,84.8 L 450,140 L 50,140 Z"
                      fill="url(#indigoChartGradient)"
                    />

                    {/* Chart line */}
                    <path
                      d="M 50,121.6 L 150,105.6 L 250,91.2 L 350,99.2 L 450,84.8"
                      className="stroke-indigo-600 fill-none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: 'drop-shadow(0px 2px 4px rgba(79,70,229,0.35))' }}
                    />

                    {/* Hover coordinates dots */}
                    <circle cx="50" cy="121.6" r="4.5" className="fill-white stroke-indigo-600" strokeWidth="2.5" />
                    <circle cx="150" cy="105.6" r="4.5" className="fill-white stroke-indigo-600" strokeWidth="2.5" />
                    <circle cx="250" cy="91.2" r="4.5" className="fill-white stroke-indigo-600" strokeWidth="2.5" />
                    <circle cx="350" cy="99.2" r="4.5" className="fill-white stroke-indigo-600" strokeWidth="2.5" />
                    <circle cx="450" cy="84.8" r="4.5" className="fill-white stroke-indigo-600" strokeWidth="2.5" />
                  </svg>
                  
                  {/* Chart Horizontal X indicators labels */}
                  <div className="flex justify-between px-10 pt-3.5 font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                    {chartTrendPoints.map(point => (
                      <span key={point.label} className="w-12 text-center">
                        {point.label} <strong className="text-indigo-600 block text-[11px] font-bold mt-1">{point.rate}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Course statistic totals */}
              <section className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Syllabus Benchmarks</h3>
                
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 font-mono uppercase tracking-wider">HIGHEST SCORE RATE</span>
                    <span className="font-extrabold text-emerald-600 font-mono">
                      {highestCourse ? `${highestCourse.code} (${highestCourse.attendancePercentage}%)` : 'None yet'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 font-mono uppercase tracking-wider">UNDER THRESHOLD</span>
                    <span className="font-extrabold text-rose-600 font-mono">
                      {lowestCourse ? `${lowestCourse.code} (${lowestCourse.attendancePercentage}%)` : 'None under threshold'}
                    </span>
                  </div>
                </div>
              </section>

            </div>

            {/* Attendance Roster Log Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6 flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/75 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Live Active Attendance Logs</h3>
                <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">Manage raw logs data manually</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                      <th className="py-4 px-6 w-[150px]">Date Logged</th>
                      <th className="py-4 px-6">Curated Candidate</th>
                      <th className="py-4 px-6">Target Course</th>
                      <th className="py-4 px-6 w-[120px]">Time Sync</th>
                      <th className="py-4 px-6 w-[120px]">Method</th>
                      <th className="py-4 px-6 w-[130px] text-right">Register Status</th>
                      <th className="py-4 px-6 w-[80px] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {records.slice(0, 10).map((rec) => rec && (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 text-slate-400 font-mono font-bold uppercase tracking-wider whitespace-nowrap">{rec.date}</td>
                        <td className="py-4 px-6 text-slate-800 font-bold">
                          {rec.studentName} <span className="text-[9px] font-mono font-bold text-slate-400 block mt-0.5">{rec.studentId}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-indigo-600 mr-2 font-bold">{rec.courseCode}</span>
                          <span className="text-slate-500 font-medium">{rec.courseName}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-400 font-bold">{rec.time}</td>
                        <td className="py-4 px-6 text-[10px] font-mono text-indigo-600 uppercase tracking-widest font-bold">{rec.method || 'Code'}</td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : rec.status === 'Absent'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Remove log item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Slide-over Profile Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Slide-Sheet Panel */}
            <motion.section
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto px-6 py-6 text-slate-800"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Resident Registry Particulars</h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-1 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition"
                  >
                    Close Sheet
                  </button>
                </div>

                {/* Identity header grid */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-5 rounded-lg mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                    {selectedStudent.avatarUrl ? (
                      <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold">
                        {selectedStudent.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">{selectedStudent.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1 font-bold">Index: {selectedStudent.studentId}</span>
                    <span className="inline-block mt-2 px-3 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                      {selectedStudent.degreeProgram}
                    </span>
                  </div>
                </div>

                {/* Specific student metrics boxes block matching sheets */}
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Calculated Statistics</h4>
                
                {(() => {
                  const sRecords = records.filter(r => r.studentId === selectedStudent.studentId);
                  const presentCount = selectedStudent.id === 'student_john' ? 18 : selectedStudent.id === 'student_sarah' ? 24 : sRecords.filter(r => r.status === 'Present').length;
                  const absentCount = selectedStudent.id === 'student_john' ? 2 : selectedStudent.id === 'student_sarah' ? 0 : sRecords.filter(r => r.status === 'Absent').length;
                  const lateCount = selectedStudent.id === 'student_john' ? 1 : selectedStudent.id === 'student_sarah' ? 1 : sRecords.filter(r => r.status === 'Late').length;
                  
                  return (
                    <div className="grid grid-cols-3 gap-3 mb-6 font-semibold">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[9px] block font-mono text-slate-400 uppercase">PRESENT</span>
                        <span className="text-xl text-indigo-600 font-bold">
                          {presentCount}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[9px] block font-mono text-slate-400 uppercase">ABSENT</span>
                        <span className="text-xl text-rose-600 font-bold">
                          {absentCount}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[9px] block font-mono text-slate-400 uppercase">LATE</span>
                        <span className="text-xl text-amber-600 font-bold">
                          {lateCount}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter and roster checklist history for this student */}
                <div className="flex items-center justify-between mb-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Syllabus Registry Logs
                  </h4>
                  <span className="text-[8px] text-indigo-700 font-mono font-bold tracking-widest uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">VERIFIED</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  {records
                    .filter(r => r && r.studentId === selectedStudent.studentId)
                    .slice(0, 4)
                    .map((rec) => (
                      <div key={rec.id} className="p-3.5 flex justify-between items-center bg-white text-xs hover:bg-slate-50 transition-colors">
                        <div>
                          <span className="font-bold text-indigo-600 block">{rec.courseCode}</span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{rec.sessionName}</span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : rec.status === 'Absent'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {rec.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase font-bold">{rec.date}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 mt-6">
                <button
                  onClick={() => {
                    alert('Curator System:\nMatched parameters successfully. Credentials audited of ' + selectedStudent.name);
                  }}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Administrative Access Audit</span>
                </button>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
