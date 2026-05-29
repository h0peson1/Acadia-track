/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import { Menu, LogOut, GraduationCap, X } from 'lucide-react';
import ExportModal from './components/ExportModal';

function DashboardSwitchboard() {
  const { currentUser, logout } = useAttendance();
  const [currentTab, setTab] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');

  const handleOpenExport = (format: 'excel' | 'pdf') => {
    setExportFormat(format);
    setShowExportModal(true);
  };

  // Auto sync default tabs when roles are hot-swapped or set during sandbox sessions
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setTab('admin_dashboard');
      } else {
        setTab('student_dashboard');
      }
    }
    setMobileMenuOpen(false); // Clean mobile drawer
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* 1. Header Toolbar */}
      <Header currentTab={currentTab} setTab={setTab} />

      {/* Mobile Top Navigation Guard with Hamburger toggle */}
      <div className="md:hidden fixed top-0 right-0 h-16 flex items-center px-4 z-50 pointer-events-none">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white border border-slate-200 pointer-events-auto text-indigo-600 hover:bg-slate-50 transition shadow-sm cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-45">
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-2xl border-r border-slate-200 py-6 px-4 flex flex-col justify-between">
              <div>
                {/* Brand label */}
                <div className="flex items-center gap-2 mb-8 px-2">
                  <div className="p-1.5 border border-indigo-200 rounded bg-indigo-50 text-indigo-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold tracking-wider text-slate-900">
                    Academia<span className="text-indigo-600">Track</span>
                  </span>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => { setTab('admin_dashboard'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'admin_dashboard' ? 'bg-indigo-550/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Dashboard Overview
                      </button>
                      <button
                        onClick={() => { setTab('admin_courses'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'admin_courses' ? 'bg-indigo-555/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Courses Roster
                      </button>
                      <button
                        onClick={() => { setTab('admin_sessions'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'admin_sessions' ? 'bg-indigo-560/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Sessions Config
                      </button>
                      <button
                        onClick={() => { setTab('admin_students'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'admin_students' ? 'bg-indigo-565/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Student Directory
                      </button>
                      <button
                        onClick={() => { setTab('admin_reports'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'admin_reports' ? 'bg-indigo-570/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Analytical Reports
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setTab('student_dashboard'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'student_dashboard' ? 'bg-indigo-550/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Student Home
                      </button>
                      <button
                        onClick={() => { setTab('student_attendance'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'student_attendance' ? 'bg-indigo-555/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Mark Attendance
                      </button>
                      <button
                        onClick={() => { setTab('student_history'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'student_history' ? 'bg-indigo-560/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Attendance History
                      </button>
                      <button
                        onClick={() => { setTab('student_profile'); setMobileMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded text-xs font-semibold tracking-wide ${currentTab === 'student_profile' ? 'bg-indigo-565/10 bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 pl-4' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Profile Particulars
                      </button>
                    </>
                  )}
                </nav>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 border border-rose-200 text-rose-600 py-3 rounded text-xs font-semibold hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Desktop Sidebar */}
      <Sidebar currentTab={currentTab} setTab={setTab} />

      {/* 3. Main Views router panels */}
      <div className="flex-grow w-full bg-slate-50">
        {isAdmin ? (
          <AdminPortal currentTab={currentTab} setTab={setTab} onOpenExport={handleOpenExport} />
        ) : (
          <StudentPortal currentTab={currentTab} setTab={setTab} onOpenExport={handleOpenExport} />
        )}
      </div>

      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        defaultFormat={exportFormat} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <DashboardSwitchboard />
    </AttendanceProvider>
  );
}

// Inline AnimatePresence fallback just in case motion loads without full wrapping import configs
function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
