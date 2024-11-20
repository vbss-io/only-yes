import { GetQuestion } from "@/application/usecases/GetQuestion";
import { Question as QuestionModel } from "@/domain/models/Question";
import { Loading } from "@/presentation/components/Loading";
import { Question } from "@/presentation/components/Question";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as S from "./styles";

export const Home = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [question, setQuestion] = useState<QuestionModel>();
  const { state } = useLocation() as {
    state: { code: string };
    pathname: string;
  };

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const getQuestionUsecase = new GetQuestion();
        const question = await getQuestionUsecase.execute({ code: state.code });
        if (question.id) setQuestion(question);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (state?.code) {
      setIsLoading(true);
      getQuestion();
    }
  }, []);

  return (
    <S.Container id="homePage">
      <title>Only Yes {question ? `- ${question.code}` : ""}</title>
      {isLoading && <Loading />}
      {!isLoading && state?.code && !question && (
        <S.Text>Nenhuma pergunta encontrada.</S.Text>
      )}
      {!isLoading && !question && (
        <S.Button href="/create">Criar sua primeira pergunta</S.Button>
      )}
      {!isLoading && question && <Question question={question} />}
    </S.Container>
  );
};
