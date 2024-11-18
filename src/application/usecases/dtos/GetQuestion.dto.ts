import { Question } from "@/domain/models/Question";

export interface GetQuestionInput {
  code: string;
}

export type GetQuestionOutput = Question;
