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
    name: "Studio ya Ankara",
    category: "Zana za biashara",
    description: "Tengeneza ankara nadhifu na vikumbusho vya malipo kwa dakika chache.",
    detail: "Tengeneza ankara inayotumika tena, ihamishe na hifadhi kila toleo karibu.",
    icon: "receipt",
    accent: "aqua",
    credits: 2,
    status: "available",
    tag: "Maarufu",
  },
  {
    slug: "document-desk",
    name: "Dawati la Nyaraka",
    category: "Nyaraka",
    description: "Badilisha noti mbichi kuwa nyaraka zilizo wazi na tayari kushirikiwa.",
    detail: "Anza na maelezo, chagua muundo na pata rasimu safi ya waraka.",
    icon: "file-text",
    accent: "violet",
    credits: 3,
    status: "available",
    tag: "Mpya",
  },
  {
    slug: "brand-spark",
    name: "Cheche ya Chapa",
    category: "Ubunifu",
    description: "Tengeneza mwelekeo mfupi wa kampeni yako inayofuata.",
    detail: "Fafanua mwelekeo wa kuona kwa jina, ujumbe, walengwa na orodha ya uzinduzi.",
    icon: "sparkles",
    accent: "amber",
    credits: 4,
    status: "available",
  },
  {
    slug: "stock-check",
    name: "Ukaguzi wa Stoo",
    category: "Uendeshaji",
    description: "Kagua muhtasari wa stoo na ona kinachohitaji uangalizi.",
    detail: "Bandika orodha yako ya sasa ya stoo kupata mwonekano wa kujaza tena.",
    icon: "boxes",
    accent: "mint",
    credits: 2,
    status: "available",
  },
  {
    slug: "profile-kit",
    name: "Kifurushi cha Wasifu",
    category: "Ukuaji",
    description: "Tengeneza wasifu wa kitaalamu kwa tovuti na mitandao ya kijamii.",
    detail: "Badilisha uzoefu wako kuwa maandishi mafupi ya wasifu na mfumo wa wasifu.",
    icon: "badge-check",
    accent: "coral",
    credits: 3,
    status: "soon",
    tag: "Karibuni",
  },
  {
    slug: "market-pulse",
    name: "Mapigo ya Soko",
    category: "Maarifa",
    description: "Muhtasari mwepesi wa kulinganisha fursa yako inayofuata.",
    detail: "Kusanya ishara, linganisha chaguo na hifadhi hatua inayofuata.",
    icon: "chart-no-axes-combined",
    accent: "blue",
    credits: 5,
    status: "soon",
  },
];

export const activitySeed: ActivityItem[] = [
  { service: "Studio ya Ankara", type: "Rasimu ya ankara", credits: 2, status: "Imekamilika", reference: "KD-81A2", createdAt: "2026-09-09T16:25:00.000Z" },
  { service: "Dawati la Nyaraka", type: "Usafishaji wa maelezo", credits: 3, status: "Imekamilika", reference: "KD-80F4", createdAt: "2026-09-07T09:10:00.000Z" },
  { service: "Cheche ya Chapa", type: "Mwanzo wa kampeni", credits: 4, status: "Imekamilika", reference: "KD-7D91", createdAt: "2026-09-02T12:40:00.000Z" },
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
