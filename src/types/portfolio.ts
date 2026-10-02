export type Discipline = 'graphic-design' | 'engineering';

export type GraphicSubCategory = 
  | 'all'
  | 'brand-identity'
  | 'ui-ux'
  | 'typography-print'
  | 'packaging-3d';

export type EngineeringSubCategory = 
  | 'all'
  | 'cad-modeling'
  | 'mechanisms-robotics'
  | 'fea-thermal'
  | 'prototyping-dfm';

export type SubCategory = GraphicSubCategory | EngineeringSubCategory;

export interface ProjectSpec {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  discipline: Discipline;
  subCategory: SubCategory;
  tagline: string;
  description: string;
  year: string;
  clientOrContext: string;
  imageUrl?: string;
  gallery?: string[];
  tags: string[];
  tools: string[];
  specs: ProjectSpec[];
  githubRepoUrl?: string;
  liveUrl?: string;
  cadModelType?: 'gear' | 'robotic-arm' | 'drone' | 'heat-sink' | 'swiss-poster' | 'brand-guideline' | 'custom';
  isCustomUpload?: boolean;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  location: string;
  availableForHire: boolean;
}
