/* ==========================================================================
   SINGLE SOURCE OF TRUTH
   Add projects, services, skills or social links here — every section, the
   filterable gallery and the case-study routes read from these arrays.
   Nothing here is invented: only the details supplied by James are listed.
   ========================================================================== */

import yancyImg from "@/assets/projects/yancy.jpg";
import racingImg from "@/assets/projects/ihenya-racing.jpg";
import travelsImg from "@/assets/projects/emmar-travels.jpg";
import skypaintsImg from "@/assets/projects/skypaints.jpg";

export type CoverKey = "yancy" | "racing" | "travels" | "skypaints" | "generic";

export type Project = {
  slug: string;
  title: string;
  /** One-line descriptor exactly as supplied. */
  line: string;
  categories: CategoryId[];
  cover: CoverKey;
  /** Cover artwork shown on cards & case studies. */
  image: string;
  accent: "gold" | "aqua" | "clay";
  /** Supplied below — leave arrays empty until James confirms the details. */
  role: string;
  description: string;
  services: string[];
  technologies: string[];
  live: string; // live URL — renders only when provided
  repo: string; // optional GitHub URL
  gallery: { src: string; caption: string }[];
  year: string;
};

export type CategoryId = "web" | "uiux" | "graphics" | "games" | "creative-tech";

export const CATEGORIES: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "uiux", label: "UI/UX" },
  { id: "graphics", label: "Graphics" },
  { id: "games", label: "Games" },
  { id: "creative-tech", label: "Creative Technology" },
];

export const PROJECTS: Project[] = [
  {
    slug: "yancy-graphics",
    title: "Yancy Graphics",
    line: "Website Design & Development",
    categories: ["web"],
    cover: "yancy",
    image: yancyImg,
    accent: "gold",
    role: "",
    description:
      "A design studio's own front door: a site built to present work cleanly, load fast and convert visitors into enquiries.",
    services: ["Website Design", "Development"],
    technologies: [],
    live: "",
    repo: "",
    gallery: [],
    year: "",
  },
  {
    slug: "ihenya-racing",
    title: "Ihenya Racing",
    line: "Racing Game Landing Page • UI/UX • Web Development",
    categories: ["web", "uiux", "games"],
    cover: "racing",
    image: racingImg,
    accent: "aqua",
    role: "",
    description:
      "A landing page with the pace of the product it announces — motion-first layout, clear hierarchy and a signup path that stays out of the way.",
    services: ["Landing Page", "UI/UX", "Web Development"],
    technologies: [],
    live: "",
    repo: "",
    gallery: [],
    year: "",
  },
  {
    slug: "emmar-travels",
    title: "Emmar Travels",
    line: "Travel Agency Website • UI/UX • Web Development",
    categories: ["web", "uiux"],
    cover: "travels",
    image: travelsImg,
    accent: "clay",
    role: "",
    description:
      "A travel agency site organised around intent: browse destinations, compare trips, send an enquiry — with photography doing the persuading.",
    services: ["Website Design", "UI/UX", "Web Development"],
    technologies: [],
    live: "",
    repo: "",
    gallery: [],
    year: "",
  },
  {
    slug: "skypaints",
    title: "Skypaints",
    line: "Business Website • Web Design & Development",
    categories: ["web"],
    cover: "skypaints",
    image: skypaintsImg,
    accent: "aqua",
    role: "",
    description:
      "A business website that makes a trade look as considered as it is — services, coverage and a quote request wired into every scroll.",
    services: ["Web Design", "Development"],
    technologies: [],
    live: "",
    repo: "",
    gallery: [],
    year: "",
  },
];

/* -------------------------------------------------------------------------- */

export type Service = {
  id: string;
  index: string;
  title: string;
  blurb: string;
  detail: string[];
  icon: "code" | "layers" | "pen" | "dataset" | "spark";
};

