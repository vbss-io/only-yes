import { Question as QuestionModel } from "@/domain/models/Question";
import { Editor } from "@/presentation/components/Editor";
import { useEffect, useState } from "react";
import * as S from "./styles";

interface QuestionProps {
  question: QuestionModel;
}

export const Question = ({ question }: QuestionProps) => {
  const [firstHover, setFirstHover] = useState(true);
  const [animation, setAnimation] = useState("");
  const [noButtonPosition, setNoButtonPosition] = useState({ top: 0, left: 0 });
  const [noButtonMoves, setNoButtonMoves] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [extraYesButtons, setExtraYesButtons] = useState<
    { id: number; top: number; left: number }[]
  >([]);

  const handleYesClick = () => {
    if (question.answerType === "link") {
      window.open(question.answer);
    }
    setExtraYesButtons([]);
    setConfirmed(true);
  };

  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;
    if (noButtonMoves >= 5 && !confirmed) {
      intervalId = setInterval(() => {
        const bodyWidth = document.body.clientWidth;
        const bodyHeight = document.body.clientHeight;
        const newButton = {
          id: Date.now(),
          top: Math.random() * (bodyHeight - 100),
          left: Math.random() * (bodyWidth - 135),
        };
        setExtraYesButtons((prev) => [...prev, newButton]);
      }, 250);

      return () => clearInterval(intervalId);
    }
    if (confirmed) clearInterval(intervalId);
  });

  const handleNoMouseEnter = () => {
    if (firstHover) setFirstHover(false);
    setNoButtonMoves((prev) => prev + 1);
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;
    const newLeft = Math.random() * (bodyWidth - 135);
    const newTop = Math.random() * (bodyHeight - 100);
    setNoButtonPosition({ top: newTop, left: newLeft });
    const animations = [S.shake, S.bounce, S.spin];
    const randomAnimation =
      animations[Math.floor(Math.random() * animations.length)];
    setAnimation(randomAnimation);
  };

  return (
    <S.Container>
      {!confirmed && (
        <S.Card>
          <Editor content={question.question} viewMode />
          <S.ButtonContainer>
            <S.Button onClick={handleYesClick} variant="yes">
              {question.yesText}
            </S.Button>
            <S.Button
              variant="no"
              onMouseEnter={handleNoMouseEnter}
              onTouchStart={handleNoMouseEnter}
              onTouchStartCapture={handleNoMouseEnter}
              onClick={handleNoMouseEnter}
              style={
                firstHover
                  ? {
                      top: `50%`,
                      left: `50%`,
                    }
                  : {
                      position: "absolute",
                      top: `${noButtonPosition.top}px`,
                      left: `${noButtonPosition.left}px`,
                      animation: `${animation} 0.5s ease-in-out`,
                    }
              }
            >
              {question.noText}{" "}
            </S.Button>
          </S.ButtonContainer>
          {extraYesButtons.map((button) => (
            <S.Button
              rounded="full"
              key={button.id}
              variant="extraYes"
              onClick={handleYesClick}
              style={{
                top: `${button.top}px`,
                left: `${button.left}px`,
              }}
            >
              {question.yesText}
            </S.Button>
          ))}
        </S.Card>
      )}
      {confirmed && question.answerType === "text" && (
        <S.Card animation>
          <Editor content={question.answer} viewMode />
        </S.Card>
      )}
      {confirmed && question.answerType === "video" && (
        <S.Card animation>
          <Editor videoUrl={question.answer} viewMode />
        </S.Card>
      )}
      {confirmed && question.answerType === "link" && (
        <S.Card animation>
          <S.RedirectContainer>
            <h1>Redirecionando</h1>
            <a href={question.answer} target="_blank" rel="noopener noreferrer">
              {question.answer}
            </a>
          </S.RedirectContainer>
        </S.Card>
      )}
    </S.Container>
  );
};
