

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
  icon?: string;
  createdAt?: number;
}

export interface Chapter {
  id: string;
  name: string;
  notes: Note[];
}

export interface SubSubject {
  id: string;
  name: string;
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
  role: "Admin" | "User";
  classAndSection?: string;
  username?: string;
  srNo?: string;
  password?: string;
  loginLogs?: LoginLog[];
  noteAccess?: string[];
  createdAt?: number;
}
