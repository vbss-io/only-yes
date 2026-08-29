import {
  OCCASIONS,
  occasionCopy,
  galleryPath,
  resolveOccasionLang,
} from "@/presentation/config/occasions";
import { useTranslator } from "vbss-translator";
import * as S from "./styles";

const FEATURED_SLUGS = ["pedido-de-namoro", "bora-sair", "zoeira"];

export const YourTurn = () => {
  const { t, language } = useTranslator();
  const lang = resolveOccasionLang(language);
  const featured = OCCASIONS.filter((occasion) =>
    FEATURED_SLUGS.includes(occasion.slug.pt)
  );

  return (
    <S.Container>
      <S.Title>{t("Agora é sua vez de conseguir um Sim")}</S.Title>
      <S.Options>
        {featured.map((occasion) => (
          <S.Option
            key={occasion.slug.pt}
            href={`/create?template=${occasion.slug[lang]}`}
          >
            {occasionCopy(occasion, lang).label}
          </S.Option>
        ))}
        <S.Option href={galleryPath(lang)}>{t("Ver todos")}</S.Option>
      </S.Options>
    </S.Container>
  );
};
