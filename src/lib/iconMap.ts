
import { Atom, Dna, FlaskConical, Sigma, BookOpen, Landmark, Scale, Globe, Book, Library, Folder, FileText, Calculator, PenSquare, Code, Palette, Music, BrainCircuit, Swords, Puzzle, ClipboardList, MessageSquare, Users, Bot, Send, FileQuestion, BookCheck, Menu, Gavel, Gift, HelpCircle, History, LogOut, Trophy, Home, BookUser, Printer, ShoppingCart, Settings, UserPlus, Copy, ClipboardCheck, User, ShieldAlert, ArrowRight } from "lucide-react";
import React from 'react';

const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', {
      ...props,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }, [
      React.createElement('path', { key: 1, d: "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" }),
      React.createElement('path', { key: 2, d: "m10 12 5-3-5-3z" })
    ])
  );

export const iconMap: { [key: string]: React.FC<any> } = {
  Atom,
  Dna,
  FlaskConical,
  Sigma,
  BookOpen,
  Landmark,
  Scale,
  Globe,
  Book,
  Library,
  Folder,
  FileText,
  Calculator,
  PenSquare,
  Code,
  Palette,
  Music,
  BrainCircuit,
  Swords,
  Puzzle,
  ClipboardList,
  MessageSquare,
  Users,
  Bot,
  Send,
  FileQuestion,
  BookCheck,
  Menu,
  Gavel,
  Gift,
  HelpCircle,
  History,
  LogOut,
  Trophy,
  Home,
  BookUser,
  Printer,
  ShoppingCart,
  Settings,
  UserPlus,
  Copy,
  ClipboardCheck,
  User,
  ShieldAlert,
  Youtube: YoutubeIcon,
  BookCopy: BookOpen,
  ArrowRight
};

export const iconNames = Object.keys(iconMap).sort();
