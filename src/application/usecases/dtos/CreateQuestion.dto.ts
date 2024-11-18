export interface CreateQuestionInput {
  question: string;
  yesText: string;
  noText: string;
  answerType: string;
  answer: string;
}

export interface CreateQuestionOutput {
  code: string;
}
