import { YesVariant } from "@/domain/models/QuestionStats";

export interface RecordAnswerInput {
  code: string;
  noAttempts: number;
  durationMs: number;
  yesVariant: YesVariant;
}
