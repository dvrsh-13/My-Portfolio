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
  SETTINGS: "folio_cms_settings_v3",
  PROJECTS: "folio_cms_projects_v3",
  EXPERIENCE: "folio_cms_experience_v3",
  EDUCATION: "folio_cms_education_v3",
  BLOGS: "folio_cms_blogs_v3",
};

export class CMSStore {
  private static instance: CMSStore;
  private settings!: SiteSettings;
  private projects!: ProjectItem[];
  private experience!: ExperienceItem[];
  private education!: EducationItem[];
  private blogs!: BlogItem[];
  private listeners: (() => void)[] = [];
  private memoryFallback: Record<string, string> = {};

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
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem(key);
        if (saved) {
          return JSON.parse(saved) as T;
        }
      }
    } catch (e) {
      console.warn(`[CMS] LocalStorage read failed for ${key}, checking fallback:`, e);
    }

    if (this.memoryFallback[key]) {
      try {
        return JSON.parse(this.memoryFallback[key]) as T;
      } catch {
        // Fall back to default
      }
    }
    return typeof structuredClone === "function"
      ? structuredClone(fallback)
      : (JSON.parse(JSON.stringify(fallback)) as T);
  }

  private saveToStorage<T>(key: string, value: T) {
    const serialized = JSON.stringify(value);
    this.memoryFallback[key] = serialized;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, serialized);
      }
    } catch (e) {
      console.warn(`[CMS] LocalStorage write failed for ${key}, retained in memory:`, e);
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
      if (typeof jsonStr !== "string" || !jsonStr.trim()) {
        throw new Error("Payload is empty or not a valid JSON string");
      }

      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Root JSON structure must be a non-null object");
      }

      // Guard against prototype pollution keys on parsed object
      const dangerousKeys = ["__proto__", "constructor", "prototype"];
      if (Object.keys(data).some((k) => dangerousKeys.includes(k))) {
        throw new Error("Unauthorized root key detected in JSON payload");
      }

      // 1. Settings validation & sanitization
      if (data.settings && typeof data.settings === "object" && !Array.isArray(data.settings)) {
        const s = data.settings;
        this.settings = {
          name: typeof s.name === "string" && s.name.trim() ? s.name.trim() : this.settings.name,
          status: typeof s.status === "string" && s.status.trim() ? s.status.trim() : this.settings.status,
          title: typeof s.title === "string" && s.title.trim() ? s.title.trim() : this.settings.title,
          bio: typeof s.bio === "string" && s.bio.trim() ? s.bio.trim() : this.settings.bio,
          location: typeof s.location === "string" && s.location.trim() ? s.location.trim() : this.settings.location,
          email: typeof s.email === "string" && s.email.trim() ? s.email.trim() : this.settings.email,
          github: typeof s.github === "string" && s.github.trim() ? s.github.trim() : this.settings.github,
          linkedin: typeof s.linkedin === "string" && s.linkedin.trim() ? s.linkedin.trim() : this.settings.linkedin,
          featuredProjectsLimit: Math.max(1, Math.min(10, Number(s.featuredProjectsLimit) || 3)),
          featuredExperienceLimit: Math.max(1, Math.min(10, Number(s.featuredExperienceLimit) || 3)),
          featuredBlogsLimit: Math.max(1, Math.min(10, Number(s.featuredBlogsLimit) || 3)),
        };
        this.saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
      }

      // 2. Projects validation
      if (Array.isArray(data.projects)) {
        const validProjects: ProjectItem[] = data.projects
          .filter((p: unknown) => p && typeof p === "object" && !Array.isArray(p))
          .map((p: Record<string, unknown>, idx: number) => ({
            id: typeof p.id === "string" && p.id.trim() ? p.id.trim() : `project-${idx + 1}`,
            title: typeof p.title === "string" && p.title.trim() ? p.title.trim() : "Untitled Project",
            subtitle: typeof p.subtitle === "string" ? p.subtitle.trim() : "",
            category: typeof p.category === "string" ? p.category.trim() : "Engineering",
            year: typeof p.year === "string" ? p.year.trim() : "2026",
            description: typeof p.description === "string" ? p.description.trim() : "",
            metrics: Array.isArray(p.metrics) ? p.metrics.filter((m): m is string => typeof m === "string") : [],
            tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === "string") : [],
            featured: Boolean(p.featured),
            codeSnippet: typeof p.codeSnippet === "string" ? p.codeSnippet : undefined,
          }));

        if (validProjects.length > 0) {
          this.projects = validProjects;
          this.saveToStorage(STORAGE_KEYS.PROJECTS, this.projects);
        }
      }

      // 3. Experience validation
      if (Array.isArray(data.experience)) {
        const validExp: ExperienceItem[] = data.experience
          .filter((e: unknown) => e && typeof e === "object" && !Array.isArray(e))
          .map((e: Record<string, unknown>, idx: number) => ({
            id: typeof e.id === "string" && e.id.trim() ? e.id.trim() : `exp-${idx + 1}`,
            role: typeof e.role === "string" && e.role.trim() ? e.role.trim() : "Role",
            company: typeof e.company === "string" && e.company.trim() ? e.company.trim() : "Organization",
            location: typeof e.location === "string" ? e.location.trim() : "London, UK",
            period: typeof e.period === "string" ? e.period.trim() : "",
            description: typeof e.description === "string" ? e.description.trim() : "",
            bulletPoints: Array.isArray(e.bulletPoints)
              ? e.bulletPoints.filter((b): b is string => typeof b === "string")
              : [],
            featured: Boolean(e.featured),
            category: e.category === "competition" ? "competition" : "work",
          }));

        if (validExp.length > 0) {
          this.experience = validExp;
          this.saveToStorage(STORAGE_KEYS.EXPERIENCE, this.experience);
        }
      }

      // 4. Education validation
      if (Array.isArray(data.education)) {
        const validEdu: EducationItem[] = data.education
          .filter((ed: unknown) => ed && typeof ed === "object" && !Array.isArray(ed))
          .map((ed: Record<string, unknown>, idx: number) => ({
            id: typeof ed.id === "string" && ed.id.trim() ? ed.id.trim() : `edu-${idx + 1}`,
            institution: typeof ed.institution === "string" ? ed.institution.trim() : "",
            program: typeof ed.program === "string" ? ed.program.trim() : "",
            period: typeof ed.period === "string" ? ed.period.trim() : "",
            grades: typeof ed.grades === "string" ? ed.grades.trim() : "",
            details: Array.isArray(ed.details) ? ed.details.filter((d): d is string => typeof d === "string") : [],
            featured: Boolean(ed.featured),
          }));

        if (validEdu.length > 0) {
          this.education = validEdu;
          this.saveToStorage(STORAGE_KEYS.EDUCATION, this.education);
        }
      }

      // 5. Blogs validation
      if (Array.isArray(data.blogs)) {
        const validBlogs: BlogItem[] = data.blogs
          .filter((b: unknown) => b && typeof b === "object" && !Array.isArray(b))
          .map((b: Record<string, unknown>, idx: number) => ({
            id: typeof b.id === "string" && b.id.trim() ? b.id.trim() : `blog-${idx + 1}`,
            title: typeof b.title === "string" && b.title.trim() ? b.title.trim() : "Untitled Dispatch",
            readTime: typeof b.readTime === "string" ? b.readTime.trim() : "5 min read",
            date: typeof b.date === "string" ? b.date.trim() : "2026",
            excerpt: typeof b.excerpt === "string" ? b.excerpt.trim() : "",
            content: typeof b.content === "string" ? b.content.trim() : "",
            tags: Array.isArray(b.tags) ? b.tags.filter((t): t is string => typeof t === "string") : [],
            featured: Boolean(b.featured),
          }));

        if (validBlogs.length > 0) {
          this.blogs = validBlogs;
          this.saveToStorage(STORAGE_KEYS.BLOGS, this.blogs);
        }
      }

      this.notify();
    } catch (e) {
      console.error("[CMS] Failed to import JSON:", e);
      throw e;
    }
  }
}

export const cms = CMSStore.getInstance();
