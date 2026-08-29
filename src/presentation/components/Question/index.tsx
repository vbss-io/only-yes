import { RecordAnswer } from "@/application/usecases/RecordAnswer";
import { Question as QuestionModel } from "@/domain/models/Question";
import { YesVariant } from "@/domain/models/QuestionStats";
import { burstConfetti } from "@/presentation/chase/confetti";
import { Editor } from "@/presentation/components/Editor";
import { Receipt } from "@/presentation/components/Receipt";
import { YourTurn } from "@/presentation/components/YourTurn";
import { useChase } from "@/presentation/hooks/use-chase";
import { htmlToText } from "@/presentation/utils/html-text";
import { isHttpUrl } from "@/presentation/utils/safe-url";
import { useRef, useState, type MouseEvent } from "react";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

interface QuestionProps {
  question: QuestionModel;
}

interface ChaseResult {
  attempts: number;
  durationMs: number;
}

const MAX_ATTEMPTS = 500;
const MAX_DURATION_MS = 1800000;

export const Question = ({ question }: QuestionProps) => {
  const { t } = useTranslator();
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<ChaseResult | null>(null);
  const startedAt = useRef(performance.now());
  const chase = useChase({ mode: "viewport", active: !confirmed });

  const taunts = [
    t("Tenta de novo"),
    t("Quase!"),
    t("Aqui não"),
    t("Tá lento hoje?"),
    t("Desiste logo"),
  ];

  const handleYesClick = (
    event: MouseEvent<HTMLButtonElement>,
    variant: YesVariant
  ): void => {
    if (confirmed) return;
    chase.stop();
    burstConfetti(event.clientX, event.clientY);
    const attempts = Math.min(chase.dodges, MAX_ATTEMPTS);
    const durationMs = Math.min(
      Math.round(performance.now() - startedAt.current),
      MAX_DURATION_MS
    );
    new RecordAnswer()
      .execute({
        code: question.code,
        noAttempts: attempts,
        durationMs,
        yesVariant: variant,
      })
      .catch(() => undefined);
    if (question.answerType === "link" && isHttpUrl(question.answer)) {
      window.open(question.answer, "_blank", "noopener,noreferrer");
    }
    setResult({ attempts, durationMs });
    setConfirmed(true);
  };

  return (
    <S.Container ref={chase.containerRef}>
      {!confirmed && (
        <S.Card>
          <Editor content={question.question} viewMode />
          <S.ButtonContainer>
            <S.Button
              variant="yes"
              onClick={(event: MouseEvent<HTMLButtonElement>) =>
                handleYesClick(event, "original")
              }
            >
              {question.yesText}
            </S.Button>
            {chase.fled && <S.ButtonSlot />}
            <S.NoButton
              ref={chase.noButtonRef}
              fled={chase.fled}
              onPointerEnter={chase.handleNoThreat}
              onPointerDown={chase.handleNoThreat}
              onClick={chase.handleNoThreat}
            >
              {question.noText}
            </S.NoButton>
          </S.ButtonContainer>
          {chase.act.tauntIndex !== null && !chase.reducedMotion && (
            <S.TauntBubble ref={chase.bubbleRef}>
              {taunts[chase.act.tauntIndex]}
            </S.TauntBubble>
          )}
          {chase.clones.map((index) => (
            <S.CloneButton
              key={index}
              ref={chase.setCloneRef(index)}
              onClick={(event: MouseEvent<HTMLButtonElement>) =>
                handleYesClick(event, "clone")
              }
            >
              <S.CloneInner>{question.yesText}</S.CloneInner>
            </S.CloneButton>
          ))}
        </S.Card>
      )}
      {confirmed && (
        <S.ResultStack>
          {question.answerType === "text" && (
            <S.Card animation>
              <Editor content={question.answer} viewMode />
            </S.Card>
          )}
          {question.answerType === "video" && (
            <S.Card animation>
              <Editor videoUrl={question.answer} viewMode />
            </S.Card>
          )}
          {question.answerType === "link" && (
            <S.Card animation>
              <S.RedirectContainer>
                <h1>{t("Redirecionando")}</h1>
                {isHttpUrl(question.answer) ? (
                  <a
                    href={question.answer}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {question.answer}
                  </a>
                ) : (
                  <span>{question.answer}</span>
                )}
              </S.RedirectContainer>
            </S.Card>
          )}
          {question.answerType !== "link" && result && (
            <>
              <Receipt
                question={htmlToText(question.question)}
                noAttempts={result.attempts}
                durationMs={result.durationMs}
              />
              <YourTurn />
            </>
          )}
        </S.ResultStack>
      )}
    </S.Container>
  );
};
