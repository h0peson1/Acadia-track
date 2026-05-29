/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  CheckSquare, 
  History, 
  User, 
  MapPin, 
  Badge, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Navigation,
  FileDown,
  Mail,
  Lock,
  ChevronRight,
  ChevronLeft,
  Settings,
  GraduationCap,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceRecord } from '../types';

interface StudentPortalProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onOpenExport?: (format: 'excel' | 'pdf') => void;
}

export default function StudentPortal({ currentTab, setTab, onOpenExport }: StudentPortalProps) {
  const { 
    currentUser, 
    courses, 
    records, 
    activeSession, 
    markAttendance,
    changePassword 
  } = useAttendance();

  // History filtering state
  const [semesterFilter, setSemesterFilter] = useState('Spring 2024');
  const [courseFilter, setCourseFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Code verification state
  const [codeBoxes, setCodeBoxes] = useState(['', '', '', '', '', '']);
  const [activeStep, setActiveStep] = useState(1); // 1: Code, 3: Success
  const [lastRecordedRecord, setLastRecordedRecord] = useState<AttendanceRecord | null>(null);

  const boxRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  if (!currentUser) return null;

  // Clean OTP Inputs
  const handleBoxChange = (val: string, index: number) => {
    if (/^[0-9]$/.test(val) || val === '') {
      const updated = [...codeBoxes];
      updated[index] = val;
      setCodeBoxes(updated);
      
      // Auto move focus
      if (val !== '' && index < 5) {
        boxRefs[index + 1].current?.focus();
      }
    }
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (codeBoxes[index] === '' && index > 0) {
        const updated = [...codeBoxes];
        updated[index - 1] = '';
        setCodeBoxes(updated);
        boxRefs[index - 1].current?.focus();
      }
    }
  };

  const verifySubmittedCode = () => {
    const fullCode = codeBoxes.join('');
    if (fullCode.length < 6) return;

    if (!activeSession) {
      alert("Verification Failed:\nNo live session is active on the campus grid. Please log in as Admin and generate a code first.");
      return;
    }

    if (activeSession.code !== fullCode) {
      alert(`Verification Failed:\nCode ${fullCode} is incorrect. Hint: System override code is ${activeSession.code}`);
      return;
    }

    // Mark attendance immediately and go directly to Step 3
    const result = markAttendance(fullCode);
    if (result.success && result.record) {
      setLastRecordedRecord(result.record);
      setActiveStep(3);
    } else {
      alert(result.message || "Failed to mark attendance.");
    }
  };

  const nextStep = (step: number) => {
    setActiveStep(step);
  };

  const resetFlowAndReturn = () => {
    setCodeBoxes(['', '', '', '', '', '']);
    setActiveStep(1);
    setTab('student_dashboard');
  };

  // Filter logic for attendance records
  const filteredRecords = records.filter(rec => {
    if (rec.studentId !== currentUser.studentId) return false;
    if (semesterFilter !== 'Spring 2024') return false;
    if (courseFilter !== 'All' && rec.courseCode !== courseFilter) return false;
    
    if (monthFilter !== 'All') {
      const recMonth = rec.date.split(' ')[0];
      if (recMonth !== monthFilter) return false;
    }
    return true;
  });

  // Calculate stats logic
  const studentRecords = records.filter(r => r && r.studentId === currentUser.studentId);
  const presentCount = studentRecords.filter(r => r.status === 'Present').length;
  const absentCount = studentRecords.filter(r => r.status === 'Absent').length;
  const lateCount = studentRecords.filter(r => r.status === 'Late').length;
  const overallRate = studentRecords.length > 0 
    ? Math.round(((presentCount + lateCount) / studentRecords.length) * 100) 
    : 0;

  // Pagination bounds
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="pt-24 pb-24 px-6 md:pl-72 md:pr-8 min-h-screen bg-slate-50 text-slate-900 select-none">
      <AnimatePresence mode="wait">
        
        {/* 1. STUDENT DASHBOARD TAB */}
        {currentTab === 'student_dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Welcome Frame with Badge */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">STUDENT WORKSPACE</p>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mt-1">
                  Welcome back, <span className="text-indigo-600">{currentUser.name}</span>
                </h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2 flex items-center gap-2">
                  <Badge className="w-4 h-4 text-indigo-500" />
                  <span>Verified Index Number: {currentUser.studentId}</span>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setTab('student_attendance')}
                  className="h-11 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Mark Active Attendance</span>
                </button>
              </div>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Overall Attendance Left Bento Box */}
              <section className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CHRONOLOGICAL RATIO</h3>
                  <p className="font-extrabold text-lg text-slate-800 mt-0.5">Overall Presence</p>
                </div>
                
                {/* SVG Circular chart representing overall rate */}
                <div className="flex-grow flex items-center justify-center my-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-slate-100 fill-none"
                        strokeWidth="5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-indigo-600 fill-none"
                        strokeWidth="6"
                        strokeDasharray="263.8"
                        strokeDashoffset={263.8 * (1 - overallRate / 100)}
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0px 0px 4px rgba(79,70,229,0.2))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{overallRate}%</span>
                      <span className="text-[8px] font-bold tracking-widest text-indigo-600 uppercase mt-0.5">TERMS METRIC</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Target: 85%</span>
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    <Navigation className="w-2.5 h-2.5 rotate-45" />
                    <span>✓ Good Standing</span>
                  </span>
                </div>
              </section>

              {/* Stats & Classes Column (Spans 8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Visual statistics boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Present counts */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">REGISTERED</span>
                    </div>
                    <h4 className="text-4xl font-extrabold text-slate-900 leading-none">{presentCount}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Days Present</p>
                  </div>

                  {/* Absent counts */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                        <XCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">REGISTERED</span>
                    </div>
                    <h4 className="text-4xl font-extrabold text-slate-900 leading-none">{absentCount}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Days Absent</p>
                  </div>

                  {/* Late counts */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">REGISTERED</span>
                    </div>
                    <h4 className="text-4xl font-extrabold text-slate-900 leading-none">{lateCount}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Days Late</p>
                  </div>
                </div>

                {/* Courses block with micro progress percentage */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex-grow pb-4">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">SUITE PREFERENCES</span>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 mt-0.5">Enrolled Semester Courses</h3>
                    </div>
                    <button 
                      onClick={() => setTab('student_history')}
                      className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Chronicles</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="divide-y divide-slate-100 px-6 py-2">
                    {courses.map((course) => (
                      <div key={course.code} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-1/3">
                          <div className="w-9 h-9 border border-indigo-100 bg-indigo-50/50 text-indigo-600 font-mono font-bold flex items-center justify-center text-xs rounded">
                            {course.code.slice(0, 3)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{course.code}</span>
                            <span className="text-[11px] text-slate-500 font-medium block">{course.name}</span>
                          </div>
                        </div>
                        
                        <div className="w-full sm:w-1/2 flex items-center gap-4">
                          <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                              style={{ width: `${course.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-indigo-600 w-8 text-right">{course.attendancePercentage}%</span>
                        </div>
                        
                        <div className="text-right w-fit sm:w-1/6 font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          {course.presentCount + course.lateCount} / {course.totalClasses} logs
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Focused Mark Attendance Flow Drawer */}
        {currentTab === 'student_attendance' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-lg mx-auto"
          >
            {/* Header Title bar */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={resetFlowAndReturn}
                className="p-2 -ml-2 rounded-full hover:bg-slate-150 transition-colors text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">Mark Attendance</h2>
              <div className="w-8" />
            </div>

            {/* Stepper Progress bar */}
            <div className="w-full flex items-center justify-between mb-8 px-2 select-none">
              <div className="flex-grow h-1 bg-indigo-600 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ml-1.5" style={{ boxShadow: '0px 0px 6px rgba(79,70,229,0.5)' }} />
              
              <div className={`flex-grow h-1 ml-1.5 rounded-full transition-all ${activeStep === 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              <div className={`w-2.5 h-2.5 rounded-full ml-1.5 transition-all ${activeStep === 3 ? 'bg-indigo-600' : 'bg-slate-300'}`} style={activeStep === 3 ? { boxShadow: '0px 0px 6px rgba(79,70,229,0.5)' } : {}} />
            </div>

            {/* Step Content Wrapper */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md flex flex-col justify-between min-h-[380px] relative overflow-hidden">
              
              {/* Sandbox active Session override indicator */}
              {activeStep === 1 && (
                <div className="absolute top-0 right-0 left-0 bg-indigo-50 text-indigo-700 py-2 px-4 text-[10px] font-bold uppercase tracking-widest text-center border-b border-indigo-100">
                  {activeSession ? (
                    <span>ACTIVE ATTENDANCE KEY REGISTER: <span className="underline font-extrabold text-indigo-900 text-xs tracking-widest ml-1">{activeSession.code}</span> {activeSession.location ? `(${activeSession.location})` : ''}</span>
                  ) : (
                    <span>Campus system is idle. Start a session as Admin or use code "123456"</span>
                  )}
                </div>
              )}

              {/* Step 1: Code Verification Box */}
              {activeStep === 1 && (
                <div className="flex flex-col items-center pt-8">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
                    <Lock className="w-5 h-5" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Enter Class Code</h3>
                  <p className="text-xs text-slate-500 text-center mb-8 max-w-sm font-medium">
                    Input the 6-digit numeric OTP generated by your instructor on the main projector screen.
                  </p>

                  {/* 6 Digit OTP fields row */}
                  <div className="flex items-center gap-2 mb-8">
                    {codeBoxes.slice(0, 3).map((val, idx) => (
                      <input
                        key={idx}
                        ref={boxRefs[idx]}
                        value={val}
                        onChange={(e) => handleBoxChange(e.target.value, idx)}
                        onKeyDown={(e) => handleBackspace(e, idx)}
                        maxLength={1}
                        type="text"
                        className="w-12 h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-lg tracking-widest outline-none focus:ring-1 focus:ring-indigo-600 transition-all uppercase"
                        placeholder="0"
                      />
                    ))}
                    
                    <div className="w-2 h-px bg-slate-200 mx-1 shrink-0" />

                    {codeBoxes.slice(3, 6).map((val, idx) => (
                      <input
                        key={idx + 3}
                        ref={boxRefs[idx + 3]}
                        value={val}
                        onChange={(e) => handleBoxChange(e.target.value, idx + 3)}
                        onKeyDown={(e) => handleBackspace(e, idx + 3)}
                        maxLength={1}
                        type="text"
                        className="w-12 h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-lg tracking-widest outline-none focus:ring-1 focus:ring-indigo-600 transition-all uppercase"
                        placeholder="0"
                      />
                    ))}
                  </div>

                  <button
                    onClick={verifySubmittedCode}
                    disabled={codeBoxes.some(c => !c)}
                    className="w-full h-11 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>Verify Code Key</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}



              {/* Step 3: Success Confirmation State */}
              {activeStep === 3 && lastRecordedRecord && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Attendance Registered!</h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">Your check-in has been validated and permanently logged for {lastRecordedRecord.courseCode}.</p>

                  <div className="w-full border border-slate-200 rounded-lg p-4 flex flex-col gap-3 text-left bg-slate-50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-mono tracking-wider font-bold">COURSE SECTOR</span>
                      <span className="font-mono text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                        {lastRecordedRecord.courseCode}
                      </span>
                    </div>

                    <div className="h-px bg-slate-150" />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-mono tracking-wider font-bold">CLASS DESCRIPTION</span>
                      <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                        {lastRecordedRecord.courseName}
                      </span>
                    </div>

                    <div className="h-px bg-slate-150" />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-mono tracking-wider font-bold">TIMESTAMP TIME</span>
                      <span className="font-mono text-slate-700 font-semibold">{lastRecordedRecord.time}</span>
                    </div>

                    <div className="h-px bg-slate-150" />

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-mono tracking-wider font-bold">ATTENDANCE LEVEL</span>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {lastRecordedRecord.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={resetFlowAndReturn}
                    className="w-full mt-6 h-11 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-sm transition-all flex items-center justify-center cursor-pointer"
                  >
                    Back to Suite Home
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* 3. ATTENDANCE HISTORY TAB */}
        {currentTab === 'student_history' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Header Title with Export */}
            <div className="flex justify-between items-end border-b border-slate-200 pb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold font-mono">CHRONICLE LOGS</p>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-1">Attendance History</h1>
                <p className="text-xs font-semibold text-slate-500 mt-2">Certified physical logs and institutional verification-secured sessions history.</p>
              </div>

              <button
                onClick={() => onOpenExport && onOpenExport('pdf')}
                className="h-[40px] px-4 border border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-505 text-slate-700 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>Export PDF Reports</span>
              </button>
            </div>

            {/* Filter Records Card block */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <Settings className="w-4 h-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Configure Ledger Filters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Semester Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Academic Semester</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all cursor-pointer h-10 italic"
                    value={semesterFilter}
                    onChange={(e) => {
                      setSemesterFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option className="bg-white text-slate-900">Spring 2024</option>
                    <option className="bg-white text-slate-900">Fall 2023</option>
                  </select>
                </div>

                {/* Course Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Course Identifier</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all cursor-pointer h-10 italic"
                    value={courseFilter}
                    onChange={(e) => {
                      setCourseFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option className="bg-white text-slate-900" value="All">All Registered Courses</option>
                    {courses.map(c => (
                      <option className="bg-white text-slate-900" key={c.code} value={c.code}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Month Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Timeline Month</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all cursor-pointer h-10 italic"
                    value={monthFilter}
                    onChange={(e) => {
                      setMonthFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option className="bg-white text-slate-900" value="All">All Months</option>
                    <option className="bg-white text-slate-900" value="May">May</option>
                    <option className="bg-white text-slate-900" value="Apr">April</option>
                    <option className="bg-white text-slate-900" value="Mar">March</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Attendance list data table card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                      <th className="py-4 px-6 w-[160px]">Academic Date</th>
                      <th className="py-4 px-6">Enrolled Course</th>
                      <th className="py-4 px-6">Lecture Session Detail</th>
                      <th className="py-4 px-6 w-[160px]">Syllabus Time</th>
                      <th className="py-4 px-6 w-[140px] text-right">Register State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {paginatedRecords.length > 0 ? (
                      paginatedRecords.map((rec) => {
                        const statusColor = 
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : rec.status === 'Absent'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100';

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 text-slate-400 font-mono font-bold whitespace-nowrap uppercase tracking-wider">
                              {rec.date}
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-indigo-600 mr-2.5">{rec.courseCode}</span>
                              <span className="text-slate-500 font-medium">{rec.courseName}</span>
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                              {rec.sessionName}
                            </td>
                            <td className="py-4 px-6 font-mono text-slate-400 font-bold">
                              {rec.time}
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusColor}`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 px-6 text-center text-slate-400 font-bold text-base">
                          No filtered records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  <span>
                    LOGS {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} total references
                  </span>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all text-[9px] rounded font-bold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>PREV</span>
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all text-[9px] rounded font-bold"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 4. STUDENT PROFILE TAB */}
        {currentTab === 'student_profile' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Header Title block */}
            <div className="border-b border-slate-200 pb-6">
              <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold font-mono">CREDENTIALS PROFILE</span>
              <h1 className="text-4xl font-extrabold text-slate-900 mt-1">Student Details</h1>
              <p className="text-xs font-semibold text-slate-500 mt-2">Manage your academic registry data, physical identification, and security override credentials.</p>
            </div>

            {/* Profile Bento Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Identity Container */}
              <div className="md:col-span-4 flex flex-col gap-6">
                
                {/* Profile Card details */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                  {/* Visual header background strip */}
                  <div className="h-28 bg-gradient-to-r from-indigo-800 to-indigo-950 w-full relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
                  </div>
                  
                  <div className="px-5 pb-6 flex flex-col items-center text-center -mt-10 relative">
                    {/* Rounded avatar frame */}
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md relative z-10 flex items-center justify-center">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-3xl italic">
                          {currentUser.name[0]}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-3 leading-tight">{currentUser.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5 justify-center font-bold">
                      <Badge className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Index: {currentUser.studentId}</span>
                    </p>

                    <div className="flex gap-2.5 mt-5 justify-center w-full">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                        {currentUser.level || 'Year 3'}
                      </span>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded-full border border-slate-250">
                        Student Account
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Particular card info */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3 block">PODIUM NOTIFICATIONS</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Primary Contact</span>
                      <span className="text-xs font-mono text-slate-700 font-semibold break-all select-all">{currentUser.email}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Profile Details Container */}
              <div className="md:col-span-8 flex flex-col gap-6">
                
                {/* Academic Particular List */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-2">
                    <GraduationCap className="text-indigo-600 w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Academic Registration</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[9px] block uppercase font-bold text-slate-400 tracking-wider">Enrolled Department</span>
                      <span className="text-sm font-bold text-slate-700 mt-1 block">
                        {currentUser.department || 'Computer Science'}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[9px] block uppercase font-bold text-slate-400 tracking-wider">Academic Grade Tier</span>
                      <span className="text-sm font-bold text-slate-700 mt-1 block">
                        {currentUser.level || 'Year 3'}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg sm:col-span-2">
                      <span className="text-[9px] block uppercase font-bold text-slate-400 tracking-wider">Certified Degree Track Program</span>
                      <span className="text-sm font-bold text-slate-700 mt-1 block">
                        {currentUser.degreeProgram || 'Bachelor of Science in Software Engineering'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Security Cards */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Lock className="text-indigo-600 w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Security Overrides</h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <button
                      onClick={changePassword}
                      className="w-full flex items-center justify-between py-4 group hover:bg-slate-50 rounded-lg px-2 -mx-2 cursor-pointer transition-all"
                    >
                      <div className="text-left">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700 block group-hover:text-indigo-600 transition-all">Change Passcode Security Key</span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Safely update your private institutional password settings</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all" />
                    </button>
                    
                    <button
                      onClick={() => alert("Digital preferences successfully updated.")}
                      className="w-full flex items-center justify-between py-4 group hover:bg-slate-50 rounded-lg px-2 -mx-2 cursor-pointer transition-all"
                    >
                      <div className="text-left">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700 block group-hover:text-indigo-600 transition-all">Configure Verification Alerts</span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Configure automatic secure code notification alerts</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
