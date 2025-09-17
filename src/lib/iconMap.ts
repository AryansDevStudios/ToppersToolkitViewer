
import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book, Library, Folder, FileText, Calculator, PenSquare, Code, Palette, Music, BrainCircuit, Swords, Puzzle, ClipboardList, MessageSquare, Users, Bot, Send, FileQuestion, BookCheck } from "lucide-react";

export const iconMap: { [key: string]: React.FC<any> } = {
  FlaskConical,
  Landmark,
  Sigma,
  Book,
  Atom,
  Dna,
  BookOpen,
  Scale,
  Globe,
  Calculator,
  PenSquare,
  Code,
  Palette,
  Music,
  BrainCircuit,
  Library,
  Folder,
  FileText,
  Swords,
  Puzzle,
  ClipboardList,
  MessageSquare,
  Users,
  Bot,
  Send,
  FileQuestion,
  BookCheck,
};

export const iconNames = Object.keys(iconMap).sort();
