/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { GraduationCap, ArrowRight, Lock, Badge, ShieldAlert, Compass, Globe, CheckCircle2 } from 'lucide-react';

export default function LoginScreen() {
  const { login, logout, users } = useAttendance();

  // Always sign out any existing session when the sign-in page opens
  useEffect(() => {
    logout();
  }, []);
  const [loginTab, setLoginTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginTab === 'student') {
      if (verifiedUser) {
        handleEnterDashboard();
      } else {
        handleStudentVerification(e);
      }
      return;
    }

    if (!email) {
      setError('Please provide your administrator credentials.');
      return;
    }
    if (!password) {
      setError('Please provide your administrator password.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setError('Invalid administrative credentials. Please verify your email and security code.');
    }
  };

  const handleStudentVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim()) {
      setError('Please enter your Index Number.');
      return;
    }
    const found = users.find(u => 
      u.role === 'student' && 
      u.studentId?.toLowerCase() === studentIdInput.trim().toLowerCase()
    );
    if (found) {
      setVerifiedUser(found);
      setError('');
    } else {
      setError('Invalid Index Number. Please verify your number or contact your Course Representative.');
    }
  };

  const handleEnterDashboard = () => {
    if (verifiedUser) {
      const success = login(verifiedUser.studentId);
      if (!success) {
        setError('Login failed. Please contact support.');
      }
    }
  };

  const handleContactCourseRep = () => {
    setShowSupportModal(true);
  };

  return (
    <main className="w-full flex min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white animate-fadeIn">
      {/* Left Side: Curated Academic Horizon Graphic / Atmospheric Cover */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-indigo-950 overflow-hidden items-center justify-center border-r border-slate-200">
        <div className="absolute inset-0 z-0">
          <img
            alt="University Library Atrium"
            className="w-full h-full object-cover opacity-30 filter grayscale mix-blend-overlay"
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop"
          />
        </div>
        {/* Subtle radial indigo overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-indigo-905/90 to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_30%_50%,rgba(79,70,229,0.15),transparent)] z-15" />

        {/* Curved vertical text side rail decoration */}
        <div className="absolute left-8 top-12 bottom-12 flex flex-col justify-between items-center py-4 border-r border-indigo-900/40 pr-4">
          <span className="text-[10px] tracking-[6px] text-indigo-300 font-semibold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            ACADEMIA ATTENDANCE SYSTEM
          </span>
          <div className="w-1 h-24 bg-indigo-400/20 rounded-full" />
        </div>

        {/* Brand visual stack */}
        <div className="relative z-20 max-w-lg px-12 text-left pl-20">
          <div className="inline-flex items-center gap-3 text-indigo-300 mb-6 font-semibold">
            <Compass className="w-5 h-5 animate-spin-slow text-indigo-400" />
            <span className="text-xs uppercase tracking-[3px]">VERIFIED INSTITUTIONAL LOGS</span>
          </div>
          <h1 className="font-sans text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-6 uppercase">
            ATTENDANCE. <br />
            VERIFIED.<br />
            IN REAL TIME.
          </h1>
          <p className="text-sm text-indigo-200/85 font-normal leading-relaxed max-w-sm">
            A premium verification-secured student register portal. Track classes, capture codes, and analyze live statistics with ease.
          </p>

          <div className="mt-12 pt-8 border-t border-indigo-900/30 grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] text-indigo-300/80 uppercase tracking-widest font-bold">Standard Features</div>
              <div className="text-sm font-semibold text-white">Secure Code Sync</div>
            </div>
            <div>
              <div className="text-[10px] text-indigo-300/80 uppercase tracking-widest font-bold">Portal Access</div>
              <div className="text-sm font-semibold text-white">Students & Registrar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Institution Login Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative bg-white">
        <div className="absolute top-8 right-8 hidden sm:flex items-center gap-2 text-slate-400">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span className="text-[9px] uppercase tracking-widest font-semibold font-mono">PORTAL ACCESS SECURE v2</span>
        </div>

        <div className="w-full max-w-[420px] mx-auto flex flex-col">
          {/* Header Brand Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 border border-indigo-100 rounded-full bg-indigo-50 text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Academia<span className="text-indigo-600">Track</span>
            </span>
          </div>

          {/* Institutional Portal Selector Tabs */}
          <div className="flex border border-slate-200/80 bg-slate-50/50 p-1.5 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginTab('student');
                setEmail('');
                setPassword('');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${loginTab === 'student'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginTab('admin');
                setEmail('');
                setPassword('');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${loginTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Terminal</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6 animate-fadeIn">
            <span className="text-[10px] tracking-[2px] uppercase text-indigo-600 block mb-1.5 font-bold">
              {loginTab === 'student' ? 'Student Workspace' : 'Administrative Workspace'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1.5 tracking-tight">
              {loginTab === 'student' ? 'Student Attendance Portal' : 'Authenticate Terminal'}
            </h2>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              {loginTab === 'student'
                ? 'Enter your Index Number to access attendance records and register class attendance.'
                : 'Enter your institutional administrator credentials and verification security code.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-semibold animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {loginTab === 'student' ? (
              /* Student Flow */
              !verifiedUser ? (
                /* Step 1: Input Index Number */
                <div className="flex flex-col gap-5 animate-fadeIn">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="student_id">
                      INDEX NUMBER
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Badge className="w-4 h-4" />
                      </div>
                      <input
                        className="w-full h-11 pl-11 pr-4 rounded border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-[13px]"
                        id="student_id"
                        placeholder="e.g. 25264000123"
                        type="text"
                        value={studentIdInput}
                        onChange={(e) => {
                          setStudentIdInput(e.target.value);
                          setError('');
                        }}
                      />
                    </div>
                    {/* Support helper link */}
                    <div className="mt-1.5 text-left">
                      <span className="text-[11px] font-medium text-slate-500 leading-normal block">
                        Need help finding your Index Number?{' '}
                        <button
                          type="button"
                          onClick={handleContactCourseRep}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-semibold inline-block focus:outline-none"
                        >
                          Contact your Course Representative.
                        </button>
                      </span>
                    </div>
                  </div>

                  <button
                    className="mt-1 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    type="submit"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Step 2: Index Number Verified */
                <div className="flex flex-col gap-5 animate-fadeIn">
                  <div className="p-4.5 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col gap-3.5 text-left shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="uppercase tracking-widest text-[10px]">✓ Index Number Verified</span>
                    </div>
                    
                    <div className="h-px bg-slate-200/60" />
                    
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Full Name</span>
                        <span className="text-base font-extrabold text-slate-900 leading-none">{verifiedUser.name}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-1.5">
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Academic Level</span>
                          <span className="text-xs font-semibold text-slate-700">{verifiedUser.level || 'Level 100'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">Degree Department</span>
                          <span className="text-xs font-bold text-indigo-600">{verifiedUser.department || 'Information Technology'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                    onClick={handleEnterDashboard}
                  >
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedUser(null);
                      setStudentIdInput('');
                    }}
                    className="text-center text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer"
                  >
                    Use a different Index Number
                  </button>
                </div>
              )
            ) : (
              /* Admin Flow */
              <div className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="admin_email">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Badge className="w-4 h-4" />
                    </div>
                    <input
                      className="w-full h-11 pl-11 pr-4 rounded border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-[13px]"
                      id="admin_email"
                      placeholder="e.g. admin@academiatracker.org"
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
                      Security Code / Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("IT Support Helpdesk:\nDefault admin credentials:\nEmail: admin@academiatracker.org\nPassword: admin123")}
                      className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      className="w-full h-11 pl-11 pr-4 rounded border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-[13px]"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Enter security password"
                    />
                  </div>
                </div>

                <button
                  className="mt-2 w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  type="submit"
                >
                  <span>Authenticate & Enter Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>



          {/* IT support info */}
          <div className="mt-8 text-center">
            <p className="text-[10px] font-medium text-slate-400 tracking-wide">
              Administrator Support:{' '}
              <a
                onClick={() => alert('Campus Support Center\nHotline: help@academy.org\nDirect Desk: +1 (555) 019-9430')}
                className="text-indigo-600 hover:underline cursor-pointer"
              >
                Call Hotline
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Premium Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-5 animate-scaleUp">
            {/* Modal Icon and Title */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Badge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">IT Verification Support</span>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">Recover Index Number</h3>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Modal Message */}
            <div className="text-slate-600 text-xs font-semibold leading-relaxed flex flex-col gap-3">
              <p>
                Your institutional Index Number can be found on your <strong>Admission Letter</strong>, <strong>Tuition Invoice</strong>, or official <strong>Registry records</strong>.
              </p>
              <p className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-500 font-medium">
                Would you like to open a direct WhatsApp chat with your Course Representative, <strong>Josiah</strong>, to recover your Index Number?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-2 select-none">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="flex-1 h-10 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSupportModal(false);
                  window.open(
                    "https://wa.me/233508512045?text=Hello%20Josiah%2C%20I%20need%20help%20finding%20my%20Index%20Number%20for%20AcademiaTrack.",
                    "_blank"
                  );
                }}
                className="flex-grow h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
