import { ChaseDemo } from "@/presentation/components/ChaseDemo";
import {
  galleryPath,
  resolveOccasionLang,
} from "@/presentation/config/occasions";
import {
  CursorClick,
  LinkSimple,
  Pen,
  ShareNetwork,
  Sparkle,
  TextT,
  YoutubeLogo,
} from "@phosphor-icons/react";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

export const Landing = () => {
  const { t, language } = useTranslator();
  const modelsPath = galleryPath(resolveOccasionLang(language));

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
          <S.SecondaryLink href={modelsPath}>
            {t("Ver modelos prontos")}
          </S.SecondaryLink>
          <S.CtaHint>{t("Leva menos de um minuto.")}</S.CtaHint>
        </S.HeroActions>
      </S.Hero>
      <S.Section>
        <S.SectionTitle>{t("Tente dizer Não")}</S.SectionTitle>
        <ChaseDemo
          question={t("Está gostando do Only Yes?")}
          yesText={t("Sim")}
          noText={t("Não")}
          result={t("Sabia que você ia dizer Sim.")}
          dodgeSuffix={t("O Não fugiu")}
        />
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
          <S.SecondaryLink href={modelsPath}>
            {t("Ver modelos prontos")}
          </S.SecondaryLink>
        </S.HeroActions>
      </S.Section>
    </S.Container>
  );
};
