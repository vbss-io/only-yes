export interface QuestionTemplate {
  slug: string;
  label: string;
  question: string;
  yesText: string;
  noText: string;
  answer: string;
}

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    slug: "pedido-de-namoro",
    label: "Pedido de namoro",
    question: "Quer namorar comigo?",
    yesText: "Sim",
    noText: "Não",
    answer: "Eu sabia que você ia dizer sim.",
  },
  {
    slug: "bora-sair",
    label: "Bora sair",
    question: "Bora sair sábado?",
    yesText: "Bora",
    noText: "Não dá",
    answer: "Fechado, sábado então.",
  },
  {
    slug: "zoeira",
    label: "Zoeira",
    question: "Você admite que eu estava certo?",
    yesText: "Admito",
    noText: "Nunca",
    answer: "Print tirado. Sem volta.",
  },
];

export const findQuestionTemplate = (
  slug: string | null
): QuestionTemplate | undefined =>
  QUESTION_TEMPLATES.find((template) => template.slug === slug);
