import { Atom, Dna, FlaskConical, Sigma } from "lucide-react";
import type { Subject, User } from "./types";

const mockSubjects: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    subSubjects: [
      {
        id: "mechanics",
        name: "Mechanics",
        chapters: [
          {
            id: "newtons-laws",
            name: "Newton's Laws",
            notes: [
              {
                id: "nl-notes-1",
                title: "Comprehensive Notes on Newton's Laws",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
              {
                id: "nl-qb-1",
                title: "Newton's Laws Question Bank",
                type: "Question Bank",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
          {
            id: "work-energy-power",
            name: "Work, Energy, and Power",
            notes: [
              {
                id: "wep-notes-1",
                title: "Work, Energy, and Power Detailed Notes",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
        ],
      },
      {
        id: "electromagnetism",
        name: "Electromagnetism",
        chapters: [
          {
            id: "maxwells-equations",
            name: "Maxwell's Equations",
            notes: [
              {
                id: "me-notes-1",
                title: "Intro to Maxwell's Equations",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    subSubjects: [
      {
        id: "physical-chemistry",
        name: "Physical Chemistry",
        chapters: [
          {
            id: "thermodynamics",
            name: "Thermodynamics",
            notes: [
              {
                id: "thermo-notes-1",
                title: "Laws of Thermodynamics",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
        ],
      },
      {
        id: "organic-chemistry",
        name: "Organic Chemistry",
        chapters: [
          {
            id: "hydrocarbons",
            name: "Hydrocarbons",
            notes: [
              {
                id: "hc-notes-1",
                title: "Alkane, Alkene, Alkyne Notes",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
              {
                id: "hc-qb-1",
                title: "Hydrocarbons Problem Set",
                type: "Question Bank",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Sigma,
    subSubjects: [
      {
        id: "calculus",
        name: "Calculus",
        chapters: [
          {
            id: "differentiation",
            name: "Differentiation",
            notes: [
              {
                id: "diff-notes-1",
                title: "Basics of Differentiation",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
          {
            id: "integration",
            name: "Integration",
            notes: [
              {
                id: "int-notes-1",
                title: "Integration Techniques",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    subSubjects: [
      {
        id: "genetics",
        name: "Genetics",
        chapters: [
          {
            id: "mendelian-genetics",
            name: "Mendelian Genetics",
            notes: [
              {
                id: "mg-notes-1",
                title: "Mendel's Experiments",
                type: "Handwritten Notes",
                pdfUrl: "/placeholder.pdf",
              },
            ],
          },
        ],
      },
    ],
  },
];

const mockUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@example.com", role: "Admin" },
  { id: "2", name: "Regular User", email: "user@example.com", role: "User" },
  { id: "3", name: "Jane Doe", email: "jane.doe@example.com", role: "User" },
  { id: "4", name: "John Smith", email: "john.smith@example.com", role: "User" },
];

export const getSubjects = () => mockSubjects;
export const getUsers = () => mockUsers;

export const findItemBySlug = (slug: string[]) => {
  if (!slug || slug.length === 0) return { current: null, parents: [] };

  let currentItem: any = { subSubjects: mockSubjects };
  const parents = [];

  for (const part of slug) {
    let collection;
    if (currentItem.subSubjects) {
      collection = currentItem.subSubjects;
    } else if (currentItem.chapters) {
      collection = currentItem.chapters;
    } else if (currentItem.notes) {
      collection = currentItem.notes;
    } else {
      return { current: null, parents };
    }

    const foundItem = collection.find((item: any) => item.id === part);
    if (foundItem) {
      parents.push({
        name: currentItem.name || "Subjects",
        href: `/browse/${parents.map((p) => p.id).join("/")}`,
        id: currentItem.id,
      });
      currentItem = foundItem;
    } else {
      return { current: null, parents };
    }
  }

  return { current: currentItem, parents };
};

export const getAllNotes = () => {
    const allNotes = [];
    for (const subject of mockSubjects) {
        for (const subSubject of subject.subSubjects) {
            for (const chapter of subSubject.chapters) {
                for (const note of chapter.notes) {
                    allNotes.push({
                        ...note,
                        subject: subject.name,
                        subSubject: subSubject.name,
                        chapter: chapter.name,
                    });
                }
            }
        }
    }
    return allNotes;
}
