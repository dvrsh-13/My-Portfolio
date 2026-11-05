import {
  INITIAL_SETTINGS,
  INITIAL_PROJECTS,
  INITIAL_EXPERIENCE,
  INITIAL_EDUCATION,
  INITIAL_BLOGS,
  type SiteSettings,
  type ProjectItem,
  type ExperienceItem,
  type EducationItem,
  type BlogItem,
} from "../data/portfolioData";

const STORAGE_KEYS = {
  SETTINGS: "folio_cms_settings_v2",
  PROJECTS: "folio_cms_projects_v2",
  EXPERIENCE: "folio_cms_experience_v2",
  EDUCATION: "folio_cms_education_v2",
  BLOGS: "folio_cms_blogs_v2",
};

export class CMSStore {
  private static instance: CMSStore;
  private settings!: SiteSettings;
  private projects!: ProjectItem[];
  private experience!: ExperienceItem[];
  private education!: EducationItem[];
  private blogs!: BlogItem[];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.reloadAllFromStorage();

    // Cross-tab synchronization: notify listeners when changes occur in other tabs/windows
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (!e.key || Object.values(STORAGE_KEYS).includes(e.key)) {
          this.reloadAllFromStorage();
          this.notify();
        }
      });
    }
  }

  public reloadAllFromStorage() {
    this.settings = this.loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (this.settings.name === "DEV PATEL" || this.settings.email === "devpatel.cs.math@gmail.com") {
      if (this.settings.name === "DEV PATEL") this.settings.name = "DEVARSH VINOD";
      if (this.settings.email === "devpatel.cs.math@gmail.com") this.settings.email = "devarshvinod@gmail.com";
      this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    }
    this.projects = this.loadFromStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    this.experience = this.loadFromStorage(STORAGE_KEYS.EXPERIENCE, INITIAL_EXPERIENCE);
    this.education = this.loadFromStorage(STORAGE_KEYS.EDUCATION, INITIAL_EDUCATION);
    this.blogs = this.loadFromStorage(STORAGE_KEYS.BLOGS, INITIAL_BLOGS);
  }

  public static getInstance(): CMSStore {
    if (!CMSStore.instance) {
      CMSStore.instance = new CMSStore();
    }
    return CMSStore.instance;
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch (e) {
      console.warn(`[CMS] Failed reading storage key ${key}:`, e);
    }
    return fallback;
  }

  private saveToStorage<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[CMS] Failed writing storage key ${key}:`, e);
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  // --- Getters ---
  public getSettings(): SiteSettings {
    return { ...this.settings };
  }

  public getProjects(onlyFeatured = false): ProjectItem[] {
    const list = [...this.projects];
    if (onlyFeatured) {
      return list.filter((p) => p.featured).slice(0, this.settings.featuredProjectsLimit);
    }
    return list;
  }

  public getAllProjects(): ProjectItem[] {
    return [...this.projects];
  }

  public getExperience(onlyFeatured = false): ExperienceItem[] {
    const list = [...this.experience];
    if (onlyFeatured) {
      return list.filter((e) => e.featured).slice(0, this.settings.featuredExperienceLimit);
    }
    return list;
  }

  public getAllExperience(): ExperienceItem[] {
    return [...this.experience];
  }

  public getEducation(): EducationItem[] {
    return [...this.education];
  }

  public getBlogs(onlyFeatured = false): BlogItem[] {
    const list = [...this.blogs];
    if (onlyFeatured) {
      return list.filter((b) => b.featured).slice(0, this.settings.featuredBlogsLimit);
    }
    return list;
  }

  public getAllBlogs(): BlogItem[] {
    return [...this.blogs];
  }

  // --- Setters / Mutations ---
  public updateSettings(newSettings: Partial<SiteSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  // Projects
  public addProject(item: ProjectItem) {
    this.projects.unshift(item);
    this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  public updateProject(id: string, updates: Partial<ProjectItem>) {
    this.projects = this.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  public deleteProject(id: string) {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  public toggleProjectFeatured(id: string) {
    this.projects = this.projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p));
    this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  // Experience
  public addExperience(item: ExperienceItem) {
    this.experience.unshift(item);
    this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
    this.notify();
  }

  public updateExperience(id: string, updates: Partial<ExperienceItem>) {
    this.experience = this.experience.map((e) => (e.id === id ? { ...e, ...updates } : e));
    this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
    this.notify();
  }

  public deleteExperience(id: string) {
    this.experience = this.experience.filter((e) => e.id !== id);
    this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
    this.notify();
  }

  public toggleExperienceFeatured(id: string) {
    this.experience = this.experience.map((e) => (e.id === id ? { ...e, featured: !e.featured } : e));
    this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
    this.notify();
  }

  // Education
  public addEducation(item: EducationItem) {
    this.education.unshift(item);
    this.saveToStorage(STORAGE_KEYS.EDUCATION, this.education);
    this.notify();
  }

  public updateEducation(id: string, updates: Partial<EducationItem>) {
    this.education = this.education.map((e) => (e.id === id ? { ...e, ...updates } : e));
    this.saveToStorage(STORAGE_KEYS.EDUCATION, this.education);
    this.notify();
  }

  public deleteEducation(id: string) {
    this.education = this.education.filter((e) => e.id !== id);
    this.saveToStorage(STORAGE_KEYS.EDUCATION, this.education);
    this.notify();
  }

  // Blogs
  public addBlog(item: BlogItem) {
    this.blogs.unshift(item);
    this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);
    this.notify();
  }

  public updateBlog(id: string, updates: Partial<BlogItem>) {
    this.blogs = this.blogs.map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);
    this.notify();
  }

  public deleteBlog(id: string) {
    this.blogs = this.blogs.filter((b) => b.id !== id);
    this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);
    this.notify();
  }

  public toggleBlogFeatured(id: string) {
    this.blogs = this.blogs.map((b) => (b.id === id ? { ...b, featured: !b.featured } : b));
    this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);
    this.notify();
  }

  // Reset to default
  public resetToDefaults() {
    this.settings = { ...INITIAL_SETTINGS };
    this.projects = [...INITIAL_PROJECTS];
    this.experience = [...INITIAL_EXPERIENCE];
    this.education = [...INITIAL_EDUCATION];
    this.blogs = [...INITIAL_BLOGS];

    this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
    this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
    this.saveToStorage(STORAGE_KEYS.EDUCATION, this.education);
    this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);

    this.notify();
  }

  // Export / Import
  public exportPortfolioDataTS(): string {
    return `// Devarsh Vinod Portfolio & Content Architecture Database
