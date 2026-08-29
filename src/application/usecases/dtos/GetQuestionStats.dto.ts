import { QuestionStats } from "@/domain/models/QuestionStats";

export interface GetQuestionStatsInput {
  code: string;
  key: string;
}

export interface GetQuestionStatsOutput {
  status: number;
  data: QuestionStats;
}
