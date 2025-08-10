
import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book, Library, Folder, FileText, Calculator, PenSquare, Code, Palette, Music, BrainCircuit } from "lucide-react";

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
  FileText
};

export const iconNames = Object.keys(iconMap).sort();
