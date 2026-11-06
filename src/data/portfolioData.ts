// Devarsh Vinod Portfolio & Content Architecture Database
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
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured: boolean;
  readTime?: string;
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

export const INITIAL_SETTINGS: SiteSettings = {
  "name": "Devarsh Vinod",
  "status": "ACTIVE CANDIDATE",
  "title": "Computer Science & Mathematics · Gap Year Student",
  "bio": "Gap year student specialising in Computer Science and Mathematics, aiming for a degree apprenticeship. Strong interest in software engineering, systems engineering, data analytics, and mathematical modelling in quantitative finance.",
  "location": "LONDON, UK",
  "email": "devarsh.vinod@outlook.com",
  "github": "https://github.com/dvrsh-13",
  "linkedin": "https://www.linkedin.com/in/devarsh-vinod/",
  "featuredProjectsLimit": 3,
  "featuredExperienceLimit": 3,
  "featuredBlogsLimit": 3
};

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    "id": "backtest-overfitting",
    "title": "Backtest Overfitting Detector",
    "subtitle": "Brent & Henry Hub Spot Prices Analysis",
    "category": "Quantitative Finance & Python",
    "year": "2026",
    "description": "A statistical validation engine designed to test whether trading strategies reflect genuine market edges or selection bias. Evaluated 520 simulated strategies on random and historical commodity data using the Deflated Sharpe Ratio.",
    "metrics": [
      "Tested across up to 38 years of Brent & Henry Hub price series",
      "Standard tests falsely approved 100% of overfit strategies; Deflated Sharpe rejected all",
      "Best in-sample Brent strategy (Sharpe 0.57) reversed to -0.28 on out-of-sample data"
    ],
    "tags": [
      "Python",
      "NumPy",
      "Pandas",
      "Deflated Sharpe Ratio",
      "Statistical Arbitrage"
    ],
    "featured": true,
    "codeSnippet": "def deflated_sharpe_ratio(returns, n_trials, var_sharpe):\n    # Adjusts annualised Sharpe for multiple testing & selection bias\n    gamma = 0.5772156649  # Euler-Mascheroni constant\n    expected_max = (1 - gamma) * norm.ppf(1 - 1/n_trials) + gamma * norm.ppf(1 - 1/(n_trials * np.e))\n    dsr_stat = (sharpe - expected_max) / np.sqrt(var_sharpe)\n    return 1 - norm.cdf(-dsr_stat)"
  }
];

export const INITIAL_EXPERIENCE: ExperienceItem[] = [
  {
    "id": "exp-bp",
    "role": "Work Experience",
    "company": "BP",
    "location": "Sunbury-on-Thames, UK",
    "period": "Oct 2026",
    "category": "work",
    "description": "Commercial and systems engineering placement exploring enterprise energy operations and technical early careers.",
    "bulletPoints": [
      "Developed teamwork, communication and presentation skills, and prepared for interviews and assessment centres.",
      "Spoke with professionals about their roles and early careers routes, including apprenticeships, to inform my next step."
    ],
    "featured": true
  },
  {
    "id": "exp-cognizant",
    "role": "Work Experience",
    "company": "Cognizant",
    "location": "London, UK",
    "period": "Sep 2025",
    "category": "work",
    "description": "Predictive valuation modelling and machine learning regression pipeline development.",
    "bulletPoints": [
      "Built a Random Forest regression model to predict vehicle prices, covering data cleaning, exploratory data analysis (EDA), feature selection, and model training.",
      "Identified non-linear patterns through EDA and independently decided to switch from a linear model to a Random Forest, improving predictive accuracy."
    ],
    "featured": true
  },
  {
    "id": "exp-lockheed",
    "role": "Work Experience",
    "company": "Lockheed Martin",
    "location": "Harwell, UK",
    "period": "Jul 2025",
    "category": "work",
    "description": "Aerospace and defence systems engineering placement under Ministry of Defence project scopes.",
    "bulletPoints": [
      "Collaborated with a team to design a mock LEO surveillance satellite for the Ministry of Defence under project deadlines.",
      "Learnt how high-performance computing and data processing inform modern defence and global security."
    ],
    "featured": true
  },
  {
    "id": "exp-hs2",
    "role": "Work Experience",
    "company": "HS2 (High Speed Two)",
    "location": "Ruislip, UK",
    "period": "May 2023 – Jun 2023",
    "category": "work",
    "description": "Infrastructure systems engineering and cost constraint optimisation.",
    "bulletPoints": [
      "Led a team to design a high-speed rail system, balancing engineering requirements against cost constraints.",
      "Secured first place by presenting our solution to a board of directors."
    ],
    "featured": false
  },
  {
    "id": "comp-m3-challenge",
    "role": "Top 20% Worldwide",
    "company": "MathWorks Math Modelling (M3) Challenge",
    "location": "International / Remote",
    "period": "2026",
    "category": "competition",
    "description": "Trained an XGBoost  model on UK behavioural datasets and used Monte Carlo simulations to predict yearly gambling profit & loss based on demographics.",
    "bulletPoints": [
      "Trained an XGBoost  model on UK behavioural datasets and used Monte Carlo simulations to predict yearly gambling profit & loss based on demographics.",
      "Produced technical paper  under strict 14-hour deadline through effective collaboration and teamwork."
    ],
    "featured": true
  },
  {
    "id": "comp-code-quest",
    "role": "Advanced Division Podium Winner",
    "company": "Lockheed Martin Code Quest",
    "location": "Harwell, UK",
    "period": "2025 & 2026",
    "category": "competition",
    "description": "Algorithmic competitive programming in Python under tight time limits.",
    "bulletPoints": [
      "Led team to Top 3 (2026) and 2nd place (2025) in algorithmic problem solving using Python, working under tight time limits.",
      "Optimised graph traversal, dynamic programming, and data structure efficiency under strict evaluation criteria."
    ],
    "featured": true
  }
];

export const INITIAL_EDUCATION: EducationItem[] = [
  {
    "id": "upton-court",
    "institution": "Upton Court Grammar School",
    "program": "A-Levels: Computer Science, Mathematics, Further Mathematics",
    "period": "Sep 2024 — Aug 2026",
    "grades": "Achieved AAA",
    "details": [
      "Extended Project Qualification (EPQ) Dissertation — Grade A: 'Use of AI in Autonomous Weaponry and Cyber Warfare'",
      "Leadership: Sixth Form Student Leader, Digital Team Member, Former Co-lead of Computing Society",
      "Rigorous study in pure mathematics, complex numbers, matrices, differential equations, and computational data structures"
    ],
    "featured": true
  },
  {
    "id": "de-salis",
    "institution": "De Salis Studio College",
    "program": "GCSE Qualifications",
    "period": "Sep 2021 — Jun 2024",
    "grades": "Maths 9, Further Maths 8, Statistics 7, English Language 8, English Literature 8",
    "details": [
      "Achieved  grade 9 in Mathematics, with grade 8 in Further Mathematics and 7 in Statistics"
    ],
    "featured": true
  }
];

export const INITIAL_BLOGS: BlogItem[] = [];