// Automatically generated from CMS Studio

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  description: string;
  metrics: string[];
  tags: string[];
  featured: boolean;
  codeSnippet?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  bulletPoints: string[];
  featured: boolean;
  category: "work" | "competition";
}

export interface EducationItem {
  id: string;
  institution: string;
  program: string;
  period: string;
  grades: string;
  details: string[];
  featured: boolean;
}

export interface BlogItem {
  id: string;
  title: string;
  readTime: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured: boolean;
}

export interface SiteSettings {
  name: string;
  status: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  featuredProjectsLimit: number;
  featuredExperienceLimit: number;
  featuredBlogsLimit: number;
}

export const INITIAL_SETTINGS: SiteSettings = ${JSON.stringify(this.settings, null, 2)};

export const INITIAL_PROJECTS: ProjectItem[] = ${JSON.stringify(this.projects, null, 2)};

export const INITIAL_EXPERIENCE: ExperienceItem[] = ${JSON.stringify(this.experience, null, 2)};

export const INITIAL_EDUCATION: EducationItem[] = ${JSON.stringify(this.education, null, 2)};

export const INITIAL_BLOGS: BlogItem[] = ${JSON.stringify(this.blogs, null, 2)};
`;
  }

  public exportJSON(): string {
    return JSON.stringify(
      {
        settings: this.settings,
        projects: this.projects,
        experience: this.experience,
        education: this.education,
        blogs: this.blogs,
      },
      null,
      2
    );
  }

  public importJSON(jsonStr: string) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) this.settings = data.settings;
      if (data.projects) this.projects = data.projects;
      if (data.experience) this.experience = data.experience;
      if (data.education) this.education = data.education;
      if (data.blogs) this.blogs = data.blogs;

      this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
      this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
      this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
      this.saveToStorage(STORAGE_KEYS.EDUCATION, this.education);
      this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);

      this.notify();
    } catch (e) {
      console.error("[CMS] Failed to import JSON:", e);
      throw e;
    }
  }
}

export const cms = CMSStore.getInstance();
