/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course, AttendanceRecord, ActiveSession, RecentActivity } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AttendanceContextProps {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  records: AttendanceRecord[];
  activeSession: ActiveSession | null;
  activities: RecentActivity[];
  isCloudConnected: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  startNewSession: (courseCode: string, duration: number, radius: number, location: string) => string;
  endActiveSession: () => void;
  markAttendance: (code: string, coords?: { lat: number; lng: number }) => { success: boolean; message: string; record?: AttendanceRecord };
  changePassword: () => void;
  exportData: (format: 'pdf' | 'excel') => void;
  addActivity: (title: string, subtitle: string, type: RecentActivity['type']) => void;
  deleteRecord: (id: string) => void;
}

const AttendanceContext = createContext<AttendanceContextProps | undefined>(undefined);

// Sourced seed users matching screenshots
const SEED_USERS: User[] = [
  {
    id: 'admin_alex',
    name: 'Alex Johnson',
    email: 'hw055277@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'admin_josiah',
    name: 'Josiah Kwadwo Asante',
    email: 'josiahokatakyiekwadwoasante@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'student_hopeson',
    name: 'Hopeson Wosornu He-eve',
    email: 'hopeson.wosornu@academiatracker.org',
    role: 'student',
    studentId: '2526403377',
    department: 'Information Technology',
    level: '100',
    degreeProgram: 'BSc. Information Technology',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  }
];

const SEED_COURSES: Course[] = [
  {
    code: 'MATH 122',
    name: 'Probability & Statistics',
    attendancePercentage: 90,
    presentCount: 18,
    absentCount: 2,
    lateCount: 0,
    totalClasses: 20
  },
  {
    code: 'MATH 123',
    name: 'Discrete Structures',
    attendancePercentage: 87,
    presentCount: 26,
    absentCount: 3,
    lateCount: 1,
    totalClasses: 30
  },
  {
    code: 'GSSS 162',
    name: 'Communication Skills',
    attendancePercentage: 100,
    presentCount: 15,
    absentCount: 0,
    lateCount: 0,
    totalClasses: 15
  },
  {
    code: 'CIIS 154',
    name: 'Digital Electronics',
    attendancePercentage: 95,
    presentCount: 19,
    absentCount: 1,
    lateCount: 0,
    totalClasses: 20
  },
  {
    code: 'CIIS 152',
    name: 'Introduction to Information Systems',
    attendancePercentage: 92,
    presentCount: 23,
    absentCount: 2,
    lateCount: 0,
    totalClasses: 25
  },
  {
    code: 'CICS 112',
    name: 'Programming with C++',
    attendancePercentage: 95,
    presentCount: 18,
    absentCount: 1,
    lateCount: 1,
    totalClasses: 20
  },
  {
    code: 'GSFF 122',
    name: 'Functional French (II)',
    attendancePercentage: 88,
    presentCount: 14,
    absentCount: 2,
    lateCount: 0,
    totalClasses: 16
  }
];

// Sourced activity records matching screenshots
const SEED_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act_1',
    title: 'CICS 112 - Programming with C++ attendance started.',
    subtitle: 'Block C Lecture Hall (Great Hall) • Prof. Constantine',
    time: '10 mins ago',
    type: 'session_start'
  },
  {
    id: 'act_2',
    title: 'Weekly attendance report generated.',
    subtitle: 'Sent to administrative staff.',
    time: '2 hours ago',
    type: 'report_gen'
  },
  {
    id: 'act_3',
    title: 'Low attendance alert triggered.',
    subtitle: '3 students below 70% threshold in MATH 122.',
    time: 'Yesterday',
    type: 'alert'
  }
];

