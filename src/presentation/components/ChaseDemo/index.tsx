import { burstConfetti } from "@/presentation/chase/confetti";
import { useChase } from "@/presentation/hooks/use-chase";
import { useState, type MouseEvent } from "react";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

interface ChaseDemoProps {
  question: string;
  yesText: string;
  noText: string;
  result: string;
  dodgeSuffix: string;
}

export const ChaseDemo = ({
  question,
  yesText,
  noText,
  result,
  dodgeSuffix,
}: ChaseDemoProps) => {
  const { t } = useTranslator();
  const [saidYes, setSaidYes] = useState(false);
  const chase = useChase({ mode: "container", active: !saidYes });

  const taunts = [
    t("Tenta de novo"),
    t("Quase!"),
    t("Aqui não"),
    t("Tá lento hoje?"),
    t("Desiste logo"),
  ];

  const handleYesClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (saidYes) return;
    chase.stop();
    burstConfetti(event.clientX, event.clientY);
    setSaidYes(true);
  };

  return (
    <S.Card ref={chase.containerRef}>
      {!saidYes && (
        <>
          <S.Question>{question}</S.Question>
          <S.Buttons>
            <S.DemoButton variant="yes" onClick={handleYesClick}>
              {yesText}
            </S.DemoButton>
            {chase.fled && <S.Slot />}
            <S.DemoButton
              ref={chase.noButtonRef}
              variant="no"
              fled={chase.fled}
              onPointerEnter={chase.handleNoThreat}
              onPointerDown={chase.handleNoThreat}
              onClick={chase.handleNoThreat}
            >
              {noText}
            </S.DemoButton>
          </S.Buttons>
          {chase.act.tauntIndex !== null && !chase.reducedMotion && (
            <S.Taunt ref={chase.bubbleRef}>
              {taunts[chase.act.tauntIndex]}
            </S.Taunt>
          )}
          {chase.clones.map((index) => (
            <S.Clone
              key={index}
              ref={chase.setCloneRef(index)}
              onClick={handleYesClick}
            >
              <S.CloneInner>{yesText}</S.CloneInner>
            </S.Clone>
          ))}
        </>
      )}
      {saidYes && (
        <S.Result>
          {result}
          {chase.dodges > 0 && (
            <span>
              {dodgeSuffix} {chase.dodges}x.
            </span>
          )}
        </S.Result>
      )}
    </S.Card>
  );
};
