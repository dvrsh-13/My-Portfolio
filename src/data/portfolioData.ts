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
  name: "Devarsh Vinod",
  status: "ACTIVE CANDIDATE",
  title: "Computer Science & Mathematics · Degree Apprenticeship Candidate",
  bio: "Gap year student specialising in Computer Science and Mathematics, aiming for a degree apprenticeship. Strong interest in software engineering, systems engineering, data analytics, and mathematical modelling in quantitative finance.",
  location: "LONDON, UK",
  email: "devarsh.vinod@outlook.com",
  github: "https://github.com/dvrsh-13",
  linkedin: "https://linkedin.com",
  featuredProjectsLimit: 3,
  featuredExperienceLimit: 3,
  featuredBlogsLimit: 3,
};

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "backtest-overfitting",
    title: "Backtest Overfitting Detector",
    subtitle: "Brent & Henry Hub Spot Prices Analysis",
    category: "Quantitative Finance & Python",
    year: "2026",
    description:
      "A statistical validation engine designed to test whether trading strategies reflect genuine market edges or selection bias. Evaluated 520 simulated strategies on random and historical commodity data using the Deflated Sharpe Ratio.",
    metrics: [
      "Tested across up to 38 years of Brent & Henry Hub price series",
      "Standard tests falsely approved 100% of overfit strategies; Deflated Sharpe rejected all",
      "Best in-sample Brent strategy (Sharpe 0.57) reversed to -0.28 on out-of-sample data",
    ],
    tags: ["Python", "NumPy", "Pandas", "Deflated Sharpe Ratio", "Statistical Arbitrage"],
    featured: true,
    codeSnippet: `def deflated_sharpe_ratio(returns, n_trials, var_sharpe):
    # Adjusts annualised Sharpe for multiple testing & selection bias
    gamma = 0.5772156649  # Euler-Mascheroni constant
    expected_max = (1 - gamma) * norm.ppf(1 - 1/n_trials) + gamma * norm.ppf(1 - 1/(n_trials * np.e))
    dsr_stat = (sharpe - expected_max) / np.sqrt(var_sharpe)
    return 1 - norm.cdf(-dsr_stat)`,
  },
  {
    id: "fourier-stock-filter",
    title: "Fourier Transform Stock Analysis",
    subtitle: "Spectral Time-Series Decomposition",
    category: "Signal Processing & Data Analytics",
    year: "2024",
    description:
      "Applied Fast Fourier Transforms (FFT) in Python and MATLAB to multi-year equity time series to isolate spectral frequencies, filter high-frequency microstructure noise, and extract underlying secular market trends.",
    metrics: [
      "Frequency domain filtering isolating low-frequency market cycles",
      "Benchmarked FFT noise reduction against exponential moving averages",
      "Implemented custom inverse-FFT reconstruction algorithms in NumPy",
    ],
    tags: ["Python", "MATLAB", "SciPy", "FFT", "Time-Series Analysis"],
    featured: true,
    codeSnippet: `def fourier_filter(series, cutoff_freq):
    # Transform to frequency domain and zero high-frequency noise
    fft_vals = np.fft.rfft(series)
    fft_vals[cutoff_freq:] = 0
    return np.fft.irfft(fft_vals, n=len(series))`,
  },
  {
    id: "m3-challenge-model",
    title: "Monte Carlo Risk & XGBoost Demographics",
    subtitle: "MathWorks Math Modelling (M3) Challenge",
    category: "Predictive Analytics & Simulation",
    year: "2026",
    description:
      "Trained an XGBoost gradient boosting model on UK behavioural datasets and engineered Monte Carlo stochastic simulations to forecast yearly profit and loss by demographic cohorts, quantifying downside financial risk.",
    metrics: [
      "Placed Top 20% Worldwide in rigorous mathematical modelling competition",
      "100,000-iteration Monte Carlo trials mapping extreme tail risk distributions",
      "Evaluated feature importance metrics with Scikit-learn and Seaborn",
    ],
    tags: ["XGBoost", "Monte Carlo", "Scikit-Learn", "Matplotlib", "Risk Modelling"],
    featured: true,
  },
  {
    id: "satellite-comm-sim",
    title: "Mock LEO Surveillance Satellite",
    subtitle: "Lockheed Martin Harwell Engineering",
    category: "Systems & Defence Computing",
    year: "2025",
    description:
      "Collaborative systems engineering simulation of a Low Earth Orbit (LEO) reconnaissance satellite payload for defence monitoring, analysing onboard data bandwidth and high-performance downlinks.",
    metrics: [
      "Modelled orbital pass windows and telemetry data compression",
      "Explored high-performance computing constraints in secure environments",
    ],
    tags: ["Systems Engineering", "Data Downlink", "HPC", "Defence Systems"],
    featured: false,
  },
];

