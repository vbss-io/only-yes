import {
  CursorClick,
  LinkSimple,
  Pen,
  ShareNetwork,
  Sparkle,
  TextT,
  YoutubeLogo,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

export const Landing = () => {
  const { t } = useTranslator();
  const demoCardRef = useRef<HTMLDivElement>(null);
  const [noPosition, setNoPosition] = useState<{
    top: number;
    left: number;
  }>();
  const [saidYes, setSaidYes] = useState(false);

  const handleNoDodge = () => {
    const card = demoCardRef.current;
    if (!card) return;
    const maxLeft = card.clientWidth - 130;
    const maxTop = card.clientHeight - 60;
    setNoPosition({
      top: Math.random() * maxTop,
      left: Math.random() * maxLeft,
    });
  };

  const steps = [
    {
      icon: <Pen />,
      title: t("Crie sua pergunta"),
      text: t(
        "Escreva uma pergunta de Sim ou Não com texto rico, imagens e cores."
      ),
    },
    {
      icon: <ShareNetwork />,
      title: t("Compartilhe o link"),
      text: t("Cada pergunta gera um link único pra enviar pra quem quiser."),
    },
    {
      icon: <CursorClick />,
      title: t("O Não sempre foge"),
      text: t(
        "Quando alguém tenta clicar em Não, o botão escapa. No fim, só resta o Sim."
      ),
    },
  ];

  const feedbackTypes = [
    {
      icon: <TextT />,
      title: t("Texto"),
      text: t("Mostre uma mensagem personalizada depois do Sim."),
    },
    {
      icon: <LinkSimple />,
      title: "Link",
      text: t("Redirecione pra qualquer página que você escolher."),
    },
    {
      icon: <YoutubeLogo />,
      title: "Youtube",
      text: t("Toque um vídeo especial como resposta."),
    },
  ];

  return (
    <S.Container>
      <S.Hero>
        <S.HeroBadge>
          <Sparkle weight="fill" />
          {t("Grátis e sem precisar de conta")}
        </S.HeroBadge>
        <S.HeroTitle>
          {t("A pergunta que só aceita")} <span>{t("Sim")}</span>
        </S.HeroTitle>
        <S.HeroSubtitle>
          {t(
            "Crie perguntas de Sim ou Não onde o botão Não sempre foge do clique. Compartilhe o link e divirta-se com a reação."
          )}
        </S.HeroSubtitle>
        <S.HeroActions>
          <S.CtaButton as="a" href="/create">
            {t("Criar Pergunta")}
          </S.CtaButton>
          <S.CtaHint>{t("Leva menos de um minuto.")}</S.CtaHint>
        </S.HeroActions>
      </S.Hero>
      <S.Section>
        <S.SectionTitle>{t("Tente dizer Não")}</S.SectionTitle>
        <S.DemoCard ref={demoCardRef}>
          {!saidYes && (
            <>
              <S.DemoQuestion>
                {t("Está gostando do Only Yes?")}
              </S.DemoQuestion>
              <S.DemoButtons>
                <S.DemoButton variant="yes" onClick={() => setSaidYes(true)}>
                  {t("Sim")}
                </S.DemoButton>
                <S.DemoButton
                  variant="no"
                  onMouseEnter={handleNoDodge}
                  onTouchStart={handleNoDodge}
                  onClick={handleNoDodge}
                  style={
                    noPosition
                      ? {
                          position: "absolute",
                          top: `${noPosition.top}px`,
                          left: `${noPosition.left}px`,
                        }
                      : undefined
                  }
                >
                  {t("Não")}
                </S.DemoButton>
              </S.DemoButtons>
            </>
          )}
          {saidYes && (
            <S.DemoResult>
              {t("Sabia que você ia dizer Sim.")}
            </S.DemoResult>
          )}
        </S.DemoCard>
      </S.Section>
      <S.Section>
        <S.SectionTitle>{t("Como funciona")}</S.SectionTitle>
        <S.Steps>
          {steps.map((step) => (
            <S.StepCard key={step.title}>
              <S.StepIcon>{step.icon}</S.StepIcon>
              <S.StepTitle>{step.title}</S.StepTitle>
              <S.StepText>{step.text}</S.StepText>
            </S.StepCard>
          ))}
        </S.Steps>
      </S.Section>
      <S.Section>
        <S.SectionTitle>
          {t("Escolha o que acontece depois do Sim")}
        </S.SectionTitle>
        <S.Steps>
          {feedbackTypes.map((type) => (
            <S.StepCard key={type.title}>
              <S.StepIcon>{type.icon}</S.StepIcon>
              <S.StepTitle>{type.title}</S.StepTitle>
              <S.StepText>{type.text}</S.StepText>
            </S.StepCard>
          ))}
        </S.Steps>
      </S.Section>
      <S.Section>
        <S.SectionTitle>{t("Pronto pra começar?")}</S.SectionTitle>
        <S.HeroActions>
          <S.CtaButton as="a" href="/create">
            {t("Criar Pergunta")}
          </S.CtaButton>
        </S.HeroActions>
      </S.Section>
    </S.Container>
  );
};
