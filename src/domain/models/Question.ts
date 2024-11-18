export interface Question {
  id: string;
  code: string;
  question: string;
  yesText: string;
  noText: string;
  answerType: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}