export const INITIAL_EXPERIENCE: ExperienceItem[] = [
  {
    id: "exp-bp",
    role: "Work Experience",
    company: "BP",
    location: "Sunbury-on-Thames, UK",
    period: "Oct 2026",
    category: "work",
    description:
      "Commercial and systems engineering placement exploring enterprise energy operations and technical early careers.",
    bulletPoints: [
      "Developed teamwork, communication and presentation skills, and prepared for interviews and assessment centres.",
      "Spoke with professionals about their roles and early careers routes, including apprenticeships, to inform my next step.",
    ],
    featured: true,
  },
  {
    id: "exp-cognizant",
    role: "Work Experience",
    company: "Cognizant",
    location: "London, UK",
    period: "Sep 2025",
    category: "work",
    description:
      "Predictive valuation modelling and machine learning regression pipeline development.",
    bulletPoints: [
      "Built a Random Forest regression model to predict vehicle prices, covering data cleaning, exploratory data analysis (EDA), feature selection, and model training.",
      "Identified non-linear patterns through EDA and independently decided to switch from a linear model to a Random Forest, improving predictive accuracy.",
    ],
    featured: true,
  },
  {
    id: "exp-lockheed",
    role: "Work Experience",
    company: "Lockheed Martin",
    location: "Harwell, UK",
    period: "Jul 2025",
    category: "work",
    description:
      "Aerospace and defence systems engineering placement under Ministry of Defence project scopes.",
    bulletPoints: [
      "Collaborated with a team to design a mock LEO surveillance satellite for the Ministry of Defence under project deadlines.",
      "Learnt how high-performance computing and data processing inform modern defence and global security.",
    ],
    featured: true,
  },
  {
    id: "exp-hs2",
    role: "Work Experience",
    company: "HS2 (High Speed Two)",
    location: "Ruislip, UK",
    period: "May 2023 – Jun 2023",
    category: "work",
    description:
      "Infrastructure systems engineering and cost constraint optimisation.",
    bulletPoints: [
      "Led a team to design a high-speed rail system, balancing engineering requirements against cost constraints.",
      "Secured first place by presenting our solution to a board of directors.",
    ],
    featured: false,
  },
  {
    id: "comp-m3-challenge",
    role: "Top 20% Worldwide",
    company: "MathWorks Math Modelling (M3) Challenge",
    location: "International / Remote",
    period: "2026",
    category: "competition",
    description:
      "Trained an XGBoost gradient boosting model on UK behavioural datasets and engineered Monte Carlo stochastic simulations to quantify demographic tail risk.",
    bulletPoints: [
      "Trained an XGBoost gradient boosting model on UK behavioural datasets and engineered Monte Carlo stochastic simulations to quantify demographic tail risk.",
      "Produced technical paper documenting stochastic risk distribution across age cohorts under strict 14-hour deadline.",
    ],
    featured: true,
  },
  {
    id: "comp-code-quest",
    role: "Advanced Division Podium Winner",
    company: "Lockheed Martin Code Quest",
    location: "Harwell, UK",
    period: "2025 & 2026",
    category: "competition",
    description:
      "Algorithmic competitive programming in Python under tight time limits.",
    bulletPoints: [
      "Led team to Top 3 (2026) and 2nd place (2025) in algorithmic problem solving using Python, working under tight time limits.",
      "Optimised graph traversal, dynamic programming, and data structure efficiency under strict evaluation criteria.",
    ],
    featured: true,
  },
];

