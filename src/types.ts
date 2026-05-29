/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  studentId?: string;
  department?: string;
  level?: string;
  degreeProgram?: string;
}

export interface Course {
  code: string;
  name: string;
  attendancePercentage: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalClasses: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  courseCode: string;
  courseName: string;
  sessionName: string;
  status: 'Present' | 'Late' | 'Absent';
  method?: 'Code' | 'QR Scanned' | 'Manual Entry' | 'System';
}

export interface ActiveSession {
  courseCode: string;
  duration: number; // in minutes
  geofenceRadius: number; // in meters
  code: string;
  timeLeft: number; // in seconds
  totalStudents: number;
  checkedInCount: number;
  isLive: boolean;
  checkedInStudentIds: string[];
  location?: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'session_start' | 'report_gen' | 'alert' | 'check_in';
}
