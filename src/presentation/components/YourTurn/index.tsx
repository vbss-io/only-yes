import { QUESTION_TEMPLATES } from "@/presentation/config/question-templates";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

export const YourTurn = () => {
  const { t } = useTranslator();

  return (
    <S.Container>
      <S.Title>{t("Agora é sua vez de conseguir um Sim")}</S.Title>
      <S.Options>
        {QUESTION_TEMPLATES.map((template) => (
          <S.Option
            key={template.slug}
            href={`/create?template=${template.slug}`}
          >
            {t(template.label)}
          </S.Option>
        ))}
      </S.Options>
    </S.Container>
  );
};