export const INITIAL_EDUCATION: EducationItem[] = [
  {
    id: "upton-court",
    institution: "Upton Court Grammar School",
    program: "A-Levels: Computer Science, Mathematics, Further Mathematics",
    period: "Sep 2024 — Aug 2026",
    grades: "Achieved AAA",
    details: [
      "Extended Project Qualification (EPQ) Dissertation — Grade A: 'Use of AI in Autonomous Weaponry and Cyber Warfare'",
      "Leadership: Sixth Form Student Leader, Digital Team Member, Former Co-lead of Computing Society",
      "Rigorous study in pure mathematics, complex numbers, matrices, differential equations, and computational data structures",
    ],
    featured: true,
  },
  {
    id: "cambridge-stem-smart",
    institution: "University of Cambridge & Isaac Physics",
    program: "Cambridge STEM Smart Scholar",
    period: "Jan 2025 — Dec 2025",
    grades: "Selective STEM Programme",
    details: [
      "Advanced problem-solving programme conducted in partnership with the University of Cambridge",
      "Subject focus: Computer Science, Double Mathematics (Pure Mathematics, Mechanics, Discrete Methods)",
      "Intensive weekly problem sets and supervision lectures covering undergraduate-level mathematics and algorithms",
    ],
    featured: true,
  },
  {
    id: "de-salis",
    institution: "De Salis Studio College",
    program: "GCSE Qualifications",
    period: "Sep 2021 — Jun 2024",
    grades: "Maths 9, Further Maths 8, Statistics 7, English Lang 8, English Lit 8",
    details: [
      "Top grade 9 in Mathematics, with grade 8 in Further Mathematics and 7 in Statistics",
      "Demonstrated early distinction in quantitative analysis and formal mathematical reasoning",
    ],
    featured: true,
  },
];

export const INITIAL_BLOGS: BlogItem[] = [
  {
    id: "backtest-overfitting-notes",
    title: "Why Most Quantitative Backtests Lie: The Deflated Sharpe Ratio",
    date: "February 2026",
    excerpt:
      "Exploring selection bias and p-hacking in quantitative trading strategies. How testing multiple parameter variations guarantees false positives without statistical deflation.",
    content:
      "When a quantitative researcher runs hundreds of iterations of a moving average crossover or momentum strategy, the maximum observed Sharpe ratio is not a sample from a standard distribution—it is the maximum of a family of correlated random variables. In this note, we examine Bailey and Lopez de Prado's Deflated Sharpe Ratio, applying it to 38 years of Brent and Henry Hub commodity price data...",
    tags: ["Quantitative Finance", "Statistics", "Python"],
    featured: true,
  },
  {
    id: "ai-in-warfare-epq",
    title: "Autonomous Weaponry & Cyber Warfare: Strategic Invariants of AI",
    date: "December 2025",
    excerpt:
      "An executive digest of my Grade A EPQ dissertation analysing the algorithmic ethics, target classification latencies, and cyber defence vectors of autonomous systems.",
    content:
      "The integration of machine learning classifiers into kinetic military systems introduces unprecedented verification challenges. Unlike software systems where exceptions can be caught and rolled back, autonomous targeting operates under hard real-time latency deadlines in adversarial environments...",
    tags: ["EPQ Dissertation", "AI Ethics", "Systems Engineering"],
    featured: true,
  },
  {
    id: "fourier-transform-intuition",
    title: "Deconstructing Market Noise with the Discrete Fourier Transform",
    date: "August 2024",
    excerpt:
      "A geometric and visual walkthrough of transitioning time-series asset prices into the frequency domain using FFT in Python and MATLAB.",
    content:
      "Financial time series are notoriously non-stationary and noisy. By viewing prices not as a sequence of discrete moments in time, but as an interference pattern of underlying cyclical frequencies, we can use Fast Fourier Transforms to cleanly separate systemic rhythm from microsecond noise...",
    tags: ["Mathematics", "Signal Processing", "NumPy"],
    featured: true,
  },
  {
    id: "random-forest-vs-linear",
    title: "Linear Assumptions in Non-Linear Domains: A Cognizant Case Study",
    date: "October 2025",
    excerpt:
      "Observations from building vehicle price regression models: when exploratory data analysis demands abandoning linear regression for tree ensembles.",
    content:
      "During my machine learning placement at Cognizant, residual plots of vehicle prices quickly demonstrated heteroscedasticity and non-linear feature interactions that linear regression could not accommodate...",
    tags: ["Machine Learning", "Scikit-Learn", "EDA"],
    featured: false,
  },
];
