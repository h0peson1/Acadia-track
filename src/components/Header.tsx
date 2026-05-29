/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Bell, 
  User, 
  Search, 
  Compass,
  X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Header({ currentTab, setTab }: HeaderProps) {
  const { currentUser, activeSession } = useAttendance();


  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <header className="fixed top-0 w-full z-40 flex justify-between items-center px-6 lg:px-8 h-16 bg-white/90 border-b border-slate-200 md:pl-72 pr-14 md:pr-6 lg:pr-8 backdrop-blur-md text-slate-900 select-none">
        {/* Left items or contextual search */}
        <div className="flex items-center gap-4 flex-grow max-w-md">
          {isAdmin && (currentTab === 'admin_students' || currentTab === 'admin_reports') ? (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search directory registers..."
                disabled
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[2px]">
                {isAdmin ? (
                  <span className="text-indigo-600 font-semibold">
                    Registrar Console
                  </span>
                ) : (
                  <span className="text-slate-600 font-semibold">
                    Student Portal
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right control items */}
        <div className="flex items-center gap-3 lg:gap-6 text-sm">

          {/* Notifications Icon with active pill */}
          <button 
            onClick={() => alert(`System Status:\nAll digital parameters verified. Beacons normal.\nSupabase Link: ${isCloudConnected ? 'ACTIVE CLOUD DATA FILL' : 'DEMO LOCAL DATA FILL'}`)}
            className="relative p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {activeSession && !isAdmin && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full pulsing" />
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Profile Card - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 leading-none mb-0.5">{currentUser.name}</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{currentUser.role} log</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center text-indigo-600">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover filter brightness-95 contrast-105" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </header>


    </>
  );
}
