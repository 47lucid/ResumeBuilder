export interface Experience {
  id: string;
  /** Section heading this entry belongs to, e.g. "Professional Experience", "Education" */
  sectionTitle: string;
  company: string;
  role: string;
  duration: string;
  rawText: string;
  enhancedBullets: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  skills: string;
  experiences: Experience[];
  /** Editable heading above the experience list (default: "Professional Experience") */
  expSectionTitle?: string;
  /** Accent / highlight color — title text, divider line, date badge background */
  accentColor?: string;
  /** Resume paper background color */
  resumeBg?: string;
  /** Creative template: sidebar background color */
  sidebarColor?: string;
  /** Creative template: sidebar text / icon color */
  sidebarTextColor?: string;
}

export interface TemplateProps {
  data: ResumeData;
}
