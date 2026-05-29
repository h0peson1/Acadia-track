/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  X, 
  FileDown, 
  FileSpreadsheet, 
  Check, 
  Loader2, 
  Calendar,
  Layers,
  ShieldCheck,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFormat: 'excel' | 'pdf';
}

export default function ExportModal({ isOpen, onClose, defaultFormat }: ExportModalProps) {
  const { courses } = useAttendance();
  const [format, setFormat] = useState<'excel' | 'pdf'>(defaultFormat);
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('Spring 2024');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // 1: Form, 2: Loading, 3: Success
  const [stage, setStage] = useState(1);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Sync default format on open
  useEffect(() => {
    if (isOpen) {
      setFormat(defaultFormat);
      setStage(1);
      setLoadingTextIndex(0);
    }
  }, [isOpen, defaultFormat]);

  // Loading text animations
  const loadingTexts = [
    'Synthesizing campus database chronicles...',
    'Resolving cryptographic attendance hashes...',
    'Structuring column matrices and telemetry charts...',
    'Finalizing document formatting structures...',
    'Packaging secure document download file...'
  ];

  useEffect(() => {
    if (stage !== 2) return;
    
    const interval = setInterval(() => {
      setLoadingTextIndex(prev => {
        if (prev < loadingTexts.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [stage]);

  if (!isOpen) return null;

  const handleGenerateExport = () => {
    setStage(2);
    
    // Simulate compilation delay for high-fidelity experience
    setTimeout(() => {
      setStage(3);
      
      // Trigger a raw simulated file download block
      const filename = `AcademiaTrack_Attendance_${selectedCourse.replace(/\s+/g, '_')}_${selectedSemester.replace(/\s+/g, '_')}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      const dummyContent = "AcademiaTrack Secure Attendance Export Chronicles";
      const blob = new Blob([dummyContent], { type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[440px] text-slate-800"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Export Chronicles</h3>
            </div>
            <button
              onClick={onClose}
              disabled={stage === 2}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 flex-grow flex flex-col justify-between font-semibold">
            
            {/* Stage 1: Parameters Form */}
            {stage === 1 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* 1. Format Select Cards */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Export Document Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Excel Card */}
                    <button
                      type="button"
                      onClick={() => setFormat('excel')}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer select-none text-center ${
                        format === 'excel'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <FileSpreadsheet className={`w-8 h-8 mb-2 ${format === 'excel' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">Excel Spreadsheet</span>
                      <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">Raw data logs</span>
                    </button>

                    {/* PDF Card */}
                    <button
                      type="button"
                      onClick={() => setFormat('pdf')}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer select-none text-center ${
                        format === 'pdf'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <FileDown className={`w-8 h-8 mb-2 ${format === 'pdf' ? 'text-rose-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">PDF Document Report</span>
                      <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">Visual print ready</span>
                    </button>
                  </div>
                </div>

                {/* 2. Dropdown Select Course */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Course Scope</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-650 transition-all cursor-pointer h-10 italic appearance-none"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option className="bg-white text-slate-900" value="All">All Enrolled Courses</option>
                      {courses.map(c => (
                        <option className="bg-white text-slate-900" key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                    <Layers className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Dropdowns Split Row (Semester & Status) */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Semester selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Academic Term</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-650 transition cursor-pointer h-9 italic appearance-none"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                      >
                        <option className="bg-white text-slate-900">Spring 2024</option>
                        <option className="bg-white text-slate-900">Fall 2023</option>
                      </select>
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance Status</label>
                    <div className="relative">
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-650 transition cursor-pointer h-9 italic appearance-none"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option className="bg-white text-slate-900" value="All">All States</option>
                        <option className="bg-white text-slate-900" value="Present">Present Only</option>
                        <option className="bg-white text-slate-900" value="Late">Late Only</option>
                        <option className="bg-white text-slate-900" value="Absent">Absent Only</option>
                      </select>
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateExport}
                  className={`w-full mt-6 h-11 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow ${
                    format === 'excel'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Generate {format === 'excel' ? 'Spreadsheet' : 'PDF Report'}</span>
                </button>
              </div>
            )}

            {/* Stage 2: Processing Loader Animation */}
            {stage === 2 && (
              <div className="flex flex-col items-center justify-center py-16 flex-grow animate-fadeIn">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h4 className="text-sm font-extrabold text-slate-900 mb-1">Generating Attendance Chronicles</h4>
                
                <div className="h-6 flex items-center justify-center">
                  <motion.p
                    key={loadingTextIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[11px] font-medium text-slate-500 leading-normal text-center"
                  >
                    {loadingTexts[loadingTextIndex]}
                  </motion.p>
                </div>

                {/* Micro linear compilation progress bar */}
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mt-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.8, ease: 'easeInOut' }}
                    className={`h-full rounded-full ${format === 'excel' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            )}

            {/* Stage 3: Success Downloader checkpoint */}
            {stage === 3 && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeIn flex-grow">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 border ${
                  format === 'excel' 
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-600' 
                    : 'bg-rose-50 border-rose-250 text-rose-600'
                }`}>
                  <Check className="w-7 h-7" />
                </div>

                <h3 className="text-base font-extrabold text-slate-950 mb-1">Export Completed!</h3>
                <p className="text-[11px] text-slate-500 max-w-xs font-medium leading-normal mb-8">
                  Your secure attendance logs spreadsheet file has been compiled and downloaded to your default system folder.
                </p>

                <button
                  onClick={onClose}
                  className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center cursor-pointer"
                >
                  Done & Return
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
