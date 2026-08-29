import occasionsData from "@/presentation/assets/occasions.json";

export type OccasionLang = "pt" | "en";

export interface OccasionFaq {
  q: string;
  a: string;
}

export interface OccasionCopy {
  label: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  question: string;
  yesText: string;
  noText: string;
  answer: string;
  faq: OccasionFaq[];
}

export interface Occasion {
  slug: { pt: string; en: string };
  icon: string;
  pt: OccasionCopy;
  en: OccasionCopy;
}

export interface OccasionMatch {
  occasion: Occasion;
  lang: OccasionLang;
}

export const OCCASIONS = occasionsData as Occasion[];

export const findOccasionBySlug = (
  slug: string | null
): OccasionMatch | undefined => {
  if (!slug) return undefined;
  for (const occasion of OCCASIONS) {
    if (occasion.slug.pt === slug) return { occasion, lang: "pt" };
    if (occasion.slug.en === slug) return { occasion, lang: "en" };
  }
  return undefined;
};

export const occasionCopy = (
  occasion: Occasion,
  lang: OccasionLang
): OccasionCopy => (lang === "pt" ? occasion.pt : occasion.en);

export const occasionPath = (occasion: Occasion, lang: OccasionLang): string =>
  lang === "pt"
    ? `/modelos/${occasion.slug.pt}`
    : `/templates/${occasion.slug.en}`;

export const galleryPath = (lang: OccasionLang): string =>
  lang === "pt" ? "/modelos" : "/templates";

export const relatedOccasions = (occasion: Occasion): Occasion[] => {
  const index = OCCASIONS.findIndex(
    (candidate) => candidate.slug.pt === occasion.slug.pt
  );
  return [1, 2, 3].map(
    (offset) => OCCASIONS[(index + offset) % OCCASIONS.length]
  );
};

export const resolveOccasionLang = (language: string): OccasionLang =>
  language === "en" ? "en" : "pt";

export interface OccasionPageCopy {
  galleryTitle: string;
  gallerySubtitle: string;
  useTemplate: string;
  seeTemplate: string;
  tryIt: string;
  faqTitle: string;
  relatedTitle: string;
  backToGallery: string;
  dodgeSuffix: string;
}

export const OCCASION_PAGE_COPY: Record<OccasionLang, OccasionPageCopy> = {
  pt: {
    galleryTitle: "Modelos prontos por ocasião",
    gallerySubtitle:
      "Escolha uma ocasião, personalize em segundos e mande o link onde dizer Não é impossível.",
    useTemplate: "Usar este modelo",
    seeTemplate: "Ver modelo",
    tryIt: "Teste você mesmo",
    faqTitle: "Perguntas frequentes",
    relatedTitle: "Outras ocasiões",
    backToGallery: "Todos os modelos",
    dodgeSuffix: "O Não fugiu",
  },
  en: {
    galleryTitle: "Ready-made templates for every occasion",
    gallerySubtitle:
      "Pick an occasion, personalize it in seconds and send the link where saying No is impossible.",
    useTemplate: "Use this template",
    seeTemplate: "See template",
    tryIt: "Try it yourself",
    faqTitle: "Frequently asked questions",
    relatedTitle: "Other occasions",
    backToGallery: "All templates",
    dodgeSuffix: "The No dodged",
  },
};
