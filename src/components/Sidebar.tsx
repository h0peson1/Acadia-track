/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Home, 
  CheckSquare, 
  History, 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Clock, 
  Users, 
  BarChart3, 
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setTab }: SidebarProps) {
  const { currentUser, logout, activeSession } = useAttendance();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r border-slate-200 bg-white z-50 pt-6 pb-6 select-none font-sans text-slate-800">
      {/* Brand Header Label */}
      <div className="px-6 mb-8 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 px-1.5 border border-indigo-200 rounded bg-indigo-50 text-indigo-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Academia<span className="text-indigo-600">Track</span>
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
          {isAdmin ? 'ADMINISTRATOR PORTAL' : 'STUDENT TERMINAL'}
        </span>
      </div>

      {/* Nav Menu Lists */}
      <nav className="flex-grow px-3 space-y-1">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MAIN NAVIGATION</span>
        </div>

        {isAdmin ? (
          <>
            {/* Admin Tabs */}
            <button
              onClick={() => setTab('admin_dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'admin_dashboard'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setTab('admin_courses')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'admin_courses'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Courses Roster</span>
            </button>

            <button
              onClick={() => setTab('admin_sessions')}
              className={`relative w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'admin_sessions'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Active Sessions</span>
              {activeSession && (
                <span className="absolute right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full pulsing" />
              )}
            </button>

            <button
              onClick={() => setTab('admin_students')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'admin_students'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Student Directory</span>
            </button>

            <button
              onClick={() => setTab('admin_reports')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'admin_reports'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Analytics & Reports</span>
            </button>
          </>
        ) : (
          <>
            {/* Student Tabs */}
            <button
              onClick={() => setTab('student_dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'student_dashboard'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Student Home</span>
            </button>

            <button
              onClick={() => setTab('student_attendance')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'student_attendance'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Mark Attendance</span>
            </button>

            <button
              onClick={() => setTab('student_history')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'student_history'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Attendance History</span>
            </button>

            <button
              onClick={() => setTab('student_profile')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                currentTab === 'student_profile'
                  ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <User className="w-4 h-4 text-indigo-600" />
              <span>Profile Details</span>
            </button>
          </>
        )}
      </nav>

      {/* Settings & Lower Tab Logout */}
      <div className="px-3 pt-4 border-t border-slate-100 space-y-1">
        <button
          onClick={() => {
            alert('Settings Protected:\nAttendance logs are secured locally inside active browser state.');
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
