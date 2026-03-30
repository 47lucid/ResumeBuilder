export interface Experience {
  id: string;
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
}

export interface TemplateProps {
  data: ResumeData;
}