export const SERVICES: Service[] = [
  {
    id: "web-development",
    index: "01",
    title: "Web Development",
    blurb: "Responsive websites, landing pages and interactive web experiences.",
    detail: [
      "Semantic, accessible, SEO-considered markup",
      "Responsive down to the smallest Android screen",
      "Motion systems, CMS & form integrations",
    ],
    icon: "code",
  },
  {
    id: "ui-ux-design",
    index: "02",
    title: "UI/UX Design",
    blurb: "Modern interfaces focused on usability, visual hierarchy and conversion.",
    detail: [
      "Wireframes through high-fidelity prototypes",
      "Design systems and reusable component sets",
      "Journey mapping and conversion reviews",
    ],
    icon: "layers",
  },
  {
    id: "graphic-design",
    index: "03",
    title: "Graphic Design",
    blurb: "Digital graphics, promotional artwork, branding and social media visuals.",
    detail: [
      "Logo & brand asset kits",
      "Campaign and promotional artwork",
      "Social templates sized per platform",
    ],
    icon: "pen",
  },
  {
    id: "data-annotation",
    index: "04",
    title: "Data Annotation & AI Data Work",
    blurb: "Image annotation, text annotation, categorization, labeling, data validation and quality assurance.",
    detail: [
      "Bounding boxes, polygons, keypoints, segmentation",
      "Text labeling, entity tagging, categorization",
      "Validation passes and QA review loops",
    ],
    icon: "dataset",
  },
  {
    id: "creative-technology",
    index: "05",
    title: "Creative Technology",
    blurb: "Interactive digital experiences combining design, development, animation and emerging technologies.",
    detail: [
      "WebGL & real-time particle environments",
      "Scroll-linked storytelling",
      "Prototypes for demos, launches and installations",
    ],
    icon: "spark",
  },
];

/* -------------------------------------------------------------------------- */

export const DATA_CAPABILITIES = [
  {
    id: "IMG",
    label: "Image annotation",
    items: ["Bounding boxes", "Polygons", "Keypoints", "Semantic segmentation"],
  },
  {
    id: "TXT",
    label: "Text annotation",
    items: ["Entity tagging", "Sentiment", "Intent labels", "Transcription review"],
  },
  {
    id: "CAT",
    label: "Categorization & labeling",
    items: ["Taxonomy mapping", "Class balancing", "Labeling queues", "Guideline adherence"],
  },
  {
    id: "QA",
    label: "Validation & QA",
    items: ["Consensus checks", "Gold-set scoring", "Error triage", "Edge-case flagging"],
  },
];

export const DATA_WORKFLOW = [
  { step: "01", label: "Ingest", note: "Batch intake & guideline read-through" },
  { step: "02", label: "Label", note: "Annotate to spec, one class at a time" },
  { step: "03", label: "Validate", note: "Second pass against the rubric" },
  { step: "04", label: "QA", note: "Sampling, disagreement resolution" },
  { step: "05", label: "Deliver", note: "Clean exports, versioned & logged" },
];

export const DATA_SPEC = [
  { k: "Tooling", v: "Labeling platforms & guidelines provided per project" },
  { k: "Modalities", v: "Images · Text · Bounding geometry · Categories" },
  { k: "Throughput", v: "Sized to the batch — steady daily quotas" },
  { k: "Confidentiality", v: "Data stays inside the agreed platform" },
];

/* -------------------------------------------------------------------------- */

/** Extend freely as new tools are confirmed. */
export const SKILL_GROUPS: { id: string; label: string; items: string[] }[] = [
  { id: "build", label: "Build", items: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS"] },
  { id: "design", label: "Design", items: ["Figma", "UI systems", "Prototyping", "Graphic composition"] },
  { id: "motion", label: "Motion / 3D", items: ["Framer Motion", "Three.js", "GSAP"] },
  { id: "data", label: "Data / AI", items: ["Image annotation", "Text annotation", "Validation & QA"] },
];

export const CONTACT = {
  name: "James Irungu",
  role: "Designer, Developer & Digital Creative",
  tagline: "Transforming Ideas Into Digital Reality.",
  email: "jayirungu4@gmail.com",
  phoneDisplay: "+254 17747808",
  phoneHref: "tel:+25417747808",
  location: "Nairobi, Kenya",
  timezone: "Africa/Nairobi",
  availability: "Open for website, design & data-annotation work",
};

/** Add handles/URLs here — the contact & footer rows render only real links. */
export const SOCIALS: { id: string; label: string; handle: string; url: string }[] = [];

export const NAV_LINKS = [
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "data-annotation", label: "Data Annotation" },
  { id: "contact", label: "Contact" },
];

export const HERO_DISCIPLINES = [
  "Website Design & Development",
  "UI / UX Design",
  "Graphic Design & Branding",
  "Data Annotation & AI Data Work",
  "Creative Technology",
  "Interactive Experiences",
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
