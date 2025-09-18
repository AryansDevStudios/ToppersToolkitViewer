

import type { Timestamp } from "firebase/firestore";

export interface LoginLog {
  timestamp: number;
  ipAddress?: string; // Note: Capturing IP on server is more reliable
  userAgent: string;
  platform: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  os: string;
  browser: string;
  screenResolution: string;
  pointingMethod: 'Mouse' | 'Touchscreen';
  ram?: number; // in GB
  cpuCores?: number;
  gpuInfo?: string;
}

export interface Note {
  id: string;
  type: string;
  pdfUrl: string;
  originalPdfUrl?: string;
  linkType?: 'github' | 'other';
  serveViaJsDelivr?: boolean;
  useProxy?: boolean;
  icon?: string;
  createdAt?: number;
  isPublic?: boolean;
}

export interface Chapter {
  id:string;
  name: string;
  notes: Note[];
}

export interface SubSubject {
  id: string;
  name: string;
  icon?: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  subSubjects: SubSubject[];
}

export interface QotdOption {
  text: string;
}

export interface QuestionOfTheDay {
  id: string;
  question: string;
  options: QotdOption[];
  correctOptionIndex: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface UserQotdAnswer {
  questionId: string;
  question: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  answeredAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User" | "Student" | "Teacher";
  classAndSection?: string;
  gender?: "Male" | "Female";
  srNo?: string;
  whatsappNumber: string;
  password?: string;
  loginLogs?: LoginLog[];
  noteAccess?: string[];
  createdAt?: number;
  hasAiAccess?: boolean;
  hasFullNotesAccess?: boolean;
  score?: number;
  showOnLeaderboard?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Doubt {
    id: string;
    userId: string;
    userName: string;
    userClassAndSection?: string;
    question: string;
    answer?: string;
    status: 'pending' | 'answered';
    answeredBy?: string; // Admin's name
    answeredByAdminId?: string; // Admin's user ID
}
    
