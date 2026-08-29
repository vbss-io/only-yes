export type YesVariant = "original" | "clone";

export interface AnswerRecord {
  noAttempts: number;
  durationMs: number;
  yesVariant: YesVariant;
  answeredAt: string;
}

export interface QuestionStats {
  question: {
    code: string;
    question: string;
    createdAt: string;
  };
  stats: {
    answersCount: number;
    totalNoAttempts: number;
    maxNoAttempts: number;
    totalDurationMs: number;
  };
  answers: AnswerRecord[];
}
