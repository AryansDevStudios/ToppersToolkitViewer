
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
  id: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User" | "Student" | "Teacher" | "Ethic Learner";
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
}
