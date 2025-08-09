import type { LucideIcon } from "lucide-react";

export interface Note {
  id: string;
  title: string;
  type: "Handwritten Notes" | "Question Bank" | "Others";
  pdfUrl: string;
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
  icon: LucideIcon;
  subSubjects: SubSubject[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
}