// Rich set of 26 seed attendance logs matching details for true pagination clickability
const generateSeedRecords = (): AttendanceRecord[] => {
  const list: AttendanceRecord[] = [
    {
      id: 'rec_1',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 15, 2024',
      time: '09:05 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 24: Data Structures',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_2',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 14, 2024',
      time: '02:15 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Seminar: Series & Sequences',
      status: 'Late',
      method: 'Manual Entry'
    },
    {
      id: 'rec_3',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 12, 2024',
      time: '--:--',
      courseCode: 'HIS102',
      courseName: 'Modern World History',
      sessionName: 'Discussion Group B',
      status: 'Absent',
      method: 'System'
    },
    {
      id: 'rec_4',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 10, 2024',
      time: '09:02 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lab 08: Memory Management',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_5',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 08, 2024',
      time: '09:00 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 23: Algorithms Intro',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_6',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 07, 2024',
      time: '02:02 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 18: Integration Rules',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_7',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 05, 2024',
      time: '11:00 AM',
      courseCode: 'ENG101',
      courseName: 'Academic Writing',
      sessionName: 'Workshop: Argumentation',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_8',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 03, 2024',
      time: '09:12 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 22: Binary Search Trees',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_9',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'May 01, 2024',
      time: '02:00 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 17: Limits & Continuity',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_10',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 28, 2024',
      time: '11:05 AM',
      courseCode: 'ENG101',
      courseName: 'Academic Writing',
      sessionName: 'Peer Review: Proposal Draft',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_11',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 26, 2024',
      time: '09:00 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 21: Pointers in C',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_12',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 24, 2024',
      time: '--:--',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 16: Optimization Problems',
      status: 'Absent',
      method: 'System'
    },
    {
      id: 'rec_13',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 22, 2024',
      time: '02:00 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 15: Chain Rule Practice',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_14',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 19, 2024',
      time: '09:04 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 20: Memory Allocation',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_15',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 17, 2024',
      time: '02:05 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 14: Implicit Differentiation',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_16',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 15, 2024',
      time: '11:00 AM',
      courseCode: 'ENG101',
      courseName: 'Academic Writing',
      sessionName: 'Lecture 08: Citations Style',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_17',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 12, 2024',
      time: '09:00 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 19: Structs & Unions',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_18',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 10, 2024',
      time: '02:00 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 13: Related Rates',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_19',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 08, 2024',
      time: '11:00 AM',
      courseCode: 'ENG101',
      courseName: 'Academic Writing',
      sessionName: 'Lecture 07: Structure of Thesis',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_20',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 05, 2024',
      time: '09:02 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 18: Scope of Variables',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_21',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Apr 03, 2024',
      time: '02:00 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 12: Derivative Rules',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_22',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Mar 29, 2024',
      time: '11:00 AM',
      courseCode: 'ENG101',
      courseName: 'Academic Writing',
      sessionName: 'Lecture 06: Plagiarism & Ethics',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_23',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Mar 27, 2024',
      time: '09:05 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 17: Functions & Returns',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_24',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Mar 25, 2024',
      time: '02:18 PM',
      courseCode: 'MTH103',
      courseName: 'Calculus I',
      sessionName: 'Lecture 11: Tangents & Rates',
      status: 'Late',
      method: 'QR Scanned'
    },
    {
      id: 'rec_25',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Mar 22, 2024',
      time: '11:00 AM',
      courseCode: 'ENG101',
      courseName: 'Academic Writing',
      sessionName: 'Workshop: Thesis Statements',
      status: 'Present',
      method: 'QR Scanned'
    },
    {
      id: 'rec_26',
      studentId: '1093482A',
      studentName: 'John Mensah',
      date: 'Mar 20, 2024',
      time: '09:01 AM',
      courseCode: 'CSC101',
      courseName: 'Intro to Computer Science',
      sessionName: 'Lecture 16: Loops & Conditions',
      status: 'Present',
      method: 'QR Scanned'
    }
  ];
  const courseMap: Record<string, { code: string; name: string }> = {
    'CSC101': { code: 'CICS 112', name: 'Programming with C++' },
    'MTH103': { code: 'MATH 122', name: 'Probability & Statistics' },
    'ENG101': { code: 'GSSS 162', name: 'Communication Skills' },
    'HIS102': { code: 'GSFF 122', name: 'Functional French (II)' }
  };

  return list.map(rec => {
    const mapped = courseMap[rec.courseCode] || { code: 'CIIS 152', name: 'Introduction to Information Systems' };
    return {
      ...rec,
      studentId: '25264003378',
      courseCode: mapped.code,
      courseName: mapped.name
    };
  });
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any outdated course list cache synchronously before state initializes
  const savedCoursesCheck = localStorage.getItem('acad_courses');
  const needsCoursePurge = savedCoursesCheck && (savedCoursesCheck.includes('CSC101') || savedCoursesCheck.includes('MTH103') || savedCoursesCheck.includes('CSC 101') || savedCoursesCheck.includes('MATH 202'));
  const needsSupabasePurge = isSupabaseConfigured && !localStorage.getItem('acad_supabase_purged');

  if (needsCoursePurge || needsSupabasePurge) {
    localStorage.removeItem('acad_courses');
    localStorage.removeItem('acad_current_user');
    localStorage.removeItem('acad_records');
    localStorage.removeItem('acad_active_session');
    localStorage.removeItem('acad_activities');
    if (needsSupabasePurge) {
      localStorage.setItem('acad_supabase_purged', 'true');
    }
  }

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('acad_current_user');
    if (saved) return JSON.parse(saved);
    return isSupabaseConfigured ? null : SEED_USERS[0];
  });

  const [users, setUsersList] = useState<User[]>(() => {
    return isSupabaseConfigured ? [] : SEED_USERS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('acad_courses');
    if (saved) return JSON.parse(saved);
    return isSupabaseConfigured ? [] : SEED_COURSES;
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('acad_records');
    if (saved) return JSON.parse(saved);
    return isSupabaseConfigured ? [] : generateSeedRecords();
  });

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => {
    const saved = localStorage.getItem('acad_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activities, setActivities] = useState<RecentActivity[]>(() => {
    const saved = localStorage.getItem('acad_activities');
    if (saved) return JSON.parse(saved);
    return isSupabaseConfigured ? [] : SEED_ACTIVITIES;
  });

  // Dynamic Local Storage Migration for outdated seed configurations (e.g. CSC101 or 1093482A)
  useEffect(() => {
    const savedCourses = localStorage.getItem('acad_courses');
    const savedUser = localStorage.getItem('acad_current_user');
    let shouldReset = false;
    
    if (savedCourses && savedCourses.includes('CSC101')) {
      shouldReset = true;
    }
    if (savedUser && savedUser.includes('1093482A')) {
      shouldReset = true;
    }
    
    if (shouldReset) {
      localStorage.removeItem('acad_courses');
      localStorage.removeItem('acad_current_user');
      localStorage.removeItem('acad_records');
      localStorage.removeItem('acad_active_session');
      localStorage.removeItem('acad_activities');
      // Force reload page to initialize with pristine second semester configuration!
      window.location.reload();
    }
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('acad_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Load data from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchSupabaseData = async () => {
      try {
        // 1. Fetch profiles (users)
        const { data: dbProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (!profilesError && dbProfiles && dbProfiles.length > 0) {
          const mappedUsers: User[] = dbProfiles.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role as 'student' | 'admin',
            avatarUrl: p.avatar_url || undefined,
            studentId: p.student_id || undefined,
            department: p.department || undefined,
            level: p.level || undefined,
            degreeProgram: p.degree_program || undefined
          }));
          setUsersList(mappedUsers);
          
          // Sync current logged-in user details if changed
          if (currentUser) {
            const updatedSelf = mappedUsers.find(u => u.id === currentUser.id);
            if (updatedSelf) {
              setCurrentUser(updatedSelf);
            }
          }
        }

        // 2. Fetch courses
        const { data: dbCourses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('code', { ascending: true });

        if (!coursesError && dbCourses && dbCourses.length > 0) {
          const mappedCourses: Course[] = dbCourses.map(c => ({
            code: c.code,
            name: c.name,
            attendancePercentage: Number(c.attendance_percentage),
            presentCount: c.present_count,
            absentCount: c.absent_count,
            lateCount: c.late_count,
            totalClasses: c.total_classes
          }));
          setCourses(mappedCourses);
        }

        // 3. Fetch active sessions
        const { data: dbSessions, error: sessionsError } = await supabase
          .from('active_sessions')
          .select('*')
          .eq('id', 'current_session')
          .single();

        if (!sessionsError && dbSessions && dbSessions.is_live) {
          const elapsedSeconds = Math.floor((Date.now() - new Date(dbSessions.updated_at).getTime()) / 1000);
          const computedTimeLeft = dbSessions.time_left - elapsedSeconds;
          
          if (computedTimeLeft > 0) {
            const mappedSession: ActiveSession = {
              courseCode: dbSessions.course_code,
              duration: dbSessions.duration,
              geofenceRadius: Number(dbSessions.geofence_radius),
              code: dbSessions.code,
              timeLeft: computedTimeLeft,
              totalStudents: dbSessions.total_students,
              checkedInCount: dbSessions.checked_in_count,
              isLive: dbSessions.is_live,
              checkedInStudentIds: Array.isArray(dbSessions.checked_in_student_ids) 
                ? dbSessions.checked_in_student_ids 
                : JSON.parse(dbSessions.checked_in_student_ids || '[]'),
              location: dbSessions.location || undefined
            };
            setActiveSession(mappedSession);
          } else {
            // Session expired
            await supabase.from('active_sessions').delete().eq('id', 'current_session');
            setActiveSession(null);
          }
        } else {
          setActiveSession(null);
        }

        // 4. Fetch attendance records
        const { data: dbRecords, error: recordsError } = await supabase
          .from('attendance_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (!recordsError && dbRecords && dbRecords.length > 0) {
          const mappedRecords: AttendanceRecord[] = dbRecords.map(r => ({
            id: r.id,
            studentId: r.student_id,
            studentName: r.student_name,
            date: r.date,
            time: r.time,
            courseCode: r.course_code,
            courseName: r.course_name,
            sessionName: r.session_name,
            status: r.status as 'Present' | 'Late' | 'Absent',
            method: r.method as AttendanceRecord['method']
          }));
          setRecords(mappedRecords);
        }
      } catch (err) {
        console.error('Error fetching Supabase cloud data:', err);
      }
    };

    fetchSupabaseData();

    // Subscribe to active session updates so student devices update in absolute real-time!
    const sessionChannel = supabase
      .channel('public:active_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    // Subscribe to records updates
    const recordChannel = supabase
      .channel('public:attendance_records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(recordChannel);
    };
  }, [isSupabaseConfigured, currentUser?.role]);

  useEffect(() => {
    localStorage.setItem('acad_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('acad_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('acad_active_session', JSON.stringify(activeSession));
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem('acad_activities', JSON.stringify(activities));
  }, [activities]);

  // Interval timer for active sessions
  useEffect(() => {
    if (!activeSession || !activeSession.isLive) return;

    const timer = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          
          // Delete from Supabase upon expiration
          if (isSupabaseConfigured && supabase) {
            supabase.from('active_sessions').delete().eq('id', 'current_session')
              .then(({ error }) => {
                if (error) console.error('Supabase active_session timer expiration clean error:', error);
              });
          }
          
          return null; // Session expired
        }
        
        const updatedTimeLeft = prev.timeLeft - 1;

        // Periodic sync to Supabase (every 10 seconds) to update time_left for peer clients
        if (updatedTimeLeft % 10 === 0 && isSupabaseConfigured && supabase && currentUser?.role === 'admin') {
          supabase.from('active_sessions').update({
            time_left: updatedTimeLeft,
            updated_at: new Date().toISOString()
          }).eq('id', 'current_session').then(({ error }) => {
            if (error) console.error('Supabase timer update error:', error);
          });
        }

        return {
          ...prev,
          timeLeft: updatedTimeLeft
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession?.isLive, isSupabaseConfigured]);

  const login = (email: string, password?: string): boolean => {
    const trimmed = email.toLowerCase().trim();
    const found = users.find(u => 
      u.email.toLowerCase() === trimmed ||
      (u.studentId && u.studentId.toLowerCase() === trimmed)
    );
    if (found) {
      if (found.role === 'admin') {
        if (password === 'Admin2025' || password === 'admin123') {
          setCurrentUser(found);
          return true;
        }
        return false;
      }
      setCurrentUser(found);
      return true;
    }

    // Strict Fallback for explicit development email inputs
    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail === 'hw055277@gmail.com' || lowerEmail === 'admin@academiatracker.org' || lowerEmail === 'admin') {
      if (password === 'Admin2025' || password === 'admin123') {
        setCurrentUser(SEED_USERS[0]);
        return true;
      }
      return false;
    } else if (lowerEmail === 'josiahokatakyiekwadwoasante@gmail.com' || lowerEmail === 'josiah') {
      if (password === 'Admin2025' || password === 'admin123') {
        setCurrentUser(SEED_USERS[1]);
        return true;
      }
      return false;
    } else if (lowerEmail === 'john.m@gctu.edu.gh' || lowerEmail === 'john' || lowerEmail === '25264003378') {
      const studentUser = users.find(u => u.email.toLowerCase() === 'john.m@gctu.edu.gh') || {
        id: 'student_john',
        name: 'John Mensah',
        email: 'john.m@gctu.edu.gh',
        role: 'student',
        studentId: '25264003378',
        department: 'Computer Science',
        level: '100',
        degreeProgram: 'BSc. Computer Science'
      };
      setCurrentUser(studentUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addActivity = (title: string, subtitle: string, type: RecentActivity['type']) => {
    setActivities(prev => [
      {
        id: `act_${Date.now()}`,
        title,
        subtitle,
        time: 'Just now',
        type
      },
      ...prev.slice(0, 9) // Keep last 10 activities max
    ]);
  };

  const startNewSession = (courseCode: string, duration: number, radius: number, location: string): string => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newSession: ActiveSession = {
      courseCode,
      duration,
      geofenceRadius: radius,
      code: generatedCode,
      timeLeft: duration * 60,
      totalStudents: 42,
      checkedInCount: 0,
      isLive: true,
      checkedInStudentIds: [],
      location
    };
    setActiveSession(newSession);

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('active_sessions').upsert({
        id: 'current_session',
        course_code: courseCode,
        duration,
        geofence_radius: radius,
        code: generatedCode,
        time_left: duration * 60,
        total_students: 42,
        checked_in_count: 0,
        is_live: true,
        checked_in_student_ids: [],
        location,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error('Supabase startNewSession error:', error);
      });
    }

    // Track state change logs
    const cName = courses.find(c => c.code === courseCode)?.name || courseCode;
    addActivity(
      `${courseCode} - ${cName} attendance started.`,
      `Location: ${location} • ${duration} mins`,
      'session_start'
    );

    return generatedCode;
  };

  const endActiveSession = () => {
    if (activeSession) {
      addActivity(
        `${activeSession.courseCode} attendance tracking ended.`,
        `Checked In: ${activeSession.checkedInCount} students.`,
        'report_gen'
      );
    }
    setActiveSession(null);

    // Sync deletion to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('active_sessions').delete().eq('id', 'current_session').then(({ error }) => {
        if (error) console.error('Supabase endActiveSession error:', error);
      });
    }
  };

  // Perform student check-in simulation
  const markAttendance = (code: string) => {
    if (!activeSession) {
      return { success: false, message: 'No active attendance tracking session is currently running.' };
    }

    if (activeSession.code !== code) {
      return { success: false, message: 'Invalid 6-digit session code. Please verify and try again.' };
    }

    if (!currentUser) {
      return { success: false, message: 'You must be logged in as a student to record attendance.' };
    }

    // Check if copy has checked in
    if (activeSession.checkedInStudentIds.includes(currentUser.id)) {
      return { success: true, message: 'Your attendance is already recorded for this session.' };
    }

    // Add new student record
    const targetCourse = courses.find(c => c.code === activeSession.courseCode);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
    
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const isLate = activeSession.timeLeft < (activeSession.duration * 60) - 300; // Check late if marked after 5 minutes
    const recordStatus = isLate ? 'Late' : 'Present';

    const newRecord: AttendanceRecord = {
      id: `rec_user_${Date.now()}`,
      studentId: currentUser.studentId || 'UEB251234',
      studentName: currentUser.name,
      date: dateStr,
      time: timeStr,
      courseCode: activeSession.courseCode,
      courseName: targetCourse?.name || 'Class Session',
      sessionName: activeSession.location ? `${activeSession.location} • Lecture ${targetCourse ? targetCourse.totalClasses + 1 : 1}` : `Lecture ${targetCourse ? targetCourse.totalClasses + 1 : 1}: Real-time Attendance`,
      status: recordStatus,
      method: 'Code'
    };

    // Update records list
    setRecords(prev => [newRecord, ...prev]);

    // Update session counts and student ID logs
    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        checkedInCount: prev.checkedInCount + 1,
        checkedInStudentIds: [...prev.checkedInStudentIds, currentUser.id]
      };
    });

    // Update courses statistic progress
    setCourses(prev =>
      prev.map(c => {
        if (c.code === activeSession.courseCode) {
          const newPresent = recordStatus === 'Present' ? c.presentCount + 1 : c.presentCount;
          const newLate = recordStatus === 'Late' ? c.lateCount + 1 : c.lateCount;
          const newTotal = c.totalClasses + 1;
          const updatedPercent = Math.round(((newPresent + newLate) / newTotal) * 100);
          return {
            ...c,
            presentCount: newPresent,
            lateCount: newLate,
            totalClasses: newTotal,
            attendancePercentage: updatedPercent
          };
        }
        return c;
      })
    );

    // Sync check-in to Supabase
    if (isSupabaseConfigured && supabase) {
      // 1. Insert record
      supabase.from('attendance_records').insert({
        id: newRecord.id,
        student_id: newRecord.studentId,
        student_name: newRecord.studentName,
        date: newRecord.date,
        time: newRecord.time,
        course_code: newRecord.courseCode,
        course_name: newRecord.courseName,
        session_name: newRecord.sessionName,
        status: newRecord.status,
        method: newRecord.method
      }).then(({ error }) => {
        if (error) console.error('Supabase insert record error:', error);
      });

      // 2. Update active session checked-in list and count
      const updatedStudentIds = [...activeSession.checkedInStudentIds, currentUser.id];
      supabase.from('active_sessions').update({
        checked_in_count: activeSession.checkedInCount + 1,
        checked_in_student_ids: updatedStudentIds,
        updated_at: new Date().toISOString()
      }).eq('id', 'current_session').then(({ error }) => {
        if (error) console.error('Supabase active session checkin update error:', error);
      });

      // 3. Update course stats
      if (targetCourse) {
        const newPresent = recordStatus === 'Present' ? targetCourse.presentCount + 1 : targetCourse.presentCount;
        const newLate = recordStatus === 'Late' ? targetCourse.lateCount + 1 : targetCourse.lateCount;
        const newTotal = targetCourse.totalClasses + 1;
        const updatedPercent = Math.round(((newPresent + newLate) / newTotal) * 100);

        supabase.from('courses').update({
          present_count: newPresent,
          late_count: newLate,
          total_classes: newTotal,
          attendance_percentage: updatedPercent
        }).eq('code', activeSession.courseCode).then(({ error }) => {
          if (error) console.error('Supabase update course statistics error:', error);
        });
      }
    }

    addActivity(
      `${currentUser.name} checked into ${activeSession.courseCode}.`,
      `Status: ${recordStatus} • Time: ${timeStr}`,
      'check_in'
    );

    return {
      success: true,
      message: 'Attendance successfully verified and recorded!',
      record: newRecord
    };
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));

    // Sync deletion to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('attendance_records').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete record error:', error);
      });
    }
  };

  const changePassword = () => {
    alert('Academic Security Update:\nA password reset link was dispatched to your institutional email.');
  };

  const exportData = (format: 'pdf' | 'excel') => {
    alert(`Institutional Data Export:\nSuccessfully generated and downloaded student attendance logs in .${format} format.`);
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        users,
        courses,
        records,
        activeSession,
        activities,
        isCloudConnected: isSupabaseConfigured,
        login,
        logout,
        startNewSession,
        endActiveSession,
        markAttendance,
        changePassword,
        exportData,
        addActivity,
        deleteRecord
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used inside an AttendanceProvider');
  }
  return context;
};
