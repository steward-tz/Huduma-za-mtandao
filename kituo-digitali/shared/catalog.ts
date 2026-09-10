export type ServiceStatus = "available" | "soon";

export type ServiceCatalogItem = {
  slug: string;
  name: string;
  category: string;
  description: string;
  detail: string;
  icon: string;
  accent: string;
  credits: number;
  status: ServiceStatus;
  tag?: string;
};

export type ActivityItem = {
  service: string;
  type: string;
  credits: number;
  status: string;
  reference: string;
  createdAt: string;
};

export const serviceCatalog: ServiceCatalogItem[] = [
  {
    slug: "invoice-studio",
    name: "Invoice Studio",
    category: "Business tools",
    description: "Create polished invoices and payment reminders in minutes.",
    detail: "Build a reusable invoice, export it, and keep every version close at hand.",
    icon: "receipt",
    accent: "aqua",
    credits: 2,
    status: "available",
    tag: "Popular",
  },
  {
    slug: "document-desk",
    name: "Document Desk",
    category: "Documents",
    description: "Turn rough notes into clear, ready-to-share documents.",
    detail: "Start with a brief, choose a format, and receive a clean document draft.",
    icon: "file-text",
    accent: "violet",
    credits: 3,
    status: "available",
    tag: "New",
  },
  {
    slug: "brand-spark",
    name: "Brand Spark",
    category: "Creative",
    description: "Generate a focused mini direction for your next campaign.",
    detail: "Clarify a visual direction with a name, message, audience, and launch checklist.",
    icon: "sparkles",
    accent: "amber",
    credits: 4,
    status: "available",
  },
  {
    slug: "stock-check",
    name: "Stock Check",
    category: "Operations",
    description: "Review a small inventory snapshot and spot what needs attention.",
    detail: "Paste your current stock list to get a simple restock view.",
    icon: "boxes",
    accent: "mint",
    credits: 2,
    status: "available",
  },
  {
    slug: "profile-kit",
    name: "Profile Kit",
    category: "Growth",
    description: "Shape a clear professional profile for web and social use.",
    detail: "Turn your experience into concise profile copy and a bio system.",
    icon: "badge-check",
    accent: "coral",
    credits: 3,
    status: "soon",
    tag: "Soon",
  },
  {
    slug: "market-pulse",
    name: "Market Pulse",
    category: "Insights",
    description: "A lightweight snapshot for comparing your next opportunity.",
    detail: "Capture the signal, compare the options, and save the next step.",
    icon: "chart-no-axes-combined",
    accent: "blue",
    credits: 5,
    status: "soon",
  },
];

export const activitySeed: ActivityItem[] = [
  { service: "Invoice Studio", type: "Invoice draft", credits: 2, status: "Complete", reference: "KD-81A2", createdAt: "2026-09-09T16:25:00.000Z" },
  { service: "Document Desk", type: "Brief cleanup", credits: 3, status: "Complete", reference: "KD-80F4", createdAt: "2026-09-07T09:10:00.000Z" },
  { service: "Brand Spark", type: "Campaign starter", credits: 4, status: "Complete", reference: "KD-7D91", createdAt: "2026-09-02T12:40:00.000Z" },
];

export function findService(slug: string) {
  return serviceCatalog.find((service) => service.slug === slug);
}

export function getCatalogIconName(slug: string) {
  return findService(slug)?.icon ?? "circle-dashed";
}

export function formatCatalogDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
