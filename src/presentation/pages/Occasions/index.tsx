import { OccasionIcon } from "@/presentation/components/OccasionIcon";
import {
  OCCASIONS,
  OCCASION_PAGE_COPY,
  occasionCopy,
  occasionPath,
  type OccasionLang,
} from "@/presentation/config/occasions";
import { useLocation } from "react-router-dom";
import * as S from "./styles";

export const Occasions = () => {
  const location = useLocation();
  const lang: OccasionLang = location.pathname.startsWith("/templates")
    ? "en"
    : "pt";
  const pageCopy = OCCASION_PAGE_COPY[lang];

  return (
    <S.Container>
      <title>Only Yes - {pageCopy.galleryTitle}</title>
      <S.Title>{pageCopy.galleryTitle}</S.Title>
      <S.Subtitle>{pageCopy.gallerySubtitle}</S.Subtitle>
      <S.Grid>
        {OCCASIONS.map((occasion) => {
          const copy = occasionCopy(occasion, lang);
          return (
            <S.Card key={occasion.slug.pt}>
              <S.CardIcon>
                <OccasionIcon name={occasion.icon} />
              </S.CardIcon>
              <S.CardTitle>{copy.label}</S.CardTitle>
              <S.CardQuestion>“{copy.question}”</S.CardQuestion>
              <S.CardActions>
                <S.PrimaryAction
                  href={`/create?template=${occasion.slug[lang]}`}
                >
                  {pageCopy.useTemplate}
                </S.PrimaryAction>
                <S.SecondaryAction href={occasionPath(occasion, lang)}>
                  {pageCopy.seeTemplate}
                </S.SecondaryAction>
              </S.CardActions>
            </S.Card>
          );
        })}
      </S.Grid>
    </S.Container>
  );
};
